/**
 * LoftDialog - Professional CAD-style loft feature dialog
 * 
 * Provides comprehensive options for lofting between multiple profiles:
 * - Multi-profile selection with ordering
 * - Optional guide curves
 * - Start/End tangency conditions
 * - Connection point management
 * - Operation type (New, Add, Remove, Intersect)
 * - Solid/Surface output
 * - Real-time preview
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  X, 
  Layers,
  Plus,
  Minus,
  Maximize2,
  Target,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Square,
  Circle,
  Hexagon,
  Spline,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Link,
  Unlink
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore, Sketch, SketchEntity } from '../../store/documentStore'

// Loft operation types
type OperationType = 'new' | 'add' | 'remove' | 'intersect'

// Loft type
type LoftType = 'solid' | 'surface'

// Tangency condition types
type TangencyCondition = 'free' | 'normal' | 'tangent' | 'curvature'

interface ProfileInfo {
  sketchId: string
  sketchName: string
  entityId: string
  entityType: string
  displayName: string
  order: number
}

interface GuideInfo {
  sketchId: string
  sketchName: string
  entityId: string
  entityType: string
  displayName: string
}

export function LoftDialog() {
  const { closeDialog, dialogData, addNotification, selection, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Get available profiles (closed shapes that can be lofted)
  const availableProfiles = useMemo(() => {
    if (!activePartStudio) return []
    
    const profiles: Omit<ProfileInfo, 'order'>[] = []
    activePartStudio.sketches.forEach((sketch, sketchId) => {
      sketch.entities.forEach((entity, index) => {
        // Closed profiles can be lofted as solids
        if (entity.type === 'rectangle' || entity.type === 'circle' || entity.type === 'polygon') {
          profiles.push({
            sketchId,
            sketchName: sketch.name,
            entityId: entity.id,
            entityType: entity.type,
            displayName: `${sketch.name} - ${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} ${index + 1}`
          })
        }
      })
    })
    
    return profiles
  }, [activePartStudio])
  
  // Get available guide curves
  const availableGuides = useMemo(() => {
    if (!activePartStudio) return []
    
    const guides: GuideInfo[] = []
    activePartStudio.sketches.forEach((sketch, sketchId) => {
      sketch.entities.forEach((entity, index) => {
        // Lines, arcs, and splines can be guides
        if (entity.type === 'line' || entity.type === 'arc' || entity.type === 'spline') {
          guides.push({
            sketchId,
            sketchName: sketch.name,
            entityId: entity.id,
            entityType: entity.type,
            displayName: `${sketch.name} - ${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} ${index + 1}`
          })
        }
      })
    })
    
    return guides
  }, [activePartStudio])
  
  // State for loft parameters
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileInfo[]>([])
  const [selectedGuides, setSelectedGuides] = useState<string[]>([])
  const [operation, setOperation] = useState<OperationType>('new')
  const [loftType, setLoftType] = useState<LoftType>('solid')
  
  // Tangency conditions
  const [startCondition, setStartCondition] = useState<TangencyCondition>('free')
  const [endCondition, setEndCondition] = useState<TangencyCondition>('free')
  const [startMagnitude, setStartMagnitude] = useState(1.0)
  const [endMagnitude, setEndMagnitude] = useState(1.0)
  
  // Closed loft option
  const [closedLoft, setClosedLoft] = useState(false)
  
  // Preview
  const [showPreview, setShowPreview] = useState(true)
  const [showConnectors, setShowConnectors] = useState(true)
  
  // Merge scope for add/remove operations
  const [mergeWithAll, setMergeWithAll] = useState(true)
  const [selectedBodies, setSelectedBodies] = useState<string[]>([])
  
  // Selection mode
  const [selectionMode, setSelectionMode] = useState<'profiles' | 'guides'>('profiles')
  
  // Get available bodies for merge scope
  const availableBodies = useMemo(() => 
    activePartStudio?.parts || [],
    [activePartStudio]
  )
  
  // Add profile to selection
  const addProfile = useCallback((entityId: string) => {
    const profile = availableProfiles.find(p => p.entityId === entityId)
    if (profile && !selectedProfiles.find(p => p.entityId === entityId)) {
      setSelectedProfiles(prev => [
        ...prev,
        { ...profile, order: prev.length }
      ])
    }
  }, [availableProfiles, selectedProfiles])
  
  // Remove profile from selection
  const removeProfile = useCallback((entityId: string) => {
    setSelectedProfiles(prev => {
      const filtered = prev.filter(p => p.entityId !== entityId)
      // Reorder remaining profiles
      return filtered.map((p, i) => ({ ...p, order: i }))
    })
  }, [])
  
  // Move profile up in order
  const moveProfileUp = useCallback((index: number) => {
    if (index <= 0) return
    setSelectedProfiles(prev => {
      const newProfiles = [...prev]
      const temp = newProfiles[index]
      newProfiles[index] = { ...newProfiles[index - 1], order: index }
      newProfiles[index - 1] = { ...temp, order: index - 1 }
      return newProfiles
    })
  }, [])
  
  // Move profile down in order
  const moveProfileDown = useCallback((index: number) => {
    setSelectedProfiles(prev => {
      if (index >= prev.length - 1) return prev
      const newProfiles = [...prev]
      const temp = newProfiles[index]
      newProfiles[index] = { ...newProfiles[index + 1], order: index }
      newProfiles[index + 1] = { ...temp, order: index + 1 }
      return newProfiles
    })
  }, [])
  
  // Toggle guide selection
  const toggleGuide = useCallback((entityId: string) => {
    setSelectedGuides(prev => 
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    )
  }, [])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    setDialogData({
      type: 'loft',
      profileIds: selectedProfiles.map(p => p.entityId),
      profileOrder: selectedProfiles.map(p => ({ entityId: p.entityId, sketchId: p.sketchId })),
      guideIds: selectedGuides,
      operation,
      loftType,
      startCondition,
      endCondition,
      startMagnitude,
      endMagnitude,
      closedLoft,
      showPreview,
      showConnectors
    })
  }, [
    selectedProfiles, selectedGuides, operation, loftType,
    startCondition, endCondition, startMagnitude, endMagnitude,
    closedLoft, showPreview, showConnectors, setDialogData
  ])
  
  // Handle create
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    if (selectedProfiles.length < 2) {
      addNotification('error', 'Please select at least 2 profiles to loft')
      return
    }
    
    // Build loft parameters
    const params: Record<string, any> = {
      profiles: selectedProfiles.map(p => ({
        sketchId: p.sketchId,
        entityId: p.entityId,
        order: p.order
      })),
      guides: selectedGuides.map(gId => {
        const guide = availableGuides.find(g => g.entityId === gId)
        return guide ? { sketchId: guide.sketchId, entityId: gId } : null
      }).filter(Boolean),
      operation,
      loftType,
      startCondition,
      endCondition,
      startMagnitude: startCondition !== 'free' ? startMagnitude : 1.0,
      endMagnitude: endCondition !== 'free' ? endMagnitude : 1.0,
      closedLoft,
      // Merge scope
      mergeWithAll,
      mergeScope: !mergeWithAll ? selectedBodies : []
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'loft').length + 1
    const name = `Loft ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'loft',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      addNotification('success', `Created ${name}`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create loft feature')
    }
  }
  
  // Get icon for entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'rectangle': return <Square size={14} />
      case 'circle': return <Circle size={14} />
      case 'polygon': return <Hexagon size={14} />
      case 'line': return <Minus size={14} />
      case 'arc': return <Circle size={14} />
      case 'spline': return <Spline size={14} />
      default: return <Target size={14} />
    }
  }
  
  // Validation
  const isValid = selectedProfiles.length >= 2
  
  // Get condition description
  const getConditionDescription = (condition: TangencyCondition) => {
    switch (condition) {
      case 'free': return 'No constraint'
      case 'normal': return 'Perpendicular to profile plane'
      case 'tangent': return 'Smooth transition to adjacent surface'
      case 'curvature': return 'Continuous curvature transition'
      default: return ''
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[480px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <Layers size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Loft</h2>
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
          
          {/* Profile Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Target size={12} />
              Profiles (Sections)
              <span className="ml-auto text-cad-accent text-[10px] normal-case">
                {selectedProfiles.length} selected • Min 2 required
              </span>
            </label>
            
            {/* Selected profiles list */}
            {selectedProfiles.length > 0 && (
              <div className="bg-white border border-amber-500/30 p-2 space-y-1">
                <p className="text-xs text-cad-text-dim mb-2">Selected profiles (in order):</p>
                {selectedProfiles.map((profile, index) => (
                  <div 
                    key={profile.entityId}
                    className="flex items-center gap-2 p-2 bg-white border border-cad-border"
                  >
                    <span className="text-cad-accent font-bold text-sm w-6">{index + 1}</span>
                    <div className="flex items-center gap-2 text-cad-text-dim">
                      {getEntityIcon(profile.entityType)}
                    </div>
                    <span className="text-sm text-cad-text flex-1 truncate">{profile.displayName}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveProfileUp(index)}
                        disabled={index === 0}
                        className="p-1 hover:bg-cad-panel disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveProfileDown(index)}
                        disabled={index === selectedProfiles.length - 1}
                        className="p-1 hover:bg-cad-panel disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => removeProfile(profile.entityId)}
                        className="p-1 hover:bg-cad-accent/20 text-cad-accent"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Available profiles to add */}
            {availableProfiles.length === 0 ? (
              <div className="p-4 bg-white border border-cad-border">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-cad-accent mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-cad-text font-medium">No profiles found</p>
                    <p className="text-cad-accent/70 mt-1">
                      Create sketches with closed profiles (rectangles, circles, or polygons) on different planes to loft between.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className={`space-y-1 max-h-32 overflow-y-auto bg-white border p-2 transition-colors ${
                  selectionMode === 'profiles' ? 'border-amber-500/50' : 'border-cad-border'
                }`}
                onClick={() => setSelectionMode('profiles')}
              >
                <p className="text-xs text-cad-text-dim mb-1">Click to add profiles:</p>
                {availableProfiles.filter(p => !selectedProfiles.find(sp => sp.entityId === p.entityId)).map((profile) => (
                  <button
                    key={profile.entityId}
                    onClick={() => addProfile(profile.entityId)}
                    className="w-full flex items-center gap-3 p-2 cursor-pointer transition-colors hover:bg-cad-accent/20 border border-transparent hover:border-amber-500/30"
                  >
                    <div className="w-6 h-6 bg-cad-panel flex items-center justify-center">
                      <Plus size={12} className="text-cad-accent" />
                    </div>
                    <div className="flex items-center gap-2 text-cad-text-dim">
                      {getEntityIcon(profile.entityType)}
                    </div>
                    <span className="text-sm text-cad-text flex-1 text-left">{profile.displayName}</span>
                  </button>
                ))}
                {availableProfiles.filter(p => !selectedProfiles.find(sp => sp.entityId === p.entityId)).length === 0 && (
                  <p className="text-xs text-cad-text-dim italic p-2">All profiles have been added</p>
                )}
              </div>
            )}
          </div>
          
          {/* Guide Curves (Optional) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Spline size={12} />
              Guide Curves (Optional)
              <span className="ml-auto text-cad-text-dim text-[10px] normal-case">
                {selectedGuides.length} selected
              </span>
            </label>
            
            {availableGuides.length === 0 ? (
              <div className="p-3 bg-white border border-cad-border">
                <p className="text-xs text-cad-text-dim">
                  No guide curves available. Create lines, arcs, or splines connecting the profiles to control the loft shape.
                </p>
              </div>
            ) : (
              <div 
                className={`space-y-1 max-h-28 overflow-y-auto bg-white border p-2 transition-colors ${
                  selectionMode === 'guides' ? 'border-amber-500/50' : 'border-cad-border'
                }`}
                onClick={() => setSelectionMode('guides')}
              >
                {availableGuides.map((guide) => (
                  <label
                    key={guide.entityId}
                    className={`
                      flex items-center gap-3 p-2 cursor-pointer transition-colors
                      ${selectedGuides.includes(guide.entityId)
                        ? 'bg-cad-accent/20 border border-amber-500/50'
                        : 'hover:bg-cad-panel border border-transparent'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGuides.includes(guide.entityId)}
                      onChange={() => toggleGuide(guide.entityId)}
                      className="sr-only"
                    />
                    <div className={`
                      w-5 h-5 border-2 flex items-center justify-center transition-colors
                      ${selectedGuides.includes(guide.entityId)
                        ? 'bg-cad-accent border-cad-accent'
                        : 'border-cad-border'}
                    `}>
                      {selectedGuides.includes(guide.entityId) && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex items-center gap-2 text-cad-text-dim">
                      {getEntityIcon(guide.entityType)}
                    </div>
                    <span className="text-sm text-cad-text flex-1">{guide.displayName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Operation Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Operation
            </label>
            <div className="grid grid-cols-4 gap-1 bg-white p-1">
              {[
                { value: 'new', label: 'New', icon: <Plus size={14} /> },
                { value: 'add', label: 'Add', icon: <Plus size={14} className="text-cad-accent" /> },
                { value: 'remove', label: 'Remove', icon: <Minus size={14} className="text-cad-accent" /> },
                { value: 'intersect', label: 'Intersect', icon: <Maximize2 size={14} className="text-cad-accent" /> },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setOperation(op.value as OperationType)}
                  className={`
                    flex flex-col items-center gap-1 p-2 transition-colors text-xs
                    ${operation === op.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {op.icon}
                  <span>{op.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Merge Scope (for add/remove/intersect) */}
          {operation !== 'new' && availableBodies.length > 0 && (
            <div className="space-y-2 p-3 bg-white/50 border border-cad-border">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mergeWithAll}
                  onChange={(e) => setMergeWithAll(e.target.checked)}
                  className="w-4 h-4 border-cad-border bg-white"
                />
                <span className="text-sm text-cad-text">Merge with all intersecting parts</span>
              </label>
            </div>
          )}
          
          {/* Start/End Conditions */}
          <div className="space-y-3 p-3 bg-white/50 border border-cad-border">
            <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Tangency Conditions
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Start Condition */}
              <div className="space-y-2">
                <label className="block text-xs text-cad-text-dim">Start Condition</label>
                <select
                  value={startCondition}
                  onChange={(e) => setStartCondition(e.target.value as TangencyCondition)}
                  className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent appearance-none cursor-pointer"
                >
                  <option value="free">Free</option>
                  <option value="normal">Normal to Plane</option>
                  <option value="tangent">Tangent</option>
                  <option value="curvature">Curvature Continuous</option>
                </select>
                {startCondition !== 'free' && (
                  <div>
                    <label className="block text-xs text-cad-text-dim mb-1">Magnitude</label>
                    <input
                      type="number"
                      value={startMagnitude}
                      onChange={(e) => setStartMagnitude(parseFloat(e.target.value) || 1)}
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent"
                    />
                  </div>
                )}
              </div>
              
              {/* End Condition */}
              <div className="space-y-2">
                <label className="block text-xs text-cad-text-dim">End Condition</label>
                <select
                  value={endCondition}
                  onChange={(e) => setEndCondition(e.target.value as TangencyCondition)}
                  className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent appearance-none cursor-pointer"
                >
                  <option value="free">Free</option>
                  <option value="normal">Normal to Plane</option>
                  <option value="tangent">Tangent</option>
                  <option value="curvature">Curvature Continuous</option>
                </select>
                {endCondition !== 'free' && (
                  <div>
                    <label className="block text-xs text-cad-text-dim mb-1">Magnitude</label>
                    <input
                      type="number"
                      value={endMagnitude}
                      onChange={(e) => setEndMagnitude(parseFloat(e.target.value) || 1)}
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Loft Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Output Type
            </label>
            <div className="grid grid-cols-2 gap-1 bg-white p-1">
              {[
                { value: 'solid', label: 'Solid' },
                { value: 'surface', label: 'Surface' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setLoftType(type.value as LoftType)}
                  className={`
                    p-2 transition-colors text-xs
                    ${loftType === type.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Additional Options */}
          <div className="space-y-2 p-3 bg-white/50 border border-cad-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={closedLoft}
                onChange={(e) => setClosedLoft(e.target.checked)}
                className="w-4 h-4 border-cad-border bg-white"
              />
              <span className="text-sm text-cad-text">Closed Loft (connect last to first)</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showConnectors}
                onChange={(e) => setShowConnectors(e.target.checked)}
                className="w-4 h-4 border-cad-border bg-white"
              />
              <span className="text-sm text-cad-text">Show connection lines</span>
            </label>
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
              <span className="text-sm text-cad-text">Show preview</span>
            </label>
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-white border border-cad-border">
            <h4 className="text-xs font-medium text-cad-text mb-2">Summary</h4>
            <ul className="text-xs text-cad-text space-y-1">
              <li>• Profiles: {selectedProfiles.length} selected</li>
              {selectedProfiles.length > 0 && (
                <li className="ml-2 text-cad-text/60">
                  Order: {selectedProfiles.map((p, i) => p.displayName.split(' - ')[1] || `Profile ${i+1}`).join(' → ')}
                </li>
              )}
              <li>• Guides: {selectedGuides.length} selected</li>
              <li>• Operation: {operation.charAt(0).toUpperCase() + operation.slice(1)}</li>
              <li>• Output: {loftType.charAt(0).toUpperCase() + loftType.slice(1)}</li>
              {startCondition !== 'free' && <li>• Start: {startCondition} (×{startMagnitude})</li>}
              {endCondition !== 'free' && <li>• End: {endCondition} (×{endMagnitude})</li>}
              {closedLoft && <li>• Closed loft enabled</li>}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-white/50">
          <div className="text-xs text-cad-text-dim">
            {!isValid && (
              <span className="text-cad-accent flex items-center gap-1">
                <AlertCircle size={12} />
                {selectedProfiles.length < 2 
                  ? `Need ${2 - selectedProfiles.length} more profile(s)`
                  : 'Configuration error'}
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

