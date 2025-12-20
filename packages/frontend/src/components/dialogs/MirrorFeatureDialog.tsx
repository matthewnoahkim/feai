/**
 * MirrorFeatureDialog - Professional CAD-style 3D mirror feature dialog
 * 
 * Provides comprehensive options for mirroring 3D geometry:
 * - Mirror plane selection (reference planes or planar faces)
 * - Mirror type: Part, Feature, or Face
 * - Entity selection based on mirror type
 * - Result operation (New, Add, Remove, Intersect)
 * - Merge scope options
 * - Reapply features toggle
 * - Real-time preview
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  X, 
  FlipHorizontal,
  Plus,
  Minus,
  Maximize2,
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
  RefreshCw,
  Target
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore, Part, Feature } from '../../store/documentStore'

// Mirror type
type MirrorType = 'part' | 'feature' | 'face'

// Operation type for mirrored result
type OperationType = 'new' | 'add' | 'remove' | 'intersect'

// Mirror plane info
interface PlaneInfo {
  id: string
  type: 'reference' | 'face'
  name: string
  normal?: [number, number, number]
}

// Entity info for mirroring
interface EntityInfo {
  id: string
  type: 'part' | 'feature' | 'face'
  name: string
  partId?: string
}

export function MirrorFeatureDialog() {
  const { closeDialog, dialogData, addNotification, selection, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Get available reference planes
  const availablePlanes = useMemo((): PlaneInfo[] => {
    const planes: PlaneInfo[] = [
      { id: 'front-plane', type: 'reference', name: 'Front Plane', normal: [0, 0, 1] },
      { id: 'top-plane', type: 'reference', name: 'Top Plane', normal: [0, 1, 0] },
      { id: 'right-plane', type: 'reference', name: 'Right Plane', normal: [1, 0, 0] },
    ]
    
    // Add planar faces from parts
    if (activePartStudio) {
      activePartStudio.parts?.forEach((part) => {
        const faceLabels = ['Top', 'Bottom', 'Front', 'Back', 'Left', 'Right']
        faceLabels.forEach((label, index) => {
          planes.push({
            id: `${part.id}-face-${index}`,
            type: 'face',
            name: `${part.name} - ${label} Face`,
            normal: index === 0 ? [0, 1, 0] : index === 1 ? [0, -1, 0] : 
                    index === 2 ? [0, 0, 1] : index === 3 ? [0, 0, -1] :
                    index === 4 ? [-1, 0, 0] : [1, 0, 0]
          })
        })
      })
    }
    
    return planes
  }, [activePartStudio])
  
  // Get available parts for mirroring
  const availableParts = useMemo((): EntityInfo[] => {
    if (!activePartStudio) return []
    return activePartStudio.parts?.map(part => ({
      id: part.id,
      type: 'part' as const,
      name: part.name
    })) || []
  }, [activePartStudio])
  
  // Get available features for mirroring
  const availableFeatures = useMemo((): EntityInfo[] => {
    if (!activePartStudio) return []
    return activePartStudio.features
      .filter(f => !f.suppressed && f.type !== 'mirror') // Can't mirror a mirror
      .map(feature => ({
        id: feature.id,
        type: 'feature' as const,
        name: feature.name
      }))
  }, [activePartStudio])
  
  // Get available faces for mirroring
  const availableFaces = useMemo((): EntityInfo[] => {
    if (!activePartStudio) return []
    const faces: EntityInfo[] = []
    activePartStudio.parts?.forEach((part) => {
      const faceLabels = ['Top', 'Bottom', 'Front', 'Back', 'Left', 'Right']
      faceLabels.forEach((label, index) => {
        faces.push({
          id: `${part.id}-face-${index}`,
          type: 'face',
          name: `${part.name} - ${label}`,
          partId: part.id
        })
      })
    })
    return faces
  }, [activePartStudio])
  
  // State for mirror parameters
  const [mirrorType, setMirrorType] = useState<MirrorType>('part')
  const [selectedPlane, setSelectedPlane] = useState<string | null>(null)
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [operation, setOperation] = useState<OperationType>('add')
  
  // Advanced options
  const [reapplyFeatures, setReapplyFeatures] = useState(false)
  const [mergeWithAll, setMergeWithAll] = useState(true)
  const [selectedMergeScope, setSelectedMergeScope] = useState<string[]>([])
  
  // Preview state
  const [showPreview, setShowPreview] = useState(true)
  const [previewValid, setPreviewValid] = useState(true)
  
  // Advanced options expanded
  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  
  // Auto-select first plane
  useEffect(() => {
    if (availablePlanes.length > 0 && !selectedPlane) {
      setSelectedPlane(availablePlanes[0].id)
    }
  }, [availablePlanes, selectedPlane])
  
  // Clear entity selection when mirror type changes
  useEffect(() => {
    setSelectedEntities([])
  }, [mirrorType])
  
  // Get entities list based on mirror type
  const entitiesList = useMemo(() => {
    switch (mirrorType) {
      case 'part': return availableParts
      case 'feature': return availableFeatures
      case 'face': return availableFaces
      default: return []
    }
  }, [mirrorType, availableParts, availableFeatures, availableFaces])
  
  // Toggle entity selection
  const toggleEntity = useCallback((entityId: string) => {
    setSelectedEntities(prev => {
      if (prev.includes(entityId)) {
        return prev.filter(id => id !== entityId)
      }
      return [...prev, entityId]
    })
  }, [])
  
  // Validate selections
  const checkValidity = useCallback((): { valid: boolean, message: string } => {
    if (!selectedPlane) {
      return { valid: false, message: 'Select a mirror plane' }
    }
    
    if (selectedEntities.length === 0) {
      return { valid: false, message: `Select ${mirrorType}(s) to mirror` }
    }
    
    return { valid: true, message: '' }
  }, [selectedPlane, selectedEntities, mirrorType])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    const validity = checkValidity()
    setPreviewValid(validity.valid)
    
    setDialogData({
      type: 'mirror',
      mirrorType,
      planeId: selectedPlane,
      entities: selectedEntities,
      operation,
      reapplyFeatures,
      mergeWithAll,
      mergeScope: selectedMergeScope,
      showPreview,
      previewValid: validity.valid
    })
  }, [
    mirrorType, selectedPlane, selectedEntities, operation,
    reapplyFeatures, mergeWithAll, selectedMergeScope, showPreview,
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
    
    // Build mirror parameters
    const params: Record<string, any> = {
      mirrorType,
      planeId: selectedPlane,
      entities: selectedEntities,
      operation,
      reapplyFeatures: mirrorType === 'feature' ? reapplyFeatures : false,
      mergeWithAll,
      mergeScope: !mergeWithAll ? selectedMergeScope : []
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'mirror').length + 1
    const typeLabel = mirrorType.charAt(0).toUpperCase() + mirrorType.slice(1)
    const name = `Mirror ${typeLabel} ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'mirror',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      addNotification('success', `Created ${name}`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create mirror feature')
    }
  }
  
  // Get entity icon
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'part': return <Box size={14} />
      case 'feature': return <Layers size={14} />
      case 'face': return <Square size={14} />
      default: return <Target size={14} />
    }
  }
  
  // Validation
  const validity = checkValidity()
  const isValid = validity.valid
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[480px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <FlipHorizontal size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Mirror</h2>
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
          
          {/* Mirror Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Mirror Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white p-1">
              {[
                { value: 'part', label: 'Part', icon: <Box size={14} />, desc: 'Mirror entire bodies' },
                { value: 'feature', label: 'Feature', icon: <Layers size={14} />, desc: 'Mirror feature results' },
                { value: 'face', label: 'Face', icon: <Square size={14} />, desc: 'Mirror selected faces' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setMirrorType(type.value as MirrorType)}
                  className={`
                    flex flex-col items-center gap-1 p-2 transition-colors text-xs
                    ${mirrorType === type.value 
                      ? 'bg-cad-accent text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                  title={type.desc}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-cad-text-dim italic">
              {mirrorType === 'part' ? 'Duplicates entire part bodies across the mirror plane' :
               mirrorType === 'feature' ? 'Mirrors the results of selected features' :
               'Mirrors selected faces of a part (for surfaces)'}
            </p>
          </div>
          
          {/* Mirror Plane Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Target size={12} />
              Mirror Plane
            </label>
            
            <div className="space-y-1 max-h-36 overflow-y-auto bg-white border border-cad-border p-2">
              {/* Reference Planes */}
              <p className="text-xs text-cad-text-dim mb-1 font-medium">Reference Planes:</p>
              {availablePlanes.filter(p => p.type === 'reference').map((plane) => (
                <label
                  key={plane.id}
                  className={`
                    flex items-center gap-3 p-2 cursor-pointer transition-colors
                    ${selectedPlane === plane.id
                      ? 'bg-cad-accent/20 border border-cad-accent/50'
                      : 'hover:bg-cad-panel border border-transparent'}
                  `}
                >
                  <input
                    type="radio"
                    name="mirrorPlane"
                    checked={selectedPlane === plane.id}
                    onChange={() => setSelectedPlane(plane.id)}
                    className="sr-only"
                  />
                  <div className={`
                    w-4 h-4 border-2 flex items-center justify-center transition-colors
                    ${selectedPlane === plane.id 
                      ? 'bg-cad-accent border-cad-accent' 
                      : 'border-cad-border'}
                  `}>
                    {selectedPlane === plane.id && <div className="w-2 h-2 bg-white" />}
                  </div>
                  <Square size={12} className="text-cad-accent" />
                  <span className="text-sm text-cad-text">{plane.name}</span>
                </label>
              ))}
              
              {/* Planar Faces (if parts exist) */}
              {availablePlanes.filter(p => p.type === 'face').length > 0 && (
                <>
                  <p className="text-xs text-cad-text-dim mt-2 mb-1 font-medium">Planar Faces:</p>
                  {availablePlanes.filter(p => p.type === 'face').slice(0, 6).map((plane) => (
                    <label
                      key={plane.id}
                      className={`
                        flex items-center gap-3 p-2 cursor-pointer transition-colors
                        ${selectedPlane === plane.id
                          ? 'bg-cad-accent/20 border border-cad-accent/50'
                          : 'hover:bg-cad-panel border border-transparent'}
                      `}
                    >
                      <input
                        type="radio"
                        name="mirrorPlane"
                        checked={selectedPlane === plane.id}
                        onChange={() => setSelectedPlane(plane.id)}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 border-2 flex items-center justify-center transition-colors
                        ${selectedPlane === plane.id 
                          ? 'bg-cad-accent border-cad-accent' 
                          : 'border-cad-border'}
                      `}>
                        {selectedPlane === plane.id && <div className="w-2 h-2 bg-white" />}
                      </div>
                      <Box size={12} className="text-gray-400" />
                      <span className="text-sm text-cad-text">{plane.name}</span>
                    </label>
                  ))}
                </>
              )}
            </div>
          </div>
          
          {/* Entities to Mirror */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              {getEntityIcon(mirrorType)}
              {mirrorType === 'part' ? 'Parts' : mirrorType === 'feature' ? 'Features' : 'Faces'} to Mirror
              <span className="ml-auto text-cad-accent text-[10px] normal-case">
                {selectedEntities.length} selected
              </span>
            </label>
            
            {entitiesList.length === 0 ? (
              <div className="p-4 bg-white border border-cad-border">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-cad-accent mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-cad-text font-medium">
                      No {mirrorType}s available
                    </p>
                    <p className="text-cad-accent/70 mt-1">
                      {mirrorType === 'part' 
                        ? 'Create 3D geometry first to mirror parts.'
                        : mirrorType === 'feature'
                          ? 'Add features to the part studio to mirror them.'
                          : 'Create parts with faces to mirror.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto bg-white border border-cad-border p-2">
                {entitiesList.map((entity) => (
                  <label
                    key={entity.id}
                    className={`
                      flex items-center gap-3 p-2 cursor-pointer transition-colors
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
                      w-4 h-4 border flex items-center justify-center transition-colors
                      ${selectedEntities.includes(entity.id)
                        ? 'bg-cad-accent border-cad-accent'
                        : 'border-cad-border'}
                    `}>
                      {selectedEntities.includes(entity.id) && <Check size={10} className="text-white" />}
                    </div>
                    {getEntityIcon(entity.type)}
                    <span className="text-sm text-cad-text">{entity.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* Operation Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Result Operation
            </label>
            <div className="grid grid-cols-4 gap-1 bg-white p-1">
              {[
                { value: 'new', label: 'New', icon: <Plus size={14} />, desc: 'Create new part' },
                { value: 'add', label: 'Add', icon: <Plus size={14} className="text-cad-accent" />, desc: 'Add to existing' },
                { value: 'remove', label: 'Remove', icon: <Minus size={14} className="text-cad-accent" />, desc: 'Cut from existing' },
                { value: 'intersect', label: 'Intersect', icon: <Maximize2 size={14} className="text-cad-accent" />, desc: 'Keep common' },
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
                  title={op.desc}
                >
                  {op.icon}
                  <span>{op.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-cad-text-dim italic">
              {operation === 'new' ? 'Creates a new separate part from the mirrored geometry' :
               operation === 'add' ? 'Merges mirrored geometry with existing part(s)' :
               operation === 'remove' ? 'Cuts mirrored geometry from existing part(s)' :
               'Keeps only the intersection of mirrored and existing geometry'}
            </p>
          </div>
          
          {/* Merge Scope (for add/remove/intersect) */}
          {operation !== 'new' && availableParts.length > 0 && (
            <div className="space-y-2 p-3 bg-white/50 border border-cad-border">
              <label className="flex items-center gap-2 cursor-pointer">
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
                  <p className="text-xs text-cad-text-dim">Select parts to merge with:</p>
                  {availableParts.map((part) => (
                    <label
                      key={part.id}
                      className="flex items-center gap-2 p-1 hover:bg-cad-panel cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMergeScope.includes(part.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMergeScope(prev => [...prev, part.id])
                          } else {
                            setSelectedMergeScope(prev => prev.filter(id => id !== part.id))
                          }
                        }}
                        className="w-3 h-3 border-cad-border bg-white"
                      />
                      <span className="text-xs text-cad-text">{part.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Advanced Options (Collapsible) */}
          {mirrorType === 'feature' && (
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
                      checked={reapplyFeatures}
                      onChange={(e) => setReapplyFeatures(e.target.checked)}
                      className="w-4 h-4 border-cad-border bg-white"
                    />
                    <span className="text-sm text-cad-text flex items-center gap-2">
                      <RefreshCw size={14} className={reapplyFeatures ? 'text-cad-accent' : ''} />
                      Reapply Features
                    </span>
                  </label>
                  <p className="text-xs text-cad-text-dim pl-6 -mt-1">
                    Re-evaluate feature references symmetrically on the mirrored side.
                    Enable this if features have external references that need to adapt.
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
            {showPreview && !previewValid && (
              <span className="text-xs text-cad-accent flex items-center gap-1">
                <AlertTriangle size={12} />
                Preview unavailable
              </span>
            )}
          </div>
          
          {/* Visual Representation */}
          <div className="p-3 bg-white border border-cad-border">
            <div className="flex items-center justify-center">
              <svg width="200" height="80" viewBox="0 0 200 80">
                {/* Mirror plane */}
                <line 
                  x1="100" y1="5" x2="100" y2="75" 
                  stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2"
                />
                <text x="100" y="85" fill="#6366f1" fontSize="8" textAnchor="middle">
                  Mirror Plane
                </text>
                
                {/* Original geometry */}
                <rect 
                  x="20" y="20" width="60" height="40" 
                  fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="1"
                />
                <text x="50" y="45" fill="#6366f1" fontSize="9" textAnchor="middle">
                  Original
                </text>
                
                {/* Mirrored geometry */}
                <rect 
                  x="120" y="20" width="60" height="40" 
                  fill="#1a4d8f" fillOpacity="0.3" stroke="#1a4d8f" strokeWidth="1"
                />
                <text x="150" y="45" fill="#1a4d8f" fontSize="9" textAnchor="middle">
                  Mirrored
                </text>
                
                {/* Mirror arrows */}
                <path 
                  d="M 85 40 L 75 35 L 75 45 Z" 
                  fill="#6366f1"
                />
                <path 
                  d="M 115 40 L 125 35 L 125 45 Z" 
                  fill="#1a4d8f"
                />
              </svg>
            </div>
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-white border border-cad-border">
            <h4 className="text-xs font-medium text-cad-text mb-2">Summary</h4>
            <ul className="text-xs text-cad-text space-y-1">
              <li>• Mirror Type: {mirrorType.charAt(0).toUpperCase() + mirrorType.slice(1)}</li>
              <li>• Plane: {availablePlanes.find(p => p.id === selectedPlane)?.name || 'None'}</li>
              <li>• Entities: {selectedEntities.length} selected</li>
              <li>• Operation: {operation.charAt(0).toUpperCase() + operation.slice(1)}</li>
              {mirrorType === 'feature' && reapplyFeatures && <li>• Reapply features enabled</li>}
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

