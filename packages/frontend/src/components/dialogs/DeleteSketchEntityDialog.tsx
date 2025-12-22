/**
 * DeleteSketchEntityDialog - Confirmation for deleting sketch entities
 * Shows impact of deletion (constraints, dimensions that will be removed)
 */

import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { useDocumentStore } from '../../store/documentStore'
import { useUIStore } from '../../store/uiStore'

interface DeleteSketchEntityDialogProps {
  sketchId: string
  entityIds: string[]
  onClose: () => void
}

export function DeleteSketchEntityDialog({ 
  sketchId, 
  entityIds, 
  onClose 
}: DeleteSketchEntityDialogProps) {
  const { document, deleteSketchEntity } = useDocumentStore()
  const { addNotification } = useUIStore()
  
  // Find the sketch and entities
  let sketch: any = null
  for (const ps of document?.partStudios || []) {
    const foundSketch = ps.sketches.get(sketchId)
    if (foundSketch) {
      sketch = foundSketch
      break
    }
  }
  
  if (!sketch) {
    onClose()
    return null
  }
  
  const entities = sketch.entities.filter((e: any) => entityIds.includes(e.id))
  
  // Find affected constraints
  const affectedConstraints = sketch.constraints.filter((c: any) =>
    c.entityIds.some((id: string) => entityIds.includes(id))
  )
  
  const handleDelete = () => {
    // Delete each entity (constraints will be cleaned up automatically)
    entityIds.forEach(entityId => {
      deleteSketchEntity(sketchId, entityId)
    })
    
    const count = entityIds.length
    const constraintCount = affectedConstraints.length
    addNotification(
      'success', 
      `Deleted ${count} entit${count > 1 ? 'ies' : 'y'}${constraintCount > 0 ? ` and ${constraintCount} constraint${constraintCount > 1 ? 's' : ''}` : ''}`
    )
    onClose()
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleDelete()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" 
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white border border-cad-border w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="font-serif text-lg text-cad-text">
              Delete Sketch {entityIds.length > 1 ? 'Entities' : 'Entity'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-100 rounded transition-colors"
          >
            <X size={18} className="text-cad-text-dim" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="text-sm text-cad-text font-sans">
            {entityIds.length === 1 ? (
              <>
                Are you sure you want to delete this <strong>{entities[0]?.type}</strong>?
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{entityIds.length} sketch entities</strong>?
              </>
            )}
          </div>
          
          {/* Show entities being deleted */}
          {entityIds.length > 1 && entityIds.length <= 5 && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded">
              <div className="text-xs font-semibold text-cad-text mb-1">Entities to delete:</div>
              <ul className="text-xs text-cad-text-dim space-y-0.5 ml-4 list-disc">
                {entities.map((e: any) => (
                  <li key={e.id}>{e.type}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Show affected constraints */}
          {affectedConstraints.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800 font-sans">
                  <strong>Warning:</strong> This will also remove {affectedConstraints.length} constraint
                  {affectedConstraints.length > 1 ? 's' : ''} and dimension
                  {affectedConstraints.length > 1 ? 's' : ''}:
                  {affectedConstraints.length <= 3 ? (
                    <ul className="mt-1 ml-4 list-disc">
                      {affectedConstraints.map((c: any) => (
                        <li key={c.id}>{c.type}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-1">
                      {affectedConstraints.slice(0, 2).map((c: any) => c.type).join(', ')}, and {affectedConstraints.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 border border-cad-border p-3 rounded text-xs text-cad-text-dim font-sans">
            <strong>Note:</strong> This action can be undone using Ctrl+Z.
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-cad-border bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-sans text-cad-text border border-cad-border hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-sans text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete {entityIds.length > 1 ? `${entityIds.length} Entities` : 'Entity'}
          </button>
        </div>
      </div>
    </div>
  )
}

