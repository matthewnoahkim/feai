/**
 * Box Selection Overlay - Visual rectangle for drag-select in 3D viewport
 * 
 * Features:
 * - Window selection (left-to-right): Blue, solid border, only fully enclosed
 * - Crossing selection (right-to-left): Green, dashed border, any intersection
 * - Real-time preview of selected entities
 * - Semi-transparent fill for visibility
 */

import React from 'react'
import { useUIStore } from '../store/uiStore'

export function BoxSelectionOverlay() {
  const { boxSelection } = useUIStore()
  
  if (!boxSelection.isActive) return null
  
  // Calculate rectangle dimensions
  const left = Math.min(boxSelection.startX, boxSelection.currentX)
  const top = Math.min(boxSelection.startY, boxSelection.currentY)
  const width = Math.abs(boxSelection.currentX - boxSelection.startX)
  const height = Math.abs(boxSelection.currentY - boxSelection.startY)
  
  // Determine visual style based on mode
  const isWindow = boxSelection.mode === 'window'
  const isCrossing = boxSelection.mode === 'crossing'
  
  // Colors and styles
  const fillColor = isWindow ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)' // Blue or Green
  const borderColor = isWindow ? '#3b82f6' : '#22c55e'
  const borderStyle = isWindow ? 'solid' : 'dashed'
  const borderWidth = isWindow ? '2px' : '2px'
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: fillColor,
        border: `${borderWidth} ${borderStyle} ${borderColor}`,
        boxSizing: 'border-box',
        zIndex: 1000
      }}
    >
      {/* Optional label showing mode */}
      {boxSelection.mode && (
        <div
          className="absolute -top-6 left-0 px-2 py-1 text-xs font-sans font-medium rounded shadow-sm"
          style={{
            backgroundColor: borderColor,
            color: 'white'
          }}
        >
          {isWindow ? 'Window Select' : 'Crossing Select'}
          {boxSelection.previewIds.length > 0 && ` (${boxSelection.previewIds.length})`}
        </div>
      )}
    </div>
  )
}

