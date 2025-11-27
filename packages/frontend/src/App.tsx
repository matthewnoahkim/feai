import React, { useEffect } from 'react'
import { Layout } from './components/Layout'
import { Viewport3D } from './components/Viewport3D'
import { FeatureTree } from './components/FeatureTree'
import { Toolbar } from './components/Toolbar'
import { SketchToolbar } from './components/SketchToolbar'
import { SketchCanvas } from './components/SketchCanvas'
import { PropertyPanel } from './components/PropertyPanel'
import { StatusBar } from './components/StatusBar'
import { FeatureDialog } from './components/dialogs/FeatureDialog'
import { SketchDialog } from './components/dialogs/SketchDialog'
import { Notifications } from './components/Notifications'
import { useDocumentStore } from './store/documentStore'
import { useUIStore } from './store/uiStore'

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
    clearSelection
  } = useUIStore()

  // Create new document on first load
  useEffect(() => {
    if (!document) {
      createNewDocument('New Part')
    }
  }, [document, createNewDocument])

  // Handle global keyboard shortcuts (non-sketch specific)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if we're in sketch mode - SketchCanvas handles its own shortcuts
      if (sketchMode) return
      
      // Exit with Escape
      if (e.key === 'Escape') {
        setActiveTool(null)
        clearSelection()
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
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sketchMode, setActiveTool, clearSelection])

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
        <div className="flex-1 relative bg-cad-darker min-h-0 min-w-0">
          {/* 3D view - always rendered but hidden in sketch mode for context */}
          <div className={`absolute inset-0 ${isSketchMode ? 'opacity-0 pointer-events-none' : ''}`}>
            <Viewport3D />
          </div>
          
          {/* Sketch Canvas - 2D overlay for sketch editing */}
          {isSketchMode && <SketchCanvas />}
          
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
        </div>

        {/* Right Panel - Properties */}
        {rightPanelOpen && <PropertyPanel />}
      </div>

      {/* Status Bar */}
      <StatusBar />
      
      {/* Dialogs */}
      {activeDialog === 'extrude' && <FeatureDialog type="extrude" />}
      {activeDialog === 'revolve' && <FeatureDialog type="revolve" />}
      {activeDialog === 'fillet' && <FeatureDialog type="fillet" />}
      {activeDialog === 'chamfer' && <FeatureDialog type="chamfer" />}
      {activeDialog === 'sketch' && <SketchDialog />}
      
      {/* Notifications */}
      <Notifications />
    </Layout>
  )
}

export default App
