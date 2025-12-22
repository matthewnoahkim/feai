/**
 * Toolbar - Main application toolbar with functional tools
 * Academic/scholarly theme styling
 */

import React, { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import { useProjectStore } from '../store/projectStore'
import { useFEAStore } from '../store/feaStore'
import {
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
  Pencil,
  Scissors,
  CornerUpRight,
  Shell,
  FlipHorizontal,
  Activity,
  PanelRight
} from 'lucide-react'

// Helper to convert mesh to STL format (ASCII)
function meshToSTL(parts: any[]): string {
  let stl = 'solid model\n'
  
  for (const part of parts) {
    if (!part.mesh) continue
    const { vertices, indices } = part.mesh
    
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3
      const i1 = indices[i + 1] * 3
      const i2 = indices[i + 2] * 3
      
      // Get vertices
      const v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]]
      const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]]
      const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]]
      
      // Calculate face normal
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

// Helper to parse STL file (ASCII or Binary) into mesh data
function parseSTL(buffer: ArrayBuffer): { vertices: number[], normals: number[], indices: number[] } | null {
  // Try to detect if it's ASCII or binary
  const textDecoder = new TextDecoder('utf-8')
  const header = textDecoder.decode(buffer.slice(0, 80))
  
  // ASCII STL starts with "solid"
  if (header.trim().toLowerCase().startsWith('solid')) {
    // Try ASCII parse first
    const text = textDecoder.decode(buffer)
    const asciiResult = parseASCIISTL(text)
    if (asciiResult && asciiResult.vertices.length > 0) {
      return asciiResult
    }
  }
  
  // Try binary parse
  return parseBinarySTL(buffer)
}

// Parse ASCII STL format
function parseASCIISTL(stlContent: string): { vertices: number[], normals: number[], indices: number[] } | null {
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  // Match facet blocks - more flexible regex
  const lines = stlContent.split('\n')
  let currentNormal: number[] = [0, 0, 1]
  let vertexIndex = 0
  let faceVertices: number[][] = []
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()
    
    if (trimmed.startsWith('facet normal')) {
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 5) {
        currentNormal = [parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4])]
      }
      faceVertices = []
    } else if (trimmed.startsWith('vertex')) {
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 4) {
        faceVertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])])
      }
    } else if (trimmed.startsWith('endfacet') && faceVertices.length === 3) {
      // Add the triangle
      for (const v of faceVertices) {
        vertices.push(v[0], v[1], v[2])
        normals.push(currentNormal[0], currentNormal[1], currentNormal[2])
      }
      indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2)
      vertexIndex += 3
    }
  }
  
  if (vertices.length === 0) {
    return null
  }
  
  return { vertices, normals, indices }
}

// Parse Binary STL format
function parseBinarySTL(buffer: ArrayBuffer): { vertices: number[], normals: number[], indices: number[] } | null {
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  try {
    const dataView = new DataView(buffer)
    
    // Skip 80-byte header
    // Read number of triangles (4 bytes, little-endian uint32)
    const numTriangles = dataView.getUint32(80, true)
    
    if (numTriangles === 0 || numTriangles > 10000000) {
      return null // Sanity check
    }
    
    let offset = 84 // After header and triangle count
    
    for (let i = 0; i < numTriangles; i++) {
      // Read normal (3 floats)
      const nx = dataView.getFloat32(offset, true); offset += 4
      const ny = dataView.getFloat32(offset, true); offset += 4
      const nz = dataView.getFloat32(offset, true); offset += 4
      
      // Read 3 vertices (9 floats total)
      for (let v = 0; v < 3; v++) {
        const vx = dataView.getFloat32(offset, true); offset += 4
        const vy = dataView.getFloat32(offset, true); offset += 4
        const vz = dataView.getFloat32(offset, true); offset += 4
        
        vertices.push(vx, vy, vz)
        normals.push(nx, ny, nz)
      }
      
      // Skip attribute byte count (2 bytes)
      offset += 2
      
      // Add indices
      const baseIdx = i * 3
      indices.push(baseIdx, baseIdx + 1, baseIdx + 2)
    }
    
    if (vertices.length === 0) {
      return null
    }
    
    return { vertices, normals, indices }
  } catch (e) {
    console.error('Binary STL parse error:', e)
    return null
  }
}

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  disabled?: boolean
  title?: string  // Optional detailed tooltip (overrides label)
}

function ToolButton({ icon, label, active, onClick, disabled, title }: ToolButtonProps) {
  return (
    <button
      className={`
        flex flex-col items-center justify-center p-1.5 min-w-[40px] transition-colors flex-shrink-0
        font-sans text-xs
        ${active 
          ? 'bg-cad-accent text-white' 
          : 'hover:bg-gray-100 text-cad-text-dim hover:text-cad-text'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title || label}  // Use detailed tooltip if provided, otherwise label
    >
      {icon}
      <span className="text-[9px] mt-0.5 font-medium whitespace-nowrap">{label}</span>
    </button>
  )
}

function ToolDivider() {
  return <div className="w-px h-8 bg-cad-border mx-0.5 flex-shrink-0" />
}

export function Toolbar() {
  const navigate = useNavigate()
  const { 
    activeMode, 
    activeTool, 
    setActiveTool, 
    viewSettings, 
    toggleViewSetting, 
    setDisplayMode,
    openDialog,
    addNotification,
    rightPanelOpen,
    toggleRightPanel,
    rollbackState,
    rollToEnd
  } = useUIStore()
  
  const { document, createNewDocument, importSTLPart, undo, redo, canUndo, canRedo, updateDocumentName, showAllBodies } = useDocumentStore()
  const { isSimulationMode, enterSimulationMode, exitSimulationMode } = useFEAStore()
  const { currentProject, updateProject } = useProjectStore()
  const { projectId } = useParams<{ projectId?: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  
  // FEA/Simulation handler
  const handleSimulation = () => {
    if (isSimulationMode) {
      exitSimulationMode()
    } else {
      enterSimulationMode()
    }
  }

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
  
  const handleExport = () => {
    if (!document) {
      addNotification('error', 'No document to export')
      return
    }
    
    // Get active part studio parts
    const activePartStudio = document.partStudios.find(ps => ps.id === document.activeElementId)
    const parts = activePartStudio?.parts || []
    
    if (parts.length === 0) {
      addNotification('error', 'No geometry to export. Create some 3D features first.')
      return
    }
    
    // Export as STL
    const content = meshToSTL(parts)
    const filename = `${document.name || 'model'}.stl`
    
    const blob = new Blob([content], { type: 'application/octet-stream' })
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
      // Read file as ArrayBuffer to support both ASCII and binary STL
      const buffer = await file.arrayBuffer()
      
      // Parse STL file
      const mesh = parseSTL(buffer)
      
      if (!mesh || mesh.vertices.length === 0) {
        addNotification('error', 'Failed to parse STL file. Make sure it is a valid STL file.')
        return
      }
      
      const triangleCount = mesh.indices.length / 3
      console.log('Parsed STL:', mesh.vertices.length / 3, 'vertices,', triangleCount, 'triangles')
      
      // Create a new document
      const docName = file.name.replace(/\.stl$/i, '')
      await createNewDocument(docName)
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the new document
      const newDoc = useDocumentStore.getState().document
      
      if (newDoc && newDoc.partStudios.length > 0) {
        const partStudioId = newDoc.partStudios[0].id
        
        // Use the store method to import the part
        importSTLPart(partStudioId, docName, mesh)
        
        addNotification('success', `Imported ${file.name} (${triangleCount} triangles)`)
      } else {
        addNotification('error', 'Failed to create document for import')
      }
    } catch (error) {
      console.error('Import error:', error)
      addNotification('error', 'Failed to import STL file: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
    
    // Reset input
    e.target.value = ''
  }

  // Handle project name editing
  const handleStartEditingName = () => {
    if (currentProject) {
      setEditedName(currentProject.name)
      setIsEditingName(true)
    } else if (document) {
      setEditedName(document.name)
      setIsEditingName(true)
    }
  }

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setIsEditingName(false)
      return
    }

    try {
      if (projectId && currentProject) {
        await updateProject(projectId, { name: editedName.trim() })
        addNotification('success', 'Project renamed')
      } else if (document) {
        updateDocumentName(editedName.trim())
      }
      setIsEditingName(false)
    } catch (error) {
      addNotification('error', 'Failed to rename')
      console.error('Failed to rename:', error)
    }
  }

  const handleCancelEditingName = () => {
    setIsEditingName(false)
    setEditedName('')
  }

  // Get display name
  const displayName = currentProject?.name || document?.name || 'Untitled'

  // Sketch tools
  const sketchTools = [
    { icon: <Minus size={16} />, label: 'Line', tool: 'line', title: 'Draw straight lines (L)' },
    { icon: <Square size={16} />, label: 'Rect', tool: 'rectangle', title: 'Draw rectangles (R)' },
    { icon: <Circle size={16} />, label: 'Circle', tool: 'circle', title: 'Draw circles (C)' },
    { icon: <Spline size={16} />, label: 'Arc', tool: 'arc', title: 'Draw circular arcs (A)' },
    { icon: <Spline size={16} />, label: 'Spline', tool: 'spline', title: 'Draw smooth curves (S)' },
  ]

  // Model feature tools
  const modelTools = [
    { icon: <Box size={16} />, label: 'Extrude', action: handleExtrude, title: 'Create 3D solid by extruding sketch profile' },
    { icon: <RotateCcw size={16} />, label: 'Revolve', action: handleRevolve, title: 'Create solid by revolving sketch around axis' },
    { icon: <Layers size={16} />, label: 'Loft', action: handleLoft, title: 'Blend between multiple profiles' },
    { icon: <CornerUpRight size={16} />, label: 'Sweep', action: handleSweep, title: 'Sweep profile along path' },
  ]
  
  const modifyTools = [
    { icon: <Circle size={16} />, label: 'Fillet', action: handleFillet, title: 'Round sharp edges with smooth radius' },
    { icon: <Scissors size={16} />, label: 'Chamfer', action: handleChamfer, title: 'Bevel edges at an angle' },
    { icon: <Shell size={16} />, label: 'Shell', action: handleShell, title: 'Hollow out solid with uniform wall thickness' },
  ]
  
  const patternTools = [
    { icon: <Grid3x3 size={16} />, label: 'Linear', action: handleLinearPattern, title: 'Repeat features in linear array' },
    { icon: <RotateCw size={16} />, label: 'Circular', action: handleCircularPattern, title: 'Repeat features around axis' },
    { icon: <FlipHorizontal size={16} />, label: 'Mirror', action: handleMirrorFeature, title: 'Mirror features across plane' },
  ]

  return (
    <div className="bg-cad-panel border-b border-cad-border font-sans overflow-x-auto overflow-y-hidden scrollbar-thin">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Inner container for buttons - maintains consistent height */}
      <div className="flex items-center h-12 px-1">
        {/* Logo - scholarly style - clicking returns to dashboard */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 px-2 mr-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          title="Back to Dashboard"
        >
          <div className="w-7 h-7 flex items-center justify-center bg-cad-accent">
            <span className="text-white font-serif font-bold text-sm">F</span>
          </div>
          <span className="font-serif font-semibold text-cad-text text-sm">FeAI</span>
        </button>

      <ToolDivider />

      {/* Project/Document Name */}
      <div className="flex items-center px-2 flex-shrink-0">
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName()
              if (e.key === 'Escape') handleCancelEditingName()
            }}
            onBlur={handleSaveName}
            className="px-2 py-1 text-sm font-serif border border-cad-accent focus:outline-none min-w-[120px] max-w-[200px]"
            autoFocus
          />
        ) : (
          <button
            onClick={handleStartEditingName}
            className="px-2 py-1 text-sm font-serif text-cad-text hover:bg-gray-100 transition-colors truncate max-w-[200px]"
            title={`${displayName} (click to rename)`}
          >
            {displayName}
          </button>
        )}
      </div>

      <ToolDivider />
      
      {/* Rollback indicator */}
      {rollbackState.isActive && (
        <div className="flex items-center px-3 py-1 bg-cad-accent/10 border border-cad-accent/30 rounded mx-2 flex-shrink-0">
          <RotateCcw size={14} className="text-cad-accent mr-2" />
          <span className="text-xs font-medium text-cad-text">History Rolled Back</span>
          <button
            onClick={() => {
              if (rollbackState.partStudioId) {
                rollToEnd(rollbackState.partStudioId)
              }
            }}
            className="ml-3 px-2 py-0.5 text-xs bg-cad-accent text-white hover:bg-cad-accent-hover rounded transition-colors"
          >
            Roll to End
          </button>
        </div>
      )}

      <ToolDivider />

      {/* File operations */}
      <div className="flex items-center flex-shrink-0">
        <ToolButton icon={<Upload size={16} />} label="Import" onClick={handleImport} />
        <ToolButton icon={<Download size={16} />} label="Export" onClick={handleExport} />
      </div>

      <ToolDivider />

      {/* Undo/Redo */}
      <div className="flex items-center flex-shrink-0">
        <ToolButton 
          icon={<Undo size={16} />} 
          label="Undo" 
          onClick={() => {
            undo()
            addNotification('info', 'Undone')
          }} 
          disabled={!canUndo}
          title="Undo last action (Ctrl+Z)"
        />
        <ToolButton 
          icon={<Redo size={16} />} 
          label="Redo" 
          onClick={() => {
            redo()
            addNotification('info', 'Redone')
          }} 
          disabled={!canRedo}
          title="Redo last undone action (Ctrl+Y)"
        />
      </div>

      <ToolDivider />

      {/* Selection tool */}
      <ToolButton 
        icon={<MousePointer size={16} />} 
        label="Select" 
        active={activeTool === null}
        onClick={() => setActiveTool(null)}
        title="Select entities (drag for box selection)"
      />

      <ToolDivider />

      {/* Mode-specific tools */}
      {activeMode === 'sketch' ? (
        // Sketch mode tools
        <div className="flex items-center flex-shrink-0">
          {sketchTools.map((tool) => (
            <ToolButton
              key={tool.tool}
              icon={tool.icon}
              label={tool.label}
              active={activeTool === tool.tool}
              onClick={() => setActiveTool(tool.tool)}
              title={tool.title}
            />
          ))}
        </div>
      ) : (
        // Model mode tools
        <>
          {/* Create sketch */}
          <ToolButton 
            icon={<Pencil size={16} />} 
            label="Sketch" 
            onClick={handleSketch}
          />
          
          <ToolDivider />
          
          {/* Feature tools */}
          <div className="flex items-center flex-shrink-0">
            {modelTools.map((tool, index) => (
              <ToolButton
                key={index}
                icon={tool.icon}
                label={tool.label}
                onClick={tool.action}
                title={tool.title}
              />
            ))}
          </div>

          <ToolDivider />

          {/* Modify tools */}
          <div className="flex items-center flex-shrink-0">
            {modifyTools.map((tool, index) => (
              <ToolButton
                key={index}
                icon={tool.icon}
                label={tool.label}
                onClick={tool.action}
                title={tool.title}
              />
            ))}
          </div>
          
          <ToolDivider />
          
          {/* Pattern tools */}
          <div className="flex items-center flex-shrink-0">
            {patternTools.map((tool, index) => (
              <ToolButton
                key={index}
                icon={tool.icon}
                label={tool.label}
                onClick={tool.action}
                title={tool.title}
              />
            ))}
          </div>
        </>
      )}

      <ToolDivider />

      {/* Direct editing */}
      <div className="flex items-center flex-shrink-0">
        <ToolButton 
          icon={<Move size={16} />} 
          label="Move" 
          onClick={() => {
            setActiveTool('move')
            addNotification('info', 'Select faces to move')
          }}
          active={activeTool === 'move'}
        />
      </div>

      <ToolDivider />

      {/* Simulation / FEA */}
      <ToolButton 
        icon={<Activity size={16} />} 
        label="Simulate" 
        active={isSimulationMode}
        onClick={handleSimulation}
      />

      {/* Spacer */}
      <div className="flex-1 min-w-[8px]" />

      {/* View options */}
      <div className="flex items-center flex-shrink-0">
        <ToolButton 
          icon={<Grid3x3 size={16} />} 
          label="Grid" 
          active={viewSettings.showGrid}
          onClick={() => toggleViewSetting('showGrid')}
        />
        <ToolButton 
          icon={<Eye size={16} />} 
          label="Show All" 
          onClick={() => showAllBodies()}
          title="Show all hidden bodies"
        />
        <ToolButton 
          icon={<Eye size={16} />} 
          label={viewSettings.displayMode === 'wireframe' ? 'Wire' : 'Shaded'}
          onClick={() => setDisplayMode(
            viewSettings.displayMode === 'shadedEdges' ? 'wireframe' : 'shadedEdges'
          )}
        />
        <ToolButton 
          icon={<PanelRight size={16} />} 
          label="Properties" 
          active={rightPanelOpen}
          onClick={toggleRightPanel}
        />
      </div>
      </div>
    </div>
  )
}
