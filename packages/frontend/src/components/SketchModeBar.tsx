/**
 * SketchModeBar - Floating toolbar for sketch mode controls
 * 
 * Displays when user is in sketch editing mode:
 * - Shows current sketch name
 * - Confirm (checkmark) to finish sketch
 * - Cancel (X) to discard changes
 * - View Normal to Sketch button
 * - Sketch status indicator (under-constrained, fully constrained, etc.)
 */

import React from 'react'
import { 
  Check, 
  X, 
  Eye, 
  Pencil, 
  Lock, 
  Unlock,
  AlertCircle,
  AlertTriangle,
  Square,
  Maximize,
  Undo,
  Redo
} from 'lucide-react'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'

interface SketchModeBarProps {
  onConfirm: () => void
  onCancel: () => void
  onViewNormal: () => void
}

export function SketchModeBar({ onConfirm, onCancel, onViewNormal }: SketchModeBarProps) {
  const { sketchMode } = useUIStore()
  const { document, undo, redo, canUndo, canRedo } = useDocumentStore()
  
  if (!sketchMode) return null
  
  // Get current sketch info
  const activePartStudio = document?.partStudios.find(ps => ps.id === sketchMode.partStudioId)
  const sketch = activePartStudio?.sketches.get(sketchMode.sketchId)
  
  if (!sketch) return null
  
  // Determine constraint status
  const entityCount = sketch.entities?.length || 0
  const constraintCount = sketch.constraints?.length || 0
  const status = sketch.status || 'under-constrained'
  
  // Status styling
  const getStatusStyle = () => {
    switch (status) {
      case 'fully-constrained':
        return {
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
          icon: <Lock size={14} />,
          label: 'Fully Constrained'
        }
      case 'over-constrained':
        return {
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-400',
          icon: <AlertCircle size={14} />,
          label: 'Over-Constrained'
        }
      case 'under-constrained':
      default:
        return {
          bgColor: 'bg-cad-accent/20',
          borderColor: 'border-blue-500/50',
          textColor: 'text-cad-accent',
          icon: <Unlock size={14} />,
          label: 'Under-Constrained'
        }
    }
  }
  
  const statusStyle = getStatusStyle()
  
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-50/95 border border-cad-accent shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Header with sketch name */}
        <div className="flex items-center gap-2 px-3 py-2 bg-cad-accent/20 border-b border-cad-accent/30">
          <Pencil size={14} className="text-cad-accent" />
          <span className="text-sm font-medium text-cad-text">
            Editing: <span className="text-cad-accent">{sketch.name}</span>
          </span>
        </div>
        
        {/* Main controls */}
        <div className="flex items-center gap-2 p-2">
          {/* Status indicator */}
          <div className={`
            flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-medium
            ${statusStyle.bgColor} ${statusStyle.borderColor} ${statusStyle.textColor}
          `}>
            {statusStyle.icon}
            <span>{statusStyle.label}</span>
          </div>
          
          {/* Entity count */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-white text-xs text-cad-text-dim">
            <Square size={12} />
            <span>{entityCount} entities</span>
          </div>
          
          {/* Divider */}
          <div className="w-px h-6 bg-cad-border" />
          
          {/* Undo button */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors
              ${canUndo 
                ? 'bg-white hover:bg-cad-panel text-cad-text-dim hover:text-cad-text cursor-pointer' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
            `}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={14} />
          </button>
          
          {/* Redo button */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors
              ${canRedo 
                ? 'bg-white hover:bg-cad-panel text-cad-text-dim hover:text-cad-text cursor-pointer' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
            `}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={14} />
          </button>
          
          {/* Divider */}
          <div className="w-px h-6 bg-cad-border" />
          
          {/* View Normal button */}
          <button
            onClick={onViewNormal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-cad-panel text-xs text-cad-text-dim hover:text-cad-text transition-colors"
            title="View Normal to Sketch (N)"
          >
            <Maximize size={14} />
            <span>Normal</span>
          </button>
          
          {/* Divider */}
          <div className="w-px h-6 bg-cad-border" />
          
          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-xs text-red-400 hover:text-red-300 transition-colors"
            title="Cancel sketch changes (Esc)"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
          
          {/* Confirm button */}
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-xs text-white font-medium transition-colors"
            title="Finish sketch (Enter)"
          >
            <Check size={14} />
            <span>Finish</span>
          </button>
        </div>
        
        {/* Keyboard shortcuts hint */}
        <div className="flex items-center justify-center gap-4 px-3 py-1.5 bg-white/50 border-t border-cad-border text-[10px] text-cad-text-dim">
          <span><kbd className="px-1 py-0.5 bg-cad-panel text-[9px]">Ctrl+Z</kbd> Undo</span>
          <span><kbd className="px-1 py-0.5 bg-cad-panel text-[9px]">Ctrl+Y</kbd> Redo</span>
          <span><kbd className="px-1 py-0.5 bg-cad-panel text-[9px]">Del</kbd> Delete</span>
          <span><kbd className="px-1 py-0.5 bg-cad-panel text-[9px]">N</kbd> Normal View</span>
          <span><kbd className="px-1 py-0.5 bg-cad-panel text-[9px]">Enter</kbd> Finish</span>
        </div>
      </div>
    </div>
  )
}

// Sketch plane indicator component (shows in 3D viewport)
export function SketchPlaneIndicator() {
  const { sketchMode } = useUIStore()
  
  if (!sketchMode) return null
  
  const normal = sketchMode.planeNormal
  const origin = sketchMode.planeOrigin
  
  // Determine plane color based on orientation
  let planeColor = '#3b82f6' // Blue for XY
  if (Math.abs(normal[1]) > 0.9) {
    planeColor = '#22c55e' // Green for XZ
  } else if (Math.abs(normal[0]) > 0.9) {
    planeColor = '#ef4444' // Red for YZ
  }
  
  return (
    <group>
      {/* Translucent plane indicator */}
      <mesh 
        position={[origin[0], origin[1], origin[2]]}
        rotation={[
          normal[1] !== 0 ? -Math.PI / 2 : 0,
          0,
          normal[0] !== 0 ? Math.PI / 2 : 0
        ]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color={planeColor}
          transparent 
          opacity={0.05}
          side={2} // DoubleSide
          depthWrite={false}
        />
      </mesh>
      
      {/* Grid lines on sketch plane */}
      <gridHelper 
        args={[200, 20, planeColor, '#374151']}
        position={[origin[0], origin[1], origin[2]]}
        rotation={[
          normal[1] !== 0 ? 0 : Math.PI / 2,
          0,
          normal[0] !== 0 ? Math.PI / 2 : 0
        ]}
      />
      
      {/* Origin marker */}
      <mesh position={[origin[0], origin[1], origin[2]]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={planeColor} />
      </mesh>
      
      {/* Coordinate axes on plane */}
      <group position={[origin[0], origin[1], origin[2]]}>
        {/* X axis (or appropriate axis) */}
        <mesh position={[10, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 20, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        {/* Y axis (or appropriate axis) */}
        <mesh position={[0, normal[1] === 0 ? 10 : 0, normal[1] !== 0 ? 10 : 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 20, 8]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      </group>
    </group>
  )
}

export default SketchModeBar

