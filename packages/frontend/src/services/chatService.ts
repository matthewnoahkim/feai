/**
 * Chat Service - Handles OpenAI API integration for CAD Assistant
 */

import { CadAction, ChatContext, ChatMessage } from '../store/chatStore'

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// System prompt that instructs the AI about CAD operations
const getSystemPrompt = (context: ChatContext): string => `You are CAD Assistant, an AI helper for a professional web-based CAD application. Your role is to help users create and modify 3D geometry through natural language commands.

## Current Context
- Document ID: ${context.documentId || 'Not set'}
- Part Studio ID: ${context.partStudioId || 'Not set'}
- Selected Face: ${context.selectedFaceId || 'None'}
- Selected Edges: ${context.selectedEdgeIds.length > 0 ? context.selectedEdgeIds.join(', ') : 'None'}
- Units: ${context.units}
- Model State: ${context.modelDescription}

## Available CAD API Operations

### Sketch Operations
- Create sketch: POST /api/documents/:docId/partstudios/:psId/sketches 
  Body: { name?: string, plane: { origin: {x,y,z}, normal: {x,y,z}, xAxis: {x,y,z} } }
- Add sketch entities: POST /api/documents/:docId/partstudios/:psId/sketches/:skId/entities
  Body: { entities: [{ type: "line|circle|arc|rectangle", ...params }] }
- Add sketch constraints: POST /api/documents/:docId/partstudios/:psId/sketches/:skId/constraints
  Body: { constraints: [{ type: "coincident|parallel|perpendicular|horizontal|vertical", ...params }] }

### Feature Operations
- Add feature (extrude, revolve, fillet, etc.): POST /api/documents/:docId/partstudios/:psId/features
  Body: { feature: { type: "extrude|revolve|fillet|chamfer|shell|linearPattern|circularPattern|mirror", parameters: {...} } }
- Update feature: PUT /api/documents/:docId/partstudios/:psId/features/:fId
  Body: { name?: string, parameters: {...} }
- Delete feature: DELETE /api/documents/:docId/partstudios/:psId/features/:fId
- Get features: GET /api/documents/:docId/partstudios/:psId/features

### Document Operations
- Create document: POST /api/documents
  Body: { name: string, description?: string }
- Get document: GET /api/documents/:id
- Update document: PUT /api/documents/:id
  Body: { name?: string, description?: string }
- Delete document: DELETE /api/documents/:id

### Analysis Operations
- Mass properties: GET /api/analysis/:docId/:elementId/mass-properties
- Interference check: GET /api/analysis/:docId/:elementId/interference
- Draft analysis: GET /api/analysis/:docId/:elementId/draft?pullDirection={...}
- Measure distance: POST /api/analysis/:docId/:elementId/measure
  Body: { from: {...}, to: {...}, measureType: "pointToPoint" }

### Export Operations
- Export model: GET /api/export/:docId/:elementId?format=step|stl|obj|json

## Response Format
You MUST respond with a valid JSON object containing:
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

IMPORTANT: Replace :docId with "${context.documentId}" and :psId with "${context.partStudioId}" in your endpoints!

## Rules
1. ALWAYS respond with valid JSON in the exact format above
2. ALWAYS use the REAL API endpoints shown above with proper document and part studio IDs from context
3. Convert all dimensions to ${context.units} if not specified
4. If the request is ambiguous, ask for clarification instead of guessing
5. Break complex requests into sequential actions
6. Only use the operations listed above - do not invent new ones
7. If an operation isn't possible, explain why and suggest alternatives
8. For operations on selected geometry, use the context information provided
9. Include helpful success messages with the actual values used
10. Use emoji sparingly for visual feedback (✅ ❌ ⚠️)

## Examples

User: "Create a sketch"
Response: {
  "message": "✅ Creating a new sketch on the XY plane (top face).",
  "actions": [{
    "type": "sketch",
    "endpoint": "/api/documents/${context.documentId}/partstudios/${context.partStudioId}/sketches",
    "method": "POST",
    "body": { 
      "name": "Sketch 1",
      "plane": { "origin": {"x": 0, "y": 0, "z": 0}, "normal": {"x": 0, "y": 0, "z": 1}, "xAxis": {"x": 1, "y": 0, "z": 0} }
    },
    "description": "Create sketch on XY plane"
  }]
}

User: "Add a 50mm circle"
Response: {
  "message": "✅ Adding a 50mm diameter circle to the sketch.",
  "actions": [{
    "type": "sketch",
    "endpoint": "/api/documents/${context.documentId}/partstudios/${context.partStudioId}/sketches/[SKETCH_ID]/entities",
    "method": "POST",
    "body": { 
      "entities": [{ "type": "circle", "center": {"x": 0, "y": 0}, "radius": 25 }]
    },
    "description": "Add 50mm circle"
  }]
}

User: "Extrude it 30mm"
Response: {
  "message": "✅ Extruding the sketch 30mm.",
  "actions": [{
    "type": "feature",
    "endpoint": "/api/documents/${context.documentId}/partstudios/${context.partStudioId}/features",
    "method": "POST",
    "body": { 
      "feature": {
        "type": "extrude",
        "name": "Extrude 1",
        "parameters": {
          "sketchId": "[SKETCH_ID]",
          "distance": 30,
          "direction": {"x": 0, "y": 0, "z": 1}
        }
      }
    },
    "description": "Extrude 30mm"
  }]
}`

export interface ChatResponse {
  message: string
  actions: CadAction[]
  clarification?: string
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Builds the message history for the OpenAI API call
 */
function buildMessageHistory(
  messages: ChatMessage[],
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
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.role === 'assistant' && m.actions?.length
        ? JSON.stringify({ message: m.content, actions: m.actions })
        : m.content
    }))
  
  return [systemMessage, ...chatMessages]
}

/**
 * Parse the AI response into structured format
 */
function parseAIResponse(content: string): ChatResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // If no JSON found, treat the whole response as a message
      return {
        message: content,
        actions: []
      }
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate and transform actions
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
 * Call the OpenAI Chat Completion API
 */
export async function callChatGPT(
  userMessage: string,
  messages: ChatMessage[],
  context: ChatContext,
  apiKey: string,
  model: string = 'gpt-4'
): Promise<ChatResponse> {
  const messageHistory = buildMessageHistory(messages, context)
  
  // Add the new user message
  messageHistory.push({
    role: 'user',
    content: userMessage
  })
  
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: messageHistory,
      temperature: 0.3, // Lower temperature for more consistent CAD commands
      max_tokens: 2048
    })
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(error.error?.message || `API request failed: ${response.status}`)
  }
  
  const data = await response.json()
  const assistantMessage = data.choices?.[0]?.message?.content
  
  if (!assistantMessage) {
    throw new Error('No response from AI')
  }
  
  return parseAIResponse(assistantMessage)
}

/**
 * Validate that an action is safe to execute (whitelist check)
 */
export function validateAction(action: CadAction): boolean {
  // Normalize the endpoint - ensure it starts with /api
  const normalizedEndpoint = action.endpoint.startsWith('/api') 
    ? action.endpoint 
    : `/api${action.endpoint}`
  
  const allowedEndpoints = [
    '/api/documents',
    '/api/parts',
    '/api/sketches',
    '/api/assemblies',
    '/api/drawings',
    '/api/export',
    '/api/import',
    '/api/analysis',
    '/api/fea'
  ]
  
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  
  // Check method
  if (!allowedMethods.includes(action.method)) {
    return false
  }
  
  // Check endpoint against whitelist
  const isAllowed = allowedEndpoints.some(allowed => 
    normalizedEndpoint.startsWith(allowed)
  )
  
  return isAllowed
}

/**
 * Rate limit check - prevent too many actions at once
 */
export function checkRateLimit(actions: CadAction[], maxActions: number = 5): boolean {
  return actions.length <= maxActions
}

