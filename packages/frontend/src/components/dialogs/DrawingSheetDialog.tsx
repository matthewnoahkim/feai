/**
 * DrawingSheetDialog - Places orthographic/isometric views of the active part studio's
 * current body onto a 2D drawing sheet, from its real B-rep edges.
 *
 * Deliberately NOT doing hidden-line removal (see lib/drawing/projection.ts) — every
 * edge draws the same way regardless of whether a real drafter would show it solid,
 * dashed, or not at all. That's a substantially bigger feature (visibility analysis
 * against every face) than this pass; treat this as a wireframe/"see-through" drawing
 * mode, not a finished technical drawing.
 */

import React, { useMemo, useState } from 'react'
import { X, FileText, Plus, Trash2, Download, Check } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useDocumentStore } from '../../store/documentStore'
import { projectEdgesToView, computeViewBounds, type ViewDirection, type ProjectedEdge, type ViewBounds } from '../../lib/drawing/projection'

const SHEET_WIDTH = 900
const SHEET_HEIGHT = 620
const VIEW_LABELS: Record<ViewDirection, string> = { front: 'Front', top: 'Top', right: 'Right', iso: 'Isometric' }

interface PlacedView {
  view: { id: string; direction: ViewDirection; origin: { x: number; y: number }; scale: number }
  projected: ProjectedEdge[]
  bounds: ViewBounds | null
}

export function DrawingSheetDialog() {
  const { closeDialog, addNotification } = useUIStore()
  const { document, createDrawingSheet, deleteDrawingSheet, addDrawingView, deleteDrawingView } = useDocumentStore()

  const activePartStudio = document?.partStudios.find(ps => ps.id === document.activeElementId)
  const sheetsForStudio = (document?.drawings || []).filter(d => d.partStudioId === activePartStudio?.id)

  const [activeSheetId, setActiveSheetId] = useState<string | null>(sheetsForStudio[0]?.id ?? null)
  const activeSheet = sheetsForStudio.find(d => d.id === activeSheetId) || null
  const [newSheetName, setNewSheetName] = useState('Sheet 1')

  // The real edges to project: the current body's own B-rep edges (part.edges), same
  // data Fillet/Chamfer/Shell's dialogs use for edge picking — flattened across every
  // part in the studio (a studio can hold more than one body).
  const allEdges = useMemo(
    () => (activePartStudio?.parts || []).flatMap(p => p.edges || []),
    [activePartStudio]
  )

  const projectedViews = useMemo(() => {
    if (!activeSheet) return []
    return activeSheet.views.map(view => {
      const projected = projectEdgesToView(allEdges, view.direction)
      const bounds = computeViewBounds(projected)
      return { view, projected, bounds }
    })
  }, [activeSheet, allEdges])

  const handleCreateSheet = () => {
    if (!activePartStudio) {
      addNotification('error', 'No active part studio')
      return
    }
    const id = createDrawingSheet(activePartStudio.id, newSheetName || 'Sheet')
    setActiveSheetId(id)
  }

  const handleExportSvg = () => {
    if (!activeSheet) return
    const svg = buildSheetSvg(projectedViews, activeSheet.name)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${activeSheet.name.replace(/\s+/g, '_')}.svg`
    a.click()
    URL.revokeObjectURL(url)
    addNotification('success', `Exported ${a.download}`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-10 overflow-y-auto">
      <div className="bg-gray-50 border border-cad-border shadow-2xl w-[960px] mb-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cad-accent/20 flex items-center justify-center">
              <FileText size={14} className="text-cad-accent" />
            </div>
            <h2 className="font-semibold text-cad-text">Drawing Sheet</h2>
          </div>
          <button onClick={closeDialog} className="p-1.5 hover:bg-cad-panel transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={activeSheetId || ''}
              onChange={(e) => setActiveSheetId(e.target.value || null)}
              className="flex-1 px-2 py-1.5 bg-white border border-cad-border text-sm"
            >
              <option value="">Select sheet...</option>
              {sheetsForStudio.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input
              type="text" value={newSheetName} onChange={(e) => setNewSheetName(e.target.value)}
              className="w-32 px-2 py-1.5 bg-white border border-cad-border text-sm"
            />
            <button onClick={handleCreateSheet} className="px-3 py-1.5 bg-cad-accent text-white text-sm flex items-center gap-1">
              <Plus size={14} /> New Sheet
            </button>
            {activeSheet && (
              <button
                onClick={() => { deleteDrawingSheet(activeSheet.id); setActiveSheetId(null) }}
                className="px-2 py-1.5 bg-white border border-cad-border hover:bg-red-50 text-red-500"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {activeSheet && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-cad-text-dim">Add view:</span>
              {(['front', 'top', 'right', 'iso'] as ViewDirection[]).map(dir => (
                <button
                  key={dir}
                  onClick={() => addDrawingView(activeSheet.id, dir)}
                  className="px-2 py-1 bg-white border border-cad-border hover:bg-cad-panel text-xs"
                >
                  {VIEW_LABELS[dir]}
                </button>
              ))}
              <button
                onClick={handleExportSvg}
                className="ml-auto px-3 py-1.5 bg-white border border-cad-border hover:bg-cad-panel text-xs flex items-center gap-1"
              >
                <Download size={12} /> Export SVG
              </button>
            </div>
          )}

          {/* Sheet render */}
          <div className="bg-white border border-cad-border overflow-auto" style={{ height: 480 }}>
            {!activeSheet ? (
              <div className="h-full flex items-center justify-center text-cad-text-dim text-sm">
                Create a sheet to place views of the current body.
              </div>
            ) : allEdges.length === 0 ? (
              <div className="h-full flex items-center justify-center text-cad-text-dim text-sm">
                No geometry in this part studio to draw yet.
              </div>
            ) : (
              <svg width={SHEET_WIDTH} height={SHEET_HEIGHT} viewBox={`0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}`}>
                <rect x={0} y={0} width={SHEET_WIDTH} height={SHEET_HEIGHT} fill="white" />
                {projectedViews.map(({ view, projected, bounds }) => {
                  if (!bounds) return null
                  const width = Math.max(bounds.maxX - bounds.minX, 1e-6)
                  const height = Math.max(bounds.maxY - bounds.minY, 1e-6)
                  const fitScale = Math.min(160 / width, 160 / height) * view.scale
                  const cx = SHEET_WIDTH / 2 + view.origin.x
                  const cy = SHEET_HEIGHT / 2 + view.origin.y
                  const midX = (bounds.minX + bounds.maxX) / 2
                  const midY = (bounds.minY + bounds.maxY) / 2

                  return (
                    <g key={view.id}>
                      <text x={cx} y={cy - 100} textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="sans-serif">
                        {VIEW_LABELS[view.direction]}
                      </text>
                      <g stroke="#1a1a2e" strokeWidth={1} fill="none">
                        {projected.map(edge => (
                          <polyline
                            key={edge.edgeId}
                            points={edge.points
                              // Drawing-space Y grows up; SVG's grows down — flip so the
                              // view isn't rendered upside down.
                              .map(p => `${cx + (p.x - midX) * fitScale},${cy - (p.y - midY) * fitScale}`)
                              .join(' ')}
                          />
                        ))}
                      </g>
                    </g>
                  )
                })}
              </svg>
            )}
          </div>

          {activeSheet && (
            <div className="flex flex-wrap gap-2">
              {activeSheet.views.map(v => (
                <div key={v.id} className="flex items-center gap-1 px-2 py-1 bg-white border border-cad-border text-xs">
                  {VIEW_LABELS[v.direction]}
                  <button onClick={() => deleteDrawingView(activeSheet.id, v.id)} className="text-cad-text-dim hover:text-red-500">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
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

/** Standalone SVG document (not just the fragment shown in the dialog) for export. */
function buildSheetSvg(projectedViews: PlacedView[], title: string): string {
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" viewBox="0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}">`,
    `<rect x="0" y="0" width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="white"/>`,
    `<title>${escapeXml(title)}</title>`,
  ]
  for (const { view, projected, bounds } of projectedViews) {
    if (!bounds) continue
    const width = Math.max(bounds.maxX - bounds.minX, 1e-6)
    const height = Math.max(bounds.maxY - bounds.minY, 1e-6)
    const fitScale = Math.min(160 / width, 160 / height) * view.scale
    const cx = SHEET_WIDTH / 2 + view.origin.x
    const cy = SHEET_HEIGHT / 2 + view.origin.y
    const midX = (bounds.minX + bounds.maxX) / 2
    const midY = (bounds.minY + bounds.maxY) / 2
    parts.push(`<text x="${cx}" y="${cy - 100}" text-anchor="middle" font-size="11" fill="#64748b" font-family="sans-serif">${escapeXml(VIEW_LABELS[view.direction])}</text>`)
    for (const edge of projected) {
      const pts = edge.points.map(p => `${cx + (p.x - midX) * fitScale},${cy - (p.y - midY) * fitScale}`).join(' ')
      parts.push(`<polyline points="${pts}" stroke="#1a1a2e" stroke-width="1" fill="none"/>`)
    }
  }
  parts.push('</svg>')
  return parts.join('\n')
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string))
}
