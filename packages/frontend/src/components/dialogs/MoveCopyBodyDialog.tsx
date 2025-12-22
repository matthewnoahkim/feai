/**
 * MoveCopyBodyDialog - Transform body with precise controls
 * Supports move and copy operations with translation and rotation
 */

import React, { useState, useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import { 
  X, 
  Move, 
  RotateCcw, 
  Copy,
  Check,
  Globe,
  Box as BoxIcon
} from 'lucide-react'

export function MoveCopyBodyDialog() {
  const {
    transformState,
    setTransformTranslation,
    setTransformRotation,
    toggleCreateCopy,
    setGizmoMode,
    setCoordinateSpace,
    applyTransform,
    cancelTransform
  } = useUIStore()
  
  const [localTranslation, setLocalTranslation] = useState(transformState.translation)
  const [localRotation, setLocalRotation] = useState(transformState.rotation)
  
  // Sync local state with store
  useEffect(() => {
    setLocalTranslation(transformState.translation)
  }, [transformState.translation])
  
  useEffect(() => {
    setLocalRotation(transformState.rotation)
  }, [transformState.rotation])
  
  const handleTranslationChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0
    const newTranslation = { ...localTranslation, [axis]: numValue }
    setLocalTranslation(newTranslation)
    setTransformTranslation(newTranslation)
  }
  
  const handleRotationAxisChange = (axis: 'x' | 'y' | 'z') => {
    const newRotation = { ...localRotation, axis }
    setLocalRotation(newRotation)
    setTransformRotation(newRotation)
  }
  
  const handleRotationAngleChange = (value: string) => {
    const angle = parseFloat(value) || 0
    const newRotation = { ...localRotation, angle }
    setLocalRotation(newRotation)
    setTransformRotation(newRotation)
  }
  
  const handleApply = async () => {
    await applyTransform()
  }
  
  const handleCancel = () => {
    cancelTransform()
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleApply()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onKeyDown={handleKeyDown}>
      <div className="bg-white border border-cad-border w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-cad-panel">
          <div className="flex items-center gap-2">
            {transformState.mode === 'copy' ? (
              <Copy size={18} className="text-cad-accent" />
            ) : (
              <Move size={18} className="text-cad-accent" />
            )}
            <h2 className="font-serif text-lg text-cad-text">
              {transformState.mode === 'copy' ? 'Copy Body' : 'Move Body'}
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X size={18} className="text-cad-text-dim" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Gizmo Mode Selector */}
          <div>
            <label className="block text-sm font-sans font-medium text-cad-text mb-2">
              Interaction Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGizmoMode('translate')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-sans border transition-colors
                  ${transformState.gizmoMode === 'translate'
                    ? 'bg-cad-accent text-white border-cad-accent'
                    : 'bg-white text-cad-text border-cad-border hover:bg-gray-50'
                  }
                `}
              >
                <Move size={14} />
                Translate
              </button>
              <button
                onClick={() => setGizmoMode('rotate')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-sans border transition-colors
                  ${transformState.gizmoMode === 'rotate'
                    ? 'bg-cad-accent text-white border-cad-accent'
                    : 'bg-white text-cad-text border-cad-border hover:bg-gray-50'
                  }
                `}
              >
                <RotateCcw size={14} />
                Rotate
              </button>
            </div>
          </div>
          
          {/* Translation Controls */}
          <div>
            <label className="block text-sm font-sans font-medium text-cad-text mb-2">
              Translation (mm)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-sans text-cad-text-dim mb-1">X</label>
                <input
                  type="number"
                  value={localTranslation.x}
                  onChange={(e) => handleTranslationChange('x', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm font-mono border border-cad-border focus:outline-none focus:border-cad-accent"
                  placeholder="0.0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-sans text-cad-text-dim mb-1">Y</label>
                <input
                  type="number"
                  value={localTranslation.y}
                  onChange={(e) => handleTranslationChange('y', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm font-mono border border-cad-border focus:outline-none focus:border-cad-accent"
                  placeholder="0.0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-sans text-cad-text-dim mb-1">Z</label>
                <input
                  type="number"
                  value={localTranslation.z}
                  onChange={(e) => handleTranslationChange('z', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm font-mono border border-cad-border focus:outline-none focus:border-cad-accent"
                  placeholder="0.0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          
          {/* Rotation Controls */}
          <div>
            <label className="block text-sm font-sans font-medium text-cad-text mb-2">
              Rotation
            </label>
            <div className="space-y-2">
              {/* Axis selector */}
              <div>
                <label className="block text-xs font-sans text-cad-text-dim mb-1">Axis</label>
                <div className="flex gap-2">
                  {(['x', 'y', 'z'] as const).map((axis) => (
                    <button
                      key={axis}
                      onClick={() => handleRotationAxisChange(axis)}
                      className={`
                        flex-1 px-3 py-1.5 text-sm font-sans border transition-colors
                        ${localRotation.axis === axis
                          ? 'bg-cad-accent text-white border-cad-accent'
                          : 'bg-white text-cad-text border-cad-border hover:bg-gray-50'
                        }
                      `}
                    >
                      {axis.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Angle input */}
              <div>
                <label className="block text-xs font-sans text-cad-text-dim mb-1">Angle (degrees)</label>
                <input
                  type="number"
                  value={localRotation.angle}
                  onChange={(e) => handleRotationAngleChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm font-mono border border-cad-border focus:outline-none focus:border-cad-accent"
                  placeholder="0.0"
                  step="1"
                />
              </div>
            </div>
          </div>
          
          {/* Coordinate Space Selector */}
          <div>
            <label className="block text-sm font-sans font-medium text-cad-text mb-2">
              Coordinate Space
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setCoordinateSpace('world')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-sans border transition-colors
                  ${transformState.coordinateSpace === 'world'
                    ? 'bg-cad-accent text-white border-cad-accent'
                    : 'bg-white text-cad-text border-cad-border hover:bg-gray-50'
                  }
                `}
              >
                <Globe size={14} />
                World
              </button>
              <button
                onClick={() => setCoordinateSpace('local')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-sans border transition-colors
                  ${transformState.coordinateSpace === 'local'
                    ? 'bg-cad-accent text-white border-cad-accent'
                    : 'bg-white text-cad-text border-cad-border hover:bg-gray-50'
                  }
                `}
              >
                <BoxIcon size={14} />
                Local
              </button>
            </div>
          </div>
          
          {/* Create Copy Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-cad-border rounded">
            <input
              type="checkbox"
              id="create-copy"
              checked={transformState.createCopy}
              onChange={toggleCreateCopy}
              className="w-4 h-4 text-cad-accent border-cad-border rounded focus:ring-cad-accent"
            />
            <label htmlFor="create-copy" className="flex-1 text-sm font-sans text-cad-text cursor-pointer">
              Create a copy (original stays in place)
            </label>
            <Copy size={14} className="text-cad-text-dim" />
          </div>
          
          {/* Help text */}
          <div className="text-xs text-cad-text-dim font-sans bg-blue-50 border border-blue-200 p-2 rounded">
            <strong>Tip:</strong> Use the gizmo in the 3D view to drag the body interactively. 
            Values will update in real-time.
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-cad-border bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-sans text-cad-text border border-cad-border hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-sans text-white bg-cad-accent hover:bg-cad-accent-hover transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            {transformState.createCopy ? 'Copy & Move' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

