/**
 * MeasurementsPanel - Display and manage measurements
 * Shows list of measurements with expand/collapse details
 */

import React, { useState } from 'react'
import { useUIStore, Measurement } from '../store/uiStore'
import { useChatStore } from '../store/chatStore'
import { formatMeasurement, formatDelta } from '../utils/measurement-utils'
import { 
  Ruler, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  X,
  Copy,
  RotateCcw
} from 'lucide-react'

interface MeasurementItemProps {
  measurement: Measurement
  onRemove: (id: string) => void
}

function MeasurementItem({ measurement, onRemove }: MeasurementItemProps) {
  const [expanded, setExpanded] = useState(false)
  
  const formatEntityName = (entity: any) => {
    if (!entity) return 'Unknown'
    switch (entity.type) {
      case 'vertex': return 'Vertex'
      case 'edge': return 'Edge'
      case 'face': return 'Face'
      case 'point': return 'Point'
      default: return entity.type
    }
  }
  
  const formatTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  
  const copyToClipboard = () => {
    const text = formatMeasurement(measurement)
    navigator.clipboard.writeText(text)
  }
  
  return (
    <div className="border-b border-cad-border last:border-b-0">
      {/* Main measurement row */}
      <div className="px-3 py-2 hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-2">
          {/* Expand/collapse button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-0.5 p-0.5 hover:bg-gray-200 rounded transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown size={14} className="text-cad-text-dim" />
            ) : (
              <ChevronRight size={14} className="text-cad-text-dim" />
            )}
          </button>
          
          {/* Measurement icon */}
          <div className="mt-0.5">
            {measurement.type === 'angle' ? (
              <RotateCcw size={14} className="text-cad-accent" />
            ) : (
              <Ruler size={14} className="text-cad-accent" />
            )}
          </div>
          
          {/* Measurement value and info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-sm text-cad-text font-mono">
                  {formatMeasurement(measurement)}
                </div>
                <div className="text-xs text-cad-text-dim font-sans mt-0.5">
                  {formatEntityName(measurement.entity1)} → {formatEntityName(measurement.entity2)}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy value"
                >
                  <Copy size={12} className="text-cad-text-dim" />
                </button>
                <button
                  onClick={() => onRemove(measurement.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                  title="Remove measurement"
                >
                  <Trash2 size={12} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expanded details */}
        {expanded && (
          <div className="ml-7 mt-2 pt-2 border-t border-cad-border">
            <div className="space-y-1 text-xs font-sans">
              {/* Delta components for distance measurements */}
              {measurement.type === 'distance' && measurement.delta && (
                <div className="bg-gray-50 p-2 rounded font-mono">
                  <div className="text-cad-text-dim mb-1">Component Distances:</div>
                  <div className="text-cad-text space-y-0.5">
                    <div>ΔX: {measurement.delta.x.toFixed(3)} {measurement.unit}</div>
                    <div>ΔY: {measurement.delta.y.toFixed(3)} {measurement.unit}</div>
                    <div>ΔZ: {measurement.delta.z.toFixed(3)} {measurement.unit}</div>
                  </div>
                </div>
              )}
              
              {/* Measurement type */}
              <div className="flex justify-between">
                <span className="text-cad-text-dim">Type:</span>
                <span className="text-cad-text capitalize">{measurement.type}</span>
              </div>
              
              {/* Timestamp */}
              <div className="flex justify-between">
                <span className="text-cad-text-dim">Time:</span>
                <span className="text-cad-text">{formatTime(measurement.timestamp)}</span>
              </div>
              
              {/* Entity details */}
              <div className="mt-2 pt-2 border-t border-cad-border">
                <div className="text-cad-text-dim mb-1">Entity 1:</div>
                <div className="text-cad-text">{formatEntityName(measurement.entity1)}</div>
                {measurement.entity1.position && (
                  <div className="text-cad-text-dim text-[10px] font-mono">
                    ({measurement.entity1.position[0].toFixed(2)}, {measurement.entity1.position[1].toFixed(2)}, {measurement.entity1.position[2].toFixed(2)})
                  </div>
                )}
              </div>
              
              {measurement.entity2 && (
                <div className="mt-1">
                  <div className="text-cad-text-dim mb-1">Entity 2:</div>
                  <div className="text-cad-text">{formatEntityName(measurement.entity2)}</div>
                  {measurement.entity2.position && (
                    <div className="text-cad-text-dim text-[10px] font-mono">
                      ({measurement.entity2.position[0].toFixed(2)}, {measurement.entity2.position[1].toFixed(2)}, {measurement.entity2.position[2].toFixed(2)})
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function MeasurementsPanel() {
  const { 
    measurements, 
    showMeasurementsPanel, 
    toggleMeasurementsPanel,
    clearMeasurements,
    removeMeasurement,
    measurementMode,
    leftPanelOpen,
    leftPanelWidth,
    chatPanelWidth
  } = useUIStore()
  const { isOpen: isChatOpen } = useChatStore()
  
  if (!showMeasurementsPanel) return null
  
  const leftOffset = leftPanelOpen ? leftPanelWidth : 0
  const rightOffset = isChatOpen ? chatPanelWidth : 0
  
  return (
    <div 
      className="fixed h-80 bg-white border-t border-cad-border shadow-lg z-30 flex flex-col"
      style={{ 
        left: `${leftOffset}px`,
        right: `${rightOffset}px`,
        bottom: '28px' // Height of status bar
      }}
    >
      {/* Resize Handle */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-cad-accent/50 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault()
          const startY = e.clientY
          const startHeight = 320 // h-80 = 20rem = 320px
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = startY - moveEvent.clientY
            const newHeight = Math.max(150, Math.min(600, startHeight + delta))
            const container = window.document.querySelector('.fixed.bottom-0.z-30') as HTMLElement
            if (container) {
              container.style.height = `${newHeight}px`
            }
          }
          
          const handleMouseUp = () => {
            window.document.removeEventListener('mousemove', handleMouseMove)
            window.document.removeEventListener('mouseup', handleMouseUp)
            window.document.body.style.cursor = ''
            window.document.body.style.userSelect = ''
          }
          
          window.document.addEventListener('mousemove', handleMouseMove)
          window.document.addEventListener('mouseup', handleMouseUp)
          window.document.body.style.cursor = 'ns-resize'
          window.document.body.style.userSelect = 'none'
        }}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cad-border bg-cad-panel">
        <div className="flex items-center gap-2">
          <Ruler size={16} className="text-cad-accent" />
          <span className="font-serif font-semibold text-sm text-cad-text">
            Measurements
          </span>
          {measurements.length > 0 && (
            <span className="text-xs text-cad-text-dim font-sans">
              ({measurements.length})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {measurements.length > 0 && (
            <button
              onClick={clearMeasurements}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Clear all measurements"
            >
              <Trash2 size={14} className="text-cad-text-dim" />
            </button>
          )}
          <button
            onClick={toggleMeasurementsPanel}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Close panel"
          >
            <X size={14} className="text-cad-text-dim" />
          </button>
        </div>
      </div>
      
      {/* Measurement mode status */}
      {measurementMode.isActive && (
        <div className="px-3 py-2 bg-cad-accent/10 border-b border-cad-border">
          <div className="flex items-center gap-2 text-xs font-sans">
            <div className="w-2 h-2 bg-cad-accent rounded-full animate-pulse" />
            <span className="text-cad-text">
              {measurementMode.step === 'select-first' 
                ? 'Select first entity...' 
                : 'Select second entity...'}
            </span>
          </div>
          <div className="text-[10px] text-cad-text-dim mt-1">
            Press ESC to exit measurement mode
          </div>
        </div>
      )}
      
      {/* Measurements list */}
      <div className="flex-1 overflow-y-auto">
        {measurements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Ruler size={32} className="text-gray-300 mb-2" />
            <div className="text-sm text-cad-text-dim font-sans">
              No measurements yet
            </div>
            <div className="text-xs text-cad-text-dim font-sans mt-1">
              Activate measure tool and select entities
            </div>
          </div>
        ) : (
          <div>
            {measurements.map(measurement => (
              <MeasurementItem
                key={measurement.id}
                measurement={measurement}
                onRemove={removeMeasurement}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer hint */}
      {measurements.length > 0 && (
        <div className="px-3 py-2 border-t border-cad-border bg-gray-50">
          <div className="text-[10px] text-cad-text-dim font-sans">
            Click the arrow to expand details • Click copy to copy value
          </div>
        </div>
      )}
    </div>
  )
}

