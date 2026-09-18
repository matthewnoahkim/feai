/**
 * Chat Service - client-side gateway to the CAD Assistant.
 *
 * The actual OpenAI call lives server-side in src/lib/assistant/openai.ts (imported only by
 * app/api/assistant/route.ts) so the API key never reaches the browser. This file just posts
 * to that route and parses its response - it must never import anything that reads
 * process.env.OPENAI_API_KEY.
 */

// `import type` (not a value import) so this has no runtime dependency on chatStore -
// chatStore imports DEFAULT_MODEL/OpenAIModel from this file, so a value import here would
// create a real circular module dependency instead of just a type-checking one.
import type { CadAction, ChatContext, ChatMessage } from '../store/chatStore'

// gpt-6-astra is OpenAI's current flagship - strongest reasoning/coding quality, which is
// what this assistant needs since it has to turn ambiguous English into a precise,
// schema-constrained action list. The Sol/Terra/Luna tier trades some of that reliability
// for lower latency/cost if that trade-off is ever needed instead.
export type OpenAIModel = 'gpt-6-astra' | 'gpt-5.6-sol' | 'gpt-5.6-terra' | 'gpt-5.6-luna'
export const DEFAULT_MODEL: OpenAIModel = 'gpt-6-astra'

export interface ChatResponse {
  message: string
  actions: CadAction[]
  clarification?: string
}

/**
 * Sends a message to the CAD Assistant via the server-side /api/assistant route (which
 * holds the real OpenAI key). Throws with a human-readable message on failure - the caller
 * (useChatAssistant.ts) surfaces that text directly in the chat transcript.
 */
export async function requestAssistant(
  userMessage: string,
  messages: ChatMessage[],
  context: ChatContext,
  model: OpenAIModel = DEFAULT_MODEL
): Promise<ChatResponse> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage, messages, context, model })
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error?.message || `Assistant request failed: ${response.status}`)
  }

  return data as ChatResponse
}

/**
 * Rate limit check - prevent too many actions at once
 */
export function checkRateLimit(actions: CadAction[], maxActions: number = 5): boolean {
  return actions.length <= maxActions
}
