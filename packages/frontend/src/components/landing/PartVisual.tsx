'use client'

import { useId } from 'react'

export type PartVisualMode = 'prompt' | 'action' | 'kernel' | 'mesh' | 'solver' | 'results'

// Same isometric bracket in every mode — three quads (top / left / right face) plus a
// bolt hole — so the visual reads as one part moving through the pipeline rather than six
// unrelated icons. Coordinates are shared constants for exactly that reason.
const TOP = 'M50 40 L120 22 L160 46 L90 64 Z'
const LEFT = 'M50 40 L50 96 L90 118 L90 64 Z'
const RIGHT = 'M160 46 L160 88 L90 118 L90 64 Z'
const HOLE = { cx: 100, cy: 46, rx: 9, ry: 4.2 }

function Bracket({ dim = false }: { dim?: boolean }) {
  const stroke = dim ? 'var(--l-dim)' : 'var(--l-accent)'
  const opacity = dim ? 0.35 : 1
  return (
    <g opacity={opacity} fill="none" stroke={stroke} strokeWidth={1.4} strokeLinejoin="round">
      <path d={TOP} />
      <path d={LEFT} />
      <path d={RIGHT} />
      <ellipse cx={HOLE.cx} cy={HOLE.cy} rx={HOLE.rx} ry={HOLE.ry} />
    </g>
  )
}

// Fan-triangulation lines used by both the mesh and results modes, gated by a threshold
// so mesh "density" can grow with scroll progress instead of appearing all at once.
const TRI_LINES: [number, number, number, number][] = [
  [90, 55, 50, 40], [90, 55, 120, 22], [90, 55, 160, 46], [90, 55, 90, 64],
  [70, 68, 50, 40], [70, 68, 50, 96], [70, 68, 90, 64], [70, 68, 90, 118],
  [125, 67, 160, 46], [125, 67, 160, 88], [125, 67, 90, 64], [125, 67, 90, 118],
]

function MeshLines({ count, dark = false }: { count: number; dark?: boolean }) {
  return (
    <g stroke={dark ? 'rgba(0,0,0,0.35)' : 'var(--l-dim)'} strokeWidth={0.6}>
      {TRI_LINES.slice(0, count).map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  )
}

export function PartVisual({
  mode,
  progress = 1,
}: {
  mode: PartVisualMode
  /** How far scrolled through *this* stage, 0–1 — drives small in-place animation
   * (mesh density filling in, stress rising, rows/cells appearing) without switching mode. */
  progress?: number
}) {
  const uid = useId()
  const p = Math.max(0, Math.min(1, progress))

  return (
    <div className="tech-frame aspect-[4/3] w-full overflow-hidden p-4">
      <svg viewBox="0 0 200 150" className="h-full w-full" style={{ color: 'var(--l-accent)' }}>
        {mode === 'prompt' && (
          <>
            <g transform="translate(58 30)"><Bracket dim /></g>
            <g>
              <rect x="6" y="10" width="112" height="66" rx="3" fill="var(--l-surface)" stroke="var(--l-border-strong)" strokeWidth="1.2" />
              <path d="M18 76 L18 88 L30 76 Z" fill="var(--l-surface)" stroke="var(--l-border-strong)" strokeWidth="1.2" />
              {[0, 1, 2].map(i => (
                <rect
                  key={i}
                  x="16"
                  y={24 + i * 15}
                  width={p * (100 - i * 24) > 14 ? Math.min(96, (i === 0 ? 0.5 : i === 1 ? 0.8 : 0.35) * 96 * Math.min(1, p * 3 - i)) : 0}
                  height="6"
                  fill={i === 1 ? 'var(--l-accent)' : 'var(--l-dim)'}
                  opacity={i === 1 ? 0.85 : 0.5}
                />
              ))}
              <rect x="16" y="24" width="3" height="6" className="l-blink-cursor" fill="var(--l-accent)" />
            </g>
            <line x1="70" y1="76" x2="88" y2="58" stroke="var(--l-accent)" strokeWidth="1" strokeDasharray="2 3" opacity={0.7} />
            <circle cx="90" cy="55" r="3" fill="var(--l-accent)" className="l-pulse-dot" />
          </>
        )}

        {mode === 'action' && (
          <>
            <g transform="translate(4 20)"><Bracket dim /></g>
            <circle cx="94" cy="64" r="3.2" fill="var(--l-accent)" className="l-pulse-dot" />
            <circle cx="130" cy="46" r="3.2" fill="var(--l-accent)" className="l-pulse-dot" />
            <g fontFamily="monospace" fontSize="8.5" fill="var(--l-text)">
              {[['op', 'extrude'], ['face', 'F14'], ['depth', '8 mm']].map(([k, v], i) => (
                <g key={k} opacity={p * 3 > i ? 1 : 0} style={{ transition: 'opacity 300ms ease' }}>
                  <text x="6" y={112 + i * 13}><tspan fill="var(--l-dim)">{k}</tspan><tspan fill="var(--l-accent)"> → </tspan>{v}</text>
                </g>
              ))}
            </g>
          </>
        )}

        {mode === 'kernel' && (
          <>
            <Bracket />
            <g fontFamily="monospace" fontSize="7.5" fill="var(--l-dim)">
              <text x="4" y="132">F 6</text>
              <text x="30" y="132">E 12</text>
              <text x="60" y="132">V 8</text>
            </g>
          </>
        )}

        {mode === 'mesh' && (
          <>
            <Bracket dim />
            <MeshLines count={Math.round(2 + p * (TRI_LINES.length - 2))} />
            {TRI_LINES.slice(0, Math.round(2 + p * (TRI_LINES.length - 2))).map(([x1, y1], i) => (
              <circle key={i} cx={x1} cy={y1} r="1.4" fill="var(--l-accent)" opacity={0.8} />
            ))}
          </>
        )}

        {mode === 'solver' && (
          <>
            <g transform="translate(2 26)"><Bracket dim /></g>
            <g transform="translate(112 18)">
              <text x="0" y="8" fontFamily="monospace" fontSize="9" fill="var(--l-text)">K u = f</text>
              {Array.from({ length: 16 }).map((_, i) => {
                const row = Math.floor(i / 4)
                const col = i % 4
                const cellOrder = row * 4 + col
                const lit = p * 16 > cellOrder
                return (
                  <rect
                    key={i}
                    x={col * 11}
                    y={16 + row * 11}
                    width="9.5"
                    height="9.5"
                    fill={lit ? 'var(--l-accent)' : 'var(--l-surface)'}
                    opacity={lit ? 0.25 + (row + col) * 0.03 : 1}
                    stroke="var(--l-border)"
                    strokeWidth="0.6"
                    style={{ transition: 'fill 250ms ease, opacity 250ms ease' }}
                  />
                )
              })}
            </g>
            <line x1="86" y1="70" x2="112" y2="70" stroke="var(--l-accent)" strokeWidth="1" markerEnd={`url(#${uid}-arrow)`} opacity={0.7} />
            <defs>
              <marker id={`${uid}-arrow`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6 Z" fill="var(--l-accent)" />
              </marker>
            </defs>
          </>
        )}

        {mode === 'results' && (
          <>
            <defs>
              <linearGradient id={`${uid}-stress`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#1a4d8f" />
                <stop offset="45%" stopColor="#0891b2" />
                <stop offset="75%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            <g opacity={0.35 + p * 0.65} style={{ transition: 'opacity 300ms ease' }}>
              <path d={TOP} fill={`url(#${uid}-stress)`} />
              <path d={LEFT} fill={`url(#${uid}-stress)`} opacity={0.85} />
              <path d={RIGHT} fill={`url(#${uid}-stress)`} opacity={0.7} />
            </g>
            <g fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={1}>
              <path d={TOP} /><path d={LEFT} /><path d={RIGHT} />
            </g>
            <MeshLines count={6} dark />
            <g transform="translate(4 132)" fontFamily="monospace" fontSize="6.5" fill="var(--l-dim)">
              <rect x="0" y="-8" width="60" height="4" fill={`url(#${uid}-stress)`} />
              <text x="0" y="4">low</text>
              <text x="48" y="4">high σ</text>
            </g>
          </>
        )}
      </svg>
    </div>
  )
}
