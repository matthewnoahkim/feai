/**
 * FilletDialog - Professional CAD-style fillet feature dialog
 * 
 * Provides comprehensive options for rounding edges of solids:
 * - Edge/Face/Feature selection modes
 * - Constant and variable radius options
 * - Tangent propagation
 * - Multiple radius sets
 * - Preview with validation
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  X, 
  Circle,
  Plus,
  Check,
  AlertCircle,
  Square,
  Box,
  Layers,
  Trash2,
  ChevronDown,
  ChevronRight,
  Link2,
  Unlink2,
  AlertTriangle,
  Eye,
  EyeOff,
  CornerDownRight
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore, Part } from '../../store/documentStore'

// Selection mode for what can be filleted
type SelectionMode = 'edges' | 'faces' | 'features'

// Fillet type
type FilletType = 'constant' | 'variable' | 'chord'

// Edge info for selection
interface EdgeInfo {
  partId: string
  partName: string
  edgeId: string
  edgeLabel: string
  radius?: number  // For variable radius
}

// Face info for selection
interface FaceInfo {
  partId: string
  partName: string
  faceId: string
  faceLabel: string
  edgeCount: number
}

// Radius set for multiple different radii
interface RadiusSet {
  id: string
  radius: number
  edgeIds: string[]
}

export function FilletDialog() {
  const { closeDialog, dialogData, addNotification, selection, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Get available parts (bodies that can be filleted)
  const availableParts = useMemo(() => {
    if (!activePartStudio) return []
    return activePartStudio.parts || []
  }, [activePartStudio])
  
  // Mock edges for demonstration (in real CAD, these would come from geometry analysis)
  const availableEdges = useMemo(() => {
    const edges: EdgeInfo[] = []
    availableParts.forEach((part, partIndex) => {
      // Generate mock edges for each part (12 edges for a box-like shape)
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
          edgeCount: 4  // Each face has 4 edges for a box
        })
      })
    })
    return faces
  }, [availableParts])
  
  // State for fillet parameters
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('edges')
  const [filletType, setFilletType] = useState<FilletType>('constant')
  const [radius, setRadius] = useState(2)
  const [selectedEdges, setSelectedEdges] = useState<string[]>([])
  const [selectedFaces, setSelectedFaces] = useState<string[]>([])
  
  // Variable radius state
  const [variablePoints, setVariablePoints] = useState<{ position: number, radius: number }[]>([
    { position: 0, radius: 2 },
    { position: 100, radius: 2 }
  ])
  
  // Multiple radius sets
  const [radiusSets, setRadiusSets] = useState<RadiusSet[]>([])
  const [activeRadiusSetId, setActiveRadiusSetId] = useState<string | null>(null)
  
  // Options
  const [tangentPropagation, setTangentPropagation] = useState(true)
  const [fullRound, setFullRound] = useState(false)
  const [curvatureContinuous, setCurvatureContinuous] = useState(false)
  
  // Preview state
  const [showPreview, setShowPreview] = useState(true)
  const [previewValid, setPreviewValid] = useState(true)
  
  // Expanded sections
  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  const [radiusSetsExpanded, setRadiusSetsExpanded] = useState(false)
  
  // Toggle edge selection
  const toggleEdge = useCallback((edgeId: string) => {
    setSelectedEdges(prev => {
      if (prev.includes(edgeId)) {
        return prev.filter(id => id !== edgeId)
      }
      
      // If tangent propagation is on, simulate selecting related edges
      if (tangentPropagation) {
        // Find edges on the same part that might be tangent
        const edge = availableEdges.find(e => e.edgeId === edgeId)
        if (edge) {
          const partEdges = availableEdges.filter(e => e.partId === edge.partId)
          // Simulate tangent chain by selecting edges with similar labels
          const similar = partEdges
            .filter(e => {
              const edgeDir = edge.edgeLabel.split('-')[0]
              return e.edgeLabel.includes(edgeDir) && !prev.includes(e.edgeId)
            })
            .map(e => e.edgeId)
          return [...prev, edgeId, ...similar.slice(0, 3)]  // Limit for demo
        }
      }
      
      return [...prev, edgeId]
    })
  }, [tangentPropagation, availableEdges])
  
  // Toggle face selection (selects all edges of face)
  const toggleFace = useCallback((faceId: string) => {
    setSelectedFaces(prev => {
      if (prev.includes(faceId)) {
        return prev.filter(id => id !== faceId)
      }
      return [...prev, faceId]
    })
  }, [])
  
  // Add variable radius point
  const addVariablePoint = useCallback(() => {
    const maxPos = Math.max(...variablePoints.map(p => p.position))
    setVariablePoints(prev => [
      ...prev,
      { position: (maxPos + 100) / 2, radius: radius }
    ].sort((a, b) => a.position - b.position))
  }, [variablePoints, radius])
  
  // Remove variable radius point
  const removeVariablePoint = useCallback((index: number) => {
    if (variablePoints.length > 2) {
      setVariablePoints(prev => prev.filter((_, i) => i !== index))
    }
  }, [variablePoints])
  
  // Add new radius set
  const addRadiusSet = useCallback(() => {
    const newSet: RadiusSet = {
      id: `set-${Date.now()}`,
      radius: radius,
      edgeIds: []
    }
    setRadiusSets(prev => [...prev, newSet])
    setActiveRadiusSetId(newSet.id)
  }, [radius])
  
  // Remove radius set
  const removeRadiusSet = useCallback((setId: string) => {
    setRadiusSets(prev => prev.filter(s => s.id !== setId))
    if (activeRadiusSetId === setId) {
      setActiveRadiusSetId(null)
    }
  }, [activeRadiusSetId])
  
  // Validate radius
  const validateRadius = useCallback((r: number): boolean => {
    // Simple validation - in real CAD, this would check against geometry
    if (r <= 0) return false
    if (r > 100) return false  // Arbitrary max for demo
    return true
  }, [])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    const isValid = validateRadius(radius) && 
      (selectedEdges.length > 0 || selectedFaces.length > 0)
    setPreviewValid(isValid)
    
    setDialogData({
      type: 'fillet',
      selectionMode,
      filletType,
      radius,
      selectedEdges,
      selectedFaces,
      variablePoints: filletType === 'variable' ? variablePoints : null,
      radiusSets,
      tangentPropagation,
      fullRound,
      curvatureContinuous,
      showPreview,
      previewValid: isValid
    })
  }, [
    selectionMode, filletType, radius, selectedEdges, selectedFaces,
    variablePoints, radiusSets, tangentPropagation, fullRound,
    curvatureContinuous, showPreview, validateRadius, setDialogData
  ])
  
  // Handle create
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    if (selectedEdges.length === 0 && selectedFaces.length === 0) {
      addNotification('error', 'Please select edges or faces to fillet')
      return
    }
    
    if (!validateRadius(radius)) {
      addNotification('error', 'Invalid radius value')
      return
    }
    
    // Build fillet parameters
    const params: Record<string, any> = {
      selectionMode,
      filletType,
      radius,
      edges: selectedEdges,
      faces: selectedFaces,
      variablePoints: filletType === 'variable' ? variablePoints : null,
      radiusSets: radiusSets.length > 0 ? radiusSets : null,
      tangentPropagation,
      fullRound,
      curvatureContinuous
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'fillet').length + 1
    const name = `Fillet ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'fillet',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      addNotification('success', `Created ${name} with radius ${radius}mm`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create fillet feature')
    }
  }
  
  // Get total selected count
  const totalSelected = selectedEdges.length + selectedFaces.length * 4  // Each face has ~4 edges
  
  // Validation
  const isValid = (selectedEdges.length > 0 || selectedFaces.length > 0) && 
    validateRadius(radius)
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[460px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <Circle size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Fillet</h2>
          </div>
          <button
            onClick={closeDialog}
            className="p-1.5 hover:bg-cad-panel transition-colors"
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
            <div className="grid grid-cols-3 gap-1 bg-white p-1">
              {[
                { value: 'edges', label: 'Edges', icon: <CornerDownRight size={14} /> },
                { value: 'faces', label: 'Faces', icon: <Square size={14} /> },
                { value: 'features', label: 'Features', icon: <Layers size={14} /> },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setSelectionMode(mode.value as SelectionMode)}
                  className={`
                    flex flex-col items-center gap-1 p-2 transition-colors text-xs
                    ${selectionMode === mode.value 
                      ? 'bg-cad-accent text-white' 
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
              {selectionMode === 'edges' ? 'Select Edges' : selectionMode === 'faces' ? 'Select Faces' : 'Select Features'}
              <span className="ml-auto text-cad-accent text-[10px] normal-case">
                {totalSelected} selected
              </span>
            </label>
            
            {availableParts.length === 0 ? (
              <div className="p-4 bg-white border border-cad-border">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-cad-accent mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-cad-text font-medium">No parts found</p>
                    <p className="text-cad-accent/70 mt-1">
                      Create 3D geometry (extrude, revolve, etc.) first to add fillets.
                    </p>
                  </div>
                </div>
              </div>
            ) : selectionMode === 'edges' ? (
              <div className="space-y-2 max-h-40 overflow-y-auto bg-white border border-cad-border p-2">
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
                            flex items-center gap-2 p-1.5 cursor-pointer transition-colors text-xs
                            ${selectedEdges.includes(edge.edgeId)
                              ? 'bg-cad-accent/20 border border-cad-accent/50'
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
                            w-3 h-3 border flex items-center justify-center transition-colors
                            ${selectedEdges.includes(edge.edgeId)
                              ? 'bg-cad-accent border-cad-accent'
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
            ) : selectionMode === 'faces' ? (
              <div className="space-y-2 max-h-40 overflow-y-auto bg-white border border-cad-border p-2">
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
                            flex items-center gap-2 p-1.5 cursor-pointer transition-colors text-xs
                            ${selectedFaces.includes(face.faceId)
                              ? 'bg-cad-accent/20 border border-cad-accent/50'
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
                            w-3 h-3 border flex items-center justify-center transition-colors
                            ${selectedFaces.includes(face.faceId)
                              ? 'bg-cad-accent border-cad-accent'
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
            ) : (
              <div className="p-4 bg-white border border-cad-border">
                <p className="text-xs text-cad-text-dim">
                  Feature selection allows filleting all edges created by a specific feature. 
                  Select a feature from the Feature Tree to fillet its edges.
                </p>
              </div>
            )}
          </div>
          
          {/* Fillet Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Fillet Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white p-1">
              {[
                { value: 'constant', label: 'Constant' },
                { value: 'variable', label: 'Variable' },
                { value: 'chord', label: 'Chord Width' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilletType(type.value as FilletType)}
                  className={`
                    p-2 transition-colors text-xs
                    ${filletType === type.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Radius Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              {filletType === 'chord' ? 'Chord Width (mm)' : 'Radius (mm)'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value) || 0)}
                min={0.1}
                step={0.5}
                className={`
                  flex-1 px-3 py-2 bg-white border text-sm focus:border-cad-accent
                  ${validateRadius(radius) ? 'border-cad-border' : 'border-red-500'}
                `}
              />
              <button
                onClick={() => setRadius(prev => Math.max(0.1, prev - 0.5))}
                className="px-3 py-2 bg-white border border-cad-border hover:bg-cad-panel"
              >
                -
              </button>
              <button
                onClick={() => setRadius(prev => prev + 0.5)}
                className="px-3 py-2 bg-white border border-cad-border hover:bg-cad-panel"
              >
                +
              </button>
            </div>
            {!validateRadius(radius) && (
              <p className="text-xs text-cad-accent flex items-center gap-1">
                <AlertTriangle size={12} />
                Radius must be positive and not too large
              </p>
            )}
          </div>
          
          {/* Variable Radius Points */}
          {filletType === 'variable' && (
            <div className="space-y-2 p-3 bg-white/50 border border-cad-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                  Variable Radius Points
                </label>
                <button
                  onClick={addVariablePoint}
                  className="text-xs text-cad-accent hover:text-cad-accent flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add Point
                </button>
              </div>
              
              <div className="space-y-2">
                {variablePoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-cad-text-dim w-16">
                      {index === 0 ? 'Start' : index === variablePoints.length - 1 ? 'End' : `${point.position.toFixed(0)}%`}
                    </span>
                    <input
                      type="number"
                      value={point.radius}
                      onChange={(e) => {
                        const newPoints = [...variablePoints]
                        newPoints[index].radius = parseFloat(e.target.value) || 0
                        setVariablePoints(newPoints)
                      }}
                      min={0.1}
                      step={0.5}
                      className="flex-1 px-2 py-1 bg-white border border-cad-border text-xs"
                    />
                    <span className="text-xs text-cad-text-dim">mm</span>
                    {variablePoints.length > 2 && index > 0 && index < variablePoints.length - 1 && (
                      <button
                        onClick={() => removeVariablePoint(index)}
                        className="p-1 hover:bg-cad-accent/20 text-cad-accent"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tangent Propagation */}
          <div className="p-3 bg-white/50 border border-cad-border space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tangentPropagation}
                onChange={(e) => setTangentPropagation(e.target.checked)}
                className="w-4 h-4 border-cad-border bg-white"
              />
              <span className="text-sm text-cad-text flex items-center gap-2">
                {tangentPropagation ? <Link2 size={14} className="text-cad-accent" /> : <Unlink2 size={14} />}
                Tangent Propagation
              </span>
            </label>
            <p className="text-xs text-cad-text-dim pl-6">
              {tangentPropagation 
                ? 'Automatically selects tangent edges when one edge is picked'
                : 'Only the exact clicked edge is selected'}
            </p>
          </div>
          
          {/* Advanced Options (Collapsible) */}
          <div className="border border-cad-border overflow-hidden">
            <button
              onClick={() => setAdvancedExpanded(!advancedExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/50 hover:bg-cad-panel transition-colors"
            >
              <span className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                Advanced Options
              </span>
              {advancedExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {advancedExpanded && (
              <div className="p-3 space-y-3 border-t border-cad-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fullRound}
                    onChange={(e) => setFullRound(e.target.checked)}
                    className="w-4 h-4 border-cad-border bg-white"
                  />
                  <span className="text-sm text-cad-text">Full Round</span>
                </label>
                <p className="text-xs text-cad-text-dim pl-6 -mt-1">
                  Creates a fillet that completely rounds the edge between two faces
                </p>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={curvatureContinuous}
                    onChange={(e) => setCurvatureContinuous(e.target.checked)}
                    className="w-4 h-4 border-cad-border bg-white"
                  />
                  <span className="text-sm text-cad-text">Curvature Continuous (G2)</span>
                </label>
                <p className="text-xs text-cad-text-dim pl-6 -mt-1">
                  Creates a smoother blend instead of standard circular arc
                </p>
              </div>
            )}
          </div>
          
          {/* Multiple Radius Sets (Collapsible) */}
          <div className="border border-cad-border overflow-hidden">
            <button
              onClick={() => setRadiusSetsExpanded(!radiusSetsExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/50 hover:bg-cad-panel transition-colors"
            >
              <span className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                Multiple Radius Sets ({radiusSets.length})
              </span>
              {radiusSetsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {radiusSetsExpanded && (
              <div className="p-3 space-y-2 border-t border-cad-border">
                <p className="text-xs text-cad-text-dim">
                  Create multiple radius sets to apply different fillet sizes to different edges.
                </p>
                
                {radiusSets.map((set) => (
                  <div 
                    key={set.id}
                    className={`
                      flex items-center gap-2 p-2 border transition-colors
                      ${activeRadiusSetId === set.id 
                        ? 'bg-cad-accent/20 border-cad-accent/50' 
                        : 'bg-white border-cad-border'}
                    `}
                  >
                    <input
                      type="number"
                      value={set.radius}
                      onChange={(e) => {
                        setRadiusSets(prev => prev.map(s => 
                          s.id === set.id ? { ...s, radius: parseFloat(e.target.value) || 0 } : s
                        ))
                      }}
                      className="w-20 px-2 py-1 bg-white border border-cad-border text-xs"
                    />
                    <span className="text-xs text-cad-text-dim">mm</span>
                    <span className="text-xs text-cad-text flex-1">
                      {set.edgeIds.length} edges
                    </span>
                    <button
                      onClick={() => setActiveRadiusSetId(set.id)}
                      className={`text-xs px-2 py-1 ${
                        activeRadiusSetId === set.id ? 'bg-cad-accent text-white' : 'hover:bg-cad-panel'
                      }`}
                    >
                      Select
                    </button>
                    <button
                      onClick={() => removeRadiusSet(set.id)}
                      className="p-1 hover:bg-cad-accent/20 text-cad-accent"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={addRadiusSet}
                  className="w-full py-2 text-xs text-cad-accent hover:text-cad-accent border border-dashed border-cad-accent/30 hover:border-cad-accent/50 flex items-center justify-center gap-1"
                >
                  <Plus size={12} />
                  Add Radius Set
                </button>
              </div>
            )}
          </div>
          
          {/* Preview Toggle */}
          <div className="flex items-center justify-between p-2 bg-white/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
                className="w-4 h-4 border-cad-border bg-white"
              />
              <span className="text-sm text-cad-text flex items-center gap-2">
                {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
                Show Preview
              </span>
            </label>
            {showPreview && !previewValid && (
              <span className="text-xs text-cad-accent flex items-center gap-1">
                <AlertTriangle size={12} />
                Preview unavailable
              </span>
            )}
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-white border border-cad-border">
            <h4 className="text-xs font-medium text-cad-accent mb-2">Summary</h4>
            <ul className="text-xs text-cad-text space-y-1">
              <li>• Selection: {totalSelected} {selectionMode}</li>
              <li>• {filletType === 'chord' ? 'Chord Width' : 'Radius'}: {radius} mm</li>
              <li>• Type: {filletType.charAt(0).toUpperCase() + filletType.slice(1)}</li>
              {filletType === 'variable' && (
                <li>• Variable points: {variablePoints.length}</li>
              )}
              {tangentPropagation && <li>• Tangent propagation enabled</li>}
              {fullRound && <li>• Full round enabled</li>}
              {curvatureContinuous && <li>• G2 curvature continuous</li>}
              {radiusSets.length > 0 && <li>• {radiusSets.length} additional radius set(s)</li>}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-white/50">
          <div className="text-xs text-cad-text-dim">
            {!isValid && (
              <span className="text-cad-accent flex items-center gap-1">
                <AlertCircle size={12} />
                {selectedEdges.length === 0 && selectedFaces.length === 0 
                  ? 'Select edges or faces to fillet'
                  : 'Invalid radius'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeDialog}
              className="px-4 py-2 text-sm bg-cad-panel hover:bg-cad-border transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!isValid}
              className={`
                px-4 py-2 text-sm transition-colors flex items-center gap-2
                ${isValid 
                  ? 'bg-cad-accent hover:bg-cad-accent-hover text-white' 
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

