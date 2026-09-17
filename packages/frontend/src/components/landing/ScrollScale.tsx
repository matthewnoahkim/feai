'use client'

import { useEffect, useRef } from 'react'

/** Shrinks, lifts and fades its children as the page scrolls away from the top — the
 * hero visual receding into the page rather than just disappearing. Reads scrollY directly
 * (rAF-batched, same pattern as ParallaxLayer/ScrollProgress) since the effect needs a
 * continuous 0–1 fraction of `range`, not a boolean "in view". */
export function ScrollScale({
  children,
  className = '',
  style,
  range = 520,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /** Scroll distance, in px, over which the effect fully plays out. */
  range?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ticking = false
    const update = () => {
      ticking = false
      const el = ref.current
      if (!el) return
      const t = Math.max(0, Math.min(1, window.scrollY / range))
      el.style.transform = `scale(${1 - t * 0.07}) translateY(${t * 16}px)`
      el.style.opacity = String(1 - t * 0.5)
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [range])

  return (
    <div ref={ref} className={className} style={{ ...style, willChange: 'transform, opacity' }}>
      {children}
    </div>
  )
}
