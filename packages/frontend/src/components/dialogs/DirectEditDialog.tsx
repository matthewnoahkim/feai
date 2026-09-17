/**
 * DirectEditDialog - Push/pull a single flat face of the current body
 *
 * There's no real "move this face and rebuild its neighbors" primitive in the modeling
 * engine (see freecad_ops.py's do_direct_edit) — this is scoped to a single planar face,
 * extruded along its own normal and fused/cut onto the body. A curved face is rejected
 * by the server with a clear error rather than silently doing the wrong thing.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Check, AlertCircle, Square, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

type PushPull = 'push' | 'pull'

interface FaceInfo {
  partId: string
  partName: string
  faceId: string
  faceLabel: string
}

export function DirectEditDialog() {
  const { closeDialog, addNotification, selection, setDialogData, setPickFilter } = useUIStore()
  const { document } = useDocumentStore()

  const activePartStudio = useMemo(() =>
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )

  const availableParts = useMemo(() => activePartStudio?.parts || [], [activePartStudio])

  // Real B-rep faces from the modeling engine (part.faces), same <partId>-face-<N>
  // addressing PartFaces uses in the viewport and Shell/Fillet's dialogs already use.
  const availableFaces = useMemo(() => {
    const faces: FaceInfo[] = []
    availableParts.forEach((part) => {
      ;(part.faces || []).forEach((face) => {
        const index = parseInt(face.faceId.replace(/^f/, ''), 10)
        faces.push({
          partId: part.id,
          partName: part.name,
          faceId: `${part.id}-face-${index}`,
          faceLabel: `${part.name} — Face ${index + 1}`,
        })
      })
    })
    return faces
  }, [availableParts])

  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null)
  const [pushPull, setPushPull] = useState<PushPull>('push')
  const [magnitude, setMagnitude] = useState(5)

  // Only faces are pickable in the viewport while this panel is open — direct edit
  // targets exactly one face, never edges/vertices.
  useEffect(() => {
    setPickFilter(['face'])
    return () => setPickFilter([])
  }, [setPickFilter])

  // A face picked in the 3D viewport arrives through uiStore selection (type 'face').
  // Direct edit is single-target, so only the most recent pick is kept even if the
  // viewport allows ctrl-click multi-select for other tools.
  useEffect(() => {
    if (selection.type !== 'face' || selection.ids.length === 0) return
    setSelectedFaceId(selection.ids[selection.ids.length - 1])
  }, [selection])

  const selectedFace = selectedFaceId ? availableFaces.find(f => f.faceId === selectedFaceId) : null

  const checkValidity = useCallback((): { valid: boolean; message: string } => {
    if (!selectedFaceId) return { valid: false, message: 'Pick a flat face on the body' }
    if (!magnitude || magnitude <= 0) return { valid: false, message: 'Distance must be positive' }
    return { valid: true, message: '' }
  }, [selectedFaceId, magnitude])

  useEffect(() => {
    const validity = checkValidity()
    setDialogData({
      type: 'direct-edit',
      faceId: selectedFaceId,
      distance: pushPull === 'push' ? magnitude : -magnitude,
      previewValid: validity.valid,
    })
  }, [selectedFaceId, pushPull, magnitude, checkValidity, setDialogData])

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

    const distance = pushPull === 'push' ? magnitude : -magnitude
    const featureCount = activePartStudio.features.filter(f => f.type === 'directEdit').length + 1
    const name = `Direct Edit ${featureCount}`

    const feature = await useDocumentStore.getState().submitFeature(activePartStudio.id, {
      type: 'directEdit',
      name,
      suppressed: false,
      parameters: { faceId: selectedFaceId, distance },
    }, useUIStore.getState().dialogData)

    if (feature) {
      addNotification('success', `Created ${name} — ${pushPull === 'push' ? 'pushed out' : 'pulled in'} ${magnitude}mm`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create direct edit feature')
    }
  }

  const validity = checkValidity()
  const isValid = validity.valid

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[420px] mb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <ArrowUpFromLine size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Direct Edit</h2>
          </div>
          <button onClick={closeDialog} className="p-1.5 hover:bg-cad-panel transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Face selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Square size={12} />
              Face to Edit
            </label>
            {selectedFace ? (
              <div className="flex items-center justify-between p-3 bg-white border border-cad-accent/50">
                <span className="text-sm text-cad-text">{selectedFace.faceLabel}</span>
                <button
                  onClick={() => setSelectedFaceId(null)}
                  className="text-xs text-cad-accent hover:text-cad-text"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="p-3 bg-white border border-cad-border">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-cad-accent mt-0.5" />
                  <p className="text-sm text-cad-text">Click a flat face in the viewport to select it.</p>
                </div>
              </div>
            )}
          </div>

          {/* Push / Pull */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Direction
            </label>
            <div className="grid grid-cols-2 gap-1 bg-white p-1">
              {[
                { value: 'push' as const, label: 'Push (grow)', icon: <ArrowUpFromLine size={14} /> },
                { value: 'pull' as const, label: 'Pull (shrink)', icon: <ArrowDownToLine size={14} /> },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPushPull(opt.value)}
                  className={`
                    flex items-center justify-center gap-2 p-2 transition-colors text-xs
                    ${pushPull === opt.value ? 'bg-cad-accent text-white' : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-1">
            <label className="text-xs text-cad-text-dim">Distance (mm)</label>
            <input
              type="number"
              value={magnitude}
              min={0.1}
              step={1}
              onChange={(e) => setMagnitude(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
            />
          </div>

          <p className="text-xs text-cad-text-dim italic">
            Only flat faces are supported right now — a curved face will be rejected rather
            than edited incorrectly.
          </p>
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
