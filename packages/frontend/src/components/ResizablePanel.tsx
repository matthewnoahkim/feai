/**
 * ResizablePanel - A panel with a draggable resize handle
 * Similar to Cursor IDE's resizable panels
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'

interface ResizablePanelProps {
  children: React.ReactNode
  direction: 'horizontal' | 'vertical'
  side: 'left' | 'right' | 'top' | 'bottom'
  initialSize: number
  minSize?: number
  maxSize?: number
  onResize?: (size: number) => void
  className?: string
}

export function ResizablePanel({
  children,
  direction,
  side,
  initialSize,
  minSize = 200,
  maxSize = 800,
  onResize,
  className = ''
}: ResizablePanelProps) {
  const [size, setSize] = useState(initialSize)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef(0)
  const startSizeRef = useRef(0)

  // Sync with initialSize prop changes
  useEffect(() => {
    setSize(initialSize)
  }, [initialSize])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY
    startSizeRef.current = size
  }, [direction, size])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY
      const delta = currentPos - startPosRef.current

      let newSize: number
      if (side === 'left' || side === 'top') {
        newSize = startSizeRef.current + delta
      } else {
        newSize = startSizeRef.current - delta
      }

      // Clamp size to min/max
      newSize = Math.max(minSize, Math.min(maxSize, newSize))
      
      setSize(newSize)
      onResize?.(newSize)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, direction, side, minSize, maxSize, onResize])

  const handleStyle = direction === 'horizontal'
    ? {
        cursor: 'col-resize',
        width: '5px',
        height: '100%',
        position: 'absolute' as const,
        top: 0,
        [side === 'left' ? 'right' : 'left']: -2,
        zIndex: 10
      }
    : {
        cursor: 'row-resize',
        height: '5px',
        width: '100%',
        position: 'absolute' as const,
        left: 0,
        [side === 'top' ? 'bottom' : 'top']: -2,
        zIndex: 10
      }

  const panelStyle = direction === 'horizontal'
    ? { width: `${size}px`, flexShrink: 0 }
    : { height: `${size}px`, flexShrink: 0 }

  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 ${className}`}
      style={panelStyle}
    >
      {children}
      <div
        onMouseDown={handleMouseDown}
        style={handleStyle}
        className={`
          hover:bg-cad-accent/40 transition-colors
          ${isResizing ? 'bg-cad-accent/60' : ''}
        `}
      />
    </div>
  )
}

