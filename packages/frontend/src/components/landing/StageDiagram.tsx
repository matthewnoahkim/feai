'use client'

/** Vertical flow list used alongside the sticky visual in StickyScroll: every stage is
 * listed against one continuous connecting line that fills smoothly with `progress`
 * (0–1 across the whole list) rather than snapping between stages, so the line reads as a
 * single scroll-linked draw instead of a discrete step indicator. Kept dumb/presentational
 * — StickyScroll owns the scroll math and just hands down a float. */
export function StageDiagram({
  stages,
  progress,
}: {
  stages: { index: string; title: string }[]
  /** 0 at the first stage, 1 at the last — StickyScroll's continuous scroll fraction. */
  progress: number
}) {
  const n = stages.length
  const activeFloat = progress * (n - 1)
  const activeIndex = Math.max(0, Math.min(n - 1, Math.round(activeFloat)))
  const lineFillPct = n > 1 ? Math.max(0, Math.min(1, activeFloat / (n - 1))) * 100 : 0

  return (
    <div className="tech-frame p-6">
      <ol className="relative flex flex-col">
        <span className="l-stage-line-track" aria-hidden />
        <span className="l-stage-line-fill" style={{ height: `${lineFillPct}%` }} aria-hidden />
        {stages.map((stage, i) => {
          const isActive = i === activeIndex
          const isPast = i < activeIndex
          return (
            <li key={stage.index} className="relative pl-9">
              <span className={`l-stage-dot ${isActive ? 'is-active' : ''}`} aria-hidden>
                {isPast ? '✓' : ''}
              </span>
              <div className={`l-stage-row ${isActive ? 'is-active' : ''}`}>
                <span className="l-index">{stage.index}/</span>
                <span className="l-stage-title">{stage.title}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
