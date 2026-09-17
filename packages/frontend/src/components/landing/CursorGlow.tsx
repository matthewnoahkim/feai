'use client'

import { useEffect, useRef } from 'react'

/** Wraps its children in a relatively-positioned box with a radial-gradient overlay that
 * follows the pointer, for a "spotlight" feel over the hero. Position is set via CSS
 * custom properties rather than transform so the gradient itself (not a moved element)
 * tracks the cursor — same reasoning as ParallaxLayer's background-position choice. */
export function CursorGlow({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
      el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
      el.style.setProperty('--spot-o', '1')
    }
    const onLeave = () => el.style.setProperty('--spot-o', '0')
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={ref} className={`l-spotlight-zone ${className}`}>
      <div className="l-spotlight" aria-hidden />
      {children}
    </div>
  )
}
