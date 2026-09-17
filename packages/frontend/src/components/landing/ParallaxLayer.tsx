'use client'

import { useEffect, useRef } from 'react'

/** A drop-in replacement for the plain `<div className="... l-grid-bg ...">` background
 * div — same empty, decorative, `aria-hidden` element, just with its own
 * `background-position` nudged as the page scrolls for a subtle depth effect. Uses
 * background-position rather than transforming the element, so it doesn't fight
 * `.l-fade-bottom`'s mask or blur at sub-pixel offsets the way a translate can. */
export function ParallaxLayer({
  className = '',
  speed = 0.12,
}: {
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ticking = false
    const update = () => {
      ticking = false
      const el = ref.current
      if (!el) return
      el.style.backgroundPosition = `0 ${window.scrollY * speed}px`
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])

  return <div ref={ref} className={`l-grid-drift ${className}`} aria-hidden />
}
