/**
 * Server-only OpenAI integration for the CAD Assistant. This file reads process.env.
 * OPENAI_API_KEY directly and must never be imported by client code (components, hooks,
 * zustand stores) - only by the /api/assistant route handler. Client code calls that route
 * instead via services/chatService.ts's requestAssistant().
 */

import type { CadAction, ChatContext } from '@/store/chatStore'
import { FEATURE_CATALOG } from '@/store/featureAdapter'
import { DEFAULT_MODEL, type OpenAIModel } from '@/services/chatService'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Deliberately narrower than the store's ChatMessage: this is what the prompt-building
// below actually reads, and matching it structurally (rather than importing ChatMessage)
// lets the zod-validated request body from the API route be passed straight in with no
// cast, since the store type carries fields (Date timestamps, etc.) the request JSON
// doesn't have and doesn't need.
interface AssistantMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  actions?: unknown
}

// Generated from FEATURE_CATALOG (packages/frontend/src/store/featureAdapter.ts) so the
// assistant is never told about an operation cadExecutor can't actually perform.
function describeFeatureCatalog(): string {
  const live = FEATURE_CATALOG.filter(f => f.status === 'live')
  const planned = FEATURE_CATALOG.filter(f => f.status === 'planned')
  const lines = live.map(f => {
    const params = Object.entries(f.params).map(([k, v]) => `${k}${v ? ` (${v})` : ''}`).join(', ')
    return `- "${f.type}": ${f.summary}${params ? `\n  parameters: ${params}` : ''}`
  })
  const plannedList = planned.map(f => f.type).join(', ')
  return `${lines.join('\n')}\n\nNot yet implemented (say so if asked, do not emit these): ${plannedList || 'none'}.`
}

// System prompt that instructs the AI about CAD operations
const getSystemPrompt = (context: ChatContext): string => `You are CAD Assistant, an AI helper for a professional web-based CAD application. Your role is to help users create and modify 3D geometry through natural language commands, by emitting the same feature actions a user creates by hand - every action you emit becomes a normal, editable entry in the feature tree.

## Current Context
- Document ID: ${context.documentId || 'Not set'}
- Part Studio ID: ${context.partStudioId || 'Not set'}
- Selected Face: ${context.selectedFaceId || 'None'}
- Selected Edges: ${context.selectedEdgeIds.length > 0 ? context.selectedEdgeIds.join(', ') : 'None'}
- Selected Vertices: ${context.selectedVertexIds.length > 0 ? context.selectedVertexIds.join(', ') : 'None'}
- Units: ${context.units}
- Model State: ${context.modelDescription}

## What you can actually do

Each action has a "type" matching one of the feature types below (or "sketch" to create a
sketch, or a sketch-entities action to draw a profile first). Unknown or unsupported types
are rejected - only use what is listed here.

${describeFeatureCatalog()}

### Sketch entities (drawing a profile before extrude/revolve/sweep)
Action: { "type": "sketch", "endpoint": ".../sketches/:sketchId/entities", "body": { "sketchId": "...", "entities": [{ "type": "line|circle|arc|rectangle|polygon", "data": {...} }] } }
Entity data shapes: line/arc need {start:{x,y}, end:{x,y}} (arc also center, radius, startAngle/endAngle in radians); circle needs {center:{x,y}, radius}; rectangle needs {corner1:{x,y}, corner2:{x,y}}; polygon needs {center:{x,y}, radius, sides}.

## Response Format
The API call enforces JSON-object output, so your entire response is parsed as one JSON
object - do not wrap it in markdown code fences or add any text outside it. That object
must contain:
{
  "message": "Human-readable explanation of what you're doing",
  "actions": [
    {
      "type": "sketch|feature|document|analysis|export",
      "endpoint": "/api/documents/:docId/partstudios/:psId/...",
      "method": "GET"|"POST"|"PUT"|"DELETE",
      "body": { ...parameters },
      "description": "Brief description of this specific action"
    }
  ],
  "clarification": "Optional: question to ask if the request is ambiguous"
}

## Rules
1. ALWAYS respond with valid JSON in the exact format above
2. "type" must be one of the feature types listed above, or "sketch" - never invent one
3. Convert all dimensions to ${context.units} if not specified
4. If the request is ambiguous, ask for clarification instead of guessing
5. Break complex requests into sequential actions (sketch -> entities -> extrude, etc.)
6. If an operation isn't possible, explain why and suggest alternatives - don't pretend
7. For operations on selected geometry, use the context information provided
8. Include helpful success messages with the actual values used
9. Use emoji sparingly for visual feedback (✅ ❌ ⚠️)
10. "endpoint" and "method" are cosmetic labels for the activity log, not real requests - keep them short and descriptive

## Examples

User: "Create a sketch"
Response: {
  "message": "✅ Creating a new sketch on the top plane.",
  "actions": [{
    "type": "sketch",
    "endpoint": "sketch: top plane",
    "method": "POST",
    "body": { "planeId": "top" },
    "description": "Create sketch on the top plane"
  }]
}

User: "Add a 50mm circle"
Response: {
  "message": "✅ Adding a 50mm diameter circle to the sketch.",
  "actions": [{
    "type": "sketch",
    "endpoint": "sketch entities: [SKETCH_ID]",
    "method": "POST",
    "body": {
      "sketchId": "[SKETCH_ID]",
      "entities": [{ "type": "circle", "data": { "center": { "x": 0, "y": 0 }, "radius": 25 } }]
    },
    "description": "Add 50mm diameter circle"
  }]
}

User: "Extrude it 30mm"
Response: {
  "message": "✅ Extruding the sketch 30mm.",
  "actions": [{
    "type": "extrude",
    "endpoint": "feature: extrude",
    "method": "POST",
    "body": {
      "sketchId": "[SKETCH_ID]",
      "depth1": 30,
      "operation": "new"
    },
    "description": "Extrude 30mm"
  }]
}`

export interface ChatResponse {
  message: string
  actions: CadAction[]
  clarification?: string
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Builds the message history for the OpenAI API call
 */
function buildMessageHistory(
  messages: AssistantMessage[],
  context: ChatContext
): OpenAIMessage[] {
  const systemMessage: OpenAIMessage = {
    role: 'system',
    content: getSystemPrompt(context)
  }

  // Convert chat messages to OpenAI format (skip system messages from chat history)
  const chatMessages: OpenAIMessage[] = messages
    .filter(m => m.role !== 'system')
    .slice(-10) // Keep last 10 messages for context
    .map(m => {
      const hasActions = Array.isArray(m.actions) && m.actions.length > 0
      return {
        role: m.role as 'user' | 'assistant',
        content: m.role === 'assistant' && hasActions
          ? JSON.stringify({ message: m.content, actions: m.actions })
          : m.content
      }
    })

  return [systemMessage, ...chatMessages]
}

/**
 * Parse the AI response into structured format
 */
function parseAIResponse(content: string): ChatResponse {
  try {
    // response_format: { type: 'json_object' } makes the whole completion a JSON object,
    // so this should always succeed - the regex fallback below only matters if that
    // constraint is ever missing (older model, API change) and the model wrapped the
    // object in prose or a markdown fence anyway.
    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return { message: content, actions: [] }
      }
      parsed = JSON.parse(jsonMatch[0])
    }

    const actions: CadAction[] = (parsed.actions || []).map((action: any, index: number) => ({
      id: `action-${Date.now()}-${index}`,
      type: action.type || 'unknown',
      endpoint: action.endpoint || '',
      method: action.method || 'POST',
      body: action.body || {},
      description: action.description || '',
      status: 'pending' as const
    }))

    return {
      message: parsed.message || content,
      actions,
      clarification: parsed.clarification
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return {
      message: content,
      actions: []
    }
  }
}

/**
 * Calls the OpenAI Chat Completion API with FEAI's system prompt and the CAD Assistant's
 * feature-action schema. Server-only: reads the API key from process.env.OPENAI_API_KEY,
 * which is never exposed to the client (unlike the old NEXT_PUBLIC_OPENAI_API_KEY this
 * replaces).
 */
export async function runAssistant(
  userMessage: string,
  messages: AssistantMessage[],
  context: ChatContext,
  model: OpenAIModel = DEFAULT_MODEL
): Promise<ChatResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('The AI assistant is not configured on this server (missing OPENAI_API_KEY).')
  }

  const messageHistory = buildMessageHistory(messages, context)
  messageHistory.push({ role: 'user', content: userMessage })

  // Every model in OpenAIModel is reasoning-tier: they 400 on `temperature`/`max_tokens`
  // and take `reasoning_effort`/`max_completion_tokens` instead. "high" trades some latency
  // for the accuracy this needs - turning ambiguous English into a schema-exact action list
  // is worth more reasoning than a quick, more error-prone guess.
  const requestBody = {
    model,
    messages: messageHistory,
    reasoning_effort: 'high',
    max_completion_tokens: 2048,
    response_format: { type: 'json_object' as const },
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(error.error?.message || `OpenAI request failed: ${response.status}`)
  }

  const data = await response.json()
  const assistantMessage = data.choices?.[0]?.message?.content

  if (!assistantMessage) {
    throw new Error('No response from AI')
  }

  return parseAIResponse(assistantMessage)
}
