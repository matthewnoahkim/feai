'use client';

import { useCallback, useEffect, type ComponentType, type ReactNode } from 'react';
import { Viewport3D } from '@/components/Viewport3D';
import { FeatureTree } from '@/components/FeatureTree';
import { Toolbar } from '@/components/Toolbar';
import { SketchToolbar } from '@/components/SketchToolbar';
import { SketchCanvas } from '@/components/SketchCanvas';
import { SelectionManager } from '@/components/SelectionManager';
import { SelectionContextMenu, useContextMenu } from '@/components/SelectionContextMenu';
import { PropertyPanel } from '@/components/PropertyPanel';
import { StatusBar } from '@/components/StatusBar';
import {
  ExtrudeDialog,
  RevolveDialog,
  SweepDialog,
  LoftDialog,
  FilletDialog,
  ChamferDialog,
  ShellDialog,
  DirectEditDialog,
  AssemblyDialog,
  DrawingSheetDialog,
  MirrorFeatureDialog,
  LinearPatternDialog,
  CircularPatternDialog,
  SketchDialog,
  MoveCopyBodyDialog,
} from '@/components/dialogs';
import { Notifications } from '@/components/Notifications';
import { ChatPanel } from '@/components/chat';
import { ResizablePanel } from '@/components/ResizablePanel';
import { MeasurementsPanel } from '@/components/MeasurementsPanel';
import { serializeDocument, useDocumentStore } from '@/store/documentStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { useChatStore } from '@/store/chatStore';

/** Dialog id -> component. Both editor routes render dialogs from this one map, so a new
 * dialog is registered in exactly one place. Ids match uiStore.openDialog / openFeatureForEdit. */
export const DIALOG_REGISTRY: Record<string, ComponentType> = {
  extrude: ExtrudeDialog,
  revolve: RevolveDialog,
  sweep: SweepDialog,
  loft: LoftDialog,
  fillet: FilletDialog,
  chamfer: ChamferDialog,
  shell: ShellDialog,
  'direct-edit': DirectEditDialog,
  assembly: AssemblyDialog,
  'drawing-sheet': DrawingSheetDialog,
  'mirror-feature': MirrorFeatureDialog,
  'linear-pattern': LinearPatternDialog,
  'circular-pattern': CircularPatternDialog,
  sketch: SketchDialog,
  'move-copy-body': MoveCopyBodyDialog,
};

/** Loads the project into the document store, autosaves every 30 s, flushes a final save
 * on unload, and exposes an explicit save for buttons/shortcuts. */
export function useEditorProject(projectId?: string) {
  const { fetchProject, saveProjectData } = useProjectStore();
  const { document, createNewDocument, loadDocumentFromData } = useDocumentStore();
  const { loadProjectChats } = useChatStore();
  const { addNotification } = useUIStore();

  useEffect(() => {
    if (projectId) {
      loadProjectChats(projectId);
      fetchProject(projectId).then(project => {
        if (project?.data) loadDocumentFromData(project.data);
        else createNewDocument(project?.name || 'New Part');
      });
    } else if (!document) {
      createNewDocument('New Part');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const save = useCallback(async () => {
    if (!projectId || !document) return;
    try {
      await saveProjectData(projectId, serializeDocument(document));
      addNotification('success', 'Project saved');
    } catch {
      addNotification('error', 'Failed to save project');
    }
  }, [projectId, document, saveProjectData, addNotification]);

  useEffect(() => {
    if (!projectId || !document) return;
    const interval = setInterval(() => {
      saveProjectData(projectId, serializeDocument(document)).catch(console.error);
    }, 30000);
    return () => clearInterval(interval);
  }, [projectId, document, saveProjectData]);

  useEffect(() => {
    if (!projectId || !document) return;
    const flush = () => {
      // Unload-time requests are capped (~64 KB in flight). serializeDocument keeps the
      // payload small by dropping regenerable meshes; the interval save covers the rest.
      fetch(`/api/projects/${projectId}/data`, {
        method: 'PUT',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: serializeDocument(document) }),
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [projectId, document]);

  return { save };
}

interface EditorShellProps {
  projectId?: string;
  /** Optional header above the toolbar (e.g. the geometry route's nav with its Save button). */
  renderHeader?: (ctx: { save: () => Promise<void> }) => ReactNode;
  /** Extra panels rendered after the standard ones (e.g. the FEA SimulationPanel). */
  children?: ReactNode;
}

/** The CAD editor proper: toolbar, feature tree, viewport/sketch canvas, context menu, chat,
 * properties, status bar, dialogs. Used by both editor routes so they cannot drift apart. */
export function EditorShell({ projectId, renderHeader, children }: EditorShellProps) {
  const { save } = useEditorProject(projectId);
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
    cancelTransform,
  } = useUIStore();
  const { isOpen: isChatOpen } = useChatStore();
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

  const confirmSketch = useCallback(() => {
    if (sketchMode) {
      addNotification('success', 'Sketch completed');
      exitSketchMode();
    }
  }, [sketchMode, exitSketchMode, addNotification]);

  const cancelSketch = useCallback(() => {
    if (sketchMode) {
      addNotification('info', 'Sketch cancelled');
      exitSketchMode();
    }
  }, [sketchMode, exitSketchMode, addNotification]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (sketchMode && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        confirmSketch();
        return;
      }
      if (sketchMode && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        addNotification('info', 'View oriented normal to sketch plane');
        return;
      }
      if (e.key === 'Escape') {
        if (sketchMode) cancelSketch();
        else if (transformState.isActive) cancelTransform();
        else {
          setActiveTool(null);
          clearSelection();
        }
      }
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        useUIStore.getState().selectAll();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sketchMode, confirmSketch, cancelSketch, transformState, cancelTransform, setActiveTool, clearSelection, addNotification, save]);

  const isSketchMode = activeMode === 'sketch' && !!sketchMode;
  const ActiveDialog = activeDialog ? DIALOG_REGISTRY[activeDialog] : undefined;

  return (
    <>
      {renderHeader?.({ save })}
      {isSketchMode ? <SketchToolbar /> : <Toolbar />}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <div className="flex flex-1 overflow-hidden relative">
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
              <SelectionContextMenu position={contextMenu.position} onClose={closeContextMenu} />
            )}
          </div>
          <ChatPanel />
        </div>
        {rightPanelOpen && <PropertyPanel />}
        <StatusBar />
      </div>
      {ActiveDialog && <ActiveDialog />}
      <Notifications />
      <MeasurementsPanel />
      {children}
    </>
  );
}
