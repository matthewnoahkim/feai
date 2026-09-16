/**
 * BrowserSupportBanner - App-wide notice that FEAI is only tested against
 * Chrome/Firefox/Edge. Shown once per browser until dismissed (see e.g. the project
 * schematic's drag-and-drop, which relies on dataTransfer/setDragImage behavior that
 * Safari implements more strictly than Chromium/Firefox do).
 */

'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

const DISMISS_KEY = 'feai-browser-support-dismissed'

/** Chrome/Firefox/Edge, to the exclusion of Safari and other engines. Chromium-based
 * browsers other than Edge (Opera, Brave, etc.) still say "Chrome/" in their UA string,
 * so this only excludes the ones with their own distinct token. */
function isSupportedBrowser(userAgent: string): boolean {
  const isEdge = /Edg(?:e|A|iOS)?\//.test(userAgent)
  const isOpera = /OPR\//.test(userAgent) || /Opera/.test(userAgent)
  const isFirefox = /Firefox\//.test(userAgent)
  const isChrome = /Chrome\//.test(userAgent) && !isEdge && !isOpera
  return isEdge || isFirefox || isChrome
}

export function BrowserSupportBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isSupportedBrowser(navigator.userAgent)) return
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      // Private browsing / blocked storage — fall through and show the banner anyway.
    }
    setVisible(true)
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // No persistence available; it'll just show again next visit.
    }
  }

  if (!visible) return null

  return (
    // Fixed, not part of normal flow — many pages (the editor, the schematic) size
    // themselves to `h-screen`, and a banner sitting in flow above them would push
    // their bottom edge off-screen instead of just overlapping the very top briefly.
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 border-b border-cad-warning/30 bg-cad-warning/10 px-4 py-2 font-sans text-sm text-cad-text">
      <AlertTriangle size={14} className="flex-shrink-0 text-cad-warning" />
      <span>
        FEAI is tested on <strong>Chrome, Firefox, and Edge</strong>. Some features may not work correctly in other browsers.
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 p-1 hover:bg-cad-warning/20"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default BrowserSupportBanner
