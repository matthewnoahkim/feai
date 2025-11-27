import React, { useEffect, useCallback, useState } from 'react'
import { Layout } from './components/Layout'
import { Viewport3D } from './components/Viewport3D'
import { FeatureTree } from './components/FeatureTree'
import { Toolbar } from './components/Toolbar'
import { SketchToolbar } from './components/SketchToolbar'
import { SketchCanvas } from './components/SketchCanvas'
import { SketchModeBar } from './components/SketchModeBar'
import { SelectionManager } from './components/SelectionManager'
import { SelectionContextMenu, useContextMenu } from './components/SelectionContextMenu'
import { PropertyPanel } from './components/PropertyPanel'
import { StatusBar } from './components/StatusBar'
import { FeatureDialog } from './components/dialogs/FeatureDialog'
import { ExtrudeDialog } from './components/dialogs/ExtrudeDialog'
import { RevolveDialog } from './components/dialogs/RevolveDialog'
import { SweepDialog } from './components/dialogs/SweepDialog'
import { LoftDialog } from './components/dialogs/LoftDialog'
import { FilletDialog } from './components/dialogs/FilletDialog'
import { ChamferDialog } from './components/dialogs/ChamferDialog'
import { ShellDialog } from './components/dialogs/ShellDialog'
import { MirrorFeatureDialog } from './components/dialogs/MirrorFeatureDialog'
import { LinearPatternDialog } from './components/dialogs/LinearPatternDialog'
import { CircularPatternDialog } from './components/dialogs/CircularPatternDialog'
import { SketchDialog } from './components/dialogs/SketchDialog'
import { Notifications } from './components/Notifications'
import { ChatPanel, ChatToggleButton } from './components/chat'
import { useDocumentStore } from './store/documentStore'
import { useUIStore } from './store/uiStore'
import { useChatStore } from './store/chatStore'

function App() {
  const { document, createNewDocument } = useDocumentStore()
  const { 
    activeMode, 
    sketchMode, 
    activeDialog, 
    leftPanelOpen, 
    rightPanelOpen,
    drawing,
    cancelDrawing,
    exitSketchMode,
    setActiveTool,
    clearSelection,
    addNotification
  } = useUIStore()
  
  // Context menu state
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu()

  // Create new document on first load
  useEffect(() => {
    if (!document) {
      createNewDocument('New Part')
    }
  }, [document, createNewDocument])

  // Sketch mode handlers
  const handleConfirmSketch = useCallback(() => {
    if (sketchMode) {
      addNotification('success', 'Sketch completed')
      exitSketchMode()
    }
  }, [sketchMode, exitSketchMode, addNotification])
  
  const handleCancelSketch = useCallback(() => {
    if (sketchMode) {
      addNotification('info', 'Sketch cancelled')
      exitSketchMode()
    }
  }, [sketchMode, exitSketchMode, addNotification])
  
  const handleViewNormal = useCallback(() => {
    // This would trigger camera animation to normal view
    // TODO: Implement camera control hook integration
    addNotification('info', 'View oriented normal to sketch plane')
  }, [addNotification])

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Sketch mode shortcuts
      if (sketchMode) {
        // Enter to confirm sketch
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          handleConfirmSketch()
          return
        }
        
        // N for normal view
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault()
          handleViewNormal()
          return
        }
      }
      
      // Exit with Escape
      if (e.key === 'Escape') {
        if (sketchMode) {
          handleCancelSketch()
        } else {
          setActiveTool(null)
          clearSelection()
        }
      }
      
      // Ctrl+Z for undo (placeholder)
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        console.log('Undo')
      }
      
      // Ctrl+Y for redo (placeholder)
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        console.log('Redo')
      }
      
      // Delete selected
      if (e.key === 'Delete') {
        const selection = useUIStore.getState().selection
        if (selection.ids.length > 0) {
          console.log('Delete selection:', selection)
        }
      }
      
      // View shortcuts (when not in sketch mode)
      if (!sketchMode) {
        // Home key to reset view
        if (e.key === 'Home') {
          // TODO: Reset camera to isometric view
          addNotification('info', 'View reset to home')
        }
        
        // Number keys for standard views
        if (e.key === '1') {
          // Front view
        } else if (e.key === '2') {
          // Top view
        } else if (e.key === '3') {
          // Right view
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sketchMode, setActiveTool, clearSelection, handleConfirmSketch, handleCancelSketch, handleViewNormal, addNotification])

  const isSketchMode = activeMode === 'sketch' && sketchMode

  return (
    <Layout>
      {/* Top Toolbar - switches based on mode */}
      {isSketchMode ? <SketchToolbar /> : <Toolbar />}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Feature Tree */}
        {leftPanelOpen && <FeatureTree />}

        {/* 3D Viewport / Sketch Canvas */}
        <div 
          className="flex-1 relative bg-cad-darker min-h-0 min-w-0"
          onContextMenu={!isSketchMode ? openContextMenu : undefined}
        >
          <SelectionManager>
            {/* 3D view - always rendered but hidden in sketch mode for context */}
            <div className={`absolute inset-0 ${isSketchMode ? 'opacity-0 pointer-events-none' : ''}`}>
              <Viewport3D />
            </div>
            
            {/* Sketch Canvas - 2D overlay for sketch editing */}
            {isSketchMode && <SketchCanvas />}
            
            {/* Sketch Mode Bar - floating controls */}
            {isSketchMode && (
              <SketchModeBar
                onConfirm={handleConfirmSketch}
                onCancel={handleCancelSketch}
                onViewNormal={handleViewNormal}
              />
            )}
            
            {/* View controls hint */}
            {!isSketchMode && (
              <div className="absolute bottom-4 left-4 text-xs text-cad-text-dim bg-cad-darker/80 backdrop-blur px-3 py-2 rounded-lg border border-cad-border/30 z-10">
                <div className="flex items-center gap-4">
                  <span>🖱️ Left: Rotate</span>
                  <span>🖱️ Middle: Pan</span>
                  <span>🖱️ Scroll: Zoom</span>
                </div>
              </div>
            )}
          </SelectionManager>
          
          {/* Selection Context Menu */}
          {contextMenu.isOpen && (
            <SelectionContextMenu
              position={contextMenu.position}
              onClose={closeContextMenu}
            />
          )}
        </div>

        {/* Right Panel - Properties */}
        {rightPanelOpen && <PropertyPanel />}
      </div>

      {/* Status Bar */}
      <StatusBar />
      
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
      
      {/* Notifications */}
      <Notifications />
      
      {/* AI Chat Assistant */}
      <ChatPanel />
      <ChatToggleButton />
    </Layout>
  )
}

export default App
