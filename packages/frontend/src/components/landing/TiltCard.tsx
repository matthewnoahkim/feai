'use client'

import { useRef } from 'react'

/**
 * Wraps a card so it tilts slightly in 3D toward the cursor on hover — combine with
 * `.l-card` for the existing border/glow hover styling. Sets `transform` inline on
 * pointer move rather than via CSS `:hover`, since inline style would otherwise fight
 * `.l-card:hover`'s own transform (and inline always wins that fight anyway); the small
 * lift .l-card:hover normally does is folded into the tilt's own translateZ instead.
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  style,
}: {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(700px) rotateX(${py * -maxTilt}deg) rotateY(${px * maxTilt}deg) translateY(-2px) translateZ(6px)`
  }

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`l-tilt ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
