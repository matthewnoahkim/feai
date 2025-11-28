/**
 * Toolbar - Main application toolbar with functional tools
 */

import React, { useRef } from 'react'
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
  RotateCw,
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

// Helper to convert mesh to STL format
function meshToSTL(parts: any[]): string {
  let stl = 'solid model\n'
  
  for (const part of parts) {
    if (!part.mesh) continue
    const { vertices, normals, indices } = part.mesh
    
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3
      const i1 = indices[i + 1] * 3
      const i2 = indices[i + 2] * 3
      
      // Calculate face normal
      const v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]]
      const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]]
      const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]]
      
      const e1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]]
      const e2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]]
      const n = [
        e1[1] * e2[2] - e1[2] * e2[1],
        e1[2] * e2[0] - e1[0] * e2[2],
        e1[0] * e2[1] - e1[1] * e2[0]
      ]
      const len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2])
      if (len > 0) {
        n[0] /= len; n[1] /= len; n[2] /= len
      }
      
      stl += `  facet normal ${n[0]} ${n[1]} ${n[2]}\n`
      stl += `    outer loop\n`
      stl += `      vertex ${v0[0]} ${v0[1]} ${v0[2]}\n`
      stl += `      vertex ${v1[0]} ${v1[1]} ${v1[2]}\n`
      stl += `      vertex ${v2[0]} ${v2[1]} ${v2[2]}\n`
      stl += `    endloop\n`
      stl += `  endfacet\n`
    }
  }
  
  stl += 'endsolid model\n'
  return stl
}

// Helper to convert mesh to OBJ format
function meshToOBJ(parts: any[]): string {
  let obj = '# WebCAD Export\n'
  let vertexOffset = 0
  
  for (const part of parts) {
    if (!part.mesh) continue
    const { vertices, indices } = part.mesh
    
    obj += `# ${part.name || 'Part'}\n`
    obj += `o ${part.name || 'Part'}\n`
    
    // Vertices
    for (let i = 0; i < vertices.length; i += 3) {
      obj += `v ${vertices[i]} ${vertices[i + 1]} ${vertices[i + 2]}\n`
    }
    
    // Faces (1-indexed in OBJ)
    for (let i = 0; i < indices.length; i += 3) {
      const f1 = indices[i] + 1 + vertexOffset
      const f2 = indices[i + 1] + 1 + vertexOffset
      const f3 = indices[i + 2] + 1 + vertexOffset
      obj += `f ${f1} ${f2} ${f3}\n`
    }
    
    vertexOffset += vertices.length / 3
  }
  
  return obj
}

// Helper to serialize document for JSON export
function serializeDocument(document: any): any {
  if (!document) return null
  
  return {
    ...document,
    partStudios: document.partStudios.map((ps: any) => ({
      ...ps,
      sketches: Array.from(ps.sketches.entries())
    }))
  }
}

// Helper to deserialize document from JSON import
function deserializeDocument(data: any): any {
  if (!data) return null
  
  return {
    ...data,
    partStudios: data.partStudios.map((ps: any) => ({
      ...ps,
      sketches: new Map(ps.sketches)
    }))
  }
}

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
  
  const { document, createNewDocument, saveDocument, loadDocumentFromData } = useDocumentStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  
  const handleShell = () => {
    openDialog('shell')
  }
  
  const handleMirrorFeature = () => {
    openDialog('mirror-feature')
  }
  
  const handleLinearPattern = () => {
    openDialog('linear-pattern')
  }
  
  const handleCircularPattern = () => {
    openDialog('circular-pattern')
  }
  
  const handleSweep = () => {
    openDialog('sweep')
  }
  
  const handleLoft = () => {
    openDialog('loft')
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
    if (!document) {
      addNotification('error', 'No document to export')
      return
    }
    
    // Get active part studio parts
    const activePartStudio = document.partStudios.find(ps => ps.id === document.activeElementId)
    const parts = activePartStudio?.parts || []
    
    if (parts.length === 0) {
      // No geometry - export document as JSON
      const json = JSON.stringify(serializeDocument(document), null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `${document.name || 'document'}.json`
      a.click()
      URL.revokeObjectURL(url)
      addNotification('success', 'Exported document as JSON')
      return
    }
    
    // Show export format options
    const format = window.prompt('Export format (stl, obj, json):', 'stl')?.toLowerCase()
    
    if (!format) return
    
    let content: string
    let filename: string
    let mimeType: string
    
    switch (format) {
      case 'stl':
        content = meshToSTL(parts)
        filename = `${document.name || 'model'}.stl`
        mimeType = 'application/octet-stream'
        break
      case 'obj':
        content = meshToOBJ(parts)
        filename = `${document.name || 'model'}.obj`
        mimeType = 'text/plain'
        break
      case 'json':
        content = JSON.stringify(serializeDocument(document), null, 2)
        filename = `${document.name || 'document'}.json`
        mimeType = 'application/json'
        break
      default:
        addNotification('error', `Unsupported format: ${format}`)
        return
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    addNotification('success', `Exported as ${filename}`)
  }
  
  const handleImport = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        const doc = deserializeDocument(data)
        if (doc && loadDocumentFromData) {
          loadDocumentFromData(doc)
          addNotification('success', `Imported ${file.name}`)
        } else {
          addNotification('error', 'Invalid document format')
        }
      } else {
        addNotification('error', 'Only JSON files can be imported. Export as JSON first.')
      }
    } catch (error) {
      console.error('Import error:', error)
      addNotification('error', 'Failed to import file')
    }
    
    // Reset input
    e.target.value = ''
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
    { icon: <Layers size={20} />, label: 'Loft', action: handleLoft },
    { icon: <CornerUpRight size={20} />, label: 'Sweep', action: handleSweep },
  ]
  
  const modifyTools = [
    { icon: <Circle size={20} />, label: 'Fillet', action: handleFillet },
    { icon: <Scissors size={20} />, label: 'Chamfer', action: handleChamfer },
    { icon: <Shell size={20} />, label: 'Shell', action: handleShell },
  ]
  
  const patternTools = [
    { icon: <Grid3x3 size={20} />, label: 'Linear', action: handleLinearPattern },
    { icon: <RotateCw size={20} />, label: 'Circular', action: handleCircularPattern },
    { icon: <FlipHorizontal size={20} />, label: 'Mirror', action: handleMirrorFeature },
  ]

  return (
    <div className="flex items-center h-14 px-2 bg-cad-dark border-b border-cad-border">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      
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
