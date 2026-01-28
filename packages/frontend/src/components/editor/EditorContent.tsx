'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Viewport3D } from '@/components/Viewport3D';
import { FeatureTree } from '@/components/FeatureTree';
import { Toolbar } from '@/components/Toolbar';
import { SketchToolbar } from '@/components/SketchToolbar';
import { SketchCanvas } from '@/components/SketchCanvas';
import { SelectionManager } from '@/components/SelectionManager';
import { SelectionContextMenu, useContextMenu } from '@/components/SelectionContextMenu';
import { PropertyPanel } from '@/components/PropertyPanel';
import { StatusBar } from '@/components/StatusBar';
import { ExtrudeDialog } from '@/components/dialogs/ExtrudeDialog';
import { RevolveDialog } from '@/components/dialogs/RevolveDialog';
import { SweepDialog } from '@/components/dialogs/SweepDialog';
import { LoftDialog } from '@/components/dialogs/LoftDialog';
import { FilletDialog } from '@/components/dialogs/FilletDialog';
import { ChamferDialog } from '@/components/dialogs/ChamferDialog';
import { ShellDialog } from '@/components/dialogs/ShellDialog';
import { MirrorFeatureDialog } from '@/components/dialogs/MirrorFeatureDialog';
import { LinearPatternDialog } from '@/components/dialogs/LinearPatternDialog';
import { CircularPatternDialog } from '@/components/dialogs/CircularPatternDialog';
import { SketchDialog } from '@/components/dialogs/SketchDialog';
import { MoveCopyBodyDialog } from '@/components/dialogs/MoveCopyBodyDialog';
import { Notifications } from '@/components/Notifications';
import { ChatPanel } from '@/components/chat';
import { SimulationPanel } from '@/components/fea';
import { ResizablePanel } from '@/components/ResizablePanel';
import { MeasurementsPanel } from '@/components/MeasurementsPanel';
import { useDocumentStore } from '@/store/documentStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { useChatStore } from '@/store/chatStore';

interface EditorContentProps {
  projectId?: string;
}

export default function EditorContent({ projectId }: EditorContentProps) {
  const router = useRouter();
  const { fetchProject, currentProject, saveProjectData } = useProjectStore();
  const { document, createNewDocument, loadDocumentFromData } = useDocumentStore();
  const { 
    activeMode, 
    sketchMode, 
    activeDialog, 
    leftPanelOpen, 
    rightPanelOpen,
    leftPanelWidth,
    chatPanelWidth,
    setLeftPanelWidth,
    exitSketchMode,
    setActiveTool,
    clearSelection,
    addNotification,
    transformState,
    cancelTransform
  } = useUIStore();
  
  const { isOpen: isChatOpen, loadProjectChats } = useChatStore();
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

  // Load project if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProjectChats(projectId);
      
      fetchProject(projectId).then((project) => {
        if (project?.data) {
          loadDocumentFromData(project.data);
        } else {
          createNewDocument(project?.name || 'New Part');
        }
      });
    } else if (!document) {
      createNewDocument('New Part');
    }
  }, [projectId]);

  // Auto-save project data periodically
  useEffect(() => {
    if (!projectId || !document) return;
    
    const saveInterval = setInterval(() => {
      const serializableDoc = {
        ...document,
        partStudios: document.partStudios.map(ps => ({
          ...ps,
          sketches: Object.fromEntries(ps.sketches)
        }))
      };
      
      saveProjectData(projectId, serializableDoc).catch(console.error);
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, [projectId, document, saveProjectData]);
  
  // Save on window unload/close
  useEffect(() => {
    if (!projectId || !document) return;
    
    const handleBeforeUnload = () => {
      const serializableDoc = {
        ...document,
        partStudios: document.partStudios.map(ps => ({
          ...ps,
          sketches: Object.fromEntries(ps.sketches)
        }))
      };
      
      const blob = new Blob([JSON.stringify({ data: serializableDoc })], { type: 'application/json' });
      navigator.sendBeacon(`/api/projects/${projectId}/data`, blob);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectId, document]);

  const handleConfirmSketch = useCallback(() => {
    if (sketchMode) {
      addNotification('success', 'Sketch completed');
      exitSketchMode();
    }
  }, [sketchMode, exitSketchMode, addNotification]);
  
  const handleCancelSketch = useCallback(() => {
    if (sketchMode) {
      addNotification('info', 'Sketch cancelled');
      exitSketchMode();
    }
  }, [sketchMode, exitSketchMode, addNotification]);
  
  const handleViewNormal = useCallback(() => {
    addNotification('info', 'View oriented normal to sketch plane');
  }, [addNotification]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (sketchMode) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleConfirmSketch();
          return;
        }
        
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleViewNormal();
          return;
        }
      }
      
      if (e.key === 'Escape') {
        if (sketchMode) {
          handleCancelSketch();
        } else if (transformState.isActive) {
          cancelTransform();
        } else {
          setActiveTool(null);
          clearSelection();
        }
      }
      
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        const { selectAll } = useUIStore.getState();
        selectAll();
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sketchMode, setActiveTool, clearSelection, handleConfirmSketch, handleCancelSketch, handleViewNormal, transformState, cancelTransform]);

  const isSketchMode = activeMode === 'sketch' && sketchMode;

  return (
    <Layout>
      {/* Top Toolbar */}
      {isSketchMode ? <SketchToolbar /> : <Toolbar />}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Panel - Feature Tree */}
          {leftPanelOpen && (
            <ResizablePanel
              direction="horizontal"
              side="left"
              initialSize={leftPanelWidth}
              minSize={200}
              maxSize={600}
              onResize={setLeftPanelWidth}
            >
              <FeatureTree />
            </ResizablePanel>
          )}

          {/* Center - 3D Viewport / Sketch Canvas */}
          <div 
            className="flex-1 relative bg-white min-h-0 min-w-0"
            style={{ marginRight: isChatOpen ? `${chatPanelWidth}px` : 0 }}
            onContextMenu={!isSketchMode ? openContextMenu : undefined}
          >
            <SelectionManager>
              <div className={`absolute inset-0 ${isSketchMode ? 'opacity-0 pointer-events-none' : ''}`}>
                <Viewport3D />
              </div>
              
              {isSketchMode && <SketchCanvas />}
            </SelectionManager>
            
            {contextMenu.isOpen && (
              <SelectionContextMenu
                position={contextMenu.position}
                onClose={closeContextMenu}
              />
            )}
          </div>
          
          {/* AI Chat Assistant */}
          <ChatPanel />
        </div>

        {/* Bottom Panel - Properties */}
        {rightPanelOpen && <PropertyPanel />}

        {/* Status Bar */}
        <StatusBar />
      </div>
      
      {/* Dialogs */}
      {activeDialog === 'extrude' && <ExtrudeDialog />}
      {activeDialog === 'revolve' && <RevolveDialog />}
      {activeDialog === 'sweep' && <SweepDialog />}
      {activeDialog === 'loft' && <LoftDialog />}
      {activeDialog === 'fillet' && <FilletDialog />}
      {activeDialog === 'chamfer' && <ChamferDialog />}
      {activeDialog === 'shell' && <ShellDialog />}
      {activeDialog === 'mirror-feature' && <MirrorFeatureDialog />}
      {activeDialog === 'linear-pattern' && <LinearPatternDialog />}
      {activeDialog === 'circular-pattern' && <CircularPatternDialog />}
      {activeDialog === 'sketch' && <SketchDialog />}
      {activeDialog === 'move-copy-body' && <MoveCopyBodyDialog />}
      
      {/* Notifications */}
      <Notifications />
      
      {/* Measurements Panel */}
      <MeasurementsPanel />
      
      {/* FEA Simulation Panel */}
      <SimulationPanel />
    </Layout>
  );
}
