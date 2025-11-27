/**
 * SelectionManager - Comprehensive selection behavior system
 * 
 * Features:
 * - Preselection highlight on hover (orange/yellow glow)
 * - Selection types: faces, edges, vertices, bodies, features
 * - Multi-selection with Shift/Ctrl modifiers
 * - Box selection (left-to-right = inside, right-to-left = crossing)
 * - Selection filters and priorities
 * - Context menu for overlapping entities
 * - Selection memory and state management
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useUIStore, SelectionType } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import { 
  MousePointer, 
  Square, 
  Box, 
  Circle, 
  Layers,
  Filter,
  Eye,
  EyeOff,
  ChevronRight,
  Check
} from 'lucide-react'

// Selection filter options
export type SelectionFilter = 'all' | 'face' | 'edge' | 'vertex' | 'body' | 'feature' | 'sketch-entity'

// Selectable entity information
export interface SelectableEntity {
  id: string
  type: SelectionType
  name: string
  parentId?: string
  parentName?: string
  priority: number // Lower = higher priority (vertex > edge > face)
  position: { x: number; y: number; z: number }
  boundingBox?: {
    min: { x: number; y: number; z: number }
    max: { x: number; y: number; z: number }
  }
}

// Box selection state
interface BoxSelectionState {
  isActive: boolean
  startPoint: { x: number; y: number } | null
  endPoint: { x: number; y: number } | null
  direction: 'left-to-right' | 'right-to-left' | null
}

// Selection colors
export const SELECTION_COLORS = {
  preselection: '#f59e0b', // Orange/amber for hover
  selected: '#3b82f6', // Blue for selected
  multiSelected: '#22c55e', // Green for additional selections
  boxSelectInside: 'rgba(59, 130, 246, 0.2)', // Blue transparent for inside
  boxSelectCrossing: 'rgba(34, 197, 94, 0.2)', // Green transparent for crossing
  boxBorderInside: '#3b82f6',
  boxBorderCrossing: '#22c55e',
}

// Selection priority (lower = higher priority)
export const SELECTION_PRIORITY: Record<SelectionType, number> = {
  'vertex': 1,
  'edge': 2,
  'face': 3,
  'sketch-entity': 4,
  'body': 5,
  'feature': 6,
  'none': 99,
}

interface SelectionManagerProps {
  children: React.ReactNode
  onSelectionChange?: (selection: { type: SelectionType; ids: string[] }) => void
}

export function SelectionManager({ children, onSelectionChange }: SelectionManagerProps) {
  const {
    selection,
    hovered,
    preselection,
    setSelection,
    clearSelection,
    addToSelection,
    removeFromSelection,
    setHovered,
    setPreselection,
    activeTool,
    drawing,
  } = useUIStore()
  
  // Selection filter
  const [selectionFilter, setSelectionFilter] = useState<SelectionFilter>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  // Box selection state
  const [boxSelection, setBoxSelection] = useState<BoxSelectionState>({
    isActive: false,
    startPoint: null,
    endPoint: null,
    direction: null,
  })
  
  // Overlapping entities menu
  const [overlappingEntities, setOverlappingEntities] = useState<SelectableEntity[]>([])
  const [showOverlapMenu, setShowOverlapMenu] = useState(false)
  const [overlapMenuPosition, setOverlapMenuPosition] = useState({ x: 0, y: 0 })
  
  // Modifier keys state
  const [modifiers, setModifiers] = useState({
    shift: false,
    ctrl: false,
    alt: false,
  })
  
  // Container ref for event handling
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track modifier keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setModifiers(prev => ({
        ...prev,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
      }))
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setModifiers(prev => ({
        ...prev,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
      }))
      
      // Escape to clear selection
      if (e.key === 'Escape' && !activeTool) {
        clearSelection()
        setShowOverlapMenu(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [activeTool, clearSelection])
  
  // Handle selection with modifiers
  const handleSelect = useCallback((entity: SelectableEntity, event?: MouseEvent) => {
    const { shift, ctrl } = modifiers
    
    // Check selection filter
    if (selectionFilter !== 'all' && entity.type !== selectionFilter) {
      return
    }
    
    if (shift || ctrl) {
      // Multi-select: toggle selection
      if (selection.ids.includes(entity.id)) {
        removeFromSelection(entity.id)
      } else {
        addToSelection(entity.type, entity.id)
      }
    } else {
      // Single select: replace selection
      setSelection({
        type: entity.type,
        ids: [entity.id],
        data: entity,
      })
    }
    
    // Notify parent
    if (onSelectionChange) {
      const newSelection = shift || ctrl
        ? {
            type: entity.type,
            ids: selection.ids.includes(entity.id)
              ? selection.ids.filter(id => id !== entity.id)
              : [...selection.ids, entity.id],
          }
        : { type: entity.type, ids: [entity.id] }
      onSelectionChange(newSelection)
    }
  }, [modifiers, selectionFilter, selection, setSelection, addToSelection, removeFromSelection, onSelectionChange])
  
  // Handle preselection (hover)
  const handleHover = useCallback((entity: SelectableEntity | null) => {
    if (entity) {
      // Check selection filter
      if (selectionFilter !== 'all' && entity.type !== selectionFilter) {
        setPreselection(null)
        setHovered(null)
        return
      }
      setPreselection(entity.id)
      setHovered(entity.id)
    } else {
      setPreselection(null)
      setHovered(null)
    }
  }, [selectionFilter, setPreselection, setHovered])
  
  // Start box selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start box selection if clicking on empty space with left button
    if (e.button !== 0) return
    if (activeTool && activeTool !== 'select') return
    
    // Check if we're clicking on an entity (handled elsewhere)
    const target = e.target as HTMLElement
    if (target.closest('[data-selectable]')) return
    
    setBoxSelection({
      isActive: true,
      startPoint: { x: e.clientX, y: e.clientY },
      endPoint: { x: e.clientX, y: e.clientY },
      direction: null,
    })
  }, [activeTool])
  
  // Update box selection
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!boxSelection.isActive || !boxSelection.startPoint) return
    
    const direction = e.clientX >= boxSelection.startPoint.x ? 'left-to-right' : 'right-to-left'
    
    setBoxSelection(prev => ({
      ...prev,
      endPoint: { x: e.clientX, y: e.clientY },
      direction,
    }))
  }, [boxSelection.isActive, boxSelection.startPoint])
  
  // End box selection
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!boxSelection.isActive) return
    
    // Calculate selection box
    const { startPoint, endPoint, direction } = boxSelection
    if (startPoint && endPoint) {
      const minX = Math.min(startPoint.x, endPoint.x)
      const maxX = Math.max(startPoint.x, endPoint.x)
      const minY = Math.min(startPoint.y, endPoint.y)
      const maxY = Math.max(startPoint.y, endPoint.y)
      
      // Only select if box is big enough
      if (maxX - minX > 5 || maxY - minY > 5) {
        // TODO: Perform actual box selection based on visible entities
        // For now, this is a placeholder that would integrate with 3D raycasting
        console.log('Box selection:', { minX, maxX, minY, maxY, direction })
      } else {
        // Small box = click on empty space = clear selection
        if (!modifiers.shift && !modifiers.ctrl) {
          clearSelection()
        }
      }
    }
    
    setBoxSelection({
      isActive: false,
      startPoint: null,
      endPoint: null,
      direction: null,
    })
  }, [boxSelection, modifiers, clearSelection])
  
  // Show overlapping entities context menu
  const handleShowOverlapMenu = useCallback((entities: SelectableEntity[], position: { x: number; y: number }) => {
    // Sort by priority
    const sorted = [...entities].sort((a, b) => a.priority - b.priority)
    setOverlappingEntities(sorted)
    setOverlapMenuPosition(position)
    setShowOverlapMenu(true)
  }, [])
  
  // Select from overlap menu
  const handleSelectFromOverlap = useCallback((entity: SelectableEntity) => {
    handleSelect(entity)
    setShowOverlapMenu(false)
  }, [handleSelect])
  
  // Get entity type icon
  const getEntityIcon = (type: SelectionType) => {
    switch (type) {
      case 'face': return <Square size={14} />
      case 'edge': return <div className="w-3.5 h-0.5 bg-current" />
      case 'vertex': return <Circle size={10} />
      case 'body': return <Box size={14} />
      case 'feature': return <Layers size={14} />
      default: return <MousePointer size={14} />
    }
  }
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {children}
      
      {/* Box Selection Overlay */}
      {boxSelection.isActive && boxSelection.startPoint && boxSelection.endPoint && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: Math.min(boxSelection.startPoint.x, boxSelection.endPoint.x),
            top: Math.min(boxSelection.startPoint.y, boxSelection.endPoint.y),
            width: Math.abs(boxSelection.endPoint.x - boxSelection.startPoint.x),
            height: Math.abs(boxSelection.endPoint.y - boxSelection.startPoint.y),
            backgroundColor: boxSelection.direction === 'left-to-right'
              ? SELECTION_COLORS.boxSelectInside
              : SELECTION_COLORS.boxSelectCrossing,
            border: `2px ${boxSelection.direction === 'left-to-right' ? 'solid' : 'dashed'} ${
              boxSelection.direction === 'left-to-right'
                ? SELECTION_COLORS.boxBorderInside
                : SELECTION_COLORS.boxBorderCrossing
            }`,
          }}
        />
      )}
      
      {/* Selection Filter Button */}
      <div className="absolute top-4 right-4 z-40">
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
              ${selectionFilter !== 'all'
                ? 'bg-cad-accent/20 border-cad-accent text-cad-accent'
                : 'bg-cad-dark/90 border-cad-border text-cad-text-dim hover:text-cad-text'}
              backdrop-blur-sm
            `}
            title="Selection Filter"
          >
            <Filter size={16} />
            <span className="text-xs font-medium capitalize">
              {selectionFilter === 'all' ? 'All' : selectionFilter}
            </span>
          </button>
          
          {/* Filter Menu */}
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-cad-dark border border-cad-border rounded-lg shadow-xl overflow-hidden z-50">
              {(['all', 'face', 'edge', 'vertex', 'body', 'feature'] as SelectionFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectionFilter(filter)
                    setShowFilterMenu(false)
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors
                    ${selectionFilter === filter
                      ? 'bg-cad-accent/20 text-cad-accent'
                      : 'hover:bg-cad-panel text-cad-text-dim hover:text-cad-text'}
                  `}
                >
                  {filter !== 'all' && getEntityIcon(filter as SelectionType)}
                  <span className="capitalize">{filter}</span>
                  {selectionFilter === filter && <Check size={12} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Overlapping Entities Context Menu */}
      {showOverlapMenu && overlappingEntities.length > 0 && (
        <div
          className="absolute z-50 bg-cad-dark border border-cad-border rounded-lg shadow-xl overflow-hidden min-w-[200px]"
          style={{
            left: overlapMenuPosition.x,
            top: overlapMenuPosition.y,
          }}
        >
          <div className="px-3 py-2 border-b border-cad-border bg-cad-darker">
            <span className="text-xs font-medium text-cad-text-dim">Select Other</span>
          </div>
          {overlappingEntities.map((entity, index) => (
            <button
              key={entity.id}
              onClick={() => handleSelectFromOverlap(entity)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors
                ${selection.ids.includes(entity.id)
                  ? 'bg-cad-accent/20 text-cad-accent'
                  : 'hover:bg-cad-panel text-cad-text-dim hover:text-cad-text'}
              `}
            >
              {getEntityIcon(entity.type)}
              <div className="flex-1 min-w-0">
                <div className="truncate">{entity.name}</div>
                {entity.parentName && (
                  <div className="text-[10px] text-cad-text-dim truncate">
                    on {entity.parentName}
                  </div>
                )}
              </div>
              <ChevronRight size={12} className="text-cad-text-dim" />
            </button>
          ))}
          <div className="px-3 py-1.5 border-t border-cad-border bg-cad-darker">
            <button
              onClick={() => setShowOverlapMenu(false)}
              className="text-[10px] text-cad-text-dim hover:text-cad-text"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Selection Info (bottom left) */}
      {selection.ids.length > 0 && (
        <div className="absolute bottom-20 left-4 z-40">
          <div className="bg-cad-dark/90 border border-cad-border rounded-lg px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs">
              {getEntityIcon(selection.type)}
              <span className="text-cad-text">
                {selection.ids.length} {selection.type}{selection.ids.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={clearSelection}
                className="ml-2 text-cad-text-dim hover:text-cad-text"
                title="Clear selection (Esc)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Selection highlight component for 3D entities
interface SelectionHighlightProps {
  entityId: string
  type: 'preselection' | 'selected'
  children: React.ReactNode
}

export function SelectionHighlight({ entityId, type, children }: SelectionHighlightProps) {
  const { selection, preselection } = useUIStore()
  
  const isPreselected = preselection === entityId
  const isSelected = selection.ids.includes(entityId)
  
  // Determine highlight state
  const highlightType = isSelected ? 'selected' : isPreselected ? 'preselection' : null
  
  if (!highlightType) return <>{children}</>
  
  return (
    <div
      className={`
        ${highlightType === 'selected' ? 'ring-2 ring-blue-500' : ''}
        ${highlightType === 'preselection' ? 'ring-2 ring-amber-500' : ''}
      `}
      data-selectable
      data-entity-id={entityId}
    >
      {children}
    </div>
  )
}

// Hook for using selection in other components
export function useSelection() {
  const {
    selection,
    hovered,
    preselection,
    setSelection,
    clearSelection,
    addToSelection,
    removeFromSelection,
    setHovered,
    setPreselection,
  } = useUIStore()
  
  const isSelected = useCallback((id: string) => selection.ids.includes(id), [selection.ids])
  const isPreselected = useCallback((id: string) => preselection === id, [preselection])
  const isHovered = useCallback((id: string) => hovered === id, [hovered])
  
  const toggleSelection = useCallback((type: SelectionType, id: string, multi = false) => {
    if (multi) {
      if (selection.ids.includes(id)) {
        removeFromSelection(id)
      } else {
        addToSelection(type, id)
      }
    } else {
      setSelection({ type, ids: [id] })
    }
  }, [selection.ids, setSelection, addToSelection, removeFromSelection])
  
  return {
    selection,
    hovered,
    preselection,
    isSelected,
    isPreselected,
    isHovered,
    setSelection,
    clearSelection,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    setHovered,
    setPreselection,
  }
}

export default SelectionManager

