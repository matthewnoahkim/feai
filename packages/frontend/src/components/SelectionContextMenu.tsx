/**
 * SelectionContextMenu - Context menu for selected entities
 * 
 * Shows relevant actions based on selection type:
 * - Face: Extrude, Draft, Shell, etc.
 * - Edge: Fillet, Chamfer, etc.
 * - Multiple edges: Fillet all, etc.
 * - Sketch entities: Edit, Delete, Constraints, etc.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useUIStore, SelectionType } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import {
  Box,
  Circle,
  Square,
  Layers,
  Trash2,
  Copy,
  Scissors,
  Eye,
  EyeOff,
  Edit,
  Move,
  RotateCcw,
  Ruler,
  ChevronRight,
  Lock,
  Unlock,
  Link,
  Unlink,
  Maximize2,
  FlipHorizontal,
  Grid3X3,
} from 'lucide-react'

interface ContextMenuItem {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  shortcut?: string
  disabled?: boolean
  divider?: boolean
  submenu?: ContextMenuItem[]
}

interface SelectionContextMenuProps {
  position: { x: number; y: number }
  onClose: () => void
}

export function SelectionContextMenu({ position, onClose }: SelectionContextMenuProps) {
  const { selection, clearSelection, openDialog } = useUIStore()
  const { document } = useDocumentStore()
  
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-context-menu]')) {
        onClose()
      }
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    (document as any)?.addEventListener('click', handleClickOutside)
    window.addEventListener('keydown', handleEscape)
    
    return () => {
      (document as any)?.removeEventListener('click', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])
  
  // Get menu items based on selection type
  const getMenuItems = useCallback((): ContextMenuItem[] => {
    const items: ContextMenuItem[] = []
    
    if (selection.ids.length === 0) {
      // No selection - general menu
      items.push(
        {
          id: 'select-all',
          label: 'Select All',
          icon: <Square size={14} />,
          action: () => { /* TODO */ },
          shortcut: 'Ctrl+A',
        },
        {
          id: 'divider-1',
          label: '',
          icon: null,
          action: () => {},
          divider: true,
        },
        {
          id: 'zoom-fit',
          label: 'Zoom to Fit',
          icon: <Maximize2 size={14} />,
          action: () => { /* TODO */ },
          shortcut: 'Home',
        },
      )
      return items
    }
    
    // Selection-based menu items
    switch (selection.type) {
      case 'face':
        items.push(
          {
            id: 'extrude',
            label: 'Extrude',
            icon: <Box size={14} />,
            action: () => { openDialog('extrude'); onClose() },
            shortcut: 'E',
          },
          {
            id: 'revolve',
            label: 'Revolve',
            icon: <RotateCcw size={14} />,
            action: () => { openDialog('revolve'); onClose() },
          },
          {
            id: 'shell',
            label: 'Shell',
            icon: <Square size={14} />,
            action: () => { openDialog('shell'); onClose() },
          },
          {
            id: 'divider-1',
            label: '',
            icon: null,
            action: () => {},
            divider: true,
          },
          {
            id: 'sketch-on-face',
            label: 'Sketch on Face',
            icon: <Grid3X3 size={14} />,
            action: () => { openDialog('sketch'); onClose() },
          },
        )
        break
        
      case 'edge':
        items.push(
          {
            id: 'fillet',
            label: selection.ids.length > 1 ? `Fillet ${selection.ids.length} Edges` : 'Fillet',
            icon: <Circle size={14} />,
            action: () => { openDialog('fillet'); onClose() },
            shortcut: 'F',
          },
          {
            id: 'chamfer',
            label: selection.ids.length > 1 ? `Chamfer ${selection.ids.length} Edges` : 'Chamfer',
            icon: <Square size={14} />,
            action: () => { openDialog('chamfer'); onClose() },
          },
          {
            id: 'divider-1',
            label: '',
            icon: null,
            action: () => {},
            divider: true,
          },
          {
            id: 'measure',
            label: 'Measure',
            icon: <Ruler size={14} />,
            action: () => { /* TODO */ },
          },
        )
        break
        
      case 'body':
        items.push(
          {
            id: 'move',
            label: 'Move/Copy',
            icon: <Move size={14} />,
            action: () => { /* TODO */ },
            shortcut: 'M',
          },
          {
            id: 'mirror',
            label: 'Mirror',
            icon: <FlipHorizontal size={14} />,
            action: () => { openDialog('mirror-feature'); onClose() },
          },
          {
            id: 'pattern',
            label: 'Pattern',
            icon: <Grid3X3 size={14} />,
            action: () => {},
            submenu: [
              {
                id: 'linear-pattern',
                label: 'Linear Pattern',
                icon: <Grid3X3 size={14} />,
                action: () => { openDialog('linear-pattern'); onClose() },
              },
              {
                id: 'circular-pattern',
                label: 'Circular Pattern',
                icon: <RotateCcw size={14} />,
                action: () => { openDialog('circular-pattern'); onClose() },
              },
            ],
          },
          {
            id: 'divider-1',
            label: '',
            icon: null,
            action: () => {},
            divider: true,
          },
          {
            id: 'hide',
            label: 'Hide',
            icon: <EyeOff size={14} />,
            action: () => { /* TODO */ },
            shortcut: 'H',
          },
        )
        break
        
      case 'feature':
        items.push(
          {
            id: 'edit',
            label: 'Edit Feature',
            icon: <Edit size={14} />,
            action: () => { /* TODO */ },
            shortcut: 'Enter',
          },
          {
            id: 'suppress',
            label: 'Suppress',
            icon: <EyeOff size={14} />,
            action: () => { /* TODO */ },
          },
          {
            id: 'divider-1',
            label: '',
            icon: null,
            action: () => {},
            divider: true,
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 size={14} />,
            action: () => { /* TODO */ },
            shortcut: 'Del',
          },
        )
        break
        
      case 'sketch-entity':
        items.push(
          {
            id: 'constrain',
            label: 'Add Constraint',
            icon: <Lock size={14} />,
            action: () => {},
            submenu: [
              {
                id: 'horizontal',
                label: 'Horizontal',
                icon: <div className="w-3.5 h-0.5 bg-current" />,
                action: () => { /* TODO */ },
                shortcut: 'H',
              },
              {
                id: 'vertical',
                label: 'Vertical',
                icon: <div className="w-0.5 h-3.5 bg-current" />,
                action: () => { /* TODO */ },
                shortcut: 'V',
              },
              {
                id: 'perpendicular',
                label: 'Perpendicular',
                icon: <div className="text-[10px]">⟂</div>,
                action: () => { /* TODO */ },
              },
              {
                id: 'parallel',
                label: 'Parallel',
                icon: <div className="text-[10px]">//</div>,
                action: () => { /* TODO */ },
              },
            ],
          },
          {
            id: 'dimension',
            label: 'Add Dimension',
            icon: <Ruler size={14} />,
            action: () => { /* TODO */ },
            shortcut: 'D',
          },
          {
            id: 'divider-1',
            label: '',
            icon: null,
            action: () => {},
            divider: true,
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 size={14} />,
            action: () => { /* TODO */ },
            shortcut: 'Del',
          },
        )
        break
        
      default:
        break
    }
    
    // Common items for all selection types
    if (selection.ids.length > 0) {
      items.push(
        {
          id: 'divider-common',
          label: '',
          icon: null,
          action: () => {},
          divider: true,
        },
        {
          id: 'deselect',
          label: 'Deselect All',
          icon: <Unlink size={14} />,
          action: () => { clearSelection(); onClose() },
          shortcut: 'Esc',
        },
      )
    }
    
    return items
  }, [selection, clearSelection, openDialog, onClose])
  
  const menuItems = getMenuItems()
  
  // Render menu item
  const renderMenuItem = (item: ContextMenuItem, depth = 0) => {
    if (item.divider) {
      return <div key={item.id} className="h-px bg-cad-border my-1" />
    }
    
    const hasSubmenu = item.submenu && item.submenu.length > 0
    
    return (
      <div key={item.id} className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (hasSubmenu) {
              setActiveSubmenu(activeSubmenu === item.id ? null : item.id)
            } else {
              item.action()
            }
          }}
          onMouseEnter={() => hasSubmenu && setActiveSubmenu(item.id)}
          disabled={item.disabled}
          className={`
            w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors
            ${item.disabled
              ? 'text-cad-text-dim cursor-not-allowed'
              : 'hover:bg-cad-panel text-cad-text hover:text-cad-text'}
          `}
        >
          <span className="w-4 flex items-center justify-center text-cad-text-dim">
            {item.icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {item.shortcut && (
            <span className="text-[10px] text-cad-text-dim ml-4">{item.shortcut}</span>
          )}
          {hasSubmenu && <ChevronRight size={12} className="text-cad-text-dim" />}
        </button>
        
        {/* Submenu */}
        {hasSubmenu && activeSubmenu === item.id && (
          <div
            className="absolute left-full top-0 ml-1 min-w-[160px] bg-cad-dark border border-cad-border rounded-lg shadow-xl overflow-hidden z-50"
            data-context-menu
          >
            {item.submenu!.map(subItem => renderMenuItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div
      data-context-menu
      className="fixed z-50 min-w-[180px] bg-cad-dark border border-cad-border rounded-lg shadow-xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Header showing selection info */}
      {selection.ids.length > 0 && (
        <div className="px-3 py-2 border-b border-cad-border bg-cad-darker">
          <span className="text-[10px] font-medium text-cad-text-dim uppercase tracking-wide">
            {selection.ids.length} {selection.type}{selection.ids.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}
      
      {/* Menu items */}
      <div className="py-1">
        {menuItems.map(item => renderMenuItem(item))}
      </div>
    </div>
  )
}

// Hook to manage context menu
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
  })
  
  const openContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
    })
  }, [])
  
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }))
  }, [])
  
  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  }
}

export default SelectionContextMenu

