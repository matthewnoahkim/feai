/**
 * DeleteFeatureDialog - Confirmation dialog for feature deletion
 * Shows preview of model without the feature
 */

import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { useDocumentStore } from '../../store/documentStore'
import { useUIStore } from '../../store/uiStore'

interface DeleteFeatureDialogProps {
  featureId: string
  partStudioId: string
  onClose: () => void
}

export function DeleteFeatureDialog({ featureId, partStudioId, onClose }: DeleteFeatureDialogProps) {
  const { document, deleteFeature } = useDocumentStore()
  const { addNotification } = useUIStore()
  
  // Find the feature
  const partStudio = document?.partStudios.find(ps => ps.id === partStudioId)
  const feature = partStudio?.features.find(f => f.id === featureId)
  
  if (!feature) {
    onClose()
    return null
  }
  
  // Check for dependent features (simplified - in a real CAD system this would be more complex)
  const dependentFeatures = partStudio?.features.filter(f => 
    f.dependencies?.includes(featureId)
  ) || []
  
  const handleDelete = async () => {
    try {
      await deleteFeature(partStudioId, featureId)
      addNotification('success', `Feature "${feature.name}" deleted`)
      onClose()
    } catch (error) {
      addNotification('error', 'Failed to delete feature')
      console.error('Delete feature error:', error)
    }
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
              Delete Feature
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
            Are you sure you want to delete the feature <strong>"{feature.name}"</strong>?
          </div>
          
          {dependentFeatures.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800 font-sans">
                  <strong>Warning:</strong> This feature has {dependentFeatures.length} dependent feature
                  {dependentFeatures.length !== 1 ? 's' : ''} that may be affected:
                  <ul className="mt-1 ml-4 list-disc">
                    {dependentFeatures.slice(0, 3).map(f => (
                      <li key={f.id}>{f.name}</li>
                    ))}
                    {dependentFeatures.length > 3 && (
                      <li>... and {dependentFeatures.length - 3} more</li>
                    )}
                  </ul>
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
            Delete Feature
          </button>
        </div>
      </div>
    </div>
  )
}

