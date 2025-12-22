/**
 * Feature Tree - Enhanced hierarchical view of model structure
 * Academic/scholarly theme styling
 * 
 * Features:
 * - Feature history with icons and states
 * - Edit, suppress, reorder, delete operations
 * - Error/warning indicators
 * - Rollback bar for history navigation
 * - Drag and drop reordering
 * - Rename inline editing
 * - Visibility toggles for sketches/planes
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore, Feature, Sketch } from '../store/documentStore'
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileBox,
  Pencil,
  Box,
  CircleDot,
  Layers,
  RotateCcw,
  Square,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  AlertTriangle,
  Lock,
  Unlock,
  GripVertical,
  Check,
  X,
  RefreshCcw,
  FlipHorizontal,
  Grid3X3,
  Shell,
  Circle,
  CornerUpRight
} from 'lucide-react'

// Feature state types
type FeatureState = 'normal' | 'error' | 'warning' | 'editing' | 'suppressed'

interface TreeItemProps {
  label: string
  icon: React.ReactNode
  level?: number
  selected?: boolean
  state?: FeatureState
  hasChildren?: boolean
  expanded?: boolean
  draggable?: boolean
  onToggle?: () => void
  onClick?: () => void
  onDoubleClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  onRename?: (newName: string) => void
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  statusIcon?: React.ReactNode
  errorMessage?: string
  actions?: React.ReactNode
  isRenaming?: boolean
  onRenameStart?: () => void
  onRenameEnd?: () => void
}

function TreeItem({
  label,
  icon,
  level = 0,
  selected,
  state = 'normal',
  hasChildren,
  expanded,
  draggable,
  onToggle,
  onClick,
  onDoubleClick,
  onContextMenu,
  onRename,
  onDragStart,
  onDragOver,
  onDrop,
  statusIcon,
  errorMessage,
  actions,
  isRenaming,
  onRenameStart,
  onRenameEnd
}: TreeItemProps) {
  const [localName, setLocalName] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])
  
  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRename?.(localName)
      onRenameEnd?.()
    } else if (e.key === 'Escape') {
      setLocalName(label)
      onRenameEnd?.()
    }
  }
  
  const getStateStyles = () => {
    switch (state) {
      case 'error':
        return 'bg-cad-error/10 border-l-2 border-cad-error'
      case 'warning':
        return 'bg-cad-warning/10 border-l-2 border-cad-warning'
      case 'editing':
        return 'bg-cad-accent/10 border-l-2 border-cad-accent'
      case 'suppressed':
        return 'opacity-50 italic'
      default:
        return selected ? 'bg-cad-accent/10 border-l-2 border-cad-accent' : 'hover:bg-gray-50'
    }
  }
  
  return (
    <div
      className={`
        feature-item group flex items-center gap-1 px-2 py-1.5 cursor-pointer transition-colors font-sans
        ${getStateStyles()}
        ${isDragOver ? 'ring-2 ring-cad-accent bg-cad-accent/5' : ''}
      `}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable={draggable && !isRenaming}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
        onDragOver?.(e)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false)
        onDrop?.(e)
      }}
      title={errorMessage}
    >
      {/* Drag handle */}
      {draggable && (
        <span className="text-cad-text-dim opacity-0 group-hover:opacity-50 cursor-grab">
          <GripVertical size={12} />
        </span>
      )}
      
      {/* Expand/collapse toggle */}
      <button
        className={`w-4 h-4 flex items-center justify-center ${!hasChildren && 'invisible'}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle?.()
        }}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Icon */}
      <span className="text-cad-text-dim flex-shrink-0">{icon}</span>

      {/* Label / Rename input */}
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onKeyDown={handleRenameKeyDown}
          onBlur={() => {
            onRename?.(localName)
            onRenameEnd?.()
          }}
          className="flex-1 bg-cad-panel border border-cad-accent px-1 py-0.5 text-sm outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span 
          className={`flex-1 text-sm truncate ${state === 'suppressed' ? 'line-through' : ''}`}
          onDoubleClick={(e) => {
            e.stopPropagation()
            onRenameStart?.()
          }}
        >
          {label}
        </span>
      )}
      
      {/* Status icon (error/warning/editing) */}
      {statusIcon && (
        <span className="flex-shrink-0">{statusIcon}</span>
      )}

      {/* Actions (visible on hover) */}
      <div className="hidden group-hover:flex items-center gap-1">
        {actions}
      </div>
    </div>
  )
}

// Feature icon component
function FeatureIcon({ type, state }: { type: string; state?: FeatureState }) {
  const iconProps = { size: 16 }
  
  const getIconColor = () => {
    if (state === 'error') return 'text-cad-error'
    if (state === 'warning') return 'text-cad-warning'
    if (state === 'suppressed') return 'text-cad-text-dim'
    
    switch (type) {
      case 'sketch': return 'text-cad-accent' // Navy blue
      case 'extrude': return 'text-cad-accent' // Navy blue
      case 'revolve': return 'text-cad-accent' // Navy blue
      case 'sweep': return 'text-cad-accent' // Navy blue
      case 'loft': return 'text-cad-accent' // Navy blue
      case 'fillet': return 'text-cad-accent' // Navy blue
      case 'chamfer': return 'text-cad-accent' // Navy blue
      case 'shell': return 'text-cad-accent' // Navy blue
      case 'mirror': return 'text-cad-accent' // Navy blue
      case 'linearPattern': return 'text-cad-accent' // Navy blue
      case 'circularPattern': return 'text-cad-accent' // Navy blue
      case 'plane': return 'text-cad-text-dim'
      default: return 'text-cad-text-dim'
    }
  }
  
  const Icon = () => {
    switch (type) {
      case 'sketch':
        return <Pencil {...iconProps} />
      case 'extrude':
        return <Box {...iconProps} />
      case 'revolve':
        return <RotateCcw {...iconProps} />
      case 'sweep':
        return <CornerUpRight {...iconProps} />
      case 'loft':
        return <Layers {...iconProps} />
      case 'fillet':
        return <Circle {...iconProps} />
      case 'chamfer':
        return <CircleDot {...iconProps} />
      case 'shell':
        return <Shell {...iconProps} />
      case 'mirror':
        return <FlipHorizontal {...iconProps} />
      case 'linearPattern':
      case 'circularPattern':
        return <Grid3X3 {...iconProps} />
      case 'plane':
        return <Square {...iconProps} />
      default:
        return <FileBox {...iconProps} />
    }
  }
  
  return <span className={getIconColor()}><Icon /></span>
}

// Status icon component
function StatusIcon({ state, message }: { state: FeatureState; message?: string }) {
  switch (state) {
    case 'error':
      return (
        <span className="text-cad-error" title={message}>
          <AlertCircle size={14} />
        </span>
      )
    case 'warning':
      return (
        <span className="text-cad-warning" title={message}>
          <AlertTriangle size={14} />
        </span>
      )
    case 'editing':
      return (
        <span className="text-cad-accent" title="Editing">
          <Pencil size={14} />
        </span>
      )
    default:
      return null
  }
}

// Enhanced context menu for features
function FeatureContextMenu({ 
  feature, 
  partStudioId,
  position, 
  onClose 
}: { 
  feature: Feature
  partStudioId: string
  position: { x: number; y: number }
  onClose: () => void 
}) {
  const { toggleFeatureSuppression, deleteFeature, reorderFeature, renameFeature, copyFeature } = useDocumentStore()
  const { document } = useDocumentStore()
  const { openDialog, addNotification, enterSketchMode, openFeatureForEdit, rollToFeature } = useUIStore()
  
  const partStudio = document?.partStudios.find(ps => ps.id === partStudioId)
  const featureIndex = partStudio?.features.findIndex(f => f.id === feature.id) ?? -1
  
  const handleEdit = () => {
    if (feature.type === 'sketch') {
      const sketch = partStudio?.sketches.get(feature.parameters.sketchId)
      if (sketch) {
        enterSketchMode(partStudioId, sketch.id, {
          normal: sketch.plane.normal as [number, number, number],
          origin: sketch.plane.origin as [number, number, number]
        })
      }
    } else {
      openDialog(feature.type, { featureId: feature.id })
    }
    onClose()
  }
  
  const handleSuppress = () => {
    toggleFeatureSuppression(partStudioId, feature.id)
    addNotification('info', feature.suppressed ? `Unsuppressed ${feature.name}` : `Suppressed ${feature.name}`)
    onClose()
  }
  
  const handleDelete = () => {
    if (window.confirm(`Delete "${feature.name}"? This may affect dependent features.`)) {
      deleteFeature(partStudioId, feature.id)
      addNotification('success', `Deleted ${feature.name}`)
    }
    onClose()
  }
  
  const handleMoveUp = () => {
    if (featureIndex > 0) {
      reorderFeature(partStudioId, feature.id, featureIndex - 1)
      addNotification('info', `Moved ${feature.name} up`)
    }
    onClose()
  }
  
  const handleMoveDown = () => {
    if (partStudio && featureIndex < partStudio.features.length - 1) {
      reorderFeature(partStudioId, feature.id, featureIndex + 1)
      addNotification('info', `Moved ${feature.name} down`)
    }
    onClose()
  }
  
  const handleCopy = async () => {
    try {
      const copiedFeature = await copyFeature(partStudioId, feature.id)
      if (copiedFeature) {
        addNotification('success', `Copied ${feature.name}`)
        
        // Auto-open the feature for editing (optional but recommended)
        // This allows the user to modify the copy immediately
        setTimeout(() => {
          openFeatureForEdit(copiedFeature.id, partStudioId)
        }, 100)
      } else {
        addNotification('error', 'Failed to copy feature')
      }
    } catch (error) {
      console.error('Copy feature error:', error)
      addNotification('error', 'Failed to copy feature')
    }
    onClose()
  }
  
  const handleRollTo = async () => {
    try {
      await rollToFeature(partStudioId, feature.id)
    } catch (error) {
      console.error('Roll to feature error:', error)
      addNotification('error', 'Failed to roll to feature')
    }
    onClose()
  }
  
  const menuItems = [
    { id: 'edit', label: 'Edit', icon: <Edit3 size={14} />, action: handleEdit, shortcut: 'Enter' },
    { id: 'rename', label: 'Rename', icon: <Pencil size={14} />, action: () => { /* handled by parent */ onClose() }, shortcut: 'F2' },
    { divider: true },
    { 
      id: 'suppress', 
      label: feature.suppressed ? 'Unsuppress' : 'Suppress', 
      icon: feature.suppressed ? <Eye size={14} /> : <EyeOff size={14} />, 
      action: handleSuppress 
    },
    { divider: true },
    { id: 'moveUp', label: 'Move Up', icon: <ArrowUp size={14} />, action: handleMoveUp, disabled: featureIndex <= 0 },
    { id: 'moveDown', label: 'Move Down', icon: <ArrowDown size={14} />, action: handleMoveDown, disabled: partStudio && featureIndex >= partStudio.features.length - 1 },
    { id: 'rollTo', label: 'Roll to Here', icon: <RefreshCcw size={14} />, action: handleRollTo },
    { divider: true },
    { id: 'copy', label: 'Copy', icon: <Copy size={14} />, action: handleCopy, shortcut: 'Ctrl+C' },
    { divider: true },
    { id: 'delete', label: 'Delete', icon: <Trash2 size={14} />, action: handleDelete, shortcut: 'Del', danger: true },
  ]
  
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="fixed bg-cad-panel border border-cad-border shadow-lg py-1 z-50 min-w-[180px] font-sans"
        style={{ left: position.x, top: position.y }}
      >
        {/* Header showing feature info */}
        <div className="px-3 py-2 border-b border-cad-border">
          <div className="flex items-center gap-2">
            <FeatureIcon type={feature.type} />
            <span className="text-sm font-medium truncate">{feature.name}</span>
          </div>
        </div>
        
        {/* Menu items */}
        {menuItems.map((item, index) => (
          item.divider ? (
            <div key={index} className="h-px bg-cad-border my-1" />
          ) : (
            <button 
              key={item.id}
              className={`
                w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2
                ${item.danger ? 'text-cad-error hover:text-cad-error' : 'text-cad-text'}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={item.action}
              disabled={item.disabled}
            >
              <span className="w-4">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <span className="text-[10px] text-cad-text-dim">{item.shortcut}</span>
              )}
            </button>
          )
        ))}
      </div>
    </>
  )
}

// Rollback bar component
function RollbackBar({ 
  position, 
  totalFeatures, 
  onDrag 
}: { 
  position: number
  totalFeatures: number
  onDrag: (newPosition: number) => void 
}) {
  const [isDragging, setIsDragging] = useState(false)
  
  if (totalFeatures === 0) return null
  
  return (
    <div 
      className={`
        flex items-center gap-2 px-4 py-1 cursor-ns-resize select-none
        ${isDragging ? 'bg-cad-warning/10' : 'hover:bg-cad-warning/5'}
      `}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      title="Drag to roll back/forward in history"
    >
      <div className="flex-1 h-0.5 bg-cad-warning/50" />
      <span className="text-[10px] text-cad-warning font-medium font-sans">
        {position < totalFeatures ? `Rolled back to ${position}` : 'Current'}
      </span>
      <div className="flex-1 h-0.5 bg-cad-warning/50" />
    </div>
  )
}

export function FeatureTree() {
  const { document } = useDocumentStore()
  const { renameFeature, toggleFeatureSuppression, deleteFeature, reorderFeature, toggleBodyVisibility } = useDocumentStore()
  const { selection, setSelection, enterSketchMode, openDialog, addNotification, activeDialog, rollbackState, rollToFeature, rollToEnd } = useUIStore()
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['root', 'origin']))
  const [contextMenu, setContextMenu] = useState<{ feature: Feature; partStudioId: string; position: { x: number; y: number } } | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [draggedFeature, setDraggedFeature] = useState<Feature | null>(null)
  const [rollbackPosition, setRollbackPosition] = useState<number | null>(null)
  const [hiddenSketches, setHiddenSketches] = useState<Set<string>>(new Set())
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document.activeElementId)
  const features = activePartStudio?.features || []
  
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  
  const handleFeatureClick = (feature: Feature) => {
    setSelection({ type: 'feature', ids: [feature.id] })
  }
  
  const handleFeatureDoubleClick = (feature: Feature, partStudioId: string) => {
    if (feature.type === 'sketch') {
      const sketch = activePartStudio?.sketches.get(feature.parameters.sketchId)
      if (sketch) {
        enterSketchMode(partStudioId, sketch.id, {
          normal: sketch.plane.normal as [number, number, number],
          origin: sketch.plane.origin as [number, number, number]
        })
      }
    } else {
      openDialog(feature.type, { featureId: feature.id })
    }
  }
  
  const handleContextMenu = (e: React.MouseEvent, feature: Feature, partStudioId: string) => {
    e.preventDefault()
    setContextMenu({ 
      feature, 
      partStudioId,
      position: { x: e.clientX, y: e.clientY } 
    })
  }
  
  const handleRename = (featureId: string, newName: string) => {
    if (activePartStudio && newName.trim()) {
      renameFeature(activePartStudio.id, featureId, newName.trim())
      addNotification('info', `Renamed to "${newName.trim()}"`)
    }
    setRenamingId(null)
  }
  
  const handleDragStart = (e: React.DragEvent, feature: Feature) => {
    setDraggedFeature(feature)
    e.dataTransfer.effectAllowed = 'move'
  }
  
  const handleDrop = (e: React.DragEvent, targetFeature: Feature) => {
    e.preventDefault()
    if (!draggedFeature || !activePartStudio || draggedFeature.id === targetFeature.id) {
      setDraggedFeature(null)
      return
    }
    
    const targetIndex = features.findIndex(f => f.id === targetFeature.id)
    if (targetIndex >= 0) {
      reorderFeature(activePartStudio.id, draggedFeature.id, targetIndex)
      addNotification('info', `Moved ${draggedFeature.name}`)
    }
    setDraggedFeature(null)
  }
  
  const getFeatureState = (feature: Feature): FeatureState => {
    if (feature.suppressed) return 'suppressed'
    if (feature.error) return 'error'
    if (feature.warning) return 'warning'
    if (activeDialog && selection.ids.includes(feature.id)) return 'editing'
    return 'normal'
  }
  
  const toggleSketchVisibility = (sketchId: string) => {
    setHiddenSketches(prev => {
      const next = new Set(prev)
      if (next.has(sketchId)) {
        next.delete(sketchId)
      } else {
        next.add(sketchId)
      }
      return next
    })
  }
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selection.type !== 'feature' || selection.ids.length === 0) return
      
      const featureId = selection.ids[0]
      const feature = features.find(f => f.id === featureId)
      if (!feature || !activePartStudio) return
      
      // F2 to rename
      if (e.key === 'F2') {
        e.preventDefault()
        setRenamingId(featureId)
      }
      
      // Delete to remove
      if (e.key === 'Delete') {
        e.preventDefault()
        if (window.confirm(`Delete "${feature.name}"?`)) {
          deleteFeature(activePartStudio.id, featureId)
          addNotification('success', `Deleted ${feature.name}`)
        }
      }
      
      // Enter to edit
      if (e.key === 'Enter' && !renamingId) {
        e.preventDefault()
        handleFeatureDoubleClick(feature, activePartStudio.id)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selection, features, activePartStudio, renamingId])

  return (
    <div className="h-full flex flex-col bg-cad-panel border-r border-cad-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-gray-50">
        <span className="font-semibold text-sm font-serif">Feature Tree</span>
        <button 
          className="p-1 hover:bg-cad-panel border border-transparent hover:border-cad-border" 
          title="Add Feature"
          onClick={() => openDialog('sketch')}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Document */}
        <TreeItem
          label={document?.name || 'Document'}
          icon={<Folder size={16} />}
          hasChildren
          expanded={expandedItems.has('root')}
          onToggle={() => toggleExpand('root')}
          onClick={() => setSelection({ type: 'document', ids: ['document'] })}
          selected={selection.type === 'document'}
        />

        {expandedItems.has('root') && (
          <>
            {/* Origin folder */}
            <TreeItem
              label="Origin"
              icon={<Folder size={16} />}
              level={1}
              hasChildren
              expanded={expandedItems.has('origin')}
              onToggle={() => toggleExpand('origin')}
            />
            
            {expandedItems.has('origin') && (
              <>
                <TreeItem
                  label="Top Plane"
                  icon={<Square size={16} className="text-cad-accent" />}
                  level={2}
                  onClick={() => setSelection({ type: 'feature', ids: ['top-plane'] })}
                  selected={selection.ids.includes('top-plane')}
                />
                <TreeItem
                  label="Front Plane"
                  icon={<Square size={16} className="text-cad-accent" />}
                  level={2}
                  onClick={() => setSelection({ type: 'feature', ids: ['front-plane'] })}
                  selected={selection.ids.includes('front-plane')}
                />
                <TreeItem
                  label="Right Plane"
                  icon={<Square size={16} className="text-cad-accent" />}
                  level={2}
                  onClick={() => setSelection({ type: 'feature', ids: ['right-plane'] })}
                  selected={selection.ids.includes('right-plane')}
                />
              </>
            )}

            {/* Divider */}
            <div className="h-px bg-cad-border mx-4 my-2" />

            {/* Features */}
            {features.length === 0 ? (
              <div className="px-4 py-3 text-sm text-cad-text-dim text-center font-sans">
                No features yet.<br />
                <button 
                  className="text-cad-accent hover:underline mt-1"
                  onClick={() => openDialog('sketch')}
                >
                  Create a sketch
                </button>
              </div>
            ) : (
              features.map((feature, index) => {
                const featureState = getFeatureState(feature)
                const isSketch = feature.type === 'sketch'
                const sketchId = isSketch ? feature.parameters.sketchId : null
                const isSketchHidden = sketchId && hiddenSketches.has(sketchId)
                
                // Check if this is the rollback position
                const isRollbackPosition = rollbackState.isActive && 
                  rollbackState.partStudioId === activePartStudio?.id && 
                  rollbackState.featureId === feature.id
                
                // Check if this feature is after the rollback point (should be grayed out)
                const rollbackIndex = rollbackState.isActive && rollbackState.featureId
                  ? features.findIndex(f => f.id === rollbackState.featureId)
                  : -1
                const isAfterRollback = rollbackIndex >= 0 && index > rollbackIndex
                
                return (
                  <React.Fragment key={feature.id}>
                    <TreeItem
                      label={feature.name}
                      icon={<FeatureIcon type={feature.type} state={featureState} />}
                      level={1}
                      selected={selection.ids.includes(feature.id)}
                      state={isAfterRollback ? 'suppressed' : featureState}
                      draggable
                      onClick={() => handleFeatureClick(feature)}
                      onDoubleClick={() => handleFeatureDoubleClick(feature, activePartStudio!.id)}
                      onContextMenu={(e) => handleContextMenu(e, feature, activePartStudio!.id)}
                      onDragStart={(e) => handleDragStart(e, feature)}
                      onDrop={(e) => handleDrop(e, feature)}
                      isRenaming={renamingId === feature.id}
                      onRenameStart={() => setRenamingId(feature.id)}
                      onRenameEnd={() => setRenamingId(null)}
                      onRename={(newName) => handleRename(feature.id, newName)}
                      statusIcon={<StatusIcon state={featureState} message={feature.error || feature.warning} />}
                      errorMessage={feature.error || feature.warning}
                      actions={
                        <div className="flex items-center gap-1">
                          {/* Rollback indicator for this feature */}
                          {isAfterRollback && (
                            <div className="text-xs text-cad-text-dim" title="Feature suppressed by rollback">
                              <Lock size={12} />
                            </div>
                          )}
                          {/* Visibility toggle for sketches */}
                          {isSketch && (
                            <button 
                              className="p-1 hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSketchVisibility(sketchId!)
                              }}
                              title={isSketchHidden ? 'Show Sketch' : 'Hide Sketch'}
                            >
                              {isSketchHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                          
                          {/* Suppress toggle */}
                          <button 
                            className="p-1 hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFeatureSuppression(activePartStudio!.id, feature.id)
                            }}
                            title={feature.suppressed ? 'Unsuppress' : 'Suppress'}
                          >
                            {feature.suppressed ? <Unlock size={14} /> : <Lock size={14} />}
                          </button>
                          
                          {/* More options */}
                          <button 
                            className="p-1 hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleContextMenu(e, feature, activePartStudio!.id)
                            }}
                            title="More options"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      }
                    />
                    
                    {/* Rollback bar indicator - shows where history is rolled back to */}
                    {isRollbackPosition && (
                      <div className="mx-4 my-1 flex items-center gap-2 group">
                        <div className="flex-1 h-0.5 bg-cad-accent relative">
                          <div className="absolute -right-1 -top-1 w-2 h-2 bg-cad-accent rounded-full" />
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (activePartStudio) {
                              await rollToEnd(activePartStudio.id)
                            }
                          }}
                          className="text-xs font-sans text-cad-accent hover:text-cad-accent-hover transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                          title="Roll to end"
                        >
                          <RotateCcw size={12} />
                          Roll to End
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                )
              })
            )}
            
            {/* Parts section */}
            {activePartStudio && activePartStudio.parts.length > 0 && (
              <>
                <div className="h-px bg-cad-border mx-4 my-2" />
                <TreeItem
                  label="Parts"
                  icon={<Folder size={16} />}
                  level={1}
                  hasChildren
                  expanded={expandedItems.has('parts')}
                  onToggle={() => toggleExpand('parts')}
                />
                
                {expandedItems.has('parts') && activePartStudio.parts.map((part) => {
                  const isHidden = part.visible === false
                  const isSelected = selection.ids.includes(part.id)
                  
                  return (
                    <TreeItem
                      key={part.id}
                      label={part.name}
                      icon={<Box size={16} className={isHidden ? "text-cad-text-dim opacity-50" : "text-cad-text-dim"} />}
                      level={2}
                      selected={isSelected}
                      onClick={() => {
                        setSelection({ type: 'body', ids: [part.id] })
                        // If selecting a hidden part, show notification with hint
                        if (isHidden) {
                          addNotification('info', `${part.name} is hidden. Click the eye icon to show it.`)
                        }
                      }}
                      state={isHidden ? 'suppressed' : 'normal'}
                      actions={
                        <div className="flex items-center gap-1">
                          {/* Visibility toggle with better feedback */}
                          <button 
                            className="p-1 hover:bg-gray-50 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleBodyVisibility(part.id)
                            }}
                            title={isHidden ? `Show ${part.name}` : `Hide ${part.name}`}
                          >
                            {isHidden ? (
                              <EyeOff size={14} className="text-cad-text-dim" />
                            ) : (
                              <Eye size={14} className="text-cad-text" />
                            )}
                          </button>
                          
                          {/* Part context menu */}
                          <button 
                            className="p-1 hover:bg-gray-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Future: Open part-specific context menu
                              addNotification('info', 'Part options coming soon')
                            }}
                            title="Part options"
                          >
                            <MoreVertical size={14} className="text-cad-text-dim" />
                          </button>
                        </div>
                      }
                    />
                  )
                })}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer with stats and legend */}
      <div className="border-t border-cad-border bg-gray-50">
        <div className="px-4 py-2 text-xs text-cad-text-dim font-sans">
          {features.length} feature{features.length !== 1 ? 's' : ''}
          {activePartStudio && activePartStudio.parts.length > 0 && (
            <>
              {' • '}
              {activePartStudio.parts.length} part{activePartStudio.parts.length !== 1 ? 's' : ''}
              {(() => {
                const hiddenCount = activePartStudio.parts.filter(p => p.visible === false).length
                if (hiddenCount > 0) {
                  return <span className="text-cad-warning"> ({hiddenCount} hidden)</span>
                }
                return null
              })()}
            </>
          )}
        </div>
        
        {/* Legend for states */}
        <div className="px-4 py-2 border-t border-cad-border flex items-center gap-3 text-[10px] text-cad-text-dim font-sans">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-cad-error" />
            Error
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-cad-warning" />
            Warning
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-cad-text-dim" />
            Suppressed
          </span>
          <span className="flex items-center gap-1">
            <EyeOff size={10} className="text-cad-text-dim" />
            Hidden
          </span>
        </div>
      </div>
      
      {/* Context menu */}
      {contextMenu && (
        <FeatureContextMenu
          feature={contextMenu.feature}
          partStudioId={contextMenu.partStudioId}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
