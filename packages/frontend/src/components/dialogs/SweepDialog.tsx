/**
 * SweepDialog - Professional CAD-style sweep feature dialog
 * 
 * Provides comprehensive options for sweeping sketch profiles along paths:
 * - Profile selection (closed sketch regions)
 * - Path selection (sketch lines, arcs, splines)
 * - Orientation options (Follow Path, Fixed, etc.)
 * - Operation type (New, Add, Remove, Intersect)
 * - Solid/Surface output
 * - Real-time preview
 */

import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  CornerUpRight,
  Plus,
  Minus,
  Maximize2,
  Target,
  ArrowRight,
  Check,
  AlertCircle,
  Square,
  Circle,
  Hexagon,
  Spline,
  Minus as LineIcon,
  RotateCcw,
  Lock,
  Unlock,
  Route
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore, Sketch, SketchEntity } from '../../store/documentStore'

// Sweep operation types
type OperationType = 'new' | 'add' | 'remove' | 'intersect'

// Sweep type
type SweepType = 'solid' | 'surface' | 'thin'

// Orientation type - how profile behaves along path
type OrientationType = 'follow-path' | 'fixed' | 'keep-normal'

interface ProfileInfo {
  sketchId: string
  sketchName: string
  entityId: string
  entityType: string
  displayName: string
}

interface PathInfo {
  sketchId: string
  sketchName: string
  entityId: string
  entityType: string
  displayName: string
  // For multi-segment paths
  isChain?: boolean
  segmentCount?: number
}

export function SweepDialog() {
  const { closeDialog, dialogData, addNotification, selection, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Get available profiles (closed shapes that can be swept)
  const availableProfiles = useMemo(() => {
    if (!activePartStudio) return []
    
    const profiles: ProfileInfo[] = []
    activePartStudio.sketches.forEach((sketch, sketchId) => {
      sketch.entities.forEach((entity, index) => {
        // Closed profiles can be swept as solids
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
  
  // Get available paths (lines, arcs, splines that can be used as sweep paths)
  const availablePaths = useMemo(() => {
    if (!activePartStudio) return []
    
    const paths: PathInfo[] = []
    
    // Add sketch entities that can serve as paths
    activePartStudio.sketches.forEach((sketch, sketchId) => {
      sketch.entities.forEach((entity, index) => {
        // Lines, arcs, and splines can be paths
        if (entity.type === 'line' || entity.type === 'arc' || entity.type === 'spline') {
          paths.push({
            sketchId,
            sketchName: sketch.name,
            entityId: entity.id,
            entityType: entity.type,
            displayName: `${sketch.name} - ${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} ${index + 1}`
          })
        }
      })
      
      // Also offer the entire sketch as a potential path if it has connected lines
      const lines = sketch.entities.filter(e => e.type === 'line')
      if (lines.length > 1) {
        paths.push({
          sketchId,
          sketchName: sketch.name,
          entityId: `${sketchId}-chain`,
          entityType: 'chain',
          displayName: `${sketch.name} - Connected Path (${lines.length} segments)`,
          isChain: true,
          segmentCount: lines.length
        })
      }
    })
    
    return paths
  }, [activePartStudio])
  
  // State for sweep parameters
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [operation, setOperation] = useState<OperationType>('new')
  const [sweepType, setSweepType] = useState<SweepType>('solid')
  const [orientation, setOrientation] = useState<OrientationType>('follow-path')
  
  // Twist angle (optional - profile can twist along path)
  const [useTwist, setUseTwist] = useState(false)
  const [twistAngle, setTwistAngle] = useState(0)
  
  // Scale along path (optional)
  const [useScale, setUseScale] = useState(false)
  const [endScale, setEndScale] = useState(1.0)
  
  // Thin sweep
  const [wallThickness, setWallThickness] = useState(2)
  
  // Preview
  const [showPreview, setShowPreview] = useState(true)
  
  // Merge scope for add/remove operations
  const [mergeWithAll, setMergeWithAll] = useState(true)
  const [selectedBodies, setSelectedBodies] = useState<string[]>([])
  
  // Selection mode
  const [selectionMode, setSelectionMode] = useState<'profile' | 'path'>('profile')
  
  // Get available bodies for merge scope
  const availableBodies = useMemo(() => 
    activePartStudio?.parts || [],
    [activePartStudio]
  )
  
  // Auto-select first profile if available
  useEffect(() => {
    if (availableProfiles.length > 0 && !selectedProfile) {
      setSelectedProfile(availableProfiles[0].entityId)
    }
  }, [availableProfiles])
  
  // Auto-select first path if available
  useEffect(() => {
    if (availablePaths.length > 0 && !selectedPath) {
      setSelectedPath(availablePaths[0].entityId)
    }
  }, [availablePaths])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    setDialogData({
      type: 'sweep',
      profileId: selectedProfile,
      pathId: selectedPath,
      operation,
      sweepType,
      orientation,
      useTwist,
      twistAngle: useTwist ? twistAngle : 0,
      useScale,
      endScale: useScale ? endScale : 1.0,
      wallThickness: sweepType === 'thin' ? wallThickness : 0,
      showPreview
    })
  }, [
    selectedProfile, selectedPath, operation, sweepType, orientation,
    useTwist, twistAngle, useScale, endScale, wallThickness, showPreview, setDialogData
  ])
  
  // Handle create
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    if (!selectedProfile) {
      addNotification('error', 'Please select a profile to sweep')
      return
    }
    
    if (!selectedPath) {
      addNotification('error', 'Please select a path for the sweep')
      return
    }
    
    // Find the sketch containing the selected profile
    let profileSketchId: string | null = null
    for (const profile of availableProfiles) {
      if (profile.entityId === selectedProfile) {
        profileSketchId = profile.sketchId
        break
      }
    }
    
    // Find the sketch containing the path
    let pathSketchId: string | null = null
    for (const path of availablePaths) {
      if (path.entityId === selectedPath) {
        pathSketchId = path.sketchId
        break
      }
    }
    
    if (!profileSketchId) {
      addNotification('error', 'Could not find sketch for selected profile')
      return
    }
    
    // Build sweep parameters
    const params: Record<string, any> = {
      profileSketchId,
      profileId: selectedProfile,
      pathSketchId,
      pathId: selectedPath,
      operation,
      sweepType,
      orientation,
      useTwist,
      twistAngle: useTwist ? twistAngle : 0,
      useScale,
      endScale: useScale ? endScale : 1.0,
      // Thin sweep params
      thinSweep: sweepType === 'thin',
      wallThickness: sweepType === 'thin' ? wallThickness : 0,
      // Merge scope
      mergeWithAll,
      mergeScope: !mergeWithAll ? selectedBodies : []
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'sweep').length + 1
    const name = `Sweep ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'sweep',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      addNotification('success', `Created ${name}`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create sweep feature')
    }
  }
  
  // Get icon for entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'rectangle': return <Square size={14} />
      case 'circle': return <Circle size={14} />
      case 'polygon': return <Hexagon size={14} />
      case 'line': return <LineIcon size={14} />
      case 'arc': return <RotateCcw size={14} />
      case 'spline': return <Spline size={14} />
      case 'chain': return <Route size={14} />
      default: return <ArrowRight size={14} />
    }
  }
  
  // Validation
  const isValid = selectedProfile && selectedPath
  
  // Get orientation description
  const getOrientationDescription = () => {
    switch (orientation) {
      case 'follow-path':
        return 'Profile stays perpendicular to path, rotating with curves'
      case 'fixed':
        return 'Profile maintains original orientation throughout sweep'
      case 'keep-normal':
        return 'Profile follows path but keeps upright orientation'
      default:
        return ''
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-20 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[440px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <CornerUpRight size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Sweep</h2>
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
              Sweep Profile (Section)
              {selectionMode === 'profile' && (
                <span className="ml-auto text-cad-accent text-[10px] normal-case">Active</span>
              )}
            </label>
            
            {availableProfiles.length === 0 ? (
              <div className="p-4 bg-white border border-cad-border">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-cad-accent mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-cad-text font-medium">No profiles found</p>
                    <p className="text-cad-accent/70 mt-1">
                      Create a sketch with closed profiles (rectangles, circles, or polygons) to sweep.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className={`space-y-1 max-h-28 overflow-y-auto bg-white border p-2 transition-colors cursor-pointer ${
                  selectionMode === 'profile' ? 'border-cad-accent/50' : 'border-cad-border'
                }`}
                onClick={() => setSelectionMode('profile')}
              >
                {availableProfiles.map((profile) => (
                  <label 
                    key={profile.entityId}
                    className={`
                      flex items-center gap-3 p-2 cursor-pointer transition-colors
                      ${selectedProfile === profile.entityId 
                        ? 'bg-cad-accent/20 border border-cad-accent/50' 
                        : 'hover:bg-cad-panel border border-transparent'}
                    `}
                  >
                    <input
                      type="radio"
                      name="profile"
                      checked={selectedProfile === profile.entityId}
                      onChange={() => {
                        setSelectedProfile(profile.entityId)
                        setSelectionMode('path')
                      }}
                      className="sr-only"
                    />
                    <div className={`
                      w-4 h-4 border-2 flex items-center justify-center transition-colors
                      ${selectedProfile === profile.entityId 
                        ? 'bg-cad-accent border-cad-accent' 
                        : 'border-cad-border'}
                    `}>
                      {selectedProfile === profile.entityId && <div className="w-2 h-2 bg-white" />}
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
          
          {/* Path Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Route size={12} />
              Sweep Path
              {selectionMode === 'path' && (
                <span className="ml-auto text-cad-accent text-[10px] normal-case">Active</span>
              )}
            </label>
            
            {availablePaths.length === 0 ? (
              <div className="p-4 bg-white border border-cad-border">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-cad-accent mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-cad-text font-medium">No paths found</p>
                    <p className="text-cad-accent/70 mt-1">
                      Create a sketch with lines, arcs, or splines to use as the sweep path.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className={`space-y-1 max-h-28 overflow-y-auto bg-white border p-2 transition-colors cursor-pointer ${
                  selectionMode === 'path' ? 'border-cad-accent/50' : 'border-cad-border'
                }`}
                onClick={() => setSelectionMode('path')}
              >
                {availablePaths.map((path) => (
                  <label 
                    key={path.entityId}
                    className={`
                      flex items-center gap-3 p-2 cursor-pointer transition-colors
                      ${selectedPath === path.entityId 
                        ? 'bg-cad-accent/20 border border-cad-accent/50' 
                        : 'hover:bg-cad-panel border border-transparent'}
                    `}
                  >
                    <input
                      type="radio"
                      name="path"
                      checked={selectedPath === path.entityId}
                      onChange={() => setSelectedPath(path.entityId)}
                      className="sr-only"
                    />
                    <div className={`
                      w-4 h-4 border-2 flex items-center justify-center transition-colors
                      ${selectedPath === path.entityId 
                        ? 'bg-cad-accent border-cad-accent' 
                        : 'border-cad-border'}
                    `}>
                      {selectedPath === path.entityId && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <div className="flex items-center gap-2 text-cad-text-dim">
                      {getEntityIcon(path.entityType)}
                    </div>
                    <span className="text-sm text-cad-text flex-1">{path.displayName}</span>
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
          
          {/* Orientation Options */}
          <div className="space-y-3 p-3 bg-white/50 border border-cad-border">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <RotateCcw size={12} />
              Profile Orientation
            </label>
            
            <div className="grid grid-cols-3 gap-1 bg-white p-1">
              {[
                { value: 'follow-path', label: 'Follow Path', icon: <CornerUpRight size={14} /> },
                { value: 'fixed', label: 'Fixed', icon: <Lock size={14} /> },
                { value: 'keep-normal', label: 'Keep Normal', icon: <Unlock size={14} /> },
              ].map((ori) => (
                <button
                  key={ori.value}
                  onClick={() => setOrientation(ori.value as OrientationType)}
                  className={`
                    flex flex-col items-center gap-1 p-2 transition-colors text-xs
                    ${orientation === ori.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {ori.icon}
                  <span>{ori.label}</span>
                </button>
              ))}
            </div>
            
            <p className="text-xs text-cad-text-dim italic">
              {getOrientationDescription()}
            </p>
          </div>
          
          {/* Sweep Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Output Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white p-1">
              {[
                { value: 'solid', label: 'Solid' },
                { value: 'surface', label: 'Surface' },
                { value: 'thin', label: 'Thin' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSweepType(type.value as SweepType)}
                  className={`
                    p-2 transition-colors text-xs
                    ${sweepType === type.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            {/* Thin sweep options */}
            {sweepType === 'thin' && (
              <div className="p-3 bg-white/50 border border-cad-border">
                <label className="block text-xs text-cad-text-dim mb-1">Wall Thickness (mm)</label>
                <input
                  type="number"
                  value={wallThickness}
                  onChange={(e) => setWallThickness(parseFloat(e.target.value) || 0)}
                  min={0.1}
                  step={0.5}
                  className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent"
                />
              </div>
            )}
          </div>
          
          {/* Advanced Options */}
          <div className="space-y-3">
            {/* Twist along path */}
            <div className="p-3 bg-white/50 border border-cad-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useTwist}
                  onChange={(e) => setUseTwist(e.target.checked)}
                  className="w-4 h-4 border-cad-border bg-white"
                />
                <span className="text-sm text-cad-text">Twist along path</span>
              </label>
              
              {useTwist && (
                <div className="mt-3">
                  <label className="block text-xs text-cad-text-dim mb-1">Twist Angle (°)</label>
                  <input
                    type="number"
                    value={twistAngle}
                    onChange={(e) => setTwistAngle(parseFloat(e.target.value) || 0)}
                    step={15}
                    className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent"
                  />
                  <p className="text-xs text-cad-text-dim mt-1">
                    Profile rotates {twistAngle}° over the length of the path
                  </p>
                </div>
              )}
            </div>
            
            {/* Scale along path */}
            <div className="p-3 bg-white/50 border border-cad-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useScale}
                  onChange={(e) => setUseScale(e.target.checked)}
                  className="w-4 h-4 border-cad-border bg-white"
                />
                <span className="text-sm text-cad-text">Scale along path</span>
              </label>
              
              {useScale && (
                <div className="mt-3">
                  <label className="block text-xs text-cad-text-dim mb-1">End Scale Factor</label>
                  <input
                    type="number"
                    value={endScale}
                    onChange={(e) => setEndScale(parseFloat(e.target.value) || 1)}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="w-full px-3 py-2 bg-white border border-cad-border text-sm focus:border-cad-accent"
                  />
                  <p className="text-xs text-cad-text-dim mt-1">
                    Profile scales from 1.0 to {endScale.toFixed(1)} ({endScale < 1 ? 'tapers' : endScale > 1 ? 'expands' : 'constant'})
                  </p>
                </div>
              )}
            </div>
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
            <h4 className="text-xs font-medium text-cad-accent mb-2">Summary</h4>
            <ul className="text-xs text-cad-accent space-y-1">
              <li>• Profile: {selectedProfile ? availableProfiles.find(p => p.entityId === selectedProfile)?.displayName || 'Selected' : 'None'}</li>
              <li>• Path: {selectedPath ? availablePaths.find(p => p.entityId === selectedPath)?.displayName || 'Selected' : 'None'}</li>
              <li>• Operation: {operation.charAt(0).toUpperCase() + operation.slice(1)}</li>
              <li>• Orientation: {orientation.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</li>
              {useTwist && <li>• Twist: {twistAngle}°</li>}
              {useScale && <li>• Scale: 1.0 → {endScale.toFixed(1)}</li>}
              {sweepType === 'thin' && <li>• Thin wall: {wallThickness} mm</li>}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-white/50">
          <div className="text-xs text-cad-text-dim">
            {!isValid && (
              <span className="text-cad-accent flex items-center gap-1">
                <AlertCircle size={12} />
                {!selectedProfile ? 'Select a profile' : 'Select a path'}
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

