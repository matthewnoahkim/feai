/**
 * ShellDialog - Professional CAD-style shell feature dialog
 * 
 * Provides comprehensive options for hollowing solid bodies:
 * - Face selection for removal (openings)
 * - Wall thickness specification
 * - Multi-thickness overrides for specific faces
 * - Shell direction (inward/outward)
 * - Preview with validation
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  X, 
  Box,
  Square,
  Check,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore, Part } from '../../store/documentStore'

// Shell direction
type ShellDirection = 'inward' | 'outward' | 'both'

// Face info for selection
interface FaceInfo {
  partId: string
  partName: string
  faceId: string
  faceLabel: string
  isRemoved: boolean
  customThickness?: number
}

// Multi-thickness override
interface ThicknessOverride {
  faceId: string
  faceLabel: string
  thickness: number
}

export function ShellDialog() {
  const { closeDialog, dialogData, addNotification, selection, setDialogData } = useUIStore()
  const { document, addFeature } = useDocumentStore()
  
  // Get active part studio
  const activePartStudio = useMemo(() => 
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )
  
  // Get available parts (bodies that can be shelled)
  const availableParts = useMemo(() => {
    if (!activePartStudio) return []
    return activePartStudio.parts || []
  }, [activePartStudio])
  
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
          isRemoved: false
        })
      })
    })
    return faces
  }, [availableParts])
  
  // State for shell parameters
  const [thickness, setThickness] = useState(2)
  const [direction, setDirection] = useState<ShellDirection>('inward')
  const [facesToRemove, setFacesToRemove] = useState<string[]>([])
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  
  // Multi-thickness overrides
  const [useMultiThickness, setUseMultiThickness] = useState(false)
  const [thicknessOverrides, setThicknessOverrides] = useState<ThicknessOverride[]>([])
  
  // Preview state
  const [showPreview, setShowPreview] = useState(true)
  const [previewValid, setPreviewValid] = useState(true)
  
  // Advanced options expanded
  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  
  // Auto-select first part if only one exists
  useEffect(() => {
    if (availableParts.length === 1 && !selectedPart) {
      setSelectedPart(availableParts[0].id)
    }
  }, [availableParts, selectedPart])
  
  // Get faces for selected part
  const partFaces = useMemo(() => {
    if (!selectedPart) return []
    return availableFaces.filter(f => f.partId === selectedPart)
  }, [selectedPart, availableFaces])
  
  // Toggle face removal
  const toggleFaceRemoval = useCallback((faceId: string) => {
    setFacesToRemove(prev => {
      if (prev.includes(faceId)) {
        return prev.filter(id => id !== faceId)
      }
      return [...prev, faceId]
    })
  }, [])
  
  // Add thickness override
  const addThicknessOverride = useCallback((faceId: string, faceLabel: string) => {
    if (!thicknessOverrides.find(o => o.faceId === faceId)) {
      setThicknessOverrides(prev => [
        ...prev,
        { faceId, faceLabel, thickness: thickness }
      ])
    }
  }, [thickness, thicknessOverrides])
  
  // Remove thickness override
  const removeThicknessOverride = useCallback((faceId: string) => {
    setThicknessOverrides(prev => prev.filter(o => o.faceId !== faceId))
  }, [])
  
  // Update override thickness
  const updateOverrideThickness = useCallback((faceId: string, newThickness: number) => {
    setThicknessOverrides(prev => prev.map(o => 
      o.faceId === faceId ? { ...o, thickness: newThickness } : o
    ))
  }, [])
  
  // Validate thickness
  const validateThickness = useCallback((): boolean => {
    if (thickness <= 0) return false
    if (thickness > 50) return false // Arbitrary max for demo
    return true
  }, [thickness])
  
  // Check if shell would fail (thickness too large)
  const checkShellValidity = useCallback((): { valid: boolean, message: string } => {
    if (!selectedPart) {
      return { valid: false, message: 'Select a part to shell' }
    }
    
    if (facesToRemove.length === 0) {
      return { valid: false, message: 'Select at least one face to remove' }
    }
    
    if (!validateThickness()) {
      return { valid: false, message: 'Invalid wall thickness' }
    }
    
    // Check if all faces of a part are being removed (would fail)
    const partFaceCount = partFaces.length
    if (facesToRemove.length >= partFaceCount) {
      return { valid: false, message: 'Cannot remove all faces' }
    }
    
    return { valid: true, message: '' }
  }, [selectedPart, facesToRemove, validateThickness, partFaces])
  
  // Update dialogData for real-time preview
  useEffect(() => {
    const validity = checkShellValidity()
    setPreviewValid(validity.valid)
    
    setDialogData({
      type: 'shell',
      partId: selectedPart,
      thickness,
      direction,
      facesToRemove,
      thicknessOverrides: useMultiThickness ? thicknessOverrides : [],
      showPreview,
      previewValid: validity.valid
    })
  }, [
    selectedPart, thickness, direction, facesToRemove,
    useMultiThickness, thicknessOverrides, showPreview,
    checkShellValidity, setDialogData
  ])
  
  // Handle create
  const handleCreate = async () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    
    const validity = checkShellValidity()
    if (!validity.valid) {
      addNotification('error', validity.message)
      return
    }
    
    // Build shell parameters
    const params: Record<string, any> = {
      partId: selectedPart,
      thickness,
      direction,
      facesToRemove,
      thicknessOverrides: useMultiThickness ? thicknessOverrides : []
    }
    
    const featureCount = activePartStudio.features.filter(f => f.type === 'shell').length + 1
    const name = `Shell ${featureCount}`
    
    const feature = await addFeature(activePartStudio.id, {
      type: 'shell',
      name,
      suppressed: false,
      parameters: params
    })
    
    if (feature) {
      addNotification('success', `Created ${name} with ${thickness}mm wall thickness`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create shell feature')
    }
  }
  
  // Get face icon based on label
  const getFaceIcon = (label: string) => {
    return <Square size={12} />
  }
  
  // Validation
  const validity = checkShellValidity()
  const isValid = validity.valid
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-cad-dark border border-cad-border rounded-lg shadow-2xl w-[460px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-gradient-to-r from-pink-900/30 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-500/20 rounded flex items-center justify-center">
              <Box size={14} className="text-pink-400" />
            </div>
            <h2 className="font-semibold text-cad-text">Shell</h2>
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
          
          {/* Part Selection */}
          {availableParts.length > 1 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                Select Part to Shell
              </label>
              <div className="space-y-1 bg-cad-darker rounded-lg border border-cad-border p-2">
                {availableParts.map((part) => (
                  <label
                    key={part.id}
                    className={`
                      flex items-center gap-3 p-2 rounded cursor-pointer transition-colors
                      ${selectedPart === part.id
                        ? 'bg-pink-500/20 border border-pink-500/50'
                        : 'hover:bg-cad-panel border border-transparent'}
                    `}
                  >
                    <input
                      type="radio"
                      name="partSelection"
                      checked={selectedPart === part.id}
                      onChange={() => {
                        setSelectedPart(part.id)
                        setFacesToRemove([])
                      }}
                      className="sr-only"
                    />
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                      ${selectedPart === part.id 
                        ? 'bg-pink-500 border-pink-500' 
                        : 'border-cad-border'}
                    `}>
                      {selectedPart === part.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <Box size={14} className="text-cad-text-dim" />
                    <span className="text-sm text-cad-text">{part.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* No Parts Warning */}
          {availableParts.length === 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-300 font-medium">No parts found</p>
                  <p className="text-amber-400/70 mt-1">
                    Create 3D geometry (extrude, revolve, etc.) first to use the shell feature.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Wall Thickness */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Wall Thickness (mm)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={thickness}
                onChange={(e) => setThickness(parseFloat(e.target.value) || 0)}
                min={0.1}
                step={0.5}
                className={`
                  flex-1 px-3 py-2 bg-cad-darker border rounded text-sm focus:border-cad-accent
                  ${validateThickness() ? 'border-cad-border' : 'border-red-500'}
                `}
              />
              <button
                onClick={() => setThickness(prev => Math.max(0.1, prev - 0.5))}
                className="px-3 py-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
              >
                -
              </button>
              <button
                onClick={() => setThickness(prev => prev + 0.5)}
                className="px-3 py-2 bg-cad-darker border border-cad-border rounded hover:bg-cad-panel"
              >
                +
              </button>
            </div>
            {!validateThickness() && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                Thickness must be positive and reasonable
              </p>
            )}
          </div>
          
          {/* Faces to Remove */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Faces to Remove (Openings)
              <span className="ml-auto text-pink-400 text-[10px] normal-case">
                {facesToRemove.length} selected
              </span>
            </label>
            
            {selectedPart ? (
              <div className="space-y-1 max-h-40 overflow-y-auto bg-cad-darker rounded-lg border border-cad-border p-2">
                <p className="text-xs text-cad-text-dim mb-2">
                  Select faces to create openings in the shell:
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {partFaces.map((face) => (
                    <label
                      key={face.faceId}
                      className={`
                        flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-xs
                        ${facesToRemove.includes(face.faceId)
                          ? 'bg-pink-500/30 border border-pink-500/50'
                          : 'hover:bg-cad-panel border border-transparent'}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={facesToRemove.includes(face.faceId)}
                        onChange={() => toggleFaceRemoval(face.faceId)}
                        className="sr-only"
                      />
                      <div className={`
                        w-3 h-3 rounded border flex items-center justify-center transition-colors
                        ${facesToRemove.includes(face.faceId)
                          ? 'bg-pink-500 border-pink-500'
                          : 'border-cad-border'}
                      `}>
                        {facesToRemove.includes(face.faceId) && <X size={8} className="text-white" />}
                      </div>
                      <span className={`text-cad-text ${facesToRemove.includes(face.faceId) ? 'line-through opacity-60' : ''}`}>
                        {face.faceLabel}
                      </span>
                    </label>
                  ))}
                </div>
                
                {facesToRemove.length === 0 && (
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Select at least one face for the shell opening
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-cad-darker rounded-lg border border-cad-border">
                <p className="text-xs text-cad-text-dim">
                  Select a part first to see available faces
                </p>
              </div>
            )}
          </div>
          
          {/* Shell Direction */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Shell Direction
            </label>
            <div className="grid grid-cols-3 gap-1 bg-cad-darker p-1 rounded-lg">
              {[
                { value: 'inward', label: 'Inward', icon: <ArrowDownToLine size={14} />, desc: 'Hollow inside' },
                { value: 'outward', label: 'Outward', icon: <ArrowUpFromLine size={14} />, desc: 'Expand outside' },
                { value: 'both', label: 'Both Sides', icon: <Layers size={14} />, desc: 'Split thickness' },
              ].map((dir) => (
                <button
                  key={dir.value}
                  onClick={() => setDirection(dir.value as ShellDirection)}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded transition-colors text-xs
                    ${direction === dir.value 
                      ? 'bg-pink-500 text-white' 
                      : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                  title={dir.desc}
                >
                  {dir.icon}
                  <span>{dir.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-cad-text-dim italic">
              {direction === 'inward' ? 'Material removed from inside, walls offset inward' :
               direction === 'outward' ? 'Part expands outward by wall thickness' :
               'Walls created on both sides of original surfaces'}
            </p>
          </div>
          
          {/* Visual Representation */}
          <div className="p-3 bg-cad-darker rounded-lg border border-cad-border">
            <div className="flex items-center justify-center">
              <svg width="180" height="100" viewBox="0 0 180 100">
                {/* Original solid outline */}
                <rect 
                  x="20" y="20" width="140" height="60" 
                  fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4,2"
                />
                
                {/* Shell wall - left */}
                <rect 
                  x={direction === 'outward' ? 10 : 20} 
                  y={direction === 'outward' ? 10 : 20} 
                  width={thickness * 3} 
                  height={direction === 'outward' ? 80 : 60}
                  fill="#ec4899" fillOpacity="0.3" stroke="#ec4899" strokeWidth="1"
                />
                
                {/* Shell wall - right */}
                <rect 
                  x={direction === 'outward' ? 160 - thickness * 3 + 10 : 160 - thickness * 3} 
                  y={direction === 'outward' ? 10 : 20} 
                  width={thickness * 3} 
                  height={direction === 'outward' ? 80 : 60}
                  fill="#ec4899" fillOpacity="0.3" stroke="#ec4899" strokeWidth="1"
                />
                
                {/* Shell wall - bottom */}
                <rect 
                  x={direction === 'outward' ? 10 : 20} 
                  y={direction === 'outward' ? 90 - thickness * 3 : 80 - thickness * 3}
                  width={direction === 'outward' ? 160 : 140} 
                  height={thickness * 3}
                  fill="#ec4899" fillOpacity="0.3" stroke="#ec4899" strokeWidth="1"
                />
                
                {/* Removed face indicator (top) */}
                {facesToRemove.some(f => f.includes('face-0')) && (
                  <g>
                    <line x1="20" y1="20" x2="160" y2="20" stroke="#ec4899" strokeWidth="2" strokeDasharray="6,3" />
                    <text x="90" y="12" fill="#ec4899" fontSize="8" textAnchor="middle">OPEN</text>
                  </g>
                )}
                
                {/* Thickness label */}
                <g transform="translate(25, 50)">
                  <line x1="0" y1="0" x2={thickness * 3} y2="0" stroke="#ec4899" strokeWidth="1" />
                  <line x1="0" y1="-3" x2="0" y2="3" stroke="#ec4899" strokeWidth="1" />
                  <line x1={thickness * 3} y1="-3" x2={thickness * 3} y2="3" stroke="#ec4899" strokeWidth="1" />
                  <text x={thickness * 1.5} y="12" fill="#ec4899" fontSize="8" textAnchor="middle">{thickness}mm</text>
                </g>
                
                {/* Interior hollow area */}
                <rect 
                  x={20 + thickness * 3} 
                  y={20 + (facesToRemove.some(f => f.includes('face-0')) ? 0 : thickness * 3)} 
                  width={140 - thickness * 6} 
                  height={60 - thickness * 3 - (facesToRemove.some(f => f.includes('face-0')) ? 0 : thickness * 3)}
                  fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2"
                />
                <text 
                  x="90" y="55" 
                  fill="#64748b" fontSize="10" textAnchor="middle"
                >
                  Hollow
                </text>
              </svg>
            </div>
          </div>
          
          {/* Advanced Options (Collapsible) */}
          <div className="border border-cad-border rounded-lg overflow-hidden">
            <button
              onClick={() => setAdvancedExpanded(!advancedExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 bg-cad-darker/50 hover:bg-cad-panel transition-colors"
            >
              <span className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                Multi-Thickness Options
              </span>
              {advancedExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {advancedExpanded && (
              <div className="p-3 space-y-3 border-t border-cad-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMultiThickness}
                    onChange={(e) => setUseMultiThickness(e.target.checked)}
                    className="w-4 h-4 rounded border-cad-border bg-cad-darker"
                  />
                  <span className="text-sm text-cad-text">Use different thickness for specific faces</span>
                </label>
                
                {useMultiThickness && (
                  <div className="space-y-2">
                    <p className="text-xs text-cad-text-dim">
                      Select faces to override their wall thickness:
                    </p>
                    
                    {/* Existing overrides */}
                    {thicknessOverrides.map((override) => (
                      <div 
                        key={override.faceId}
                        className="flex items-center gap-2 p-2 bg-pink-500/10 rounded border border-pink-500/30"
                      >
                        <span className="text-xs text-cad-text flex-1">{override.faceLabel}</span>
                        <input
                          type="number"
                          value={override.thickness}
                          onChange={(e) => updateOverrideThickness(override.faceId, parseFloat(e.target.value) || 0)}
                          min={0.1}
                          step={0.5}
                          className="w-20 px-2 py-1 bg-cad-darker border border-cad-border rounded text-xs"
                        />
                        <span className="text-xs text-cad-text-dim">mm</span>
                        <button
                          onClick={() => removeThicknessOverride(override.faceId)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add new override */}
                    {partFaces.filter(f => 
                      !facesToRemove.includes(f.faceId) && 
                      !thicknessOverrides.find(o => o.faceId === f.faceId)
                    ).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-cad-text-dim w-full mb-1">Add override:</span>
                        {partFaces.filter(f => 
                          !facesToRemove.includes(f.faceId) && 
                          !thicknessOverrides.find(o => o.faceId === f.faceId)
                        ).map((face) => (
                          <button
                            key={face.faceId}
                            onClick={() => addThicknessOverride(face.faceId, face.faceLabel)}
                            className="px-2 py-1 text-xs bg-cad-darker border border-cad-border rounded hover:border-pink-500/50 hover:bg-pink-500/10"
                          >
                            + {face.faceLabel}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
          <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/30">
            <h4 className="text-xs font-medium text-pink-300 mb-2">Summary</h4>
            <ul className="text-xs text-pink-200/70 space-y-1">
              <li>• Part: {availableParts.find(p => p.id === selectedPart)?.name || 'None selected'}</li>
              <li>• Wall Thickness: {thickness} mm</li>
              <li>• Direction: {direction.charAt(0).toUpperCase() + direction.slice(1)}</li>
              <li>• Faces to Remove: {facesToRemove.length > 0 
                ? partFaces.filter(f => facesToRemove.includes(f.faceId)).map(f => f.faceLabel).join(', ')
                : 'None'}</li>
              {useMultiThickness && thicknessOverrides.length > 0 && (
                <li>• Thickness Overrides: {thicknessOverrides.length}</li>
              )}
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
                  ? 'bg-pink-500 hover:bg-pink-600 text-white' 
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

