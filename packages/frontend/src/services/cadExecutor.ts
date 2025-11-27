/**
 * CAD Executor - Executes AI-generated CAD commands via the REST API
 */

import { CadAction } from '../store/chatStore'
import { api } from '../api/client'

const API_BASE = '/api'

export interface ExecutionResult {
  success: boolean
  action: CadAction
  result?: any
  error?: string
  createdId?: string
}

/**
 * Execute a single CAD action via the REST API
 */
async function executeAction(
  action: CadAction,
  documentId: string,
  partStudioId: string,
  previousResults: Map<string, any>
): Promise<ExecutionResult> {
  try {
    // Replace placeholder references with actual IDs from previous results
    const body = replacePlaceholders(action.body, previousResults)
    
    // Build the full endpoint URL with document/part studio context
    const endpoint = buildEndpoint(action.endpoint, documentId, partStudioId)
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: action.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: action.method !== 'GET' ? JSON.stringify(body) : undefined
    })
    
    const data = await response.json()
    
    if (!response.ok || !data.success) {
      return {
        success: false,
        action: { ...action, status: 'error' },
        error: data.error?.message || `Request failed with status ${response.status}`
      }
    }
    
    return {
      success: true,
      action: { ...action, status: 'success' },
      result: data.data,
      createdId: data.data?.id || data.data?.feature?.id || data.data?.sketch?.id
    }
  } catch (error) {
    return {
      success: false,
      action: { ...action, status: 'error' },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Replace placeholder references in the body with actual IDs
 * E.g., "<sketch_1>" becomes the actual sketch ID from previous results
 */
function replacePlaceholders(
  body: Record<string, any> | undefined,
  previousResults: Map<string, any>
): Record<string, any> | undefined {
  if (!body) return undefined
  
  const replaced = JSON.stringify(body)
  
  // Replace placeholders like <action_0>, <sketch_1>, etc.
  const result = replaced.replace(/<(\w+_\d+)>/g, (match, key) => {
    const value = previousResults.get(key)
    return value ? JSON.stringify(value).slice(1, -1) : match
  })
  
  return JSON.parse(result)
}

/**
 * Build the full endpoint URL with document/part studio IDs
 */
function buildEndpoint(
  endpoint: string,
  documentId: string,
  partStudioId: string
): string {
  // Handle different endpoint patterns
  if (endpoint.startsWith('/api/')) {
    endpoint = endpoint.slice(4) // Remove /api/ prefix
  }
  
  // Map generic endpoints to document-specific endpoints
  if (endpoint.startsWith('/primitives/')) {
    // Primitives are created in the active part studio
    return `/documents/${documentId}/partstudios/${partStudioId}/features`
  }
  
  if (endpoint.startsWith('/features')) {
    return `/documents/${documentId}/partstudios/${partStudioId}${endpoint}`
  }
  
  if (endpoint.startsWith('/sketches')) {
    return `/documents/${documentId}/partstudios/${partStudioId}${endpoint}`
  }
  
  if (endpoint === '/undo') {
    return `/documents/${documentId}/partstudios/${partStudioId}/undo`
  }
  
  return endpoint
}

/**
 * Transform primitive commands into feature commands
 */
function transformPrimitiveToFeature(action: CadAction): CadAction {
  const body = action.body || {}
  
  // Handle box primitive
  if (action.endpoint.includes('/box')) {
    return {
      ...action,
      type: 'extrude',
      endpoint: '/features',
      body: {
        feature: {
          type: 'extrude',
          name: `Box ${body.width}x${body.height}x${body.depth}`,
          parameters: {
            // Create a rectangle sketch and extrude it
            createSketch: true,
            sketchShape: 'rectangle',
            sketchWidth: body.width || 50,
            sketchHeight: body.depth || 50,
            depth: body.height || 50,
            direction: 'one',
            operation: 'new'
          }
        }
      }
    }
  }
  
  // Handle cylinder primitive
  if (action.endpoint.includes('/cylinder')) {
    return {
      ...action,
      type: 'extrude',
      endpoint: '/features',
      body: {
        feature: {
          type: 'extrude',
          name: `Cylinder R${body.radius} H${body.height}`,
          parameters: {
            createSketch: true,
            sketchShape: 'circle',
            sketchRadius: body.radius || 25,
            depth: body.height || 50,
            direction: 'one',
            operation: 'new'
          }
        }
      }
    }
  }
  
  // Handle sphere primitive
  if (action.endpoint.includes('/sphere')) {
    return {
      ...action,
      type: 'revolve',
      endpoint: '/features',
      body: {
        feature: {
          type: 'revolve',
          name: `Sphere R${body.radius}`,
          parameters: {
            createSketch: true,
            sketchShape: 'semicircle',
            sketchRadius: body.radius || 25,
            axis: 'y',
            angle: 360,
            operation: 'new'
          }
        }
      }
    }
  }
  
  // Handle cone primitive
  if (action.endpoint.includes('/cone')) {
    return {
      ...action,
      type: 'loft',
      endpoint: '/features',
      body: {
        feature: {
          type: 'loft',
          name: `Cone R${body.baseRadius} H${body.height}`,
          parameters: {
            createSketch: true,
            baseRadius: body.baseRadius || 25,
            topRadius: body.topRadius || 0,
            height: body.height || 50,
            operation: 'new'
          }
        }
      }
    }
  }
  
  return action
}

export interface ExecutionSummary {
  success: boolean
  results: ExecutionResult[]
  message: string
  createdFeatureIds: string[]
}

/**
 * Execute a sequence of CAD actions
 */
export async function executeActions(
  actions: CadAction[],
  documentId: string,
  partStudioId: string,
  onProgress?: (action: CadAction, index: number) => void
): Promise<ExecutionSummary> {
  const results: ExecutionResult[] = []
  const previousResults = new Map<string, any>()
  const createdFeatureIds: string[] = []
  let allSuccess = true
  
  for (let i = 0; i < actions.length; i++) {
    let action = actions[i]
    
    // Transform primitive commands
    if (action.endpoint.includes('/primitives/')) {
      action = transformPrimitiveToFeature(action)
    }
    
    // Notify progress
    if (onProgress) {
      onProgress({ ...action, status: 'executing' }, i)
    }
    
    const result = await executeAction(action, documentId, partStudioId, previousResults)
    results.push(result)
    
    if (!result.success) {
      allSuccess = false
      break // Stop on first failure
    }
    
    // Store result for potential use in later actions
    if (result.createdId) {
      previousResults.set(`action_${i}`, result.createdId)
      previousResults.set(`${action.type}_${i}`, result.createdId)
      createdFeatureIds.push(result.createdId)
    }
  }
  
  // Generate summary message
  let message: string
  if (allSuccess) {
    message = `✅ Successfully executed ${results.length} action${results.length > 1 ? 's' : ''}.`
  } else {
    const failedIndex = results.findIndex(r => !r.success)
    const failedAction = results[failedIndex]
    message = `❌ Action ${failedIndex + 1} failed: ${failedAction.error}`
    
    // If some actions succeeded before the failure, offer to undo
    if (failedIndex > 0) {
      message += `\n⚠️ ${failedIndex} action${failedIndex > 1 ? 's were' : ' was'} completed before the failure.`
    }
  }
  
  return {
    success: allSuccess,
    results,
    message,
    createdFeatureIds
  }
}

/**
 * Undo the last action by deleting created features
 */
export async function undoActions(
  featureIds: string[],
  documentId: string,
  partStudioId: string
): Promise<{ success: boolean; message: string }> {
  try {
    for (const featureId of featureIds.reverse()) {
      await api.deleteFeature(documentId, partStudioId, featureId)
    }
    
    return {
      success: true,
      message: `↩️ Undone ${featureIds.length} feature${featureIds.length > 1 ? 's' : ''}.`
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to undo: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

