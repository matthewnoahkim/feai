/**
 * AssemblyDialog - Combine parts from any part studio into instances, and mate them
 * face-to-face.
 *
 * Scope boundary (see documentStore.ts's createAssembly/addMate and
 * lib/assembly/mateSolver.ts): there's no DOF/simultaneous constraint solver, and no
 * viewport rendering of assembly instances yet — each mate is solved once, in closed
 * form, independent of any other mate on the same instance. Faces are picked from a
 * dropdown (real per-part face data, same addressing every other dialog uses) rather
 * than by clicking in the 3D viewport, since the viewport only ever renders the active
 * part studio's own parts today, not a separate assembly's instances.
 */

import React, { useState, useMemo } from 'react'
import { X, Boxes, Plus, Trash2, Check, Link2 } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'

export function AssemblyDialog() {
  const { closeDialog, addNotification } = useUIStore()
  const { document, createAssembly, deleteAssembly, addAssemblyInstance, deleteAssemblyInstance, addMate, deleteMate } = useDocumentStore()

  const assemblies = document?.assemblies || []
  const [activeAssemblyId, setActiveAssemblyId] = useState<string | null>(assemblies[0]?.id ?? null)
  const activeAssembly = assemblies.find(a => a.id === activeAssemblyId) || null

  const [newAssemblyName, setNewAssemblyName] = useState('Assembly 1')
  const [selectedPartStudioId, setSelectedPartStudioId] = useState(document?.partStudios[0]?.id || '')
  const [selectedPartId, setSelectedPartId] = useState('')

  // Mate form state
  const [movingInstanceId, setMovingInstanceId] = useState('')
  const [movingFaceId, setMovingFaceId] = useState('')
  const [targetInstanceId, setTargetInstanceId] = useState('')
  const [targetFaceId, setTargetFaceId] = useState('')
  const [mateType, setMateType] = useState<'coincident' | 'distance'>('coincident')
  const [offset, setOffset] = useState(0)

  const availableParts = useMemo(
    () => document?.partStudios.find(ps => ps.id === selectedPartStudioId)?.parts || [],
    [document, selectedPartStudioId]
  )

  // Faces for a given instance, looked up via the part it references (an instance has
  // no geometry of its own — same real f0/f1/... addressing as every other dialog).
  const facesForInstance = (instanceId: string) => {
    const instance = activeAssembly?.instances.find(i => i.id === instanceId)
    if (!instance || !document) return []
    for (const ps of document.partStudios) {
      const part = ps.parts.find(p => p.id === instance.partId)
      if (part) {
        return (part.faces || []).map((f, idx) => ({
          id: `${part.id}-face-${idx}`,
          label: `Face ${idx + 1}`,
        }))
      }
    }
    return []
  }

  const handleCreateAssembly = () => {
    const id = createAssembly(newAssemblyName || 'Assembly')
    setActiveAssemblyId(id)
    addNotification('success', `Created ${newAssemblyName}`)
  }

  const handleAddInstance = () => {
    if (!activeAssembly || !selectedPartId) {
      addNotification('error', 'Select a part to add')
      return
    }
    const id = addAssemblyInstance(activeAssembly.id, selectedPartStudioId, selectedPartId)
    if (id) addNotification('success', 'Instance added')
    else addNotification('error', 'Could not add that part as an instance')
  }

  const handleAddMate = () => {
    if (!activeAssembly || !movingInstanceId || !movingFaceId || !targetInstanceId || !targetFaceId) {
      addNotification('error', 'Pick a moving instance/face and a target instance/face')
      return
    }
    if (movingInstanceId === targetInstanceId) {
      addNotification('error', 'Moving and target instances must be different')
      return
    }
    addMate(activeAssembly.id, {
      type: mateType, movingInstanceId, movingFaceId, targetInstanceId, targetFaceId,
      offset: mateType === 'distance' ? offset : offset || 0,
    })
    addNotification('success', 'Mate solved and applied')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-16 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[560px] mb-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <Boxes size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Assembly</h2>
          </div>
          <button onClick={closeDialog} className="p-1.5 hover:bg-cad-panel transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Assembly selector / create */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">Assembly</label>
            <div className="flex gap-2">
              <select
                value={activeAssemblyId || ''}
                onChange={(e) => setActiveAssemblyId(e.target.value || null)}
                className="flex-1 px-2 py-1.5 bg-white border border-cad-border text-sm"
              >
                <option value="">Select assembly...</option>
                {assemblies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {activeAssembly && (
                <button
                  onClick={() => { deleteAssembly(activeAssembly.id); setActiveAssemblyId(null) }}
                  className="px-2 bg-white border border-cad-border hover:bg-red-50 text-red-500"
                  title="Delete assembly"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={newAssemblyName} onChange={(e) => setNewAssemblyName(e.target.value)}
                placeholder="New assembly name"
                className="flex-1 px-2 py-1.5 bg-white border border-cad-border text-sm"
              />
              <button onClick={handleCreateAssembly} className="px-3 py-1.5 bg-cad-accent text-white text-sm flex items-center gap-1">
                <Plus size={14} /> Create
              </button>
            </div>
          </div>

          {activeAssembly && (
            <>
              {/* Instances */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                  Instances ({activeAssembly.instances.length})
                </label>
                <div className="bg-white border border-cad-border p-2 space-y-1 max-h-32 overflow-y-auto">
                  {activeAssembly.instances.length === 0 ? (
                    <p className="text-xs text-cad-text-dim p-2">No instances yet — add a part below.</p>
                  ) : activeAssembly.instances.map(instance => (
                    <div key={instance.id} className="flex items-center justify-between text-sm px-2 py-1 hover:bg-cad-panel">
                      <span className="text-cad-text">{instance.name}</span>
                      <button onClick={() => deleteAssemblyInstance(activeAssembly.id, instance.id)} className="text-cad-text-dim hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={selectedPartStudioId}
                    onChange={(e) => { setSelectedPartStudioId(e.target.value); setSelectedPartId('') }}
                    className="px-2 py-1.5 bg-white border border-cad-border text-sm"
                  >
                    {(document?.partStudios || []).map(ps => <option key={ps.id} value={ps.id}>{ps.name}</option>)}
                  </select>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-cad-border text-sm"
                  >
                    <option value="">Select part...</option>
                    {availableParts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button onClick={handleAddInstance} className="px-2 py-1.5 bg-white border border-cad-border hover:bg-cad-panel text-sm flex items-center justify-center gap-1">
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              {/* Mates */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-cad-text-dim uppercase tracking-wide">
                  <Link2 size={12} /> Mates ({activeAssembly.mates.length})
                </label>
                <div className="bg-white border border-cad-border p-2 space-y-1 max-h-24 overflow-y-auto">
                  {activeAssembly.mates.length === 0 ? (
                    <p className="text-xs text-cad-text-dim p-2">No mates yet.</p>
                  ) : activeAssembly.mates.map(mate => (
                    <div key={mate.id} className="flex items-center justify-between text-sm px-2 py-1 hover:bg-cad-panel">
                      <span className="text-cad-text text-xs">
                        {mate.type} — {activeAssembly.instances.find(i => i.id === mate.movingInstanceId)?.name || '?'} → {activeAssembly.instances.find(i => i.id === mate.targetInstanceId)?.name || '?'}
                      </span>
                      <button onClick={() => deleteMate(activeAssembly.id, mate.id)} className="text-cad-text-dim hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {activeAssembly.instances.length < 2 ? (
                  <p className="text-xs text-cad-text-dim italic">Add at least two instances to create a mate.</p>
                ) : (
                  <div className="p-3 bg-white/50 border border-cad-border space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-cad-text-dim">Moving instance</label>
                        <select value={movingInstanceId} onChange={(e) => { setMovingInstanceId(e.target.value); setMovingFaceId('') }} className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm">
                          <option value="">Select...</option>
                          {activeAssembly.instances.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-cad-text-dim">Moving face</label>
                        <select value={movingFaceId} onChange={(e) => setMovingFaceId(e.target.value)} disabled={!movingInstanceId} className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm disabled:opacity-50">
                          <option value="">Select...</option>
                          {facesForInstance(movingInstanceId).map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-cad-text-dim">Target instance (fixed)</label>
                        <select value={targetInstanceId} onChange={(e) => { setTargetInstanceId(e.target.value); setTargetFaceId('') }} className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm">
                          <option value="">Select...</option>
                          {activeAssembly.instances.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-cad-text-dim">Target face</label>
                        <select value={targetFaceId} onChange={(e) => setTargetFaceId(e.target.value)} disabled={!targetInstanceId} className="w-full px-2 py-1.5 bg-white border border-cad-border text-sm disabled:opacity-50">
                          <option value="">Select...</option>
                          {facesForInstance(targetInstanceId).map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-end">
                      <div className="flex gap-1 bg-white p-1 border border-cad-border">
                        {(['coincident', 'distance'] as const).map(t => (
                          <button key={t} onClick={() => setMateType(t)} className={`flex-1 py-1 text-xs ${mateType === t ? 'bg-cad-accent text-white' : 'text-cad-text-dim hover:bg-cad-panel'}`}>
                            {t === 'coincident' ? 'Flush' : 'Distance'}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number" value={offset} onChange={(e) => setOffset(parseFloat(e.target.value) || 0)}
                        placeholder="Offset (mm)"
                        className="px-2 py-1.5 bg-white border border-cad-border text-sm"
                      />
                    </div>
                    <button onClick={handleAddMate} className="w-full py-2 bg-cad-accent text-white text-sm flex items-center justify-center gap-2">
                      <Link2 size={14} /> Solve Mate
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end px-4 py-3 border-t border-cad-border bg-white/50">
          <button onClick={closeDialog} className="px-4 py-2 text-sm bg-cad-panel hover:bg-cad-border transition-colors flex items-center gap-2">
            <Check size={14} /> Done
          </button>
        </div>
      </div>
    </div>
  )
}
