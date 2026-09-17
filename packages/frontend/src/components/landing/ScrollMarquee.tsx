'use client'

import { useEffect, useRef } from 'react'

/**
 * A label strip that drifts on its own (like a plain CSS marquee) but also reacts to how
 * fast and which direction the page is scrolling — scrolling down speeds it up, scrolling
 * up briefly reverses it. That reactivity is why this runs its own rAF loop and writes
 * `transform` directly instead of a `@keyframes` animation, which can only run at one
 * constant rate.
 */
export function ScrollMarquee({
  items,
  speed = 34,
  scrollFactor = 0.18,
}: {
  items: string[]
  /** Base drift speed in px/second when the page isn't scrolling. */
  speed?: number
  /** How strongly scroll velocity pushes the drift — higher feels twitchier. */
  scrollFactor?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(0)
  const lastScrollRef = useRef(0)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    lastScrollRef.current = window.scrollY
    let rafId = 0

    const tick = (now: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = now
      const dt = Math.min(48, now - lastTimeRef.current)
      lastTimeRef.current = now

      const scrollY = window.scrollY
      const scrollDelta = scrollY - lastScrollRef.current
      lastScrollRef.current = scrollY

      posRef.current += (speed * dt) / 1000 + scrollDelta * scrollFactor

      const half = track.scrollWidth / 2
      if (half > 0) posRef.current = ((posRef.current % half) + half) % half

      track.style.transform = `translateX(-${posRef.current}px)`
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [speed, scrollFactor])

  return (
    <div className="l-marquee-viewport">
      <div ref={trackRef} className="l-marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="l-marquee-item l-mono text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--l-dim)' }}>
            {item}
            <span aria-hidden style={{ color: 'var(--l-border-strong)' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
