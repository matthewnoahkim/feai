/**
 * CircularPatternDialog - Repeat the current body around an axis
 *
 * cad-server's /pattern/circular always operates on the whole current body and always
 * fuses every copy together — there's no per-part/per-feature/per-face subset, no skip-
 * instances, no start-angle offset, and no new/add/remove/intersect result choice (see
 * regenerateModel's 'circularPattern' case in documentStore.ts). This dialog only exposes
 * controls that actually change the result.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  X,
  Circle,
  Plus,
  Minus,
  Check,
  AlertCircle,
  RotateCw,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

interface AxisInfo {
  id: string
  name: string
  group: 'axis' | 'face'
}

export function CircularPatternDialog() {
  const { closeDialog, addNotification, setDialogData } = useUIStore()
  const { document } = useDocumentStore()

  const activePartStudio = useMemo(() =>
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )

  const availableParts = useMemo(() => activePartStudio?.parts || [], [activePartStudio])

  // Real faces from the modeling engine — matches resolvePatternAxis's resolution order
  // in documentStore.ts (world axis around the body's own center -> a real face's own
  // centroid/normal, e.g. picking a cylindrical boss's flat end cap).
  const availableAxes = useMemo((): AxisInfo[] => {
    const axes: AxisInfo[] = [
      { id: 'x-axis', name: 'X Axis (through body center)', group: 'axis' },
      { id: 'y-axis', name: 'Y Axis (through body center)', group: 'axis' },
      { id: 'z-axis', name: 'Z Axis (through body center)', group: 'axis' },
    ]
    availableParts.forEach((part) => {
      ;(part.faces || []).forEach((face) => {
        const index = parseInt(face.faceId.replace(/^f/, ''), 10)
        axes.push({ id: `${part.id}-face-${index}`, name: `${part.name} — Face ${index + 1} normal`, group: 'face' })
      })
    })
    return axes
  }, [availableParts])

  const [selectedAxis, setSelectedAxis] = useState<string | null>('z-axis')
  const [fullCircle, setFullCircle] = useState(true)
  const [totalAngle, setTotalAngle] = useState(360)
  const [instanceCount, setInstanceCount] = useState(6)

  useEffect(() => {
    if (fullCircle) setTotalAngle(360)
  }, [fullCircle])

  const angularSpacing = useMemo(() => (instanceCount <= 1 ? 0 : totalAngle / instanceCount), [totalAngle, instanceCount])

  const checkValidity = useCallback((): { valid: boolean; message: string } => {
    if (!activePartStudio?.parts?.length) return { valid: false, message: 'No body to pattern' }
    if (!selectedAxis) return { valid: false, message: 'Select a rotation axis' }
    if (instanceCount < 2) return { valid: false, message: 'Instance count must be at least 2' }
    if (!fullCircle && totalAngle <= 0) return { valid: false, message: 'Angle must be positive' }
    return { valid: true, message: '' }
  }, [activePartStudio, selectedAxis, instanceCount, fullCircle, totalAngle])

  useEffect(() => {
    const validity = checkValidity()
    setDialogData({
      type: 'circularPattern',
      axis: selectedAxis,
      fullCircle,
      totalAngle,
      instanceCount,
      previewValid: validity.valid,
    })
  }, [selectedAxis, fullCircle, totalAngle, instanceCount, checkValidity, setDialogData])

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

    const params = { axis: selectedAxis, fullCircle, totalAngle, instanceCount }
    const featureCount = activePartStudio.features.filter(f => f.type === 'circularPattern').length + 1
    const name = `Circular Pattern ${featureCount}`

    const feature = await useDocumentStore.getState().submitFeature(activePartStudio.id, {
      type: 'circularPattern',
      name,
      suppressed: false,
      parameters: params,
    }, useUIStore.getState().dialogData)

    if (feature) {
      addNotification('success', `Created ${name} with ${instanceCount} instances`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create circular pattern')
    }
  }

  const validity = checkValidity()
  const isValid = validity.valid

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[440px] mb-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <RotateCw size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Circular Pattern</h2>
          </div>
          <button onClick={closeDialog} className="p-1.5 hover:bg-cad-panel transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-cad-text-dim italic">
            Repeats the current body around an axis and fuses every copy together.
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Circle size={12} />
              Pattern Axis
            </label>
            <select
              value={selectedAxis || ''}
              onChange={(e) => setSelectedAxis(e.target.value || null)}
              className="w-full px-3 py-2 bg-white border border-cad-border text-sm"
            >
              <option value="">Select axis...</option>
              <optgroup label="Reference Axes">
                {availableAxes.filter(a => a.group === 'axis').map(axis => (
                  <option key={axis.id} value={axis.id}>{axis.name}</option>
                ))}
              </optgroup>
              {availableAxes.filter(a => a.group === 'face').length > 0 && (
                <optgroup label="Face Normals">
                  {availableAxes.filter(a => a.group === 'face').map(axis => (
                    <option key={axis.id} value={axis.id}>{axis.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="p-3 bg-white/50 border border-cad-border space-y-3">
            <div className="flex items-center gap-2">
              <RotateCw size={14} className="text-cad-accent" />
              <span className="text-sm font-medium text-cad-text">Rotation Settings</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={fullCircle}
                onChange={(e) => setFullCircle(e.target.checked)}
                className="w-4 h-4 border-cad-border bg-white"
              />
              <span className="text-sm text-cad-text">Full Circle (360°)</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">
                  {fullCircle ? 'Total Angle' : 'Arc Angle'} (°)
                </label>
                <input
                  type="number" value={totalAngle} disabled={fullCircle} min={1} max={360} step={15}
                  onChange={(e) => setTotalAngle(parseFloat(e.target.value) || 0)}
                  className={`w-full px-2 py-1.5 bg-white border border-cad-border text-sm ${fullCircle ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-cad-text-dim">Count (incl. seed)</label>
                <div className="flex gap-1">
                  <input
                    type="number" value={instanceCount} min={2} max={100}
                    onChange={(e) => setInstanceCount(parseInt(e.target.value) || 2)}
                    className="flex-1 px-2 py-1.5 bg-white border border-cad-border text-sm"
                  />
                  <button onClick={() => setInstanceCount(Math.max(2, instanceCount - 1))} className="px-2 bg-white border border-cad-border hover:bg-cad-panel">
                    <Minus size={12} />
                  </button>
                  <button onClick={() => setInstanceCount(Math.min(100, instanceCount + 1))} className="px-2 bg-white border border-cad-border hover:bg-cad-panel">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-cad-text-dim">
              {angularSpacing.toFixed(1)}° between instances
            </div>
          </div>

          <div className="p-3 bg-white border border-cad-border">
            <h4 className="text-xs font-medium text-cad-text mb-2">Summary</h4>
            <ul className="text-xs text-cad-text space-y-1">
              <li>• Axis: {availableAxes.find(a => a.id === selectedAxis)?.name || 'None'}</li>
              <li>• Angle: {totalAngle}° ({fullCircle ? 'full circle' : 'partial arc'})</li>
              <li>• Total: {instanceCount} instances</li>
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
