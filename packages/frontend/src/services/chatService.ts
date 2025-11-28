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

## Available CAD Operations

### Sketch Operations
- Create sketch on plane: POST /sketches { plane: "top"|"front"|"right"|faceId, name?: string }
- Add circle: POST /sketches/:id/entities { type: "circle", center: {x, y}, radius: number }
- Add rectangle: POST /sketches/:id/entities { type: "rectangle", center: {x, y}, width: number, height: number }
- Add line: POST /sketches/:id/entities { type: "line", start: {x, y}, end: {x, y} }

### Feature Operations
- Extrude: POST /features { type: "extrude", profiles: [sketchId], depth: number, direction: "one"|"symmetric"|"two", operation: "new"|"add"|"remove" }
- Revolve: POST /features { type: "revolve", profiles: [sketchId], axis: "x"|"y"|"z"|edgeId, angle: number }
- Fillet: POST /features { type: "fillet", edges: [edgeIds], radius: number }
- Chamfer: POST /features { type: "chamfer", edges: [edgeIds], distance: number }
- Shell: POST /features { type: "shell", faces: [faceIds], thickness: number }
- Linear Pattern: POST /features { type: "linearPattern", features: [featureIds], direction: {x,y,z}, count: number, spacing: number }
- Circular Pattern: POST /features { type: "circularPattern", features: [featureIds], axis: {point: {x,y,z}, direction: {x,y,z}}, count: number, angle?: number }
- Mirror: POST /features { type: "mirror", features: [featureIds], plane: "top"|"front"|"right"|planeId }

### Primitive Shapes (Quick Creation)
- Create Box: POST /primitives/box { width: number, height: number, depth: number, center?: {x,y,z} }
- Create Cylinder: POST /primitives/cylinder { radius: number, height: number, center?: {x,y,z} }
- Create Sphere: POST /primitives/sphere { radius: number, center?: {x,y,z} }
- Create Cone: POST /primitives/cone { baseRadius: number, topRadius: number, height: number, center?: {x,y,z} }

### Edit Operations
- Delete Feature: DELETE /features/:featureId
- Update Feature: PUT /features/:featureId { ...updatedParams }
- Undo Last: POST /undo

## Response Format
You MUST respond with a valid JSON object containing:
{
  "message": "Human-readable explanation of what you're doing",
  "actions": [
    {
      "type": "sketch"|"extrude"|"revolve"|"fillet"|"chamfer"|"shell"|"pattern"|"mirror"|"delete"|"undo"|"primitive",
      "endpoint": "/api/path",
      "method": "GET"|"POST"|"PUT"|"DELETE",
      "body": { ...parameters },
      "description": "Brief description of this specific action"
    }
  ],
  "clarification": "Optional: question to ask if the request is ambiguous"
}

## Rules
1. ALWAYS respond with valid JSON in the exact format above
2. Convert all dimensions to ${context.units} if not specified
3. If the request is ambiguous, ask for clarification instead of guessing
4. Break complex requests into sequential actions
5. Only use the operations listed above - do not invent new ones
6. If an operation isn't possible, explain why and suggest alternatives
7. For operations on selected geometry, use the context information provided
8. Include helpful success messages with the actual values used
9. Use emoji sparingly for visual feedback (✅ ❌ ⚠️)

## Examples

User: "Create a 50mm cube"
Response: {
  "message": "✅ Creating a 50mm cube at the origin.",
  "actions": [{
    "type": "primitive",
    "endpoint": "/api/primitives/box",
    "method": "POST",
    "body": { "width": 50, "height": 50, "depth": 50 },
    "description": "Create 50x50x50mm box"
  }]
}

User: "Make a hole on top"
Response: {
  "message": "I'd be happy to create a hole on the top face. Could you specify the diameter and depth of the hole?",
  "actions": [],
  "clarification": "What diameter and depth should the hole be?"
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
  // Normalize the endpoint - remove leading /api if present
  const normalizedEndpoint = action.endpoint.replace(/^\/api/, '')
  
  const allowedEndpoints = [
    '/primitives',
    '/features',
    '/sketches',
    '/undo',
    '/documents'
  ]
  
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE']
  
  // Check method
  if (!allowedMethods.includes(action.method)) {
    return false
  }
  
  // Check endpoint against whitelist - be more permissive
  const isAllowed = allowedEndpoints.some(allowed => 
    normalizedEndpoint.startsWith(allowed) || 
    action.endpoint.startsWith(allowed) ||
    action.endpoint.startsWith('/api' + allowed)
  )
  
  // Also allow if it's a known action type
  const knownTypes = ['sketch', 'extrude', 'revolve', 'fillet', 'chamfer', 'shell', 'pattern', 'mirror', 'delete', 'undo', 'loft', 'sweep', 'primitive']
  const isKnownType = knownTypes.includes(action.type)
  
  return isAllowed || isKnownType
}

/**
 * Rate limit check - prevent too many actions at once
 */
export function checkRateLimit(actions: CadAction[], maxActions: number = 5): boolean {
  return actions.length <= maxActions
}

