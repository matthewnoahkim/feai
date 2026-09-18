/**
 * Best-effort per-key rate limit for API routes (e.g. `assistant:${user.id}`,
 * `cad:${user.id}`). This is an in-memory sliding window, so it only holds against a single
 * warm server process - on Vercel (this app's target; see render.yaml's note that the
 * frontend stays on Vercel while cad-server runs on Render) serverless functions are
 * multiple, ephemeral instances, so a burst spread across cold starts or concurrent
 * instances won't all see the same counter. It still stops the common case (one runaway
 * client hammering one warm instance) for free; a shared store (Upstash Redis, Vercel KV)
 * is the real fix if this needs to be airtight.
 */

const DEFAULT_WINDOW_MS = 60_000
const DEFAULT_MAX_PER_WINDOW = 20

const hits = new Map<string, number[]>()

/** Returns true if `key` is still under the limit, recording this call as one more hit
 * toward it. Each call site should use its own key prefix (e.g. `cad:`, `assistant:`) so
 * different endpoints don't share one budget per user. */
export function checkAndRecordRateLimit(
  key: string,
  opts: { windowMs?: number; max?: number } = {}
): boolean {
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS
  const max = opts.max ?? DEFAULT_MAX_PER_WINDOW

  const now = Date.now()
  const windowStart = now - windowMs
  const recent = (hits.get(key) ?? []).filter(t => t > windowStart)

  if (recent.length >= max) {
    hits.set(key, recent)
    return false
  }

  recent.push(now)
  hits.set(key, recent)

  // Bound memory: drop entries for keys that haven't hit any endpoint recently, since
  // nothing else here ever removes one.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every(t => t <= windowStart)) hits.delete(k)
    }
  }

  return true
}
