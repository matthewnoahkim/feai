'use client'

import { useEffect, useRef } from 'react'

/** Thin fixed bar under the nav that fills left-to-right with scroll position across the
 * whole document. Reads scrollY directly rather than IntersectionObserver since it needs
 * a continuous fraction, not a boolean — same rAF-batching pattern as ParallaxLayer. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    const update = () => {
      ticking = false
      const el = ref.current
      if (!el) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0
      el.style.transform = `scaleX(${pct / 100})`
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

  return (
    <div className="l-progress-track" aria-hidden>
      <div ref={ref} className="l-progress-bar" />
    </div>
  )
}
