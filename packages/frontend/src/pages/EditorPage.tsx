/**
 * Editor Page - CAD Editor wrapper
 * Contains the main 3D modeling interface
 */

import React, { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Viewport3D } from '../components/Viewport3D'
import { FeatureTree } from '../components/FeatureTree'
import { Toolbar } from '../components/Toolbar'
import { SketchToolbar } from '../components/SketchToolbar'
import { SketchCanvas } from '../components/SketchCanvas'
import { SketchModeBar } from '../components/SketchModeBar'
import { SelectionManager } from '../components/SelectionManager'
import { SelectionContextMenu, useContextMenu } from '../components/SelectionContextMenu'
import { PropertyPanel } from '../components/PropertyPanel'
import { StatusBar } from '../components/StatusBar'
import { ExtrudeDialog } from '../components/dialogs/ExtrudeDialog'
import { RevolveDialog } from '../components/dialogs/RevolveDialog'
import { SweepDialog } from '../components/dialogs/SweepDialog'
import { LoftDialog } from '../components/dialogs/LoftDialog'
import { FilletDialog } from '../components/dialogs/FilletDialog'
import { ChamferDialog } from '../components/dialogs/ChamferDialog'
import { ShellDialog } from '../components/dialogs/ShellDialog'
import { MirrorFeatureDialog } from '../components/dialogs/MirrorFeatureDialog'
import { LinearPatternDialog } from '../components/dialogs/LinearPatternDialog'
import { CircularPatternDialog } from '../components/dialogs/CircularPatternDialog'
import { SketchDialog } from '../components/dialogs/SketchDialog'
import { Notifications } from '../components/Notifications'
import { ChatPanel, ChatToggleButton } from '../components/chat'
import { SimulationPanel } from '../components/fea'
import { useDocumentStore } from '../store/documentStore'
import { useUIStore } from '../store/uiStore'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'

export function EditorPage() {
  const { projectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { fetchProject, currentProject, saveProjectData } = useProjectStore()
  const { document, createNewDocument, loadDocumentFromData } = useDocumentStore()
  const { 
    activeMode, 
    sketchMode, 
    activeDialog, 
    leftPanelOpen, 
    rightPanelOpen,
    exitSketchMode,
    setActiveTool,
    clearSelection,
    addNotification
  } = useUIStore()
  
  // Context menu state
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu()

  // Load project if projectId is provided
  useEffect(() => {
    if (projectId && user) {
      fetchProject(projectId).then((project) => {
        if (project?.data) {
          loadDocumentFromData(project.data)
        } else {
          createNewDocument(project?.name || 'New Part')
        }
      })
    } else if (!document) {
      createNewDocument('New Part')
    }
  }, [projectId, user, fetchProject, document, createNewDocument, loadDocumentFromData])

  // Auto-save project data periodically
  useEffect(() => {
    if (!projectId || !document || !user) return
    
    const saveInterval = setInterval(() => {
      saveProjectData(projectId, document).catch(console.error)
    }, 30000) // Save every 30 seconds
    
    return () => clearInterval(saveInterval)
  }, [projectId, document, user, saveProjectData])

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
    addNotification('info', 'View oriented normal to sketch plane')
  }, [addNotification])

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      if (sketchMode) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          handleConfirmSketch()
          return
        }
        
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault()
          handleViewNormal()
          return
        }
      }
      
      if (e.key === 'Escape') {
        if (sketchMode) {
          handleCancelSketch()
        } else {
          setActiveTool(null)
          clearSelection()
        }
      }
      
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        console.log('Undo')
      }
      
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        console.log('Redo')
      }
      
      if (e.key === 'Delete') {
        const selection = useUIStore.getState().selection
        if (selection.ids.length > 0) {
          console.log('Delete selection:', selection)
        }
      }
      
      if (!sketchMode) {
        if (e.key === 'Home') {
          addNotification('info', 'View reset to home')
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sketchMode, setActiveTool, clearSelection, handleConfirmSketch, handleCancelSketch, handleViewNormal, addNotification])

  const isSketchMode = activeMode === 'sketch' && sketchMode

  return (
    <Layout>
      {/* Top Toolbar */}
      {isSketchMode ? <SketchToolbar /> : <Toolbar />}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Feature Tree */}
        {leftPanelOpen && <FeatureTree />}

        {/* 3D Viewport / Sketch Canvas */}
        <div 
          className="flex-1 relative bg-white min-h-0 min-w-0"
          onContextMenu={!isSketchMode ? openContextMenu : undefined}
        >
          <SelectionManager>
            {/* 3D view */}
            <div className={`absolute inset-0 ${isSketchMode ? 'opacity-0 pointer-events-none' : ''}`}>
              <Viewport3D />
            </div>
            
            {/* Sketch Canvas */}
            {isSketchMode && <SketchCanvas />}
            
            {/* Sketch Mode Bar */}
            {isSketchMode && (
              <SketchModeBar
                onConfirm={handleConfirmSketch}
                onCancel={handleCancelSketch}
                onViewNormal={handleViewNormal}
              />
            )}
            
            {/* View controls hint */}
            {!isSketchMode && (
              <div className="absolute bottom-4 left-4 text-xs text-cad-text-dim bg-cad-panel/90 backdrop-blur px-3 py-2 border border-cad-border z-10 font-sans">
                <div className="flex items-center gap-4">
                  <span>Left: Rotate</span>
                  <span>Middle: Pan</span>
                  <span>Scroll: Zoom</span>
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
      
      {/* FEA Simulation Panel */}
      <SimulationPanel />
      
      {/* AI Chat Assistant */}
      <ChatPanel />
      <ChatToggleButton />
    </Layout>
  )
}

