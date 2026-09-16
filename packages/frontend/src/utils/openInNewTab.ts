/**
 * Opens `url` in a new browser tab, not a new window.
 *
 * `window.open(url, '_blank')` reliably opens a tab in Chrome/Firefox/Edge, but Safari's
 * tab-vs-window heuristic treats a *scripted* window.open call less favorably than a
 * genuine link click — called from something other than a direct primary click (e.g. a
 * double-click handler, or any handler that isn't the immediate result of the user's
 * first click on that element), Safari can pop it open as a separate OS-level window
 * instead of a tab. Synthesizing a real `<a target="_blank">` click makes Safari treat
 * it exactly like a user clicking a link, since — as far as the browser can tell — it is.
 */
export function openInNewTab(url: string): void {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * For a click handler that needs to do async work (e.g. an API call) before it knows
 * the final URL to open: call this synchronously, at the top of the handler, to open a
 * blank tab *within the original user gesture*; once the async work resolves, point it
 * at the real URL with `navigateTo`.
 *
 * Calling `window.open()` only after an `await` has elapsed loses the "trusted user
 * gesture" context — Safari's popup blocker (stricter here than Chrome/Firefox's) can
 * silently block it, or open it as a background window instead of a tab. Opening the
 * blank tab up front, synchronously, and merely navigating it later keeps the actual
 * `window.open()` call inside the trusted gesture; only the navigation is deferred.
 */
export function openTabWhenReady(): { navigateTo: (url: string) => void; close: () => void } {
  const tab = window.open('', '_blank')
  return {
    navigateTo: (url: string) => {
      if (tab) tab.location.href = url
    },
    close: () => {
      tab?.close()
    },
  }
}
