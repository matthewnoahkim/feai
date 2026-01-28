'use client';

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowRight, Box, Save } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useProjectStore } from '@/store/projectStore';
import { useDocumentStore } from '@/store/documentStore';
import { useUIStore } from '@/store/uiStore';

// Dynamically import CAD components to avoid SSR issues
const Viewport3D = dynamic(() => import('@/components/Viewport3D').then(m => ({ default: m.Viewport3D })), { ssr: false });
const FeatureTree = dynamic(() => import('@/components/FeatureTree').then(m => ({ default: m.FeatureTree })), { ssr: false });
const Toolbar = dynamic(() => import('@/components/Toolbar').then(m => ({ default: m.Toolbar })), { ssr: false });
const SketchToolbar = dynamic(() => import('@/components/SketchToolbar').then(m => ({ default: m.SketchToolbar })), { ssr: false });
const SketchCanvas = dynamic(() => import('@/components/SketchCanvas').then(m => ({ default: m.SketchCanvas })), { ssr: false });
const SelectionManager = dynamic(() => import('@/components/SelectionManager').then(m => ({ default: m.SelectionManager })), { ssr: false });
const PropertyPanel = dynamic(() => import('@/components/PropertyPanel').then(m => ({ default: m.PropertyPanel })), { ssr: false });
const StatusBar = dynamic(() => import('@/components/StatusBar').then(m => ({ default: m.StatusBar })), { ssr: false });
const ResizablePanel = dynamic(() => import('@/components/ResizablePanel').then(m => ({ default: m.ResizablePanel })), { ssr: false });
const Notifications = dynamic(() => import('@/components/Notifications').then(m => ({ default: m.Notifications })), { ssr: false });

// Feature dialogs
const ExtrudeDialog = dynamic(() => import('@/components/dialogs/ExtrudeDialog').then(m => ({ default: m.ExtrudeDialog })), { ssr: false });
const RevolveDialog = dynamic(() => import('@/components/dialogs/RevolveDialog').then(m => ({ default: m.RevolveDialog })), { ssr: false });
const SweepDialog = dynamic(() => import('@/components/dialogs/SweepDialog').then(m => ({ default: m.SweepDialog })), { ssr: false });
const LoftDialog = dynamic(() => import('@/components/dialogs/LoftDialog').then(m => ({ default: m.LoftDialog })), { ssr: false });
const FilletDialog = dynamic(() => import('@/components/dialogs/FilletDialog').then(m => ({ default: m.FilletDialog })), { ssr: false });
const ChamferDialog = dynamic(() => import('@/components/dialogs/ChamferDialog').then(m => ({ default: m.ChamferDialog })), { ssr: false });
const ShellDialog = dynamic(() => import('@/components/dialogs/ShellDialog').then(m => ({ default: m.ShellDialog })), { ssr: false });
const MirrorFeatureDialog = dynamic(() => import('@/components/dialogs/MirrorFeatureDialog').then(m => ({ default: m.MirrorFeatureDialog })), { ssr: false });
const LinearPatternDialog = dynamic(() => import('@/components/dialogs/LinearPatternDialog').then(m => ({ default: m.LinearPatternDialog })), { ssr: false });
const CircularPatternDialog = dynamic(() => import('@/components/dialogs/CircularPatternDialog').then(m => ({ default: m.CircularPatternDialog })), { ssr: false });
const SketchDialog = dynamic(() => import('@/components/dialogs/SketchDialog').then(m => ({ default: m.SketchDialog })), { ssr: false });
const MoveCopyBodyDialog = dynamic(() => import('@/components/dialogs/MoveCopyBodyDialog').then(m => ({ default: m.MoveCopyBodyDialog })), { ssr: false });

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-cad-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cad-text">Loading CAD Editor...</p>
      </div>
    </div>
  );
}

function GeometryEditorContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { 
    materials, 
    defaultMaterialId, 
    setGeometryReady, 
    updateStepStatus,
    setCurrentStep,
  } = useWorkflowStore();
  
  const { fetchProject, currentProject, saveProjectData } = useProjectStore();
  const { document, createNewDocument, loadDocumentFromData } = useDocumentStore();
  const { 
    activeMode, 
    sketchMode, 
    activeDialog, 
    leftPanelOpen, 
    rightPanelOpen,
    leftPanelWidth,
    setLeftPanelWidth,
    exitSketchMode,
    setActiveTool,
    clearSelection,
    addNotification,
    transformState,
    cancelTransform
  } = useUIStore();

  // Load project data
  useEffect(() => {
    setCurrentStep('geometry');
    updateStepStatus('geometry', 'in-progress');
    
    fetchProject(projectId).then((project) => {
      if (project?.data) {
        loadDocumentFromData(project.data);
      } else {
        createNewDocument(project?.name || 'New Part');
      }
    });
  }, [projectId]);

  // Check if geometry has parts
  useEffect(() => {
    if (document) {
      const activePartStudio = document.partStudios.find(ps => ps.id === document.activeElementId);
      const hasParts = !!(activePartStudio?.parts && activePartStudio.parts.length > 0);
      setGeometryReady(hasParts);
    }
  }, [document, setGeometryReady]);

  // Auto-save
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

  const handleSave = useCallback(() => {
    if (!projectId || !document) return;
    
    const serializableDoc = {
      ...document,
      partStudios: document.partStudios.map(ps => ({
        ...ps,
        sketches: Object.fromEntries(ps.sketches)
      }))
    };
    
    saveProjectData(projectId, serializableDoc)
      .then(() => addNotification('success', 'Project saved'))
      .catch(() => addNotification('error', 'Failed to save project'));
  }, [projectId, document, saveProjectData, addNotification]);

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

  // Keyboard shortcuts
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
      
      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sketchMode, setActiveTool, clearSelection, handleConfirmSketch, handleCancelSketch, transformState, cancelTransform, handleSave]);

  const handleContinue = () => {
    handleSave();
    updateStepStatus('geometry', 'complete');
    router.push(`/project/${projectId}/mesh`);
  };

  const isSketchMode = activeMode === 'sketch' && sketchMode;

  // Get default material info
  const defaultMaterial = defaultMaterialId ? materials.find(m => m.id === defaultMaterialId) : null;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-cad-border px-4 py-2 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <Link
            href={`/project/${projectId}/schematic`}
            className="flex items-center gap-2 text-cad-text-dim hover:text-cad-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-sans">Schematic</span>
          </Link>
          <div className="w-px h-6 bg-cad-border" />
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cad-accent" />
            <h1 className="font-serif text-lg text-cad-text">Geometry</h1>
          </div>
          {defaultMaterial && (
            <>
              <div className="w-px h-6 bg-cad-border" />
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: defaultMaterial.color || '#3b82f6' }}
                />
                <span className="text-xs text-cad-text-dim font-sans">
                  Material: {defaultMaterial.name}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 text-cad-text-dim hover:text-cad-text text-sm font-sans transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-4 py-2 bg-cad-accent text-white text-sm font-sans hover:bg-cad-accent-hover transition-colors"
          >
            Continue to Mesh
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* CAD Toolbar */}
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
          <div className="flex-1 relative bg-white min-h-0 min-w-0">
            <SelectionManager>
              <div className={`absolute inset-0 ${isSketchMode ? 'opacity-0 pointer-events-none' : ''}`}>
                <Viewport3D />
              </div>
              
              {isSketchMode && <SketchCanvas />}
            </SelectionManager>
          </div>
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
    </div>
  );
}

export default function GeometryPage() {
  return (
    <GeometryEditorContent />
  );
}
