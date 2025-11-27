/**
 * RevolveDialog - Professional CAD-style revolve feature dialog
 * 
 * Provides comprehensive options for revolving sketch profiles:
 * - Profile selection (closed sketch regions)
 * - Axis selection (sketch lines, edges, reference axes)
 * - Angle controls (full 360° or custom angle)
 * - Operation type (New, Add, Remove, Intersect)
 * - Direction controls
 * - Real-time preview
 */

import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  RotateCcw,
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
  RefreshCw
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore, Sketch, SketchEntity } from '../../store/documentStore'

// Revolve operation types
type OperationType = 'new' | 'add' | 'remove' | 'intersect'

// Revolve type
type RevolveType = 'solid' | 'surface' | 'thin'

// Direction type
type DirectionType = 'one-direction' | 'symmetric' | 'full'

interface ProfileInfo {
  sketchId: string
  sketchName: string
  entityId: string
  entityType: string
  displayName: string
}

interface AxisInfo {
  sketchId: string
  sketchName: string
  entityId: string
  entityType: string
  displayName: string
}

export function RevolveDialog() {
  const { closeDialog, dialogData, addNotification, selection, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Get available profiles (closed shapes that can be revolved)
  const availableProfiles = useMemo(() => {
    if (!activePartStudio) return []
    
    const profiles: ProfileInfo[] = []
    activePartStudio.sketches.forEach((sketch, sketchId) => {
      sketch.entities.forEach((entity, index) => {
        // Only closed profiles can be revolved as solids
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
  
  // Get available axes (lines that can be used as revolve axis)
  const availableAxes = useMemo(() => {
    if (!activePartStudio) return []
    
    const axes: AxisInfo[] = []
    
    // Add reference axes
    axes.push({
      sketchId: 'reference',
      sketchName: 'Reference',
      entityId: 'x-axis',
      entityType: 'axis',
      displayName: 'X Axis'
    })
    axes.push({
      sketchId: 'reference',
      sketchName: 'Reference',
      entityId: 'y-axis',
      entityType: 'axis',
      displayName: 'Y Axis'
    })
    axes.push({
      sketchId: 'reference',
      sketchName: 'Reference',
      entityId: 'z-axis',
      entityType: 'axis',
      displayName: 'Z Axis'
    })
    
    // Add sketch lines as potential axes
    activePartStudio.sketches.forEach((sketch, sketchId) => {
      sketch.entities.forEach((entity, index) => {
        if (entity.type === 'line') {
          axes.push({
            sketchId,
            sketchName: sketch.name,
            entityId: entity.id,
            entityType: 'line',
            displayName: `${sketch.name} - Line ${index + 1}`
          })
        }
      })
    })
    
    return axes
  }, [activePartStudio])
  
  // State for revolve parameters
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [selectedAxis, setSelectedAxis] = useState<string>('y-axis')
  const [operation, setOperation] = useState<OperationType>('new')
  const [revolveType, setRevolveType] = useState<RevolveType>('solid')
  const [directionType, setDirectionType] = useState<DirectionType>('full')
  const [angle, setAngle] = useState(360)
  const [angle2, setAngle2] = useState(0)
  
  // Thin revolve
  const [wallThickness, setWallThickness] = useState(2)
  const [thinSymmetric, setThinSymmetric] = useState(true)
  
  // Preview
  const [showPreview, setShowPreview] = useState(true)
  
  // Merge scope for add/remove operations
  const [mergeWithAll, setMergeWithAll] = useState(true)
  const [selectedBodies, setSelectedBodies] = useState<string[]>([])
  
  // Selection mode
  const [selectionMode, setSelectionMode] = useState<'profile' | 'axis'>('profile')
  
  // Get available bodies for merge scope
  const availableBodies = useMemo(() => 
    activePartStudio?.parts || [],
    [activePartStudio]
  )
  
  // Auto-select first profile if available and none selected
  useEffect(() => {
    if (availableProfiles.length > 0 && !selectedProfile) {
      setSelectedProfile(availableProfiles[0].entityId)
    }
  }, [availableProfiles])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    setDialogData({
      type: 'revolve',
      profileId: selectedProfile,
      axisId: selectedAxis,
      operation,
      revolveType,
      directionType,
      angle: directionType === 'full' ? 360 : angle,
      angle2: directionType === 'symmetric' ? angle : angle2,
      wallThickness: revolveType === 'thin' ? wallThickness : 0,
      thinSymmetric,
      showPreview
    })
  }, [
    selectedProfile, selectedAxis, operation, revolveType, directionType,
    angle, angle2, wallThickness, thinSymmetric, showPreview, setDialogData
  ])
  
  // Calculate actual angle based on direction type
  const getActualAngle = () => {
    switch (directionType) {
      case 'full':
        return 360
      case 'symmetric':
        return angle // Half in each direction
      case 'one-direction':
        return angle
      default:
        return 360
    }
  }
  
  // Handle create
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    if (!selectedProfile) {
      addNotification('error', 'Please select a profile to revolve')
      return
    }
    
    if (!selectedAxis) {
      addNotification('error', 'Please select an axis for revolve')
      return
    }
    
    // Find the sketch containing the selected profile
    let sketchId: string | null = null
    for (const profile of availableProfiles) {
      if (profile.entityId === selectedProfile) {
        sketchId = profile.sketchId
        break
      }
    }
    
    if (!sketchId) {
      addNotification('error', 'Could not find sketch for selected profile')
      return
    }
    
    // Build revolve parameters
    const params: Record<string, any> = {
      sketchId,
      profileId: selectedProfile,
      axisId: selectedAxis,
      operation,
      revolveType,
      directionType,
      angle: getActualAngle(),
      angle2: directionType === 'symmetric' ? angle : angle2,
      // Thin revolve params
      thinRevolve: revolveType === 'thin',
      wallThickness: revolveType === 'thin' ? wallThickness : 0,
      thinSymmetric,
      // Merge scope
      mergeWithAll,
      mergeScope: !mergeWithAll ? selectedBodies : []
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'revolve').length + 1
    const name = `Revolve ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'revolve',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      addNotification('success', `Created ${name}`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create revolve feature')
    }
  }
  
  // Get icon for entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'rectangle': return <Square size={14} />
      case 'circle': return <Circle size={14} />
      case 'polygon': return <Hexagon size={14} />
      case 'line': return <LineIcon size={14} />
      case 'axis': return <ArrowRight size={14} />
      default: return <Spline size={14} />
    }
  }
  
  // Validation
  const isValid = selectedProfile && selectedAxis && (directionType === 'full' || angle > 0)
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-20 overflow-y-auto">
      <div className="bg-cad-dark border border-cad-border rounded-lg shadow-2xl w-[420px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-gradient-to-r from-purple-900/30 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
              <RotateCcw size={14} className="text-purple-400" />
            </div>
            <h2 className="font-semibold text-cad-text">Revolve</h2>
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
          
          {/* Profile Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Target size={12} />
              Profile to Revolve
              {selectionMode === 'profile' && (
                <span className="ml-auto text-blue-400 text-[10px] normal-case">Click to select</span>
              )}
            </label>
            
            {availableProfiles.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-amber-300 font-medium">No profiles found</p>
                    <p className="text-amber-400/70 mt-1">
                      Create a sketch with closed profiles (rectangles, circles, or polygons) to revolve.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className={`space-y-1 max-h-32 overflow-y-auto bg-cad-darker rounded-lg border p-2 transition-colors ${
                  selectionMode === 'profile' ? 'border-blue-500/50' : 'border-cad-border'
                }`}
                onClick={() => setSelectionMode('profile')}
              >
                {availableProfiles.map((profile) => (
                  <label 
                    key={profile.entityId}
                    className={`
                      flex items-center gap-3 p-2 rounded cursor-pointer transition-colors
                      ${selectedProfile === profile.entityId 
                        ? 'bg-purple-500/20 border border-purple-500/50' 
                        : 'hover:bg-cad-panel border border-transparent'}
                    `}
                  >
                    <input
                      type="radio"
                      name="profile"
                      checked={selectedProfile === profile.entityId}
                      onChange={() => setSelectedProfile(profile.entityId)}
                      className="sr-only"
                    />
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                      ${selectedProfile === profile.entityId 
                        ? 'bg-purple-500 border-purple-500' 
                        : 'border-cad-border'}
                    `}>
                      {selectedProfile === profile.entityId && <div className="w-2 h-2 bg-white rounded-full" />}
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
          
          {/* Axis Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <RefreshCw size={12} />
              Revolve Axis
              {selectionMode === 'axis' && (
                <span className="ml-auto text-blue-400 text-[10px] normal-case">Click to select</span>
              )}
            </label>
            
            <div 
              className={`space-y-1 max-h-32 overflow-y-auto bg-cad-darker rounded-lg border p-2 transition-colors ${
                selectionMode === 'axis' ? 'border-blue-500/50' : 'border-cad-border'
              }`}
              onClick={() => setSelectionMode('axis')}
            >
              {availableAxes.map((axis) => (
                <label 
                  key={axis.entityId}
                  className={`
                    flex items-center gap-3 p-2 rounded cursor-pointer transition-colors
                    ${selectedAxis === axis.entityId 
                      ? 'bg-purple-500/20 border border-purple-500/50' 
                      : 'hover:bg-cad-panel border border-transparent'}
                  `}
                >
                  <input
                    type="radio"
                    name="axis"
                    checked={selectedAxis === axis.entityId}
                    onChange={() => setSelectedAxis(axis.entityId)}
                    className="sr-only"
                  />
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                    ${selectedAxis === axis.entityId 
                      ? 'bg-purple-500 border-purple-500' 
                      : 'border-cad-border'}
                  `}>
                    {selectedAxis === axis.entityId && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex items-center gap-2 text-cad-text-dim">
                    {getEntityIcon(axis.entityType)}
                  </div>
                  <span className="text-sm text-cad-text flex-1">{axis.displayName}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Operation Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Operation
            </label>
            <div className="grid grid-cols-4 gap-1 bg-cad-darker p-1 rounded-lg">
              {[
                { value: 'new', label: 'New', icon: <Plus size={14} /> },
                { value: 'add', label: 'Add', icon: <Plus size={14} className="text-green-400" /> },
                { value: 'remove', label: 'Remove', icon: <Minus size={14} className="text-red-400" /> },
                { value: 'intersect', label: 'Intersect', icon: <Maximize2 size={14} className="text-purple-400" /> },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setOperation(op.value as OperationType)}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded transition-colors text-xs
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
            <div className="space-y-2 p-3 bg-cad-darker/50 rounded-lg border border-cad-border">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mergeWithAll}
                  onChange={(e) => setMergeWithAll(e.target.checked)}
                  className="w-4 h-4 rounded border-cad-border bg-cad-darker"
                />
                <span className="text-sm text-cad-text">Merge with all intersecting parts</span>
              </label>
              
              {!mergeWithAll && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-cad-text-dim">Select target parts:</p>
                  {availableBodies.map((part) => (
                    <label key={part.id} className="flex items-center gap-2 p-2 hover:bg-cad-panel rounded">
                      <input
                        type="checkbox"
                        checked={selectedBodies.includes(part.id)}
                        onChange={(e) => setSelectedBodies(prev => 
                          e.target.checked 
                            ? [...prev, part.id]
                            : prev.filter(id => id !== part.id)
                        )}
                        className="w-4 h-4 rounded border-cad-border bg-cad-darker"
                      />
                      <span className="text-sm text-cad-text">{part.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Angle and Direction */}
          <div className="space-y-3 p-3 bg-cad-darker/50 rounded-lg border border-cad-border">
            <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Angle & Direction
            </label>
            
            {/* Direction Type */}
            <div className="grid grid-cols-3 gap-1 bg-cad-darker p-1 rounded-lg">
              {[
                { value: 'full', label: 'Full (360°)' },
                { value: 'one-direction', label: 'One Direction' },
                { value: 'symmetric', label: 'Symmetric' },
              ].map((dir) => (
                <button
                  key={dir.value}
                  onClick={() => setDirectionType(dir.value as DirectionType)}
                  className={`
                    p-2 rounded transition-colors text-xs
                    ${directionType === dir.value 
                      ? 'bg-purple-500 text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {dir.label}
                </button>
              ))}
            </div>
            
            {/* Angle Input (only if not full) */}
            {directionType !== 'full' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-cad-text-dim mb-1">
                    {directionType === 'symmetric' ? 'Half Angle (°)' : 'Angle (°)'}
                  </label>
                  <input
                    type="number"
                    value={angle}
                    onChange={(e) => setAngle(parseFloat(e.target.value) || 0)}
                    min={1}
                    max={360}
                    step={5}
                    className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
                  />
                </div>
                
                {directionType === 'one-direction' && (
                  <div>
                    <label className="block text-xs text-cad-text-dim mb-1">
                      Second Direction (°)
                    </label>
                    <input
                      type="number"
                      value={angle2}
                      onChange={(e) => setAngle2(parseFloat(e.target.value) || 0)}
                      min={0}
                      max={360}
                      step={5}
                      className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Angle visualization */}
            <div className="flex items-center gap-2 text-xs text-cad-text-dim">
              <RotateCcw size={12} />
              <span>
                {directionType === 'full' 
                  ? 'Full revolution (360°)'
                  : directionType === 'symmetric'
                    ? `Symmetric: ±${angle}° (total ${angle * 2}°)`
                    : `${angle}°${angle2 > 0 ? ` + ${angle2}° (total ${angle + angle2}°)` : ''}`
                }
              </span>
            </div>
          </div>
          
          {/* Revolve Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Revolve Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-cad-darker p-1 rounded-lg">
              {[
                { value: 'solid', label: 'Solid' },
                { value: 'surface', label: 'Surface' },
                { value: 'thin', label: 'Thin' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setRevolveType(type.value as RevolveType)}
                  className={`
                    p-2 rounded transition-colors text-xs
                    ${revolveType === type.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            {/* Thin revolve options */}
            {revolveType === 'thin' && (
              <div className="p-3 bg-cad-darker/50 rounded-lg border border-cad-border space-y-3">
                <div>
                  <label className="block text-xs text-cad-text-dim mb-1">Wall Thickness (mm)</label>
                  <input
                    type="number"
                    value={wallThickness}
                    onChange={(e) => setWallThickness(parseFloat(e.target.value) || 0)}
                    min={0.1}
                    step={0.5}
                    className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded text-sm focus:border-cad-accent"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={thinSymmetric}
                    onChange={(e) => setThinSymmetric(e.target.checked)}
                    className="w-4 h-4 rounded border-cad-border bg-cad-darker"
                  />
                  <span className="text-sm text-cad-text">Symmetric thickness</span>
                </label>
              </div>
            )}
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
              <span className="text-sm text-cad-text">Show preview</span>
            </label>
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <h4 className="text-xs font-medium text-purple-300 mb-2">Summary</h4>
            <ul className="text-xs text-purple-200/70 space-y-1">
              <li>• Profile: {selectedProfile ? availableProfiles.find(p => p.entityId === selectedProfile)?.displayName || 'Selected' : 'None'}</li>
              <li>• Axis: {availableAxes.find(a => a.entityId === selectedAxis)?.displayName || selectedAxis}</li>
              <li>• Operation: {operation.charAt(0).toUpperCase() + operation.slice(1)}</li>
              <li>• Angle: {directionType === 'full' ? '360°' : directionType === 'symmetric' ? `±${angle}°` : `${angle}°${angle2 > 0 ? ` + ${angle2}°` : ''}`}</li>
              {revolveType === 'thin' && <li>• Thin wall: {wallThickness} mm</li>}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-cad-border bg-cad-darker/50">
          <div className="text-xs text-cad-text-dim">
            {!isValid && (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle size={12} />
                {!selectedProfile ? 'Select a profile' : !selectedAxis ? 'Select an axis' : 'Enter valid angle'}
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
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
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

