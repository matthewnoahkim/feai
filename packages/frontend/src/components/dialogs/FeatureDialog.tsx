/**
 * Feature Dialog - Create/edit modeling features
 */

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

interface FeatureDialogProps {
  type: 'extrude' | 'revolve' | 'fillet' | 'chamfer' | 'shell' | 'sweep' | 'loft'
}

export function FeatureDialog({ type }: FeatureDialogProps) {
  const { closeDialog, dialogData, addNotification } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Feature parameters
  const [depth, setDepth] = useState(25)
  const [radius, setRadius] = useState(5)
  const [angle, setAngle] = useState(360)
  const [thickness, setThickness] = useState(2)
  const [direction, setDirection] = useState<'one' | 'symmetric' | 'two'>('one')
  const [operation, setOperation] = useState<'new' | 'add' | 'subtract' | 'intersect'>('new')
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document.activeElementId)
  
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    let params: Record<string, any> = {}
    let name = ''
    
    switch (type) {
      case 'extrude':
        params = {
          depth,
          direction,
          operation,
          width: 30,
          height: 30
        }
        name = `Extrude ${activePartStudio.features.filter(f => f.type === 'extrude').length + 1}`
        break
        
      case 'revolve':
        params = {
          angle,
          radius: 15,
          height: depth,
          operation
        }
        name = `Revolve ${activePartStudio.features.filter(f => f.type === 'revolve').length + 1}`
        break
        
      case 'fillet':
        params = {
          radius,
          edges: dialogData?.selectedEdges || []
        }
        name = `Fillet ${activePartStudio.features.filter(f => f.type === 'fillet').length + 1}`
        break
        
      case 'chamfer':
        params = {
          distance: radius,
          edges: dialogData?.selectedEdges || []
        }
        name = `Chamfer ${activePartStudio.features.filter(f => f.type === 'chamfer').length + 1}`
        break
        
      case 'shell':
        params = {
          thickness,
          faces: dialogData?.selectedFaces || []
        }
        name = `Shell ${activePartStudio.features.filter(f => f.type === 'shell').length + 1}`
        break
    }
    
    const feature = await addFeature(activePartStudio.id, {
      type,
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      addNotification('success', `Created ${name}`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create feature')
    }
  }
  
  const titles: Record<string, string> = {
    extrude: 'Extrude',
    revolve: 'Revolve',
    fillet: 'Fillet',
    chamfer: 'Chamfer',
    shell: 'Shell',
    sweep: 'Sweep',
    loft: 'Loft'
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-cad-dark border border-cad-border rounded-lg shadow-2xl w-96 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border">
          <h2 className="font-semibold text-cad-text">{titles[type]}</h2>
          <button
            onClick={closeDialog}
            className="p-1 hover:bg-cad-panel rounded"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Extrude options */}
          {type === 'extrude' && (
            <>
              <div>
                <label className="block text-xs text-cad-text-dim mb-1">Depth (mm)</label>
                <input
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
                />
              </div>
              
              <div>
                <label className="block text-xs text-cad-text-dim mb-1">Direction</label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as any)}
                  className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
                >
                  <option value="one">One Direction</option>
                  <option value="symmetric">Symmetric</option>
                  <option value="two">Two Directions</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-cad-text-dim mb-1">Operation</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
                >
                  <option value="new">New</option>
                  <option value="add">Add</option>
                  <option value="subtract">Remove</option>
                  <option value="intersect">Intersect</option>
                </select>
              </div>
            </>
          )}
          
          {/* Revolve options */}
          {type === 'revolve' && (
            <>
              <div>
                <label className="block text-xs text-cad-text-dim mb-1">Angle (degrees)</label>
                <input
                  type="number"
                  value={angle}
                  onChange={(e) => setAngle(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={360}
                  className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
                />
              </div>
              
              <div>
                <label className="block text-xs text-cad-text-dim mb-1">Operation</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
                >
                  <option value="new">New</option>
                  <option value="add">Add</option>
                  <option value="subtract">Remove</option>
                  <option value="intersect">Intersect</option>
                </select>
              </div>
            </>
          )}
          
          {/* Fillet/Chamfer options */}
          {(type === 'fillet' || type === 'chamfer') && (
            <div>
              <label className="block text-xs text-cad-text-dim mb-1">
                {type === 'fillet' ? 'Radius' : 'Distance'} (mm)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value) || 0)}
                min={0.1}
                step={0.5}
                className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
              />
            </div>
          )}
          
          {/* Shell options */}
          {type === 'shell' && (
            <div>
              <label className="block text-xs text-cad-text-dim mb-1">Wall Thickness (mm)</label>
              <input
                type="number"
                value={thickness}
                onChange={(e) => setThickness(parseFloat(e.target.value) || 0)}
                min={0.1}
                step={0.5}
                className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
              />
            </div>
          )}
          
          {/* Selection info */}
          <div className="p-3 bg-cad-darker rounded border border-cad-border">
            <p className="text-xs text-cad-text-dim">
              {type === 'extrude' || type === 'revolve' ? (
                'Select a sketch profile to extrude/revolve, or a default profile will be used.'
              ) : type === 'fillet' || type === 'chamfer' ? (
                'Select edges in the viewport to apply the operation.'
              ) : (
                'Select faces to remove for shell operation.'
              )}
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
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

