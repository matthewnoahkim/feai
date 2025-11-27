/**
 * SketchToolbar - Sketch mode toolbar with professional CAD-style tool organization
 */

import React, { useState, useRef, useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import {
  Minus,
  Circle,
  Square,
  Hexagon,
  Spline,
  MousePointer,
  CornerUpRight,
  Ruler,
  Link,
  X,
  Check,
  ChevronDown,
  Dot,
  Scissors,
  CircleDot,
  MoveHorizontal,
  Copy,
  FlipHorizontal2,
  // Constraint icons
  Equal,
  ArrowUpDown,
  ArrowLeftRight,
  MoveHorizontal as ParallelIcon,
  CornerRightDown,
  CircleEqual,
  Target,
  Lock,
  AlignHorizontalJustifyCenter,
  GitMerge
} from 'lucide-react'

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  disabled?: boolean
  shortcut?: string
  hasVariants?: boolean
}

function ToolButton({ 
  icon, 
  label, 
  active, 
  onClick, 
  onContextMenu,
  disabled, 
  shortcut,
  hasVariants 
}: ToolButtonProps) {
  return (
    <button
      className={`
        relative flex flex-col items-center justify-center p-2 min-w-[52px] rounded-lg transition-all duration-150
        ${active 
          ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
          : 'hover:bg-cad-panel/80 text-cad-text-dim hover:text-cad-text border border-transparent hover:border-cad-border/50'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
      onContextMenu={onContextMenu}
      disabled={disabled}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <div className="relative">
        {icon}
        {hasVariants && (
          <ChevronDown 
            size={10} 
            className="absolute -bottom-1 -right-2 opacity-60" 
          />
        )}
      </div>
      <span className="text-[10px] mt-1.5 font-medium tracking-tight">{label}</span>
      {shortcut && (
        <span className="absolute top-1 right-1 text-[8px] font-mono opacity-50">{shortcut}</span>
      )}
    </button>
  )
}

interface ToolFlyoutProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  children: React.ReactNode
}

function ToolFlyout({ isOpen, onClose, position, children }: ToolFlyoutProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isOpen) return
    
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={ref}
      className="absolute z-50 bg-cad-dark border border-cad-border rounded-lg shadow-2xl py-1 min-w-[180px]"
      style={{ 
        top: position.y + 'px', 
        left: position.x + 'px',
        animation: 'fadeIn 0.1s ease-out'
      }}
    >
      {children}
    </div>
  )
}

interface FlyoutItemProps {
  icon: React.ReactNode
  label: string
  shortcut?: string
  active?: boolean
  onClick: () => void
}

function FlyoutItem({ icon, label, shortcut, active, onClick }: FlyoutItemProps) {
  return (
    <button
      className={`
        w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors
        ${active 
          ? 'bg-blue-500/20 text-blue-400' 
          : 'hover:bg-cad-panel text-cad-text-dim hover:text-cad-text'
        }
      `}
      onClick={onClick}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-[10px] font-mono opacity-50 bg-cad-panel px-1.5 py-0.5 rounded">
          {shortcut}
        </span>
      )}
    </button>
  )
}

function ToolDivider() {
  return <div className="w-px h-10 bg-cad-border/50 mx-1" />
}

function SectionDivider() {
  return <div className="h-px bg-cad-border/50 my-1" />
}

export function SketchToolbar() {
  const { 
    activeTool, 
    setActiveTool, 
    exitSketchMode,
    addNotification,
    sketchMode
  } = useUIStore()
  
  const [flyout, setFlyout] = useState<{ tool: string; x: number; y: number } | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  
  const handleToolSelect = (tool: string) => {
    setActiveTool(tool)
    setFlyout(null)
  }
  
  const handleRightClick = (tool: string, e: React.MouseEvent) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setFlyout({ 
      tool, 
      x: rect.left, 
      y: rect.bottom + 4 
    })
  }
  
  const handleFinishSketch = () => {
    exitSketchMode()
    addNotification('success', 'Sketch completed')
  }
  
  const handleCancelSketch = () => {
    exitSketchMode()
    addNotification('info', 'Sketch cancelled')
  }
  
  // Determine which rectangle variant is active
  const isRectActive = activeTool === 'rectangle-corner' || activeTool === 'rectangle-center'
  const rectLabel = activeTool === 'rectangle-center' ? 'Center Rect' : 'Rectangle'
  
  // Determine which polygon variant is active
  const isPolygonActive = activeTool === 'polygon-inscribed' || activeTool === 'polygon-circumscribed'
  const polygonLabel = activeTool === 'polygon-circumscribed' ? 'Circum.' : 'Polygon'
  
  // Determine which circle variant is active
  const isCircleActive = activeTool === 'circle-center' || activeTool === 'circle-two-point'
  const circleLabel = activeTool === 'circle-two-point' ? '2-Point' : 'Circle'
  
  // Determine which arc variant is active
  const isArcActive = activeTool === 'arc-3point' || activeTool === 'arc-center' || activeTool === 'arc-tangent'
  const arcLabel = activeTool === 'arc-center' ? 'Center Arc' : activeTool === 'arc-tangent' ? 'Tangent' : '3-Point'
  
  return (
    <div 
      ref={toolbarRef}
      className="flex items-center h-14 px-3 bg-gradient-to-b from-cad-dark to-cad-darker border-b border-cad-border"
    >
      {/* Sketch mode indicator */}
      <div className="flex items-center gap-2 px-3 mr-3">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-semibold text-blue-400">Sketch Mode</span>
      </div>
      
      <ToolDivider />
      
      {/* Selection tool */}
      <ToolButton
        icon={<MousePointer size={18} />}
        label="Select"
        shortcut="Esc"
        active={activeTool === 'select' || activeTool === null}
        onClick={() => handleToolSelect('select')}
      />
      
      <ToolDivider />
      
      {/* Drawing tools */}
      <div className="flex items-center gap-1">
        {/* Line tool */}
        <ToolButton
          icon={<Minus size={18} strokeWidth={2.5} />}
          label="Line"
          shortcut="L"
          active={activeTool === 'line' || activeTool === 'arc-tangent'}
          onClick={() => handleToolSelect('line')}
          onContextMenu={(e) => handleRightClick('line', e)}
          hasVariants
        />
        
        {/* Rectangle tool with variants */}
        <ToolButton
          icon={<Square size={18} />}
          label={rectLabel}
          shortcut="R"
          active={isRectActive}
          onClick={() => handleToolSelect('rectangle-corner')}
          onContextMenu={(e) => handleRightClick('rectangle', e)}
          hasVariants
        />
        
        {/* Polygon tool with variants */}
        <ToolButton
          icon={<Hexagon size={18} />}
          label={polygonLabel}
          shortcut="G"
          active={isPolygonActive}
          onClick={() => handleToolSelect('polygon-inscribed')}
          onContextMenu={(e) => handleRightClick('polygon', e)}
          hasVariants
        />
        
        {/* Circle tool with variants */}
        <ToolButton
          icon={<Circle size={18} />}
          label={circleLabel}
          shortcut="C"
          active={isCircleActive}
          onClick={() => handleToolSelect('circle-center')}
          onContextMenu={(e) => handleRightClick('circle', e)}
          hasVariants
        />
        
        {/* Arc tool with variants */}
        <ToolButton
          icon={<CornerUpRight size={18} />}
          label={arcLabel}
          shortcut="A"
          active={isArcActive}
          onClick={() => handleToolSelect('arc-3point')}
          onContextMenu={(e) => handleRightClick('arc', e)}
          hasVariants
        />
        
        {/* Spline tool */}
        <ToolButton
          icon={<Spline size={18} />}
          label="Spline"
          shortcut="S"
          active={activeTool === 'spline'}
          onClick={() => handleToolSelect('spline')}
          onContextMenu={(e) => handleRightClick('spline', e)}
        />
        
        {/* Point tool */}
        <ToolButton
          icon={<Dot size={18} />}
          label="Point"
          shortcut="P"
          active={activeTool === 'point'}
          onClick={() => handleToolSelect('point')}
        />
      </div>
      
      <ToolDivider />
      
      {/* Dimension & Constraints */}
      <div className="flex items-center gap-1">
        <ToolButton
          icon={<Ruler size={18} />}
          label="Dimension"
          shortcut="D"
          active={activeTool === 'dimension'}
          onClick={() => handleToolSelect('dimension')}
          onContextMenu={(e) => handleRightClick('dimension', e)}
          hasVariants
        />
        
        <ToolButton
          icon={<Link size={18} />}
          label="Constrain"
          active={activeTool === 'constraint' || activeTool?.startsWith('constraint-')}
          onClick={() => handleToolSelect('constraint')}
          onContextMenu={(e) => handleRightClick('constraint', e)}
          hasVariants
        />
      </div>
      
      <ToolDivider />
      
      {/* Modification tools */}
      <div className="flex items-center gap-1">
        <ToolButton
          icon={<Scissors size={18} />}
          label="Trim"
          shortcut="T"
          active={activeTool === 'trim'}
          onClick={() => handleToolSelect('trim')}
          onContextMenu={(e) => handleRightClick('trim-extend', e)}
          hasVariants
        />
        
        <ToolButton
          icon={<MoveHorizontal size={18} />}
          label="Extend"
          shortcut="X"
          active={activeTool === 'extend'}
          onClick={() => handleToolSelect('extend')}
          onContextMenu={(e) => handleRightClick('trim-extend', e)}
          hasVariants
        />
        
        <ToolButton
          icon={<Copy size={18} />}
          label="Offset"
          shortcut="O"
          active={activeTool === 'offset'}
          onClick={() => handleToolSelect('offset')}
          onContextMenu={(e) => handleRightClick('offset', e)}
        />
        
        <ToolButton
          icon={<FlipHorizontal2 size={18} />}
          label="Mirror"
          shortcut="M"
          active={activeTool === 'mirror'}
          onClick={() => handleToolSelect('mirror')}
          onContextMenu={(e) => handleRightClick('mirror', e)}
        />
      </div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Finish/Cancel buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCancelSketch}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cad-text-dim hover:text-cad-text bg-cad-panel hover:bg-cad-border rounded-lg transition-colors"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          onClick={handleFinishSketch}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg shadow-lg shadow-green-500/20 transition-all"
        >
          <Check size={16} />
          Finish Sketch
        </button>
      </div>
      
      {/* Tool flyouts */}
      {flyout?.tool === 'line' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<Minus size={16} />}
            label="Line"
            shortcut="L"
            active={activeTool === 'line'}
            onClick={() => handleToolSelect('line')}
          />
          <FlyoutItem
            icon={<CornerUpRight size={16} />}
            label="Tangent Arc (while drawing)"
            shortcut="A"
            active={activeTool === 'arc-tangent'}
            onClick={() => {
              addNotification('info', 'Press A while drawing a line to switch to tangent arc')
              setFlyout(null)
            }}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1">• Click-click to draw segments</p>
            <p className="mb-1">• Double-click to finish</p>
            <p>• Press Shift for H/V constraint</p>
          </div>
        </ToolFlyout>
      )}
      
      {flyout?.tool === 'rectangle' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<Square size={16} />}
            label="Corner Rectangle"
            shortcut="R"
            active={activeTool === 'rectangle-corner'}
            onClick={() => handleToolSelect('rectangle-corner')}
          />
          <FlyoutItem
            icon={<CircleDot size={16} />}
            label="Center Rectangle"
            shortcut="Shift+R"
            active={activeTool === 'rectangle-center'}
            onClick={() => handleToolSelect('rectangle-center')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>Corner Rectangle:</strong></p>
            <p className="mb-1 ml-2">• Click first corner → opposite corner</p>
            <p className="mb-2 ml-2">• Hold Alt for square constraint</p>
            <p className="mb-1"><strong>Center Rectangle:</strong></p>
            <p className="mb-1 ml-2">• Click center → corner point</p>
            <p className="ml-2">• Expands symmetrically from center</p>
          </div>
        </ToolFlyout>
      )}
      
      {flyout?.tool === 'circle' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<CircleDot size={16} />}
            label="Center-Radius Circle"
            shortcut="C"
            active={activeTool === 'circle-center'}
            onClick={() => handleToolSelect('circle-center')}
          />
          <FlyoutItem
            icon={<Circle size={16} />}
            label="Two-Point (Diameter) Circle"
            shortcut="Shift+C"
            active={activeTool === 'circle-two-point'}
            onClick={() => handleToolSelect('circle-two-point')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1">• Center-Radius: Click center, then radius</p>
            <p>• Two-Point: Click two opposite diameter points</p>
          </div>
        </ToolFlyout>
      )}
      
      {flyout?.tool === 'polygon' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<Hexagon size={16} />}
            label="Inscribed Polygon"
            shortcut="G"
            active={activeTool === 'polygon-inscribed'}
            onClick={() => handleToolSelect('polygon-inscribed')}
          />
          <FlyoutItem
            icon={<Circle size={16} />}
            label="Circumscribed Polygon"
            shortcut="Shift+G"
            active={activeTool === 'polygon-circumscribed'}
            onClick={() => handleToolSelect('polygon-circumscribed')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>Inscribed:</strong></p>
            <p className="mb-1 ml-2">• Vertices touch the circle</p>
            <p className="mb-2 ml-2">• Radius to vertices</p>
            <p className="mb-1"><strong>Circumscribed:</strong></p>
            <p className="mb-1 ml-2">• Sides tangent to circle</p>
            <p className="mb-2 ml-2">• Radius to side midpoints</p>
            <p className="mt-1 text-cad-accent">Type 3-64 to set sides</p>
          </div>
        </ToolFlyout>
      )}
      
      {flyout?.tool === 'spline' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<Spline size={16} />}
            label="Freeform Spline"
            shortcut="S"
            active={activeTool === 'spline'}
            onClick={() => handleToolSelect('spline')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>Drawing:</strong></p>
            <p className="mb-1 ml-2">• Click to place spline points</p>
            <p className="mb-1 ml-2">• Curve passes through all points</p>
            <p className="mb-2 ml-2">• Double-click to finish</p>
            <p className="mb-1"><strong>Closing:</strong></p>
            <p className="mb-2 ml-2">• Click first point to close loop</p>
            <p className="mb-1"><strong>Editing:</strong></p>
            <p className="mb-1 ml-2">• Drag points to reshape</p>
            <p className="ml-2">• Drag handles for tangent control</p>
          </div>
        </ToolFlyout>
      )}
      
      {flyout?.tool === 'arc' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<CornerUpRight size={16} />}
            label="3-Point Arc"
            shortcut="A"
            active={activeTool === 'arc-3point'}
            onClick={() => handleToolSelect('arc-3point')}
          />
          <FlyoutItem
            icon={<CircleDot size={16} />}
            label="Center-Start-End Arc"
            shortcut="Shift+A"
            active={activeTool === 'arc-center'}
            onClick={() => handleToolSelect('arc-center')}
          />
          <FlyoutItem
            icon={<Minus size={16} />}
            label="Tangent Arc (from Line)"
            shortcut="A (while drawing)"
            active={activeTool === 'arc-tangent'}
            onClick={() => {
              addNotification('info', 'Press A while drawing a line to create a tangent arc')
              setFlyout(null)
            }}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>3-Point Arc:</strong></p>
            <p className="mb-1 ml-2">• Click start → end → bulge point</p>
            <p className="mb-1 ml-2">• Snap to chord midpoint for semicircle</p>
            <p className="mb-2"><strong>Center-Start-End Arc:</strong></p>
            <p className="mb-1 ml-2">• Click center → start → end point</p>
            <p className="ml-2">• Sweep past 180° for reflex arcs</p>
          </div>
        </ToolFlyout>
      )}
      
      {flyout?.tool === 'trim-extend' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<Scissors size={16} />}
            label="Trim"
            shortcut="T"
            active={activeTool === 'trim'}
            onClick={() => handleToolSelect('trim')}
          />
          <FlyoutItem
            icon={<MoveHorizontal size={16} />}
            label="Extend"
            shortcut="X"
            active={activeTool === 'extend'}
            onClick={() => handleToolSelect('extend')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>Trim (T):</strong></p>
            <p className="mb-1 ml-2">• Click segment to remove</p>
            <p className="mb-1 ml-2">• Trims to nearest intersection</p>
            <p className="mb-2 ml-2">• Drag across for power trim</p>
            <p className="mb-1"><strong>Extend (X):</strong></p>
            <p className="mb-1 ml-2">• Click endpoint to extend</p>
            <p className="mb-1 ml-2">• Drag to boundary or position</p>
            <p className="ml-2">• Double-click to auto-extend</p>
          </div>
        </ToolFlyout>
      )}
      
      {flyout?.tool === 'offset' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<Copy size={16} />}
            label="Offset"
            shortcut="O"
            active={activeTool === 'offset'}
            onClick={() => handleToolSelect('offset')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>Offset (O):</strong></p>
            <p className="mb-1 ml-2">• Click entity or closed loop</p>
            <p className="mb-1 ml-2">• Drag arrow to set distance</p>
            <p className="mb-1 ml-2">• Click arrow to flip direction</p>
            <p className="mb-2 ml-2">• Type value for precision</p>
            <p className="mb-1"><strong>Features:</strong></p>
            <p className="mb-1 ml-2">• Maintains parallel curves</p>
            <p className="ml-2">• Auto-closes offset loops</p>
          </div>
        </ToolFlyout>
      )}
      
      {flyout?.tool === 'mirror' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<FlipHorizontal2 size={16} />}
            label="Mirror"
            shortcut="M"
            active={activeTool === 'mirror'}
            onClick={() => handleToolSelect('mirror')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>Mirror (M):</strong></p>
            <p className="mb-1 ml-2">• Select mirror line first, or</p>
            <p className="mb-1 ml-2">• Pre-select entities, then line</p>
            <p className="mb-2 ml-2">• Construction lines work great</p>
            <p className="mb-1"><strong>Features:</strong></p>
            <p className="mb-1 ml-2">• Creates symmetric copy</p>
            <p className="mb-1 ml-2">• Adds symmetric constraints</p>
            <p className="ml-2">• Enter to apply • ESC to cancel</p>
          </div>
        </ToolFlyout>
      )}

      {/* Constraint Flyout */}
      {flyout?.tool === 'constraint' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold text-cad-text-dim uppercase tracking-wider">
            Geometric Constraints
          </div>
          <FlyoutItem
            icon={<Target size={16} />}
            label="Coincident"
            shortcut="C"
            description="Point on point/curve"
            onClick={() => handleToolSelect('constraint-coincident')}
          />
          <FlyoutItem
            icon={<ArrowLeftRight size={16} />}
            label="Horizontal"
            shortcut="H"
            description="Line or points horizontal"
            onClick={() => handleToolSelect('constraint-horizontal')}
          />
          <FlyoutItem
            icon={<ArrowUpDown size={16} />}
            label="Vertical"
            shortcut="V"
            description="Line or points vertical"
            onClick={() => handleToolSelect('constraint-vertical')}
          />
          <FlyoutItem
            icon={<ParallelIcon size={16} />}
            label="Parallel"
            shortcut="/"
            description="Two lines parallel"
            onClick={() => handleToolSelect('constraint-parallel')}
          />
          <FlyoutItem
            icon={<CornerRightDown size={16} />}
            label="Perpendicular"
            shortcut="⊥"
            description="Two lines at 90°"
            onClick={() => handleToolSelect('constraint-perpendicular')}
          />
          <FlyoutItem
            icon={<GitMerge size={16} />}
            label="Tangent"
            description="Smooth curve connection"
            onClick={() => handleToolSelect('constraint-tangent')}
          />
          <FlyoutItem
            icon={<Equal size={16} />}
            label="Equal"
            shortcut="="
            description="Equal lengths/radii"
            onClick={() => handleToolSelect('constraint-equal')}
          />
          <FlyoutItem
            icon={<CircleEqual size={16} />}
            label="Concentric"
            description="Circles share center"
            onClick={() => handleToolSelect('constraint-concentric')}
          />
          <FlyoutItem
            icon={<AlignHorizontalJustifyCenter size={16} />}
            label="Midpoint"
            description="Point at line midpoint"
            onClick={() => handleToolSelect('constraint-midpoint')}
          />
          <FlyoutItem
            icon={<Lock size={16} />}
            label="Fixed"
            shortcut="F"
            description="Lock position"
            onClick={() => handleToolSelect('constraint-fixed')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>Usage:</strong></p>
            <p className="mb-1 ml-2">• Select entities, then constraint</p>
            <p className="ml-2">• Or click constraint, then entities</p>
          </div>
        </ToolFlyout>
      )}

      {/* Dimension Flyout */}
      {flyout?.tool === 'dimension' && (
        <ToolFlyout 
          isOpen={true} 
          onClose={() => setFlyout(null)}
          position={{ x: flyout.x, y: flyout.y }}
        >
          <FlyoutItem
            icon={<Ruler size={16} />}
            label="Smart Dimension"
            shortcut="D"
            description="Auto-detect dimension type"
            active={activeTool === 'dimension'}
            onClick={() => handleToolSelect('dimension')}
          />
          <SectionDivider />
          <div className="px-3 py-2 text-xs text-cad-text-dim">
            <p className="mb-1"><strong>Smart Dimension (D):</strong></p>
            <p className="mb-1 ml-2">• Line → Length</p>
            <p className="mb-1 ml-2">• Circle/Arc → Radius/Diameter</p>
            <p className="mb-1 ml-2">• 2 Lines → Distance or Angle</p>
            <p className="mb-2 ml-2">• 2 Points → Distance</p>
            <p className="mb-1"><strong>Tip:</strong></p>
            <p className="ml-2">Gray dims = Driven (reference)</p>
          </div>
        </ToolFlyout>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

