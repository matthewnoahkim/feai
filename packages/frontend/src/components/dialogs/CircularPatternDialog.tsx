/**
 * CircularPatternDialog - Professional CAD-style circular pattern feature dialog
 * 
 * Provides comprehensive options for creating circular patterns:
 * - Pattern type: Part, Feature, or Face
 * - Axis selection for rotation
 * - Angle and instance count
 * - Full circle or partial arc
 * - Skip instances functionality
 * - Real-time preview
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  X, 
  Circle,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Box,
  Layers,
  Square,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  XCircle,
  RotateCw
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

// Pattern type
type PatternType = 'part' | 'feature' | 'face'

// Operation type
type OperationType = 'new' | 'add' | 'remove' | 'intersect'

// Axis info
interface AxisInfo {
  id: string
  name: string
  type: 'axis' | 'edge' | 'face-center'
}

// Entity info for patterning
interface EntityInfo {
  id: string
  type: 'part' | 'feature' | 'face'
  name: string
}

export function CircularPatternDialog() {
  const { closeDialog, addNotification, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Available axes
  const availableAxes = useMemo((): AxisInfo[] => {
    const axes: AxisInfo[] = [
      { id: 'x-axis', name: 'X Axis', type: 'axis' },
      { id: 'y-axis', name: 'Y Axis', type: 'axis' },
      { id: 'z-axis', name: 'Z Axis', type: 'axis' },
    ]
    
    // Add cylindrical edges from parts (mock)
    if (activePartStudio?.parts) {
      activePartStudio.parts.forEach((part) => {
        axes.push(
          { id: `${part.id}-center-axis`, name: `${part.name} - Center Axis`, type: 'edge' }
        )
      })
    }
    
    return axes
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
  
  // Axis and rotation
  const [selectedAxis, setSelectedAxis] = useState<string | null>('z-axis')
  const [fullCircle, setFullCircle] = useState(true)
  const [totalAngle, setTotalAngle] = useState(360)
  const [instanceCount, setInstanceCount] = useState(6)
  const [startAngle, setStartAngle] = useState(0)
  
  // Options
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
  
  // Update angle when full circle toggled
  useEffect(() => {
    if (fullCircle) {
      setTotalAngle(360)
    }
  }, [fullCircle])
  
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
    if (index === 0) return // Can't skip seed instance
    setSkippedInstances(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      }
      return [...prev, index]
    })
  }, [])
  
  // Calculate angular spacing
  const angularSpacing = useMemo(() => {
    if (instanceCount <= 1) return 0
    return totalAngle / instanceCount
  }, [totalAngle, instanceCount])
  
  // Validate selections
  const checkValidity = useCallback((): { valid: boolean, message: string } => {
    if (selectedEntities.length === 0) {
      return { valid: false, message: `Select ${patternType}(s) to pattern` }
    }
    
    if (!selectedAxis) {
      return { valid: false, message: 'Select a rotation axis' }
    }
    
    if (instanceCount < 2) {
      return { valid: false, message: 'Instance count must be at least 2' }
    }
    
    if (!fullCircle && totalAngle <= 0) {
      return { valid: false, message: 'Angle must be positive' }
    }
    
    return { valid: true, message: '' }
  }, [selectedEntities, patternType, selectedAxis, instanceCount, fullCircle, totalAngle])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    const validity = checkValidity()
    
    setDialogData({
      type: 'circular-pattern',
      patternType,
      entities: selectedEntities,
      axis: selectedAxis,
      fullCircle,
      totalAngle,
      instanceCount,
      startAngle,
      angularSpacing,
      skippedInstances,
      operation,
      showPreview,
      previewValid: validity.valid
    })
  }, [
    patternType, selectedEntities, selectedAxis, fullCircle, totalAngle,
    instanceCount, startAngle, angularSpacing, skippedInstances, operation, showPreview,
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
      axis: selectedAxis,
      fullCircle,
      totalAngle,
      instanceCount,
      startAngle,
      skippedInstances,
      operation,
      reapplyFeatures: patternType === 'feature' ? reapplyFeatures : false
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'circular-pattern').length + 1
    const name = `Circular Pattern ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'circular-pattern',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      const actualCount = instanceCount - skippedInstances.length
      addNotification('success', `Created ${name} with ${actualCount} instances`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create circular pattern')
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
      <div className="bg-cad-dark border border-cad-border rounded-lg shadow-2xl w-[500px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-gradient-to-r from-violet-900/30 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-500/20 rounded flex items-center justify-center">
              <RotateCw size={14} className="text-violet-400" />
            </div>
            <h2 className="font-semibold text-cad-text">Circular Pattern</h2>
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
          
          {/* Pattern Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Pattern Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-cad-darker p-1 rounded-lg">
              {[
                { value: 'part', label: 'Part', icon: <Box size={14} /> },
                { value: 'feature', label: 'Feature', icon: <Layers size={14} /> },
                { value: 'face', label: 'Face', icon: <Square size={14} /> },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPatternType(type.value as PatternType)}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded transition-colors text-xs
                    ${patternType === type.value 
                      ? 'bg-violet-500 text-white' 
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
              <span className="ml-auto text-violet-400 text-[10px] normal-case">
                {selectedEntities.length} selected
              </span>
            </label>
            
            {entitiesList.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-400 mt-0.5" />
                  <p className="text-sm text-amber-300">
                    No {patternType}s available to pattern
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 max-h-28 overflow-y-auto bg-cad-darker rounded-lg border border-cad-border p-2">
                {entitiesList.map((entity) => (
                  <label
                    key={entity.id}
                    className={`
                      flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs
                      ${selectedEntities.includes(entity.id)
                        ? 'bg-violet-500/20 border border-violet-500/50'
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
                      w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors
                      ${selectedEntities.includes(entity.id)
                        ? 'bg-violet-500 border-violet-500'
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
          
          {/* Pattern Axis */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Circle size={12} />
              Pattern Axis
            </label>
            <select
              value={selectedAxis || ''}
              onChange={(e) => setSelectedAxis(e.target.value || null)}
              className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm"
            >
              <option value="">Select axis...</option>
              <optgroup label="Reference Axes">
                {availableAxes.filter(a => a.type === 'axis').map(axis => (
                  <option key={axis.id} value={axis.id}>{axis.name}</option>
                ))}
              </optgroup>
              {availableAxes.filter(a => a.type !== 'axis').length > 0 && (
                <optgroup label="Part Axes">
                  {availableAxes.filter(a => a.type !== 'axis').map(axis => (
                    <option key={axis.id} value={axis.id}>{axis.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          
          {/* Angle Settings */}
          <div className="p-3 bg-cad-darker/50 rounded-lg border border-cad-border space-y-3">
            <div className="flex items-center gap-2">
              <RotateCw size={14} className="text-violet-400" />
              <span className="text-sm font-medium text-cad-text">Rotation Settings</span>
            </div>
            
            {/* Full Circle Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fullCircle}
                onChange={(e) => setFullCircle(e.target.checked)}
                className="w-4 h-4 rounded border-cad-border bg-cad-darker"
              />
              <span className="text-sm text-cad-text">Full Circle (360°)</span>
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Total Angle */}
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">
                  {fullCircle ? 'Total Angle' : 'Arc Angle'} (°)
                </label>
                <input
                  type="number"
                  value={totalAngle}
                  onChange={(e) => setTotalAngle(parseFloat(e.target.value) || 0)}
                  disabled={fullCircle}
                  min={1}
                  max={360}
                  step={15}
                  className={`
                    w-full px-2 py-1.5 bg-cad-darker border border-cad-border rounded text-sm
                    ${fullCircle ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
              </div>
              
              {/* Instance Count */}
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Count (incl. seed)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={instanceCount}
                    onChange={(e) => setInstanceCount(parseInt(e.target.value) || 2)}
                    min={2}
                    max={100}
                    className="flex-1 px-2 py-1.5 bg-cad-darker border border-cad-border rounded text-sm"
                  />
                  <button
                    onClick={() => setInstanceCount(Math.max(2, instanceCount - 1))}
                    className="px-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
                  >
                    <Minus size={12} />
                  </button>
                  <button
                    onClick={() => setInstanceCount(Math.min(100, instanceCount + 1))}
                    className="px-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Start Angle */}
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Start Angle (°)</label>
                <input
                  type="number"
                  value={startAngle}
                  onChange={(e) => setStartAngle(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={360}
                  step={15}
                  className="w-full px-2 py-1.5 bg-cad-darker border border-cad-border rounded text-sm"
                />
              </div>
              
              {/* Angular Spacing (calculated) */}
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Angular Spacing</label>
                <div className="px-2 py-1.5 bg-cad-darker/50 border border-cad-border rounded text-sm text-violet-300">
                  {angularSpacing.toFixed(1)}° per instance
                </div>
              </div>
            </div>
          </div>
          
          {/* Skip Instances */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <XCircle size={12} />
              Skip Instances
              <span className="ml-auto text-amber-400 text-[10px] normal-case">
                {skippedInstances.length} skipped
              </span>
            </label>
            
            <div className="p-2 bg-cad-darker rounded-lg border border-cad-border">
              <p className="text-xs text-cad-text-dim mb-2">
                Click positions to skip (shown around circle):
              </p>
              
              {/* Circular layout for skip buttons */}
              <div className="relative w-40 h-40 mx-auto">
                {/* Center circle */}
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-violet-500/30" />
                
                {Array.from({ length: instanceCount }, (_, i) => {
                  const angle = ((startAngle + (totalAngle / instanceCount) * i) * Math.PI) / 180 - Math.PI / 2
                  const radius = 60
                  const x = 80 + Math.cos(angle) * radius
                  const y = 80 + Math.sin(angle) * radius
                  const isSkipped = skippedInstances.includes(i)
                  const isSeed = i === 0
                  
                  return (
                    <button
                      key={i}
                      onClick={() => toggleSkipInstance(i)}
                      disabled={isSeed}
                      style={{
                        left: `${x - 12}px`,
                        top: `${y - 12}px`,
                      }}
                      className={`
                        absolute w-6 h-6 rounded-full text-xs font-medium transition-all
                        ${isSeed
                          ? 'bg-violet-500 text-white cursor-not-allowed'
                          : isSkipped
                            ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                            : 'bg-cad-panel hover:bg-violet-500/30 text-cad-text border border-cad-border'}
                      `}
                      title={isSeed ? 'Seed instance' : `Instance ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
                
                {/* Axis indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-violet-500 rounded-full" />
              </div>
              
              {skippedInstances.length > 0 && (
                <button
                  onClick={() => setSkippedInstances([])}
                  className="mt-2 text-xs text-amber-400 hover:text-amber-300 w-full text-center"
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
            <div className="grid grid-cols-4 gap-1 bg-cad-darker p-1 rounded-lg">
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
                    p-2 rounded transition-colors text-xs
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
            <div className="border border-cad-border rounded-lg overflow-hidden">
              <button
                onClick={() => setAdvancedExpanded(!advancedExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 bg-cad-darker/50 hover:bg-cad-panel transition-colors"
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
                      className="w-4 h-4 rounded border-cad-border bg-cad-darker"
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
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-violet-500/10 rounded-lg border border-violet-500/30">
            <h4 className="text-xs font-medium text-violet-300 mb-2">Summary</h4>
            <ul className="text-xs text-violet-200/70 space-y-1">
              <li>• Pattern: {patternType.charAt(0).toUpperCase() + patternType.slice(1)}</li>
              <li>• Axis: {availableAxes.find(a => a.id === selectedAxis)?.name || 'None'}</li>
              <li>• Angle: {totalAngle}° ({fullCircle ? 'full circle' : 'partial arc'})</li>
              <li>• Spacing: {angularSpacing.toFixed(1)}° between instances</li>
              <li>• Total: {instanceCount - skippedInstances.length} instances ({skippedInstances.length} skipped)</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-cad-darker/50">
          <div className="text-xs text-cad-text-dim">
            {!isValid && (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle size={12} />
                {validity.message}
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
                  ? 'bg-violet-500 hover:bg-violet-600 text-white' 
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

