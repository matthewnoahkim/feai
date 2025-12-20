/**
 * LinearPatternDialog - Professional CAD-style linear pattern feature dialog
 * 
 * Provides comprehensive options for creating linear patterns:
 * - Pattern type: Part, Feature, or Face
 * - Direction selection (edges, axes)
 * - Spacing and instance count
 * - Second direction for grid patterns
 * - Centered/symmetric option
 * - Skip instances functionality
 * - Real-time preview
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  X, 
  Grid3X3,
  Plus,
  Minus,
  Check,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Box,
  Layers,
  Square,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowDown,
  RefreshCw,
  FlipHorizontal,
  XCircle
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

// Pattern type
type PatternType = 'part' | 'feature' | 'face'

// Operation type
type OperationType = 'new' | 'add' | 'remove' | 'intersect'

// Direction info
interface DirectionInfo {
  id: string
  name: string
  type: 'edge' | 'axis' | 'face-normal'
  vector?: [number, number, number]
}

// Entity info for patterning
interface EntityInfo {
  id: string
  type: 'part' | 'feature' | 'face'
  name: string
}

export function LinearPatternDialog() {
  const { closeDialog, addNotification, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Available directions (edges, axes)
  const availableDirections = useMemo((): DirectionInfo[] => {
    const directions: DirectionInfo[] = [
      { id: 'x-axis', name: 'X Axis', type: 'axis', vector: [1, 0, 0] },
      { id: 'y-axis', name: 'Y Axis', type: 'axis', vector: [0, 1, 0] },
      { id: 'z-axis', name: 'Z Axis', type: 'axis', vector: [0, 0, 1] },
    ]
    
    // Add edges from parts (mock)
    if (activePartStudio?.parts) {
      activePartStudio.parts.forEach((part) => {
        directions.push(
          { id: `${part.id}-edge-x`, name: `${part.name} - X Edge`, type: 'edge', vector: [1, 0, 0] },
          { id: `${part.id}-edge-y`, name: `${part.name} - Y Edge`, type: 'edge', vector: [0, 1, 0] },
          { id: `${part.id}-edge-z`, name: `${part.name} - Z Edge`, type: 'edge', vector: [0, 0, 1] }
        )
      })
    }
    
    return directions
  }, [activePartStudio])
  
  // Available parts
  const availableParts = useMemo((): EntityInfo[] => {
    if (!activePartStudio) return []
    return activePartStudio.parts?.map(part => ({
      id: part.id,
      type: 'part' as const,
      name: part.name
    })) || []
  }, [activePartStudio])
  
  // Available features
  const availableFeatures = useMemo((): EntityInfo[] => {
    if (!activePartStudio) return []
    return activePartStudio.features
      .filter(f => !f.suppressed && !f.type.includes('pattern'))
      .map(feature => ({
        id: feature.id,
        type: 'feature' as const,
        name: feature.name
      }))
  }, [activePartStudio])
  
  // Available faces
  const availableFaces = useMemo((): EntityInfo[] => {
    if (!activePartStudio) return []
    const faces: EntityInfo[] = []
    activePartStudio.parts?.forEach((part) => {
      const faceLabels = ['Top', 'Bottom', 'Front', 'Back', 'Left', 'Right']
      faceLabels.forEach((label, index) => {
        faces.push({
          id: `${part.id}-face-${index}`,
          type: 'face',
          name: `${part.name} - ${label}`
        })
      })
    })
    return faces
  }, [activePartStudio])
  
  // State for pattern parameters
  const [patternType, setPatternType] = useState<PatternType>('part')
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  
  // Direction 1
  const [direction1, setDirection1] = useState<string | null>('x-axis')
  const [spacing1, setSpacing1] = useState(20)
  const [count1, setCount1] = useState(3)
  const [flip1, setFlip1] = useState(false)
  
  // Direction 2 (for grid)
  const [useDirection2, setUseDirection2] = useState(false)
  const [direction2, setDirection2] = useState<string | null>('y-axis')
  const [spacing2, setSpacing2] = useState(20)
  const [count2, setCount2] = useState(3)
  const [flip2, setFlip2] = useState(false)
  
  // Options
  const [centered, setCentered] = useState(false)
  const [operation, setOperation] = useState<OperationType>('add')
  const [reapplyFeatures, setReapplyFeatures] = useState(false)
  
  // Skip instances
  const [skippedInstances, setSkippedInstances] = useState<number[]>([])
  
  // Preview state
  const [showPreview, setShowPreview] = useState(true)
  
  // Advanced options expanded
  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  
  // Get entities list based on pattern type
  const entitiesList = useMemo(() => {
    switch (patternType) {
      case 'part': return availableParts
      case 'feature': return availableFeatures
      case 'face': return availableFaces
      default: return []
    }
  }, [patternType, availableParts, availableFeatures, availableFaces])
  
  // Clear entity selection when pattern type changes
  useEffect(() => {
    setSelectedEntities([])
  }, [patternType])
  
  // Toggle entity selection
  const toggleEntity = useCallback((entityId: string) => {
    setSelectedEntities(prev => {
      if (prev.includes(entityId)) {
        return prev.filter(id => id !== entityId)
      }
      return [...prev, entityId]
    })
  }, [])
  
  // Toggle skip instance
  const toggleSkipInstance = useCallback((index: number) => {
    if (index === 0 && !centered) return // Can't skip seed instance
    setSkippedInstances(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      }
      return [...prev, index]
    })
  }, [centered])
  
  // Calculate total instances
  const totalInstances = useMemo(() => {
    const dir1Count = count1
    const dir2Count = useDirection2 ? count2 : 1
    return dir1Count * dir2Count
  }, [count1, count2, useDirection2])
  
  // Validate selections
  const checkValidity = useCallback((): { valid: boolean, message: string } => {
    if (selectedEntities.length === 0) {
      return { valid: false, message: `Select ${patternType}(s) to pattern` }
    }
    
    if (!direction1) {
      return { valid: false, message: 'Select a direction' }
    }
    
    if (count1 < 2) {
      return { valid: false, message: 'Instance count must be at least 2' }
    }
    
    if (spacing1 <= 0) {
      return { valid: false, message: 'Spacing must be positive' }
    }
    
    if (useDirection2) {
      if (!direction2) {
        return { valid: false, message: 'Select second direction' }
      }
      if (count2 < 2) {
        return { valid: false, message: 'Second direction count must be at least 2' }
      }
      if (spacing2 <= 0) {
        return { valid: false, message: 'Second spacing must be positive' }
      }
    }
    
    return { valid: true, message: '' }
  }, [selectedEntities, patternType, direction1, count1, spacing1, useDirection2, direction2, count2, spacing2])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    const validity = checkValidity()
    
    setDialogData({
      type: 'linear-pattern',
      patternType,
      entities: selectedEntities,
      direction1,
      spacing1,
      count1,
      flip1,
      useDirection2,
      direction2,
      spacing2,
      count2,
      flip2,
      centered,
      skippedInstances,
      operation,
      showPreview,
      previewValid: validity.valid
    })
  }, [
    patternType, selectedEntities, direction1, spacing1, count1, flip1,
    useDirection2, direction2, spacing2, count2, flip2,
    centered, skippedInstances, operation, showPreview,
    checkValidity, setDialogData
  ])
  
  // Handle create
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    const validity = checkValidity()
    if (!validity.valid) {
      addNotification('error', validity.message)
      return
    }
    
    const params: Record<string, any> = {
      patternType,
      entities: selectedEntities,
      direction1,
      spacing1,
      count1,
      flip1,
      useDirection2,
      direction2: useDirection2 ? direction2 : null,
      spacing2: useDirection2 ? spacing2 : 0,
      count2: useDirection2 ? count2 : 1,
      flip2,
      centered,
      skippedInstances,
      operation,
      reapplyFeatures: patternType === 'feature' ? reapplyFeatures : false
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'linear-pattern').length + 1
    const name = `Linear Pattern ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'linear-pattern',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      const actualCount = totalInstances - skippedInstances.length
      addNotification('success', `Created ${name} with ${actualCount} instances`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create linear pattern')
    }
  }
  
  // Get entity icon
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'part': return <Box size={14} />
      case 'feature': return <Layers size={14} />
      case 'face': return <Square size={14} />
      default: return <Box size={14} />
    }
  }
  
  // Validation
  const validity = checkValidity()
  const isValid = validity.valid
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[520px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <Grid3X3 size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Linear Pattern</h2>
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
          
          {/* Pattern Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Pattern Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white p-1">
              {[
                { value: 'part', label: 'Part', icon: <Box size={14} /> },
                { value: 'feature', label: 'Feature', icon: <Layers size={14} /> },
                { value: 'face', label: 'Face', icon: <Square size={14} /> },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPatternType(type.value as PatternType)}
                  className={`
                    flex flex-col items-center gap-1 p-2 transition-colors text-xs
                    ${patternType === type.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Entities to Pattern */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              {getEntityIcon(patternType)}
              {patternType === 'part' ? 'Parts' : patternType === 'feature' ? 'Features' : 'Faces'} to Pattern
              <span className="ml-auto text-cad-accent text-[10px] normal-case">
                {selectedEntities.length} selected
              </span>
            </label>
            
            {entitiesList.length === 0 ? (
              <div className="p-3 bg-white border border-cad-border">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-cad-accent mt-0.5" />
                  <p className="text-sm text-cad-text">
                    No {patternType}s available to pattern
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 max-h-28 overflow-y-auto bg-white border border-cad-border p-2">
                {entitiesList.map((entity) => (
                  <label
                    key={entity.id}
                    className={`
                      flex items-center gap-2 p-1.5 cursor-pointer transition-colors text-xs
                      ${selectedEntities.includes(entity.id)
                        ? 'bg-cad-accent/20 border border-cad-accent/50'
                        : 'hover:bg-cad-panel border border-transparent'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEntities.includes(entity.id)}
                      onChange={() => toggleEntity(entity.id)}
                      className="sr-only"
                    />
                    <div className={`
                      w-3.5 h-3.5 border flex items-center justify-center transition-colors
                      ${selectedEntities.includes(entity.id)
                        ? 'bg-cad-accent border-cad-accent'
                        : 'border-cad-border'}
                    `}>
                      {selectedEntities.includes(entity.id) && <Check size={8} className="text-white" />}
                    </div>
                    {getEntityIcon(entity.type)}
                    <span className="text-cad-text">{entity.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Direction 1 */}
          <div className="p-3 bg-white/50 border border-cad-border space-y-3">
            <div className="flex items-center gap-2">
              <ArrowRight size={14} className="text-cad-accent" />
              <span className="text-sm font-medium text-cad-text">Direction 1</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Direction Selection */}
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Direction</label>
                <select
                  value={direction1 || ''}
                  onChange={(e) => setDirection1(e.target.value || null)}
                  className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm"
                >
                  <option value="">Select direction...</option>
                  <optgroup label="Reference Axes">
                    {availableDirections.filter(d => d.type === 'axis').map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </optgroup>
                  {availableDirections.filter(d => d.type === 'edge').length > 0 && (
                    <optgroup label="Part Edges">
                      {availableDirections.filter(d => d.type === 'edge').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              
              {/* Flip Direction */}
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Flip</label>
                <button
                  onClick={() => setFlip1(!flip1)}
                  className={`
                    w-full px-2 py-1.5 border text-sm flex items-center justify-center gap-2
                    ${flip1 
                      ? 'bg-cad-accent/20 border-cad-accent/50 text-cad-accent' 
                      : 'bg-white border-cad-border text-cad-text-dim hover:bg-cad-panel'}
                  `}
                >
                  <FlipHorizontal size={14} />
                  {flip1 ? 'Flipped' : 'Normal'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Spacing */}
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Spacing (mm)</label>
                <input
                  type="number"
                  value={spacing1}
                  onChange={(e) => setSpacing1(parseFloat(e.target.value) || 0)}
                  min={0.1}
                  step={5}
                  className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm"
                />
              </div>
              
              {/* Instance Count */}
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Count (incl. seed)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={count1}
                    onChange={(e) => setCount1(parseInt(e.target.value) || 2)}
                    min={2}
                    max={100}
                    className="flex-1 px-2 py-1.5 bg-white border border-cad-border text-sm"
                  />
                  <button
                    onClick={() => setCount1(Math.max(2, count1 - 1))}
                    className="px-2 bg-white border border-cad-border hover:bg-cad-panel"
                  >
                    <Minus size={12} />
                  </button>
                  <button
                    onClick={() => setCount1(Math.min(100, count1 + 1))}
                    className="px-2 bg-white border border-cad-border hover:bg-cad-panel"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Direction 2 (Grid) */}
          <div className="border border-cad-border overflow-hidden">
            <button
              onClick={() => setUseDirection2(!useDirection2)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/50 hover:bg-cad-panel transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useDirection2}
                  onChange={(e) => setUseDirection2(e.target.checked)}
                  className="w-4 h-4 border-cad-border bg-white"
                  onClick={(e) => e.stopPropagation()}
                />
                <ArrowDown size={14} className="text-cad-accent" />
                <span className="text-sm font-medium text-cad-text">Direction 2 (Grid Pattern)</span>
              </div>
              {useDirection2 ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {useDirection2 && (
              <div className="p-3 space-y-3 border-t border-cad-border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cad-text-dim">Direction</label>
                    <select
                      value={direction2 || ''}
                      onChange={(e) => setDirection2(e.target.value || null)}
                      className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm"
                    >
                      <option value="">Select direction...</option>
                      {availableDirections.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-cad-text-dim">Flip</label>
                    <button
                      onClick={() => setFlip2(!flip2)}
                      className={`
                        w-full px-2 py-1.5 border text-sm flex items-center justify-center gap-2
                        ${flip2 
                          ? 'bg-cad-accent/20 border-cad-accent/50 text-cad-accent' 
                          : 'bg-white border-cad-border text-cad-text-dim hover:bg-cad-panel'}
                      `}
                    >
                      <FlipHorizontal size={14} />
                      {flip2 ? 'Flipped' : 'Normal'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-cad-text-dim">Spacing (mm)</label>
                    <input
                      type="number"
                      value={spacing2}
                      onChange={(e) => setSpacing2(parseFloat(e.target.value) || 0)}
                      min={0.1}
                      step={5}
                      className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-cad-text-dim">Count</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={count2}
                        onChange={(e) => setCount2(parseInt(e.target.value) || 2)}
                        min={2}
                        max={100}
                        className="flex-1 px-2 py-1.5 bg-white border border-cad-border text-sm"
                      />
                      <button
                        onClick={() => setCount2(Math.max(2, count2 - 1))}
                        className="px-2 bg-white border border-cad-border hover:bg-cad-panel"
                      >
                        <Minus size={12} />
                      </button>
                      <button
                        onClick={() => setCount2(Math.min(100, count2 + 1))}
                        className="px-2 bg-white border border-cad-border hover:bg-cad-panel"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Centered Option */}
          <div className="flex items-center gap-3 p-2 bg-white/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={centered}
                onChange={(e) => setCentered(e.target.checked)}
                className="w-4 h-4 border-cad-border bg-white"
              />
              <span className="text-sm text-cad-text">Centered Pattern</span>
            </label>
            <span className="text-xs text-cad-text-dim">
              (Instances distributed symmetrically around seed)
            </span>
          </div>
          
          {/* Skip Instances */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <XCircle size={12} />
              Skip Instances
              <span className="ml-auto text-cad-accent text-[10px] normal-case">
                {skippedInstances.length} skipped
              </span>
            </label>
            
            <div className="p-2 bg-white border border-cad-border">
              <p className="text-xs text-cad-text-dim mb-2">
                Click instance numbers to skip them:
              </p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: totalInstances }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSkipInstance(i)}
                    disabled={i === 0 && !centered}
                    className={`
                      w-8 h-8 text-xs font-medium transition-colors
                      ${i === 0 && !centered
                        ? 'bg-cad-accent/30 text-cad-accent cursor-not-allowed'
                        : skippedInstances.includes(i)
                          ? 'bg-cad-border text-cad-text-dim border border-cad-border line-through'
                          : 'bg-cad-panel hover:bg-cad-border text-cad-text'}
                    `}
                    title={i === 0 && !centered ? 'Seed instance (cannot skip)' : `Instance ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {skippedInstances.length > 0 && (
                <button
                  onClick={() => setSkippedInstances([])}
                  className="mt-2 text-xs text-cad-accent hover:text-cad-text"
                >
                  Clear all skipped
                </button>
              )}
            </div>
          </div>
          
          {/* Operation Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Operation
            </label>
            <div className="grid grid-cols-4 gap-1 bg-white p-1">
              {[
                { value: 'new', label: 'New' },
                { value: 'add', label: 'Add' },
                { value: 'remove', label: 'Remove' },
                { value: 'intersect', label: 'Intersect' },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setOperation(op.value as OperationType)}
                  className={`
                    p-2 transition-colors text-xs
                    ${operation === op.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Advanced Options */}
          {patternType === 'feature' && (
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
                <div className="p-3 border-t border-cad-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reapplyFeatures}
                      onChange={(e) => setReapplyFeatures(e.target.checked)}
                      className="w-4 h-4 border-cad-border bg-white"
                    />
                    <span className="text-sm text-cad-text flex items-center gap-2">
                      <RefreshCw size={14} />
                      Reapply Feature End Conditions
                    </span>
                  </label>
                  <p className="text-xs text-cad-text-dim pl-6 mt-1">
                    Re-evaluate each instance's end conditions individually
                  </p>
                </div>
              )}
            </div>
          )}
          
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
          </div>
          
          {/* Visual Representation */}
          <div className="p-3 bg-white border border-cad-border">
            <div className="flex items-center justify-center">
              <svg width="200" height="100" viewBox="0 0 200 100">
                {/* Direction 1 arrow */}
                <line x1="20" y1="50" x2="180" y2="50" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4,2" />
                <polygon points="180,50 170,45 170,55" fill="#22d3ee" />
                <text x="190" y="54" fill="#22d3ee" fontSize="8">Dir 1</text>
                
                {/* Direction 2 arrow (if enabled) */}
                {useDirection2 && (
                  <>
                    <line x1="20" y1="90" x2="20" y2="10" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4,2" />
                    <polygon points="20,10 15,20 25,20" fill="#22d3ee" />
                    <text x="5" y="8" fill="#22d3ee" fontSize="8">Dir 2</text>
                  </>
                )}
                
                {/* Pattern instances */}
                {Array.from({ length: Math.min(count1, 5) }, (_, i) => {
                  const x = 30 + i * 35
                  const rows = useDirection2 ? Math.min(count2, 3) : 1
                  
                  return Array.from({ length: rows }, (_, j) => {
                    const y = useDirection2 ? 30 + j * 25 : 50
                    const instanceIndex = i + j * count1
                    const isSkipped = skippedInstances.includes(instanceIndex)
                    const isSeed = i === 0 && j === 0
                    
                    return (
                      <g key={`${i}-${j}`}>
                        <rect 
                          x={x - 10} y={y - 10} width={20} height={20}
                          fill={isSeed ? '#22d3ee' : isSkipped ? '#ef4444' : '#22d3ee'}
                          fillOpacity={isSeed ? 0.5 : isSkipped ? 0.2 : 0.3}
                          stroke={isSeed ? '#22d3ee' : isSkipped ? '#ef4444' : '#22d3ee'}
                          strokeWidth={isSeed ? 2 : 1}
                          strokeDasharray={isSkipped ? '3,2' : 'none'}
                        />
                        {isSkipped && (
                          <line x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} stroke="#ef4444" strokeWidth="2" />
                        )}
                      </g>
                    )
                  })
                })}
                
                {/* Spacing label */}
                <text x="50" y="70" fill="#94a3b8" fontSize="8">
                  Spacing: {spacing1}mm
                </text>
              </svg>
            </div>
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-white border border-cad-border">
            <h4 className="text-xs font-medium text-cad-accent mb-2">Summary</h4>
            <ul className="text-xs text-cad-text space-y-1">
              <li>• Pattern: {patternType.charAt(0).toUpperCase() + patternType.slice(1)}</li>
              <li>• Direction 1: {count1} × {spacing1}mm</li>
              {useDirection2 && <li>• Direction 2: {count2} × {spacing2}mm</li>}
              <li>• Total: {totalInstances - skippedInstances.length} instances ({skippedInstances.length} skipped)</li>
              {centered && <li>• Centered around seed</li>}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-white/50">
          <div className="text-xs text-cad-text-dim">
            {!isValid && (
              <span className="text-cad-accent flex items-center gap-1">
                <AlertCircle size={12} />
                {validity.message}
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

