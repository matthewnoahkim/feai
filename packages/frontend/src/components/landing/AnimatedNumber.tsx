'use client'

import { useEffect, useRef, useState } from 'react'

/** Counts up from 0 to `value` once it scrolls into view. Ties the "verified geometry"
 * gallery's numbers to the same real, tested values LandingPage.tsx already hardcodes —
 * this only changes how they render in, not what they are. */
export function AnimatedNumber({
  value,
  decimals = 2,
  duration = 1200,
}: {
  value: number
  decimals?: number
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }

    let started = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return
        started = true
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(value * eased)
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return <span ref={ref}>{display.toFixed(decimals)}</span>
}
