/**
 * LinearPatternDialog - Repeat the current body along one or two directions
 *
 * cad-server's /pattern/linear always operates on the whole current body and always
 * fuses every copy together — there's no per-part/per-feature/per-face subset, no skip-
 * instances, no centered/reapply option, and no new/add/remove/intersect result choice
 * (see regenerateModel's 'linearPattern' case in documentStore.ts). An earlier version of
 * this dialog offered all of those and regenerateModel silently ignored them; this
 * version only exposes controls that actually change the result.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  X,
  Grid3X3,
  Plus,
  Minus,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowDown,
  FlipHorizontal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

interface DirectionInfo {
  id: string
  name: string
  group: 'axis' | 'edge' | 'face'
}

export function LinearPatternDialog() {
  const { closeDialog, addNotification, setDialogData } = useUIStore()
  const { document } = useDocumentStore()

  const activePartStudio = useMemo(() =>
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )

  const availableParts = useMemo(() => activePartStudio?.parts || [], [activePartStudio])

  // Real edges and faces from the modeling engine — matches resolvePatternDirectionVector's
  // resolution order in documentStore.ts (world axis -> real edge tangent -> real face normal).
  const availableDirections = useMemo((): DirectionInfo[] => {
    const directions: DirectionInfo[] = [
      { id: 'x-axis', name: 'X Axis', group: 'axis' },
      { id: 'y-axis', name: 'Y Axis', group: 'axis' },
      { id: 'z-axis', name: 'Z Axis', group: 'axis' },
    ]
    availableParts.forEach((part) => {
      ;(part.edges || []).forEach((edge) => {
        const index = parseInt(edge.edgeId.replace(/^e/, ''), 10)
        directions.push({ id: `${part.id}-edge-${index}`, name: `${part.name} — Edge ${index + 1}`, group: 'edge' })
      })
      ;(part.faces || []).forEach((face) => {
        const index = parseInt(face.faceId.replace(/^f/, ''), 10)
        directions.push({ id: `${part.id}-face-${index}`, name: `${part.name} — Face ${index + 1} normal`, group: 'face' })
      })
    })
    return directions
  }, [availableParts])

  const [direction1, setDirection1] = useState<string | null>('x-axis')
  const [spacing1, setSpacing1] = useState(20)
  const [count1, setCount1] = useState(3)
  const [flip1, setFlip1] = useState(false)

  const [useDirection2, setUseDirection2] = useState(false)
  const [direction2, setDirection2] = useState<string | null>('y-axis')
  const [spacing2, setSpacing2] = useState(20)
  const [count2, setCount2] = useState(3)
  const [flip2, setFlip2] = useState(false)

  const [advancedExpanded, setAdvancedExpanded] = useState(false)

  const totalInstances = useMemo(() => count1 * (useDirection2 ? count2 : 1), [count1, count2, useDirection2])

  const checkValidity = useCallback((): { valid: boolean; message: string } => {
    if (!activePartStudio?.parts?.length) return { valid: false, message: 'No body to pattern' }
    if (!direction1) return { valid: false, message: 'Select a direction' }
    if (count1 < 2) return { valid: false, message: 'Instance count must be at least 2' }
    if (spacing1 <= 0) return { valid: false, message: 'Spacing must be positive' }
    if (useDirection2) {
      if (!direction2) return { valid: false, message: 'Select second direction' }
      if (count2 < 2) return { valid: false, message: 'Second direction count must be at least 2' }
      if (spacing2 <= 0) return { valid: false, message: 'Second spacing must be positive' }
    }
    return { valid: true, message: '' }
  }, [activePartStudio, direction1, count1, spacing1, useDirection2, direction2, count2, spacing2])

  useEffect(() => {
    const validity = checkValidity()
    setDialogData({
      type: 'linearPattern',
      direction1, spacing1, count1, flip1,
      useDirection2, direction2, spacing2, count2, flip2,
      previewValid: validity.valid,
    })
  }, [direction1, spacing1, count1, flip1, useDirection2, direction2, spacing2, count2, flip2, checkValidity, setDialogData])

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

    const params = {
      direction1, spacing1, count1, flip1,
      useDirection2,
      direction2: useDirection2 ? direction2 : null,
      spacing2: useDirection2 ? spacing2 : 0,
      count2: useDirection2 ? count2 : 1,
      flip2,
    }

    const featureCount = activePartStudio.features.filter(f => f.type === 'linearPattern').length + 1
    const name = `Linear Pattern ${featureCount}`

    const feature = await useDocumentStore.getState().submitFeature(activePartStudio.id, {
      type: 'linearPattern',
      name,
      suppressed: false,
      parameters: params,
    }, useUIStore.getState().dialogData)

    if (feature) {
      addNotification('success', `Created ${name} with ${totalInstances} instances`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create linear pattern')
    }
  }

  const validity = checkValidity()
  const isValid = validity.valid

  const renderDirectionSelect = (
    value: string | null, onChange: (v: string) => void
  ) => (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm"
    >
      <option value="">Select direction...</option>
      <optgroup label="Reference Axes">
        {availableDirections.filter(d => d.group === 'axis').map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </optgroup>
      {availableDirections.filter(d => d.group === 'edge').length > 0 && (
        <optgroup label="Edges">
          {availableDirections.filter(d => d.group === 'edge').map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </optgroup>
      )}
      {availableDirections.filter(d => d.group === 'face').length > 0 && (
        <optgroup label="Face Normals">
          {availableDirections.filter(d => d.group === 'face').map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </optgroup>
      )}
    </select>
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[480px] mb-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <Grid3X3 size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Linear Pattern</h2>
          </div>
          <button onClick={closeDialog} className="p-1.5 hover:bg-cad-panel transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-cad-text-dim italic">
            Repeats the current body and fuses every copy together.
          </p>

          <div className="p-3 bg-white/50 border border-cad-border space-y-3">
            <div className="flex items-center gap-2">
              <ArrowRight size={14} className="text-cad-accent" />
              <span className="text-sm font-medium text-cad-text">Direction 1</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Direction</label>
                {renderDirectionSelect(direction1, setDirection1)}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Flip</label>
                <button
                  onClick={() => setFlip1(!flip1)}
                  className={`
                    w-full px-2 py-1.5 border text-sm flex items-center justify-center gap-2
                    ${flip1 ? 'bg-cad-accent/20 border-cad-accent/50 text-cad-accent' : 'bg-white border-cad-border text-cad-text-dim hover:bg-cad-panel'}
                  `}
                >
                  <FlipHorizontal size={14} />
                  {flip1 ? 'Flipped' : 'Normal'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Spacing (mm)</label>
                <input
                  type="number" value={spacing1} min={0.1} step={5}
                  onChange={(e) => setSpacing1(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Count (incl. seed)</label>
                <div className="flex gap-1">
                  <input
                    type="number" value={count1} min={2} max={100}
                    onChange={(e) => setCount1(parseInt(e.target.value) || 2)}
                    className="flex-1 px-2 py-1.5 bg-white border border-cad-border text-sm"
                  />
                  <button onClick={() => setCount1(Math.max(2, count1 - 1))} className="px-2 bg-white border border-cad-border hover:bg-cad-panel">
                    <Minus size={12} />
                  </button>
                  <button onClick={() => setCount1(Math.min(100, count1 + 1))} className="px-2 bg-white border border-cad-border hover:bg-cad-panel">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-cad-border overflow-hidden">
            <button
              onClick={() => setUseDirection2(!useDirection2)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/50 hover:bg-cad-panel transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" checked={useDirection2}
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
                    {renderDirectionSelect(direction2, setDirection2)}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-cad-text-dim">Flip</label>
                    <button
                      onClick={() => setFlip2(!flip2)}
                      className={`
                        w-full px-2 py-1.5 border text-sm flex items-center justify-center gap-2
                        ${flip2 ? 'bg-cad-accent/20 border-cad-accent/50 text-cad-accent' : 'bg-white border-cad-border text-cad-text-dim hover:bg-cad-panel'}
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
                      type="number" value={spacing2} min={0.1} step={5}
                      onChange={(e) => setSpacing2(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-cad-text-dim">Count</label>
                    <div className="flex gap-1">
                      <input
                        type="number" value={count2} min={2} max={100}
                        onChange={(e) => setCount2(parseInt(e.target.value) || 2)}
                        className="flex-1 px-2 py-1.5 bg-white border border-cad-border text-sm"
                      />
                      <button onClick={() => setCount2(Math.max(2, count2 - 1))} className="px-2 bg-white border border-cad-border hover:bg-cad-panel">
                        <Minus size={12} />
                      </button>
                      <button onClick={() => setCount2(Math.min(100, count2 + 1))} className="px-2 bg-white border border-cad-border hover:bg-cad-panel">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border border-cad-border">
            <h4 className="text-xs font-medium text-cad-text mb-2">Summary</h4>
            <ul className="text-xs text-cad-text space-y-1">
              <li>• Direction 1: {count1} × {spacing1}mm</li>
              {useDirection2 && <li>• Direction 2: {count2} × {spacing2}mm</li>}
              <li>• Total: {totalInstances} instances</li>
            </ul>
          </div>
        </div>

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
            <button onClick={closeDialog} className="px-4 py-2 text-sm bg-cad-panel hover:bg-cad-border transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!isValid}
              className={`
                px-4 py-2 text-sm transition-colors flex items-center gap-2
                ${isValid ? 'bg-cad-accent hover:bg-cad-accent-hover text-white' : 'bg-cad-border text-cad-text-dim cursor-not-allowed'}
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
