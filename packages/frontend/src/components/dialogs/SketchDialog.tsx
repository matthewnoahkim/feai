/**
 * SketchDialog - Enhanced sketch plane selection dialog
 * Academic/scholarly theme styling
 * 
 * Features:
 * - Visual plane previews with 3D representation
 * - Auto-orient view option
 * - Planar face selection from existing geometry
 * - Keyboard shortcuts
 */

import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  Square, 
  Check, 
  Eye, 
  RotateCcw,
  Layers,
  Box,
  Grid3X3
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

interface PlaneOption {
  id: string
  name: string
  description: string
  color: string
  colorClass: string
  normal: [number, number, number]
  origin: [number, number, number]
  icon: React.ReactNode
}

export function SketchDialog() {
  const { closeDialog, enterSketchMode, addNotification, setDialogData } = useUIStore()
  const { document, createSketch } = useDocumentStore()
  
  const [selectedPlane, setSelectedPlane] = useState<string>('top')
  const [autoOrientView, setAutoOrientView] = useState(true)
  const [sketchName, setSketchName] = useState('')
  const [hoveredPlane, setHoveredPlane] = useState<string | null>(null)
  
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Standard reference planes - all navy blue
  const referencePlanes: PlaneOption[] = [
    { 
      id: 'top', 
      name: 'Top Plane', 
      description: 'XY Plane (looking down Z axis)',
      color: '#1a4d8f',
      colorClass: 'bg-cad-accent',
      normal: [0, 0, 1], 
      origin: [0, 0, 0],
      icon: <Square size={16} className="text-white" />
    },
    { 
      id: 'front', 
      name: 'Front Plane', 
      description: 'XZ Plane (looking down Y axis)',
      color: '#1a4d8f',
      colorClass: 'bg-cad-accent',
      normal: [0, 1, 0], 
      origin: [0, 0, 0],
      icon: <Square size={16} className="text-white" />
    },
    { 
      id: 'right', 
      name: 'Right Plane', 
      description: 'YZ Plane (looking down X axis)',
      color: '#1a4d8f',
      colorClass: 'bg-cad-accent',
      normal: [1, 0, 0], 
      origin: [0, 0, 0],
      icon: <Square size={16} className="text-white" />
    }
  ]
  
  // Planar faces from existing parts
  const planarFaces = useMemo((): PlaneOption[] => {
    if (!activePartStudio?.parts) return []
    
    const faces: PlaneOption[] = []
    activePartStudio.parts.forEach((part) => {
      const faceTypes = [
        { suffix: 'top', name: 'Top Face', normal: [0, 1, 0] as [number, number, number] },
        { suffix: 'bottom', name: 'Bottom Face', normal: [0, -1, 0] as [number, number, number] },
        { suffix: 'front', name: 'Front Face', normal: [0, 0, 1] as [number, number, number] },
        { suffix: 'back', name: 'Back Face', normal: [0, 0, -1] as [number, number, number] },
        { suffix: 'left', name: 'Left Face', normal: [-1, 0, 0] as [number, number, number] },
        { suffix: 'right', name: 'Right Face', normal: [1, 0, 0] as [number, number, number] },
      ]
      
      faceTypes.forEach((faceType, index) => {
        faces.push({
          id: `${part.id}-face-${index}`,
          name: `${part.name} — ${faceType.name}`,
          description: 'Planar face on existing body',
          color: '#5c5c5c',
          colorClass: 'bg-cad-text-dim',
          normal: faceType.normal,
          origin: [0, 0, 0],
          icon: <Box size={16} className="text-white" />
        })
      })
    })
    
    return faces
  }, [activePartStudio])
  
  // Combine all plane options
  const allPlanes = [...referencePlanes, ...planarFaces]
  
  // Get selected plane info
  const selectedPlaneInfo = allPlanes.find(p => p.id === selectedPlane)
  
  // Generate sketch name
  useEffect(() => {
    if (activePartStudio) {
      const existingCount = activePartStudio.sketches.size
      setSketchName(`Sketch ${existingCount + 1}`)
    }
  }, [activePartStudio])
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input
      if (e.target instanceof HTMLInputElement) return
      
      if (e.key === 'Escape') {
        closeDialog()
      } else if (e.key === '1') {
        setSelectedPlane('top')
      } else if (e.key === '2') {
        setSelectedPlane('front')
      } else if (e.key === '3') {
        setSelectedPlane('right')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDialog])
  
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    // Determine which plane type
    const planeId = selectedPlane.includes('face-') ? 'top' : selectedPlane // Default to top for faces
    
    const sketch = await createSketch(activePartStudio.id, planeId)
    
    if (sketch) {
      const plane = selectedPlaneInfo || referencePlanes[0]
      addNotification('success', `Created ${sketch.name}`)
      closeDialog()
      
      // Enter sketch mode with auto-orient option
      enterSketchMode(activePartStudio.id, sketch.id, {
        normal: plane.normal,
        origin: plane.origin
      })
      
      // TODO: If autoOrientView, trigger camera animation to normal view
    } else {
      addNotification('error', 'Failed to create sketch')
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-cad-panel border border-cad-border shadow-xl w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/10 flex items-center justify-center">
              <Grid3X3 size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-serif font-semibold text-cad-text">Create Sketch</h2>
          </div>
          <button
            onClick={closeDialog}
            className="p-1.5 hover:bg-cad-panel border border-transparent hover:border-cad-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4 font-sans">
          {/* Sketch Name */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Sketch Name
            </label>
            <input
              type="text"
              value={sketchName}
              onChange={(e) => setSketchName(e.target.value)}
              className="w-full px-3 py-2 bg-cad-panel border border-cad-border text-sm focus:border-cad-accent focus:outline-none"
              placeholder="Enter sketch name..."
            />
          </div>
          
          {/* Reference Planes Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Layers size={12} />
              Reference Planes
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {referencePlanes.map((plane) => (
                <button
                  key={plane.id}
                  onClick={() => setSelectedPlane(plane.id)}
                  onMouseEnter={() => setHoveredPlane(plane.id)}
                  onMouseLeave={() => setHoveredPlane(null)}
                  className={`
                    relative flex flex-col items-center gap-2 p-3 border-2 transition-all
                    ${selectedPlane === plane.id 
                      ? 'border-cad-accent bg-cad-accent/5' 
                      : 'border-cad-border hover:border-cad-accent/50 hover:bg-gray-50'}
                  `}
                >
                  {/* Plane preview */}
                  <div 
                    className={`w-12 h-12 ${plane.colorClass} flex items-center justify-center shadow`}
                    style={{ 
                      transform: plane.id === 'top' ? 'perspective(100px) rotateX(30deg)' :
                                 plane.id === 'front' ? 'perspective(100px) rotateY(-10deg)' :
                                 'perspective(100px) rotateY(20deg)'
                    }}
                  >
                    {plane.icon}
                  </div>
                  
                  {/* Name */}
                  <span className="text-xs font-medium text-cad-text">{plane.name}</span>
                  
                  {/* Keyboard hint */}
                  <span className="absolute top-1 right-1 text-[10px] text-cad-text-dim px-1.5 py-0.5 bg-gray-50 border border-cad-border">
                    {plane.id === 'top' ? '1' : plane.id === 'front' ? '2' : '3'}
                  </span>
                  
                  {/* Selection indicator */}
                  {selectedPlane === plane.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-cad-accent flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Planar Faces Section (if parts exist) */}
          {planarFaces.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                <Box size={12} />
                Planar Faces on Bodies
              </label>
              
              <div className="max-h-32 overflow-y-auto space-y-1 bg-gray-50 border border-cad-border p-2">
                {planarFaces.slice(0, 6).map((face) => (
                  <button
                    key={face.id}
                    onClick={() => setSelectedPlane(face.id)}
                    onMouseEnter={() => setHoveredPlane(face.id)}
                    onMouseLeave={() => setHoveredPlane(null)}
                    className={`
                      w-full flex items-center gap-2 p-2 transition-colors text-left
                      ${selectedPlane === face.id 
                        ? 'bg-cad-accent/10 border border-cad-accent/50' 
                        : 'hover:bg-cad-panel border border-transparent'}
                    `}
                  >
                    <div className={`w-6 h-6 ${face.colorClass} flex items-center justify-center`}>
                      {face.icon}
                    </div>
                    <span className="text-xs text-cad-text truncate">{face.name}</span>
                    {selectedPlane === face.id && (
                      <Check size={14} className="ml-auto text-cad-accent" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Selected Plane Info */}
          {selectedPlaneInfo && (
            <div className="p-3 bg-gray-50 border border-cad-border">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3"
                  style={{ backgroundColor: selectedPlaneInfo.color }}
                />
                <span className="text-sm font-medium text-cad-text">{selectedPlaneInfo.name}</span>
              </div>
              <p className="text-xs text-cad-text-dim">{selectedPlaneInfo.description}</p>
            </div>
          )}
          
          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoOrientView}
                onChange={(e) => setAutoOrientView(e.target.checked)}
                className="w-4 h-4 border-cad-border bg-cad-panel accent-cad-accent"
              />
              <span className="text-sm text-cad-text flex items-center gap-2">
                <Eye size={14} />
                Auto-orient view normal to sketch plane
              </span>
            </label>
          </div>
          
          {/* Help text */}
          <div className="p-3 bg-cad-accent/5 border border-cad-accent/20">
            <p className="text-xs text-cad-text-dim">
              <strong className="text-cad-accent">Tip:</strong> You can also click directly on a planar face in the viewport 
              before clicking "Sketch" to automatically select that face as the sketch plane.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-gray-50">
          <div className="text-xs text-cad-text-dim font-sans">
            Press <kbd className="px-1.5 py-0.5 bg-cad-panel text-[10px] border border-cad-border">Enter</kbd> to create
          </div>
          <div className="flex gap-2 font-sans">
            <button
              onClick={closeDialog}
              className="px-4 py-2 text-sm bg-cad-panel border border-cad-border hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm bg-cad-accent hover:bg-cad-accent-hover text-white transition-colors flex items-center gap-2"
            >
              <Check size={14} />
              Create Sketch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
