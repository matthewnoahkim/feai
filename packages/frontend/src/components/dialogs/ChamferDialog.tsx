/**
 * ChamferDialog - Professional CAD-style chamfer feature dialog
 * 
 * Provides comprehensive options for beveling edges of solids:
 * - Edge/Face selection modes
 * - Chamfer types: Equal Distance (45°), Distance-Distance, Distance-Angle
 * - Tangent propagation
 * - Flip direction for asymmetric chamfers
 * - Preview with validation
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  X, 
  Triangle,
  Check,
  AlertCircle,
  Square,
  Box,
  Layers,
  ChevronDown,
  ChevronRight,
  Link2,
  Unlink2,
  AlertTriangle,
  Eye,
  EyeOff,
  CornerDownRight,
  ArrowLeftRight,
  RotateCcw
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore, Part } from '../../store/documentStore'

// Selection mode for what can be chamfered
type SelectionMode = 'edges' | 'faces'

// Chamfer type - how dimensions are specified
type ChamferType = 'equal' | 'two-distance' | 'angle-distance'

// Edge info for selection
interface EdgeInfo {
  partId: string
  partName: string
  edgeId: string
  edgeLabel: string
}

// Face info for selection  
interface FaceInfo {
  partId: string
  partName: string
  faceId: string
  faceLabel: string
  edgeCount: number
}

export function ChamferDialog() {
  const { closeDialog, dialogData, addNotification, selection, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Get available parts (bodies that can be chamfered)
  const availableParts = useMemo(() => {
    if (!activePartStudio) return []
    return activePartStudio.parts || []
  }, [activePartStudio])
  
  // Mock edges for demonstration
  const availableEdges = useMemo(() => {
    const edges: EdgeInfo[] = []
    availableParts.forEach((part) => {
      const edgeLabels = [
        'Top-Front', 'Top-Back', 'Top-Left', 'Top-Right',
        'Bottom-Front', 'Bottom-Back', 'Bottom-Left', 'Bottom-Right',
        'Front-Left', 'Front-Right', 'Back-Left', 'Back-Right'
      ]
      edgeLabels.forEach((label, edgeIndex) => {
        edges.push({
          partId: part.id,
          partName: part.name,
          edgeId: `${part.id}-edge-${edgeIndex}`,
          edgeLabel: label
        })
      })
    })
    return edges
  }, [availableParts])
  
  // Mock faces for demonstration
  const availableFaces = useMemo(() => {
    const faces: FaceInfo[] = []
    availableParts.forEach((part) => {
      const faceLabels = ['Top', 'Bottom', 'Front', 'Back', 'Left', 'Right']
      faceLabels.forEach((label, faceIndex) => {
        faces.push({
          partId: part.id,
          partName: part.name,
          faceId: `${part.id}-face-${faceIndex}`,
          faceLabel: label,
          edgeCount: 4
        })
      })
    })
    return faces
  }, [availableParts])
  
  // State for chamfer parameters
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('edges')
  const [chamferType, setChamferType] = useState<ChamferType>('equal')
  const [selectedEdges, setSelectedEdges] = useState<string[]>([])
  const [selectedFaces, setSelectedFaces] = useState<string[]>([])
  
  // Dimension values
  const [distance1, setDistance1] = useState(2)  // First distance / equal distance
  const [distance2, setDistance2] = useState(2)  // Second distance (for two-distance)
  const [angle, setAngle] = useState(45)         // Angle (for angle-distance)
  
  // Direction control for asymmetric chamfers
  const [flipped, setFlipped] = useState(false)
  
  // Options
  const [tangentPropagation, setTangentPropagation] = useState(true)
  
  // Preview state
  const [showPreview, setShowPreview] = useState(true)
  const [previewValid, setPreviewValid] = useState(true)
  
  // Advanced options expanded
  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  
  // Toggle edge selection
  const toggleEdge = useCallback((edgeId: string) => {
    setSelectedEdges(prev => {
      if (prev.includes(edgeId)) {
        return prev.filter(id => id !== edgeId)
      }
      
      if (tangentPropagation) {
        const edge = availableEdges.find(e => e.edgeId === edgeId)
        if (edge) {
          const partEdges = availableEdges.filter(e => e.partId === edge.partId)
          const similar = partEdges
            .filter(e => {
              const edgeDir = edge.edgeLabel.split('-')[0]
              return e.edgeLabel.includes(edgeDir) && !prev.includes(e.edgeId)
            })
            .map(e => e.edgeId)
          return [...prev, edgeId, ...similar.slice(0, 3)]
        }
      }
      
      return [...prev, edgeId]
    })
  }, [tangentPropagation, availableEdges])
  
  // Toggle face selection
  const toggleFace = useCallback((faceId: string) => {
    setSelectedFaces(prev => {
      if (prev.includes(faceId)) {
        return prev.filter(id => id !== faceId)
      }
      return [...prev, faceId]
    })
  }, [])
  
  // Validate dimensions
  const validateDimensions = useCallback((): boolean => {
    if (distance1 <= 0) return false
    if (chamferType === 'two-distance' && distance2 <= 0) return false
    if (chamferType === 'angle-distance' && (angle <= 0 || angle >= 90)) return false
    return true
  }, [distance1, distance2, angle, chamferType])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    const isValid = validateDimensions() && 
      (selectedEdges.length > 0 || selectedFaces.length > 0)
    setPreviewValid(isValid)
    
    setDialogData({
      type: 'chamfer',
      selectionMode,
      chamferType,
      distance1,
      distance2: chamferType === 'two-distance' ? distance2 : distance1,
      angle: chamferType === 'angle-distance' ? angle : 45,
      flipped,
      selectedEdges,
      selectedFaces,
      tangentPropagation,
      showPreview,
      previewValid: isValid
    })
  }, [
    selectionMode, chamferType, distance1, distance2, angle, flipped,
    selectedEdges, selectedFaces, tangentPropagation, showPreview,
    validateDimensions, setDialogData
  ])
  
  // Handle create
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    if (selectedEdges.length === 0 && selectedFaces.length === 0) {
      addNotification('error', 'Please select edges or faces to chamfer')
      return
    }
    
    if (!validateDimensions()) {
      addNotification('error', 'Invalid dimension values')
      return
    }
    
    // Build chamfer parameters
    const params: Record<string, any> = {
      selectionMode,
      chamferType,
      distance1,
      distance2: chamferType === 'two-distance' ? distance2 : distance1,
      angle: chamferType === 'angle-distance' ? angle : 45,
      flipped,
      edges: selectedEdges,
      faces: selectedFaces,
      tangentPropagation
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'chamfer').length + 1
    const name = `Chamfer ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'chamfer',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      const dimText = chamferType === 'equal' 
        ? `${distance1}mm` 
        : chamferType === 'two-distance'
          ? `${distance1}×${distance2}mm`
          : `${distance1}mm @ ${angle}°`
      addNotification('success', `Created ${name} (${dimText})`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create chamfer feature')
    }
  }
  
  // Get total selected count
  const totalSelected = selectedEdges.length + selectedFaces.length * 4
  
  // Validation
  const isValid = (selectedEdges.length > 0 || selectedFaces.length > 0) && 
    validateDimensions()
  
  // Get chamfer type description
  const getChamferTypeDescription = () => {
    switch (chamferType) {
      case 'equal':
        return 'Equal 45° bevel on both faces'
      case 'two-distance':
        return 'Different distances on each adjacent face'
      case 'angle-distance':
        return 'Distance along one face with specified angle'
      default:
        return ''
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-cad-dark border border-cad-border rounded-lg shadow-2xl w-[460px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-gradient-to-r from-orange-900/30 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center">
              <Triangle size={14} className="text-orange-400" />
            </div>
            <h2 className="font-semibold text-cad-text">Chamfer</h2>
          </div>
          <button
            onClick={closeDialog}
            className="p-1.5 hover:bg-cad-panel rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Selection Mode */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Selection Mode
            </label>
            <div className="grid grid-cols-2 gap-1 bg-cad-darker p-1 rounded-lg">
              {[
                { value: 'edges', label: 'Edges', icon: <CornerDownRight size={14} /> },
                { value: 'faces', label: 'Faces', icon: <Square size={14} /> },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setSelectionMode(mode.value as SelectionMode)}
                  className={`
                    flex items-center justify-center gap-2 p-2 rounded transition-colors text-xs
                    ${selectionMode === mode.value 
                      ? 'bg-orange-500 text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Edge/Face Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              {selectionMode === 'edges' ? 'Select Edges' : 'Select Faces'}
              <span className="ml-auto text-orange-400 text-[10px] normal-case">
                {totalSelected} selected
              </span>
            </label>
            
            {availableParts.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-amber-300 font-medium">No parts found</p>
                    <p className="text-amber-400/70 mt-1">
                      Create 3D geometry (extrude, revolve, etc.) first to add chamfers.
                    </p>
                  </div>
                </div>
              </div>
            ) : selectionMode === 'edges' ? (
              <div className="space-y-2 max-h-36 overflow-y-auto bg-cad-darker rounded-lg border border-cad-border p-2">
                {availableParts.map((part) => (
                  <div key={part.id} className="space-y-1">
                    <p className="text-xs text-cad-text-dim font-medium flex items-center gap-1">
                      <Box size={12} />
                      {part.name}
                    </p>
                    <div className="grid grid-cols-2 gap-1 pl-4">
                      {availableEdges.filter(e => e.partId === part.id).slice(0, 8).map((edge) => (
                        <label
                          key={edge.edgeId}
                          className={`
                            flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs
                            ${selectedEdges.includes(edge.edgeId)
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'hover:bg-cad-panel border border-transparent'}
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEdges.includes(edge.edgeId)}
                            onChange={() => toggleEdge(edge.edgeId)}
                            className="sr-only"
                          />
                          <div className={`
                            w-3 h-3 rounded border flex items-center justify-center transition-colors
                            ${selectedEdges.includes(edge.edgeId)
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-cad-border'}
                          `}>
                            {selectedEdges.includes(edge.edgeId) && <Check size={8} className="text-white" />}
                          </div>
                          <span className="text-cad-text truncate">{edge.edgeLabel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto bg-cad-darker rounded-lg border border-cad-border p-2">
                {availableParts.map((part) => (
                  <div key={part.id} className="space-y-1">
                    <p className="text-xs text-cad-text-dim font-medium flex items-center gap-1">
                      <Box size={12} />
                      {part.name}
                    </p>
                    <div className="grid grid-cols-3 gap-1 pl-4">
                      {availableFaces.filter(f => f.partId === part.id).map((face) => (
                        <label
                          key={face.faceId}
                          className={`
                            flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs
                            ${selectedFaces.includes(face.faceId)
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'hover:bg-cad-panel border border-transparent'}
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFaces.includes(face.faceId)}
                            onChange={() => toggleFace(face.faceId)}
                            className="sr-only"
                          />
                          <div className={`
                            w-3 h-3 rounded border flex items-center justify-center transition-colors
                            ${selectedFaces.includes(face.faceId)
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-cad-border'}
                          `}>
                            {selectedFaces.includes(face.faceId) && <Check size={8} className="text-white" />}
                          </div>
                          <span className="text-cad-text">{face.faceLabel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Chamfer Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Chamfer Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-cad-darker p-1 rounded-lg">
              {[
                { value: 'equal', label: 'Equal (45°)' },
                { value: 'two-distance', label: 'Two Distance' },
                { value: 'angle-distance', label: 'Angle + Dist' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setChamferType(type.value as ChamferType)}
                  className={`
                    p-2 rounded transition-colors text-xs
                    ${chamferType === type.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-cad-text-dim italic">
              {getChamferTypeDescription()}
            </p>
          </div>
          
          {/* Dimension Inputs */}
          <div className="space-y-3 p-3 bg-cad-darker/50 rounded-lg border border-cad-border">
            {/* Distance 1 (always shown) */}
            <div className="space-y-1">
              <label className="block text-xs text-cad-text-dim">
                {chamferType === 'equal' ? 'Distance (mm)' : 
                 chamferType === 'two-distance' ? 'Distance 1 (mm)' : 
                 'Distance (mm)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={distance1}
                  onChange={(e) => setDistance1(parseFloat(e.target.value) || 0)}
                  min={0.1}
                  step={0.5}
                  className={`
                    flex-1 px-3 py-2 bg-cad-darker border rounded text-sm focus:border-cad-accent
                    ${distance1 > 0 ? 'border-cad-border' : 'border-red-500'}
                  `}
                />
                <button
                  onClick={() => setDistance1(prev => Math.max(0.1, prev - 0.5))}
                  className="px-3 py-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
                >
                  -
                </button>
                <button
                  onClick={() => setDistance1(prev => prev + 0.5)}
                  className="px-3 py-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Distance 2 (for two-distance mode) */}
            {chamferType === 'two-distance' && (
              <div className="space-y-1">
                <label className="block text-xs text-cad-text-dim">Distance 2 (mm)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={distance2}
                    onChange={(e) => setDistance2(parseFloat(e.target.value) || 0)}
                    min={0.1}
                    step={0.5}
                    className={`
                      flex-1 px-3 py-2 bg-cad-darker border rounded text-sm focus:border-cad-accent
                      ${distance2 > 0 ? 'border-cad-border' : 'border-red-500'}
                    `}
                  />
                  <button
                    onClick={() => setDistance2(prev => Math.max(0.1, prev - 0.5))}
                    className="px-3 py-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setDistance2(prev => prev + 0.5)}
                    className="px-3 py-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            {/* Angle (for angle-distance mode) */}
            {chamferType === 'angle-distance' && (
              <div className="space-y-1">
                <label className="block text-xs text-cad-text-dim">Angle (°)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={angle}
                    onChange={(e) => setAngle(parseFloat(e.target.value) || 0)}
                    min={1}
                    max={89}
                    step={5}
                    className={`
                      flex-1 px-3 py-2 bg-cad-darker border rounded text-sm focus:border-cad-accent
                      ${angle > 0 && angle < 90 ? 'border-cad-border' : 'border-red-500'}
                    `}
                  />
                  <button
                    onClick={() => setAngle(prev => Math.max(1, prev - 5))}
                    className="px-3 py-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setAngle(prev => Math.min(89, prev + 5))}
                    className="px-3 py-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            {/* Flip direction (for asymmetric chamfers) */}
            {(chamferType === 'two-distance' || chamferType === 'angle-distance') && (
              <div className="pt-2 border-t border-cad-border">
                <button
                  onClick={() => setFlipped(!flipped)}
                  className={`
                    w-full flex items-center justify-center gap-2 py-2 rounded transition-colors text-sm
                    ${flipped 
                      ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300' 
                      : 'bg-cad-darker border border-cad-border hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  <ArrowLeftRight size={14} />
                  Flip Direction
                  {flipped && <span className="text-xs">(Flipped)</span>}
                </button>
                <p className="text-xs text-cad-text-dim mt-1 text-center">
                  Swap which face gets which distance
                </p>
              </div>
            )}
            
            {/* Visual representation of chamfer */}
            <div className="mt-3 p-3 bg-cad-darker rounded-lg">
              <div className="flex items-center justify-center">
                <svg width="120" height="80" viewBox="0 0 120 80">
                  {/* Original edge */}
                  <line 
                    x1="20" y1="20" x2="100" y2="20" 
                    stroke="#475569" strokeWidth="2" strokeDasharray="4,2"
                  />
                  <line 
                    x1="100" y1="20" x2="100" y2="70" 
                    stroke="#475569" strokeWidth="2" strokeDasharray="4,2"
                  />
                  
                  {/* Chamfered edge */}
                  <line 
                    x1="20" y1="20" 
                    x2={chamferType === 'equal' ? 100 - distance1 * 3 : flipped ? 100 - distance2 * 3 : 100 - distance1 * 3} 
                    y2="20" 
                    stroke="#f97316" strokeWidth="2"
                  />
                  <line 
                    x1={chamferType === 'equal' ? 100 - distance1 * 3 : flipped ? 100 - distance2 * 3 : 100 - distance1 * 3}
                    y1="20"
                    x2="100"
                    y2={chamferType === 'equal' ? 20 + distance1 * 3 : flipped ? 20 + distance1 * 3 : 20 + distance2 * 3}
                    stroke="#f97316" strokeWidth="2"
                  />
                  <line 
                    x1="100" 
                    y1={chamferType === 'equal' ? 20 + distance1 * 3 : flipped ? 20 + distance1 * 3 : 20 + distance2 * 3}
                    y2="70" 
                    x2="100"
                    stroke="#f97316" strokeWidth="2"
                  />
                  
                  {/* Dimension labels */}
                  <text x="60" y="15" fill="#f97316" fontSize="10" textAnchor="middle">
                    {chamferType === 'two-distance' ? (flipped ? `D2: ${distance2}` : `D1: ${distance1}`) : `D: ${distance1}`}
                  </text>
                  <text x="112" y="45" fill="#f97316" fontSize="10" textAnchor="start">
                    {chamferType === 'two-distance' ? (flipped ? `D1: ${distance1}` : `D2: ${distance2}`) : ''}
                  </text>
                  {chamferType === 'angle-distance' && (
                    <text x="75" y="50" fill="#f97316" fontSize="10" textAnchor="middle">
                      {angle}°
                    </text>
                  )}
                </svg>
              </div>
            </div>
          </div>
          
          {/* Tangent Propagation */}
          <div className="p-3 bg-cad-darker/50 rounded-lg border border-cad-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tangentPropagation}
                onChange={(e) => setTangentPropagation(e.target.checked)}
                className="w-4 h-4 rounded border-cad-border bg-cad-darker"
              />
              <span className="text-sm text-cad-text flex items-center gap-2">
                {tangentPropagation ? <Link2 size={14} className="text-orange-400" /> : <Unlink2 size={14} />}
                Tangent Propagation
              </span>
            </label>
            <p className="text-xs text-cad-text-dim pl-6 mt-1">
              {tangentPropagation 
                ? 'Automatically selects tangent edges when one edge is picked'
                : 'Only the exact clicked edge is selected'}
            </p>
          </div>
          
          {/* Preview Toggle */}
          <div className="flex items-center justify-between p-2 bg-cad-darker/50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
                className="w-4 h-4 rounded border-cad-border bg-cad-darker"
              />
              <span className="text-sm text-cad-text flex items-center gap-2">
                {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
                Show Preview
              </span>
            </label>
            {showPreview && !previewValid && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                Preview unavailable
              </span>
            )}
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <h4 className="text-xs font-medium text-orange-300 mb-2">Summary</h4>
            <ul className="text-xs text-orange-200/70 space-y-1">
              <li>• Selection: {totalSelected} {selectionMode}</li>
              <li>• Type: {
                chamferType === 'equal' ? 'Equal Distance (45°)' :
                chamferType === 'two-distance' ? 'Two Distance' :
                'Angle + Distance'
              }</li>
              <li>• Dimensions: {
                chamferType === 'equal' ? `${distance1} mm` :
                chamferType === 'two-distance' ? `${distance1} × ${distance2} mm` :
                `${distance1} mm @ ${angle}°`
              }</li>
              {(chamferType !== 'equal' && flipped) && <li>• Direction flipped</li>}
              {tangentPropagation && <li>• Tangent propagation enabled</li>}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-cad-darker/50">
          <div className="text-xs text-cad-text-dim">
            {!isValid && (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle size={12} />
                {selectedEdges.length === 0 && selectedFaces.length === 0 
                  ? 'Select edges or faces to chamfer'
                  : 'Invalid dimension values'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeDialog}
              className="px-4 py-2 text-sm bg-cad-panel hover:bg-cad-border rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!isValid}
              className={`
                px-4 py-2 text-sm rounded transition-colors flex items-center gap-2
                ${isValid 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-cad-border text-cad-text-dim cursor-not-allowed'}
              `}
            >
              <Check size={14} />
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

