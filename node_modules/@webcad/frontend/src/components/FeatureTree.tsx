/**
 * Feature Tree - Hierarchical view of model structure
 */

import React, { useState } from 'react'
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
  ArrowDown
} from 'lucide-react'

interface TreeItemProps {
  label: string
  icon: React.ReactNode
  level?: number
  selected?: boolean
  suppressed?: boolean
  hasChildren?: boolean
  expanded?: boolean
  onToggle?: () => void
  onClick?: () => void
  onDoubleClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  actions?: React.ReactNode
}

function TreeItem({
  label,
  icon,
  level = 0,
  selected,
  suppressed,
  hasChildren,
  expanded,
  onToggle,
  onClick,
  onDoubleClick,
  onContextMenu,
  actions
}: TreeItemProps) {
  return (
    <div
      className={`
        feature-item group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
        ${selected ? 'bg-cad-accent/20 border-l-2 border-cad-accent' : 'hover:bg-cad-panel/50'}
        ${suppressed ? 'opacity-50' : ''}
      `}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
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

      {/* Label */}
      <span className="flex-1 text-sm truncate">{label}</span>

      {/* Actions (visible on hover) */}
      <div className="hidden group-hover:flex items-center gap-1">
        {actions}
      </div>
    </div>
  )
}

function FeatureIcon({ type }: { type: string }) {
  const iconProps = { size: 16 }
  
  switch (type) {
    case 'sketch':
      return <Pencil {...iconProps} className="text-yellow-500" />
    case 'extrude':
      return <Box {...iconProps} className="text-blue-400" />
    case 'revolve':
      return <RotateCcw {...iconProps} className="text-green-400" />
    case 'loft':
      return <Layers {...iconProps} className="text-purple-400" />
    case 'fillet':
    case 'chamfer':
      return <CircleDot {...iconProps} className="text-orange-400" />
    case 'plane':
      return <Square {...iconProps} />
    default:
      return <FileBox {...iconProps} />
  }
}

// Context menu for features
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
  const { toggleFeatureSuppression, deleteFeature, reorderFeature } = useDocumentStore()
  const { document } = useDocumentStore()
  const { openDialog, addNotification } = useUIStore()
  
  const partStudio = document?.partStudios.find(ps => ps.id === partStudioId)
  const featureIndex = partStudio?.features.findIndex(f => f.id === feature.id) ?? -1
  
  const handleEdit = () => {
    openDialog(feature.type, { featureId: feature.id })
    onClose()
  }
  
  const handleSuppress = () => {
    toggleFeatureSuppression(partStudioId, feature.id)
    onClose()
  }
  
  const handleDelete = () => {
    deleteFeature(partStudioId, feature.id)
    addNotification('success', `Deleted ${feature.name}`)
    onClose()
  }
  
  const handleMoveUp = () => {
    if (featureIndex > 0) {
      reorderFeature(partStudioId, feature.id, featureIndex - 1)
    }
    onClose()
  }
  
  const handleMoveDown = () => {
    if (partStudio && featureIndex < partStudio.features.length - 1) {
      reorderFeature(partStudioId, feature.id, featureIndex + 1)
    }
    onClose()
  }
  
  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div 
        className="fixed bg-cad-dark border border-cad-border rounded shadow-xl py-1 z-50 min-w-[160px]"
        style={{ left: position.x, top: position.y }}
      >
        <button 
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-cad-panel flex items-center gap-2"
          onClick={handleEdit}
        >
          <Edit3 size={14} /> Edit
        </button>
        <button 
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-cad-panel flex items-center gap-2"
          onClick={handleSuppress}
        >
          {feature.suppressed ? <Eye size={14} /> : <EyeOff size={14} />}
          {feature.suppressed ? 'Unsuppress' : 'Suppress'}
        </button>
        <div className="h-px bg-cad-border my-1" />
        <button 
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-cad-panel flex items-center gap-2"
          onClick={handleMoveUp}
          disabled={featureIndex <= 0}
        >
          <ArrowUp size={14} /> Move Up
        </button>
        <button 
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-cad-panel flex items-center gap-2"
          onClick={handleMoveDown}
        >
          <ArrowDown size={14} /> Move Down
        </button>
        <div className="h-px bg-cad-border my-1" />
        <button 
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-cad-panel flex items-center gap-2 text-red-400"
          onClick={handleDelete}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </>
  )
}

export function FeatureTree() {
  const { document } = useDocumentStore()
  const { selection, setSelection, enterSketchMode, openDialog, addNotification } = useUIStore()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['root', 'origin']))
  const [contextMenu, setContextMenu] = useState<{ feature: Feature; partStudioId: string; position: { x: number; y: number } } | null>(null)
  
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
      const partStudio = document?.partStudios.find(ps => ps.id === partStudioId)
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
  }
  
  const handleContextMenu = (e: React.MouseEvent, feature: Feature, partStudioId: string) => {
    e.preventDefault()
    setContextMenu({ 
      feature, 
      partStudioId,
      position: { x: e.clientX, y: e.clientY } 
    })
  }

  const activePartStudio = document?.partStudios.find(ps => ps.id === document.activeElementId)
  const features = activePartStudio?.features || []

  return (
    <div className="w-72 flex flex-col bg-cad-dark border-r border-cad-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border">
        <span className="font-semibold text-sm">Feature Tree</span>
        <button 
          className="p-1 hover:bg-cad-panel rounded" 
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
                  icon={<Square size={16} className="text-blue-400" />}
                  level={2}
                  onClick={() => {
                    setSelection({ type: 'feature', ids: ['top-plane'] })
                  }}
                  selected={selection.ids.includes('top-plane')}
                />
                <TreeItem
                  label="Front Plane"
                  icon={<Square size={16} className="text-green-400" />}
                  level={2}
                  onClick={() => {
                    setSelection({ type: 'feature', ids: ['front-plane'] })
                  }}
                  selected={selection.ids.includes('front-plane')}
                />
                <TreeItem
                  label="Right Plane"
                  icon={<Square size={16} className="text-red-400" />}
                  level={2}
                  onClick={() => {
                    setSelection({ type: 'feature', ids: ['right-plane'] })
                  }}
                  selected={selection.ids.includes('right-plane')}
                />
              </>
            )}

            {/* Divider */}
            <div className="h-px bg-cad-border mx-4 my-2" />

            {/* Features */}
            {features.length === 0 ? (
              <div className="px-4 py-3 text-sm text-cad-text-dim text-center">
                No features yet.<br />
                <button 
                  className="text-cad-accent hover:underline mt-1"
                  onClick={() => openDialog('sketch')}
                >
                  Create a sketch
                </button>
              </div>
            ) : (
              features.map((feature) => (
                <TreeItem
                  key={feature.id}
                  label={feature.name}
                  icon={<FeatureIcon type={feature.type} />}
                  level={1}
                  selected={selection.ids.includes(feature.id)}
                  suppressed={feature.suppressed}
                  onClick={() => handleFeatureClick(feature)}
                  onDoubleClick={() => handleFeatureDoubleClick(feature, activePartStudio!.id)}
                  onContextMenu={(e) => handleContextMenu(e, feature, activePartStudio!.id)}
                  actions={
                    <>
                      <button 
                        className="p-1 hover:bg-cad-border rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          useDocumentStore.getState().toggleFeatureSuppression(activePartStudio!.id, feature.id)
                        }}
                        title={feature.suppressed ? 'Unsuppress' : 'Suppress'}
                      >
                        {feature.suppressed ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </>
                  }
                />
              ))
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
                
                {expandedItems.has('parts') && activePartStudio.parts.map((part) => (
                  <TreeItem
                    key={part.id}
                    label={part.name}
                    icon={<Box size={16} className="text-gray-400" />}
                    level={2}
                    selected={selection.ids.includes(part.id)}
                    onClick={() => setSelection({ type: 'body', ids: [part.id] })}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-cad-border text-xs text-cad-text-dim">
        {features.length} feature{features.length !== 1 ? 's' : ''}
        {activePartStudio && activePartStudio.parts.length > 0 && (
          <> • {activePartStudio.parts.length} part{activePartStudio.parts.length !== 1 ? 's' : ''}</>
        )}
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
