/**
 * Sketch Dialog - Create new sketch on a plane
 */

import React, { useState } from 'react'
import { X, Square } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

export function SketchDialog() {
  const { closeDialog, enterSketchMode, addNotification } = useUIStore()
  const { document, createSketch } = useDocumentStore()
  
  const [selectedPlane, setSelectedPlane] = useState<'top' | 'front' | 'right'>('top')
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document.activeElementId)
  
  const planes = [
    { id: 'top', name: 'Top Plane (XY)', color: 'bg-blue-500', normal: [0, 0, 1] as [number, number, number], origin: [0, 0, 0] as [number, number, number] },
    { id: 'front', name: 'Front Plane (XZ)', color: 'bg-green-500', normal: [0, 1, 0] as [number, number, number], origin: [0, 0, 0] as [number, number, number] },
    { id: 'right', name: 'Right Plane (YZ)', color: 'bg-red-500', normal: [1, 0, 0] as [number, number, number], origin: [0, 0, 0] as [number, number, number] }
  ]
  
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    const sketch = await createSketch(activePartStudio.id, selectedPlane)
    
    if (sketch) {
      const plane = planes.find(p => p.id === selectedPlane)!
      addNotification('success', `Created ${sketch.name}`)
      closeDialog()
      
      // Enter sketch mode
      enterSketchMode(activePartStudio.id, sketch.id, {
        normal: plane.normal,
        origin: plane.origin
      })
    } else {
      addNotification('error', 'Failed to create sketch')
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-cad-dark border border-cad-border rounded-lg shadow-2xl w-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border">
          <h2 className="font-semibold text-cad-text">Create Sketch</h2>
          <button
            onClick={closeDialog}
            className="p-1 hover:bg-cad-panel rounded"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-cad-text-dim mb-4">
            Select a plane to create the sketch on:
          </p>
          
          <div className="space-y-2">
            {planes.map(plane => (
              <button
                key={plane.id}
                onClick={() => setSelectedPlane(plane.id as any)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded border transition-colors
                  ${selectedPlane === plane.id 
                    ? 'border-cad-accent bg-cad-accent/10' 
                    : 'border-cad-border hover:border-cad-accent/50 hover:bg-cad-panel/50'}
                `}
              >
                <div className={`w-8 h-8 ${plane.color} rounded flex items-center justify-center`}>
                  <Square size={16} className="text-white" />
                </div>
                <span className="text-sm">{plane.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-cad-darker rounded border border-cad-border">
            <p className="text-xs text-cad-text-dim">
              You can also select a planar face on an existing body to create a sketch on that face.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-cad-border">
          <button
            onClick={closeDialog}
            className="px-4 py-2 text-sm bg-cad-panel hover:bg-cad-border rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm bg-cad-accent hover:bg-cad-accent-hover text-white rounded transition-colors"
          >
            Create Sketch
          </button>
        </div>
      </div>
    </div>
  )
}

