/**
 * Toolbar - Main application toolbar with functional tools
 */

import React from 'react'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import {
  FileIcon,
  Save,
  Undo,
  Redo,
  MousePointer,
  Box,
  Circle,
  Square,
  Minus,
  Spline,
  RotateCcw,
  Move,
  Layers,
  Grid3x3,
  Eye,
  Download,
  Upload,
  Settings,
  HelpCircle,
  Pencil,
  Plus,
  Scissors,
  CornerUpRight,
  Shell,
  Copy,
  FlipHorizontal
} from 'lucide-react'

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  disabled?: boolean
}

function ToolButton({ icon, label, active, onClick, disabled }: ToolButtonProps) {
  return (
    <button
      className={`
        flex flex-col items-center justify-center p-2 min-w-[48px] rounded transition-colors
        ${active ? 'bg-cad-accent text-white' : 'hover:bg-cad-panel text-cad-text-dim hover:text-cad-text'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={label}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  )
}

function ToolDivider() {
  return <div className="w-px h-10 bg-cad-border mx-1" />
}

export function Toolbar() {
  const { 
    activeMode, 
    activeTool, 
    setActiveTool, 
    viewSettings, 
    toggleViewSetting, 
    setDisplayMode,
    openDialog,
    addNotification
  } = useUIStore()
  
  const { document, createNewDocument, saveDocument } = useDocumentStore()

  // Model tools
  const handleExtrude = () => {
    openDialog('extrude')
  }
  
  const handleRevolve = () => {
    openDialog('revolve')
  }
  
  const handleFillet = () => {
    openDialog('fillet')
  }
  
  const handleChamfer = () => {
    openDialog('chamfer')
  }
  
  const handleSketch = () => {
    openDialog('sketch')
  }
  
  const handleNewDocument = async () => {
    await createNewDocument('New Part')
    addNotification('success', 'Created new document')
  }
  
  const handleSave = async () => {
    await saveDocument()
    addNotification('success', 'Document saved')
  }
  
  const handleExport = () => {
    addNotification('info', 'Export feature - select format in dialog')
    // Could open export dialog here
  }
  
  const handleImport = () => {
    addNotification('info', 'Import feature - drag & drop or select file')
    // Could open import dialog here
  }

  // Sketch tools
  const sketchTools = [
    { icon: <Minus size={20} />, label: 'Line', tool: 'line' },
    { icon: <Square size={20} />, label: 'Rectangle', tool: 'rectangle' },
    { icon: <Circle size={20} />, label: 'Circle', tool: 'circle' },
    { icon: <Spline size={20} />, label: 'Arc', tool: 'arc' },
    { icon: <Spline size={20} />, label: 'Spline', tool: 'spline' },
  ]

  // Model feature tools
  const modelTools = [
    { icon: <Box size={20} />, label: 'Extrude', action: handleExtrude },
    { icon: <RotateCcw size={20} />, label: 'Revolve', action: handleRevolve },
    { icon: <Layers size={20} />, label: 'Loft', action: () => addNotification('info', 'Loft: Select multiple profiles') },
    { icon: <CornerUpRight size={20} />, label: 'Sweep', action: () => addNotification('info', 'Sweep: Select profile and path') },
  ]
  
  const modifyTools = [
    { icon: <Circle size={20} />, label: 'Fillet', action: handleFillet },
    { icon: <Scissors size={20} />, label: 'Chamfer', action: handleChamfer },
    { icon: <Shell size={20} />, label: 'Shell', action: () => addNotification('info', 'Shell: Select faces to remove') },
  ]
  
  const patternTools = [
    { icon: <Copy size={20} />, label: 'Pattern', action: () => addNotification('info', 'Pattern: Select features to pattern') },
    { icon: <FlipHorizontal size={20} />, label: 'Mirror', action: () => addNotification('info', 'Mirror: Select features and mirror plane') },
  ]

  return (
    <div className="flex items-center h-14 px-2 bg-cad-dark border-b border-cad-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mr-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
        <span className="font-semibold text-cad-text">WebCAD</span>
      </div>

      <ToolDivider />

      {/* File operations */}
      <div className="flex items-center gap-1">
        <ToolButton icon={<FileIcon size={18} />} label="New" onClick={handleNewDocument} />
        <ToolButton icon={<Save size={18} />} label="Save" onClick={handleSave} />
        <ToolButton icon={<Upload size={18} />} label="Import" onClick={handleImport} />
        <ToolButton icon={<Download size={18} />} label="Export" onClick={handleExport} />
      </div>

      <ToolDivider />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <ToolButton icon={<Undo size={18} />} label="Undo" onClick={() => addNotification('info', 'Undo')} />
        <ToolButton icon={<Redo size={18} />} label="Redo" onClick={() => addNotification('info', 'Redo')} />
      </div>

      <ToolDivider />

      {/* Selection tool */}
      <ToolButton 
        icon={<MousePointer size={18} />} 
        label="Select" 
        active={activeTool === null}
        onClick={() => setActiveTool(null)}
      />

      <ToolDivider />

      {/* Mode-specific tools */}
      {activeMode === 'sketch' ? (
        // Sketch mode tools
        <div className="flex items-center gap-1">
          {sketchTools.map((tool) => (
            <ToolButton
              key={tool.tool}
              icon={tool.icon}
              label={tool.label}
              active={activeTool === tool.tool}
              onClick={() => setActiveTool(tool.tool)}
            />
          ))}
        </div>
      ) : (
        // Model mode tools
        <>
          {/* Create sketch */}
          <ToolButton 
            icon={<Pencil size={18} />} 
            label="Sketch" 
            onClick={handleSketch}
          />
          
          <ToolDivider />
          
          {/* Feature tools */}
          <div className="flex items-center gap-1">
            {modelTools.map((tool, index) => (
              <ToolButton
                key={index}
                icon={tool.icon}
                label={tool.label}
                onClick={tool.action}
              />
            ))}
          </div>

          <ToolDivider />

          {/* Modify tools */}
          <div className="flex items-center gap-1">
            {modifyTools.map((tool, index) => (
              <ToolButton
                key={index}
                icon={tool.icon}
                label={tool.label}
                onClick={tool.action}
              />
            ))}
          </div>
          
          <ToolDivider />
          
          {/* Pattern tools */}
          <div className="flex items-center gap-1">
            {patternTools.map((tool, index) => (
              <ToolButton
                key={index}
                icon={tool.icon}
                label={tool.label}
                onClick={tool.action}
              />
            ))}
          </div>
        </>
      )}

      <ToolDivider />

      {/* Direct editing */}
      <div className="flex items-center gap-1">
        <ToolButton 
          icon={<Move size={18} />} 
          label="Move" 
          onClick={() => {
            setActiveTool('move')
            addNotification('info', 'Select faces to move')
          }}
          active={activeTool === 'move'}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View options */}
      <div className="flex items-center gap-1">
        <ToolButton 
          icon={<Grid3x3 size={18} />} 
          label="Grid" 
          active={viewSettings.showGrid}
          onClick={() => toggleViewSetting('showGrid')}
        />
        <ToolButton 
          icon={<Eye size={18} />} 
          label={viewSettings.displayMode === 'wireframe' ? 'Wire' : 'Shaded'}
          onClick={() => setDisplayMode(
            viewSettings.displayMode === 'shadedEdges' ? 'wireframe' : 'shadedEdges'
          )}
        />
      </div>

      <ToolDivider />

      {/* Settings and Help */}
      <div className="flex items-center gap-1">
        <ToolButton icon={<Settings size={18} />} label="Settings" onClick={() => addNotification('info', 'Settings')} />
        <ToolButton icon={<HelpCircle size={18} />} label="Help" onClick={() => addNotification('info', 'Press ESC to cancel, Delete to remove selection')} />
      </div>
    </div>
  )
}
