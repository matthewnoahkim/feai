/**
 * MirrorFeatureDialog - Mirror the current body across a plane
 *
 * cad-server's /mirror always mirrors the whole current body and either fuses the
 * mirrored copy onto it or replaces it — there's no per-part/per-feature/per-face
 * subset selection on the server side (see regenerateModel's 'mirror' case in
 * documentStore.ts). Earlier versions of this dialog offered a Part/Feature/Face type
 * selector and an entity multi-select that regenerateModel silently ignored; this
 * version only exposes controls that actually change the result.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  X,
  FlipHorizontal,
  Plus,
  Check,
  AlertCircle,
  Square,
  Target
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

type OperationType = 'new' | 'add'

interface PlaneInfo {
  id: string
  type: 'reference' | 'face'
  name: string
}

export function MirrorFeatureDialog() {
  const { closeDialog, addNotification, selection, setDialogData, setPickFilter } = useUIStore()
  const { document } = useDocumentStore()

  const activePartStudio = useMemo(() =>
    document?.partStudios.find(ps => ps.id === document.activeElementId),
    [document]
  )

  const availableParts = useMemo(() => activePartStudio?.parts || [], [activePartStudio])

  // Real B-rep faces from the modeling engine (part.faces), same addressing ShellDialog/
  // DirectEditDialog use — resolveMirrorPlane looks up the real centroid/normal for these.
  const availablePlanes = useMemo((): PlaneInfo[] => {
    const planes: PlaneInfo[] = [
      { id: 'front-plane', type: 'reference', name: 'Front Plane' },
      { id: 'top-plane', type: 'reference', name: 'Top Plane' },
      { id: 'right-plane', type: 'reference', name: 'Right Plane' },
    ]
    availableParts.forEach((part) => {
      ;(part.faces || []).forEach((face) => {
        const index = parseInt(face.faceId.replace(/^f/, ''), 10)
        planes.push({
          id: `${part.id}-face-${index}`,
          type: 'face',
          name: `${part.name} — Face ${index + 1}`,
        })
      })
    })
    return planes
  }, [availableParts])

  const [selectedPlane, setSelectedPlane] = useState<string | null>(null)
  const [operation, setOperation] = useState<OperationType>('add')

  // A planar reference (front/top/right) needs no viewport pick, but picking a real
  // face is the only way to mirror across an arbitrary body face.
  useEffect(() => {
    setPickFilter(['face'])
    return () => setPickFilter([])
  }, [setPickFilter])

  useEffect(() => {
    if (selection.type !== 'face' || selection.ids.length === 0) return
    setSelectedPlane(selection.ids[selection.ids.length - 1])
  }, [selection])

  useEffect(() => {
    if (availablePlanes.length > 0 && !selectedPlane) {
      setSelectedPlane(availablePlanes[0].id)
    }
  }, [availablePlanes, selectedPlane])

  const checkValidity = useCallback((): { valid: boolean; message: string } => {
    if (!selectedPlane) return { valid: false, message: 'Select a mirror plane' }
    return { valid: true, message: '' }
  }, [selectedPlane])

  useEffect(() => {
    const validity = checkValidity()
    setDialogData({
      type: 'mirror',
      planeId: selectedPlane,
      operation,
      previewValid: validity.valid,
    })
  }, [selectedPlane, operation, checkValidity, setDialogData])

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

    const featureCount = activePartStudio.features.filter(f => f.type === 'mirror').length + 1
    const name = `Mirror ${featureCount}`

    const feature = await useDocumentStore.getState().submitFeature(activePartStudio.id, {
      type: 'mirror',
      name,
      suppressed: false,
      parameters: { planeId: selectedPlane, operation },
    }, useUIStore.getState().dialogData)

    if (feature) {
      addNotification('success', `Created ${name}`)
      closeDialog()
    } else {
      addNotification('error', 'Failed to create mirror feature')
    }
  }

  const validity = checkValidity()
  const isValid = validity.valid
  const referencePlanes = availablePlanes.filter(p => p.type === 'reference')
  const facePlanes = availablePlanes.filter(p => p.type === 'face')

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[420px] mb-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <FlipHorizontal size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Mirror</h2>
          </div>
          <button onClick={closeDialog} className="p-1.5 hover:bg-cad-panel transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-cad-text-dim italic">
            Mirrors the current body across a plane and fuses the mirrored copy onto it.
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              <Target size={12} />
              Mirror Plane
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto bg-white border border-cad-border p-2">
              <p className="text-xs text-cad-text-dim mb-1 font-medium">Reference Planes:</p>
              {referencePlanes.map((plane) => (
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
                    ${selectedPlane === plane.id ? 'bg-cad-accent border-cad-accent' : 'border-cad-border'}
                  `}>
                    {selectedPlane === plane.id && <div className="w-2 h-2 bg-white" />}
                  </div>
                  <Square size={12} className="text-cad-accent" />
                  <span className="text-sm text-cad-text">{plane.name}</span>
                </label>
              ))}

              {facePlanes.length > 0 && (
                <>
                  <p className="text-xs text-cad-text-dim mt-2 mb-1 font-medium">
                    Picked Faces {facePlanes.some(p => p.id === selectedPlane) ? '' : '(click a face in the viewport)'}:
                  </p>
                  {facePlanes.map((plane) => (
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
                        ${selectedPlane === plane.id ? 'bg-cad-accent border-cad-accent' : 'border-cad-border'}
                      `}>
                        {selectedPlane === plane.id && <div className="w-2 h-2 bg-white" />}
                      </div>
                      <Square size={12} className="text-gray-400" />
                      <span className="text-sm text-cad-text">{plane.name}</span>
                    </label>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
              Result
            </label>
            <div className="grid grid-cols-2 gap-1 bg-white p-1">
              {[
                { value: 'add' as const, label: 'Merge onto body', icon: <Plus size={14} /> },
                { value: 'new' as const, label: 'Keep separate', icon: <Square size={14} /> },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setOperation(op.value)}
                  className={`
                    flex items-center justify-center gap-2 p-2 transition-colors text-xs
                    ${operation === op.value ? 'bg-cad-accent text-white' : 'hover:bg-cad-panel text-cad-text-dim'}
                  `}
                >
                  {op.icon}
                  {op.label}
                </button>
              ))}
            </div>
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
