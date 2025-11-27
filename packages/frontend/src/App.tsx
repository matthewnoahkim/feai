import React, { useEffect } from 'react'
import { Layout } from './components/Layout'
import { Viewport3D } from './components/Viewport3D'
import { FeatureTree } from './components/FeatureTree'
import { Toolbar } from './components/Toolbar'
import { PropertyPanel } from './components/PropertyPanel'
import { StatusBar } from './components/StatusBar'
import { FeatureDialog } from './components/dialogs/FeatureDialog'
import { SketchDialog } from './components/dialogs/SketchDialog'
import { Notifications } from './components/Notifications'
import { useDocumentStore } from './store/documentStore'
import { useUIStore } from './store/uiStore'

function App() {
  const { document, createNewDocument } = useDocumentStore()
  const { activeMode, sketchMode, activeDialog, leftPanelOpen, rightPanelOpen } = useUIStore()

  // Create new document on first load
  useEffect(() => {
    if (!document) {
      createNewDocument('New Part')
    }
  }, [document, createNewDocument])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Exit sketch mode with Escape
      if (e.key === 'Escape') {
        if (sketchMode) {
          useUIStore.getState().exitSketchMode()
        } else {
          useUIStore.getState().setActiveTool(null)
          useUIStore.getState().clearSelection()
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
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sketchMode])

  return (
    <Layout>
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Feature Tree */}
        {leftPanelOpen && <FeatureTree />}

        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <Viewport3D />
          
          {/* Mode indicator */}
          {activeMode === 'sketch' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg z-50">
              Sketch Mode - Press ESC to exit
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
