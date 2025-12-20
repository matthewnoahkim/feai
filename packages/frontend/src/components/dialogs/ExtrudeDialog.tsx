/**
 * ExtrudeDialog - Professional CAD-style extrude feature dialog
 * 
 * Provides comprehensive options for extruding sketch profiles:
 * - Profile selection from available sketches
 * - Operation type (New, Add, Remove, Intersect)
 * - End conditions (Blind, Symmetric, Through All, Up to Face)
 * - Direction controls with flip
 * - Draft angle support
 * - Second direction option
 * - Real-time preview
 */

import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown, 
  FlipVertical,
  Plus,
  Minus,
  Maximize2,
  Target,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Square,
  Circle,
  Hexagon,
  Spline
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore, Sketch, SketchEntity } from '../../store/documentStore'

// Extrude operation types
type OperationType = 'new' | 'add' | 'remove' | 'intersect'

// End condition types
type EndCondition = 'blind' | 'symmetric' | 'throughAll' | 'upToFace' | 'upToVertex'

// Extrude type
type ExtrudeType = 'solid' | 'surface' | 'thin'

interface ProfileInfo {
  sketchId: string
  sketchName: string
  entityId: string
  entityType: string
  displayName: string
}

export function ExtrudeDialog() {
  const { closeDialog, dialogData, addNotification, selection, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Get available sketches and their extrudable profiles
  const availableProfiles = useMemo(() => {
    if (!activePartStudio) return []
    
    const profiles: ProfileInfo[] = []
    activePartStudio.sketches.forEach((sketch, sketchId) => {
      sketch.entities.forEach((entity, index) => {
        // Only closed profiles can be extruded as solids
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
  
  // State for extrude parameters
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [operation, setOperation] = useState<OperationType>('new')
  const [extrudeType, setExtrudeType] = useState<ExtrudeType>('solid')
  const [endCondition1, setEndCondition1] = useState<EndCondition>('blind')
  const [depth1, setDepth1] = useState(25)
  const [flipDirection1, setFlipDirection1] = useState(false)
  
  // Second direction
  const [useSecondDirection, setUseSecondDirection] = useState(false)
  const [endCondition2, setEndCondition2] = useState<EndCondition>('blind')
  const [depth2, setDepth2] = useState(25)
  
  // Draft angle
  const [useDraft, setUseDraft] = useState(false)
  const [draftAngle, setDraftAngle] = useState(5)
  const [draftOutward, setDraftOutward] = useState(true)
  
  // Thin extrude
  const [wallThickness, setWallThickness] = useState(2)
  const [thinSymmetric, setThinSymmetric] = useState(true)
  const [thickness1, setThickness1] = useState(1)
  const [thickness2, setThickness2] = useState(1)
  
  // Preview
  const [showPreview, setShowPreview] = useState(true)
  const [previewOpacity, setPreviewOpacity] = useState(0.7)
  
  // Merge scope for add/remove operations
  const [mergeWithAll, setMergeWithAll] = useState(true)
  const [selectedBodies, setSelectedBodies] = useState<string[]>([])
  
  // Get available bodies for merge scope
  const availableBodies = useMemo(() => 
    activePartStudio?.parts || [],
    [activePartStudio]
  )
  
  // Auto-select first profile if available and none selected
  useEffect(() => {
    if (availableProfiles.length > 0 && selectedProfiles.length === 0) {
      setSelectedProfiles([availableProfiles[0].entityId])
    }
  }, [availableProfiles])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    setDialogData({
      profileIds: selectedProfiles,
      operation,
      extrudeType,
      endCondition1,
      depth1,
      flipDirection1,
      useSecondDirection,
      endCondition2,
      depth2,
      useDraft,
      draftAngle,
      draftOutward,
      showPreview
    })
  }, [
    selectedProfiles, operation, extrudeType, endCondition1, depth1, flipDirection1,
    useSecondDirection, endCondition2, depth2, useDraft, draftAngle, draftOutward, showPreview,
    setDialogData
  ])
  
  // Calculate actual depth based on end condition
  const getActualDepth = (condition: EndCondition, depth: number) => {
    switch (condition) {
      case 'blind':
        return depth
      case 'symmetric':
        return depth / 2 // Half in each direction
      case 'throughAll':
        return 1000 // Large value for through all
      default:
        return depth
    }
  }
  
  // Get direction string for display
  const getDirectionDisplay = () => {
    if (endCondition1 === 'symmetric') return 'Symmetric (both sides)'
    if (flipDirection1) return 'Opposite direction'
    return 'Normal direction'
  }
  
  // Handle profile toggle
  const toggleProfile = (entityId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(entityId) 
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    )
  }
  
  // Handle create
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    if (selectedProfiles.length === 0) {
      addNotification('error', 'Please select at least one profile to extrude')
      return
    }
    
    // Find the sketch containing the first selected profile
    let sketchId: string | null = null
    for (const profile of availableProfiles) {
      if (selectedProfiles.includes(profile.entityId)) {
        sketchId = profile.sketchId
        break
      }
    }
    
    if (!sketchId) {
      addNotification('error', 'Could not find sketch for selected profile')
      return
    }
    
    // Build extrude parameters
    const params: Record<string, any> = {
      sketchId,
      profileIds: selectedProfiles,
      operation,
      extrudeType,
      endCondition1,
      depth1: getActualDepth(endCondition1, depth1),
      flipDirection1,
      useSecondDirection: useSecondDirection && endCondition1 !== 'symmetric',
      endCondition2: useSecondDirection ? endCondition2 : null,
      depth2: useSecondDirection ? getActualDepth(endCondition2, depth2) : 0,
      useDraft,
      draftAngle: useDraft ? draftAngle : 0,
      draftOutward,
      // Thin extrude params
      thinExtrude: extrudeType === 'thin',
      wallThickness: extrudeType === 'thin' ? wallThickness : 0,
      thinSymmetric,
      thickness1: !thinSymmetric ? thickness1 : wallThickness / 2,
      thickness2: !thinSymmetric ? thickness2 : wallThickness / 2,
      // Merge scope
      mergeWithAll,
      mergeScope: !mergeWithAll ? selectedBodies : []
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'extrude').length + 1
    const name = `Extrude ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'extrude',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      addNotification('success', `Created ${name}`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create extrude feature')
    }
  }
  
  // Get icon for entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'rectangle': return <Square size={14} />
      case 'circle': return <Circle size={14} />
      case 'polygon': return <Hexagon size={14} />
      default: return <Spline size={14} />
    }
  }
  
  // Validation
  const isValid = selectedProfiles.length > 0 && depth1 > 0 && (!useSecondDirection || depth2 > 0)
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-20 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[420px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <ArrowUp size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Extrude</h2>
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
              Profiles to Extrude
            </label>
            
            {availableProfiles.length === 0 ? (
              <div className="p-4 bg-white border border-cad-border">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-cad-accent mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-cad-text font-medium">No extrudable profiles found</p>
                    <p className="text-cad-accent/70 mt-1">
                      Create a sketch with closed profiles (rectangles, circles, or polygons) to extrude.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto bg-white border border-cad-border p-2">
                {availableProfiles.map((profile) => (
                  <label 
                    key={profile.entityId}
                    className={`
                      flex items-center gap-3 p-2 cursor-pointer transition-colors
                      ${selectedProfiles.includes(profile.entityId) 
                        ? 'bg-cad-accent/20 border border-blue-500/50' 
                        : 'hover:bg-cad-panel border border-transparent'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProfiles.includes(profile.entityId)}
                      onChange={() => toggleProfile(profile.entityId)}
                      className="sr-only"
                    />
                    <div className={`
                      w-5 h-5 border-2 flex items-center justify-center transition-colors
                      ${selectedProfiles.includes(profile.entityId) 
                        ? 'bg-cad-accent border-blue-500' 
                        : 'border-cad-border'}
                    `}>
                      {selectedProfiles.includes(profile.entityId) && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex items-center gap-2 text-cad-text-dim">
                      {getEntityIcon(profile.entityType)}
                    </div>
                    <span className="text-sm text-cad-text flex-1">{profile.displayName}</span>
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
              
              {!mergeWithAll && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-cad-text-dim">Select target parts:</p>
                  {availableBodies.map((part) => (
                    <label key={part.id} className="flex items-center gap-2 p-2 hover:bg-cad-panel">
                      <input
                        type="checkbox"
                        checked={selectedBodies.includes(part.id)}
                        onChange={(e) => setSelectedBodies(prev => 
                          e.target.checked 
                            ? [...prev, part.id]
                            : prev.filter(id => id !== part.id)
                        )}
                        className="w-4 h-4 border-cad-border bg-white"
                      />
                      <span className="text-sm text-cad-text">{part.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Direction 1 */}
          <div className="space-y-3 p-3 bg-white/50 border border-cad-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                Direction 1
              </label>
              <button
                onClick={() => setFlipDirection1(!flipDirection1)}
                className={`
                  p-1.5 transition-colors
                  ${flipDirection1 ? 'bg-cad-accent/20 text-cad-accent' : 'hover:bg-cad-panel text-cad-text-dim'}
                `}
                title="Flip direction"
              >
                <FlipVertical size={14} />
              </button>
            </div>
            
            {/* End Condition */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-cad-text-dim mb-1">End Condition</label>
                <select
                  value={endCondition1}
                  onChange={(e) => setEndCondition1(e.target.value as EndCondition)}
                  className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent appearance-none cursor-pointer"
                >
                  <option value="blind">Blind</option>
                  <option value="symmetric">Symmetric</option>
                  <option value="throughAll">Through All</option>
                  <option value="upToFace">Up to Face</option>
                </select>
              </div>
              
              {/* Depth (only for blind) */}
              {(endCondition1 === 'blind' || endCondition1 === 'symmetric') && (
                <div>
                  <label className="block text-xs text-cad-text-dim mb-1">
                    {endCondition1 === 'symmetric' ? 'Total Depth' : 'Depth'} (mm)
                  </label>
                  <input
                    type="number"
                    value={depth1}
                    onChange={(e) => setDepth1(parseFloat(e.target.value) || 0)}
                    min={0.01}
                    step={1}
                    className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent"
                  />
                </div>
              )}
            </div>
            
            {/* Direction indicator */}
            <div className="flex items-center gap-2 text-xs text-cad-text-dim">
              {flipDirection1 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
              <span>{getDirectionDisplay()}</span>
            </div>
          </div>
          
          {/* Second Direction Toggle */}
          {endCondition1 !== 'symmetric' && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`
                  relative w-10 h-5 transition-colors
                  ${useSecondDirection ? 'bg-cad-accent' : 'bg-cad-border'}
                `}>
                  <div className={`
                    absolute top-0.5 w-4 h-4 bg-white transition-transform
                    ${useSecondDirection ? 'translate-x-5' : 'translate-x-0.5'}
                  `} />
                </div>
                <span className="text-sm text-cad-text">Extrude in second direction</span>
              </label>
              
              {useSecondDirection && (
                <div className="p-3 bg-white/50 border border-cad-border space-y-2">
                  <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                    Direction 2
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-cad-text-dim mb-1">End Condition</label>
                      <select
                        value={endCondition2}
                        onChange={(e) => setEndCondition2(e.target.value as EndCondition)}
                        className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent appearance-none cursor-pointer"
                      >
                        <option value="blind">Blind</option>
                        <option value="throughAll">Through All</option>
                        <option value="upToFace">Up to Face</option>
                      </select>
                    </div>
                    
                    {endCondition2 === 'blind' && (
                      <div>
                        <label className="block text-xs text-cad-text-dim mb-1">Depth (mm)</label>
                        <input
                          type="number"
                          value={depth2}
                          onChange={(e) => setDepth2(parseFloat(e.target.value) || 0)}
                          min={0.01}
                          step={1}
                          className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Draft Angle */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`
                relative w-10 h-5 transition-colors
                ${useDraft ? 'bg-cad-accent' : 'bg-cad-border'}
              `}>
                <div className={`
                  absolute top-0.5 w-4 h-4 bg-white transition-transform
                  ${useDraft ? 'translate-x-5' : 'translate-x-0.5'}
                `} />
              </div>
              <span className="text-sm text-cad-text">Add draft angle</span>
            </label>
            
            {useDraft && (
              <div className="p-3 bg-white/50 border border-cad-border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-cad-text-dim mb-1">Draft Angle (°)</label>
                    <input
                      type="number"
                      value={draftAngle}
                      onChange={(e) => setDraftAngle(parseFloat(e.target.value) || 0)}
                      min={0}
                      max={45}
                      step={0.5}
                      className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-cad-text-dim mb-1">Direction</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setDraftOutward(true)}
                        className={`
                          flex-1 px-3 py-2 text-xs transition-colors
                          ${draftOutward ? 'bg-cad-accent text-white' : 'bg-white border border-cad-border text-cad-text-dim'}
                        `}
                      >
                        Outward
                      </button>
                      <button
                        onClick={() => setDraftOutward(false)}
                        className={`
                          flex-1 px-3 py-2 text-xs transition-colors
                          ${!draftOutward ? 'bg-cad-accent text-white' : 'bg-white border border-cad-border text-cad-text-dim'}
                        `}
                      >
                        Inward
                      </button>
                    </div>
                  </div>
                </div>
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
              <span className="text-sm text-cad-text">Show preview</span>
            </label>
            
            {showPreview && (
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-cad-text-dim" />
                <input
                  type="range"
                  value={previewOpacity * 100}
                  onChange={(e) => setPreviewOpacity(parseInt(e.target.value) / 100)}
                  min={20}
                  max={100}
                  className="w-20 accent-cad-accent"
                />
              </div>
            )}
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-white border border-cad-border">
            <h4 className="text-xs font-medium text-cad-text mb-2">Summary</h4>
            <ul className="text-xs text-cad-text space-y-1">
              <li>• {selectedProfiles.length} profile(s) selected</li>
              <li>• Operation: {operation.charAt(0).toUpperCase() + operation.slice(1)}</li>
              <li>• Depth: {endCondition1 === 'throughAll' ? 'Through All' : `${depth1} mm`}
                {endCondition1 === 'symmetric' && ' (symmetric)'}
              </li>
              {useSecondDirection && (
                <li>• Second direction: {endCondition2 === 'throughAll' ? 'Through All' : `${depth2} mm`}</li>
              )}
              {useDraft && <li>• Draft: {draftAngle}° {draftOutward ? 'outward' : 'inward'}</li>}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-white/50">
          <div className="text-xs text-cad-text-dim">
            {!isValid && (
              <span className="text-cad-accent flex items-center gap-1">
                <AlertCircle size={12} />
                {selectedProfiles.length === 0 ? 'Select a profile' : 'Enter valid depth'}
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

