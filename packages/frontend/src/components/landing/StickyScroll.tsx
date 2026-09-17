'use client'

import { useEffect, useRef, useState } from 'react'
import { StageDiagram } from './StageDiagram'
import { PartVisual, type PartVisualMode } from './PartVisual'

export interface StickyStep {
  index: string
  title: string
  body: string
  tags?: string[]
  visual: PartVisualMode
}

/**
 * Scrollytelling section: a visual pinned in the left column (via CSS `position: sticky`,
 * not scroll-jacking) while the right column's steps scroll past underneath.
 *
 * Rather than a boolean "is this step's element on screen" from an IntersectionObserver,
 * this tracks a continuous 0–1 `progress` across the whole step list — how far the
 * viewport's vertical center has moved through the list's own bounding box — every scroll
 * frame. That single float drives three things in sync: which stage is "active" (rounded to
 * the nearest step), the connecting line's fill height in StageDiagram, and the in-place
 * micro-animation (mesh density, stress fill, matrix cells) inside PartVisual for however
 * far the viewport is through the *current* stage specifically.
 *
 * Takes plain data rather than a render-prop for the visual, so the pages that use this can
 * stay server components — a function prop would force them across the client/server
 * boundary since functions aren't serializable in RSC payloads.
 *
 * On narrow screens sticky positioning fights with the step list's own height, so each step
 * gets an inline copy of the visual instead and the sticky column is hidden.
 */
export function StickyScroll({ steps }: { steps: StickyStep[] }) {
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const n = steps.length

  useEffect(() => {
    let ticking = false
    const update = () => {
      ticking = false
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewportMid = window.innerHeight / 2
      const t = rect.height > 0 ? (viewportMid - rect.top) / rect.height : 0
      setProgress(Math.max(0, Math.min(1, t)))
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const stepFloat = progress * (n - 1)
  const active = Math.max(0, Math.min(n - 1, Math.round(stepFloat)))
  const localProgress = Math.max(0, Math.min(1, stepFloat - active + 0.5))
  const stages = steps.map(s => ({ index: s.index, title: s.title }))

  return (
    <div ref={containerRef} className="grid gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16">
      <div className="hidden md:block">
        <div className="sticky top-24 flex flex-col gap-5">
          <div className="l-section-progress">
            <span className="l-mono text-xs" style={{ color: 'var(--l-dim)' }}>
              {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
            <span className="l-section-progress-track">
              <span className="l-section-progress-fill" style={{ transform: `scaleX(${progress})` }} />
            </span>
          </div>
          <div key={active} className="l-fade-swap">
            <PartVisual mode={steps[active].visual} progress={localProgress} />
          </div>
          <StageDiagram stages={stages} progress={progress} />
        </div>
      </div>

      <div className="flex flex-col gap-16 md:gap-[28vh] md:py-[8vh]">
        {steps.map((step, i) => (
          <div key={step.index} className={`l-sticky-step ${active === i ? 'is-active' : ''}`}>
            <div className="mb-4 md:hidden">
              <PartVisual mode={step.visual} progress={1} />
            </div>
            <div className="l-index mb-3">{step.index}/</div>
            <h3 className="mb-3 text-xl font-medium md:text-2xl">{step.title}</h3>
            <p className="max-w-md text-sm leading-relaxed sm:text-base" style={{ color: 'var(--l-muted)' }}>
              {step.body}
            </p>
            {step.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {step.tags.map(t => <span key={t} className="l-badge">{t}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
