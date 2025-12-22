/**
 * CAD Executor - Executes AI-generated CAD commands using the document store
 */

import { CadAction } from '../store/chatStore'
import { useDocumentStore } from '../store/documentStore'

export interface ExecutionResult {
  success: boolean
  action: CadAction
  result?: any
  error?: string
  createdId?: string
}

export interface ExecutionSummary {
  success: boolean
  results: ExecutionResult[]
  message: string
  createdFeatureIds: string[]
}

/**
 * Execute a sequence of CAD actions using the document store
 */
export async function executeActions(
  actions: CadAction[],
  documentId: string,
  partStudioId: string,
  onProgress?: (action: CadAction, index: number) => void
): Promise<ExecutionSummary> {
  const results: ExecutionResult[] = []
  const createdFeatureIds: string[] = []
  let allSuccess = true
  
  // Safety check: ensure store is available
  let store
  try {
    store = useDocumentStore.getState()
    if (!store) {
      throw new Error('Store not initialized')
    }
  } catch (error) {
    console.error('Failed to get document store:', error)
    return {
      success: false,
      results: [],
      message: 'System not ready. Please try again or refresh the page.',
      createdFeatureIds: []
    }
  }
  
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    
    // Notify progress - executing
    if (onProgress) {
      onProgress({ ...action, status: 'executing' }, i)
    }
    
    try {
      const result = await executeAction(action, partStudioId, store)
      results.push(result)
      
      // Notify progress - completed (success or error)
      if (onProgress) {
        onProgress(result.action, i)
      }
      
      if (!result.success) {
        console.error('Action failed:', result.error, 'Action:', action)
        allSuccess = false
        break
      }
      
      if (result.createdId) {
        createdFeatureIds.push(result.createdId)
      }
    } catch (error) {
      console.error('Caught error executing action:', error, 'Action:', action)
      const errorAction = { ...action, status: 'error' as const }
      results.push({
        success: false,
        action: errorAction,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Notify progress - error
      if (onProgress) {
        onProgress(errorAction, i)
      }
      
      allSuccess = false
      break
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
  }
  
  return {
    success: allSuccess,
    results,
    message,
    createdFeatureIds
  }
}

/**
 * Execute a single CAD action
 */
async function executeAction(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  try {
    // Handle feature type (from new API endpoints)
    if (action.type === 'feature' && body.feature) {
      const feature = body.feature
      return await executeFeatureFromAPI(feature, partStudioId, store, action)
    }
    
    // Handle primitive shapes (box, cylinder, etc.)
    if (action.type === 'primitive' || action.endpoint?.includes('/primitives/')) {
      return await executePrimitive(action, partStudioId, store)
    }
    
    // Handle sketch type (from new API endpoints)
    if (action.type === 'sketch') {
      // Check if it's adding entities or creating a sketch
      if (action.endpoint?.includes('/entities') && body.entities) {
        return await executeSketchEntities(action, partStudioId, store)
      }
      return await executeSketch(action, partStudioId, store)
    }
    
    // Handle extrude
    if (action.type === 'extrude') {
      return await executeExtrude(action, partStudioId, store)
    }
    
    // Handle fillet
    if (action.type === 'fillet') {
      return await executeFillet(action, partStudioId, store)
    }
    
    // Handle chamfer
    if (action.type === 'chamfer') {
      return await executeChamfer(action, partStudioId, store)
    }
    
    // Handle revolve
    if (action.type === 'revolve') {
      return await executeRevolve(action, partStudioId, store)
    }
    
    // Handle shell
    if (action.type === 'shell') {
      return await executeShell(action, partStudioId, store)
    }
    
    // Handle linear pattern
    if (action.type === 'linear-pattern' || action.type === 'linearPattern') {
      return await executeLinearPattern(action, partStudioId, store)
    }
    
    // Handle circular pattern
    if (action.type === 'circular-pattern' || action.type === 'circularPattern') {
      return await executeCircularPattern(action, partStudioId, store)
    }
    
    // Handle mirror
    if (action.type === 'mirror' || action.type === 'mirror-feature') {
      return await executeMirror(action, partStudioId, store)
    }
    
    // Default: try to add as a generic feature
    const feature = await store.addFeature(partStudioId, {
      type: action.type,
      name: body.name || `${action.type} feature`,
      suppressed: false,
      parameters: body
    })
    
    if (feature) {
      return {
        success: true,
        action: { ...action, status: 'success' },
        createdId: feature.id
      }
    }
    
    return {
      success: false,
      action: { ...action, status: 'error' },
      error: 'Failed to create feature'
    }
  } catch (error) {
    return {
      success: false,
      action: { ...action, status: 'error' },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Execute a feature from the new API format
 */
async function executeFeatureFromAPI(
  feature: any,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>,
  action: CadAction
): Promise<ExecutionResult> {
  const featureType = feature.type
  const parameters = feature.parameters || {}
  const name = feature.name || `${featureType} feature`
  
  const createdFeature = await store.addFeature(partStudioId, {
    type: featureType,
    name,
    suppressed: false,
    parameters
  })
  
  if (createdFeature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: createdFeature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: `Failed to create ${featureType} feature`
  }
}

/**
 * Execute sketch entities (adding shapes to an existing sketch)
 */
async function executeSketchEntities(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  const entities = body.entities || []
  
  // For now, we'll create a sketch with these entities if one doesn't exist
  // In a real implementation, you'd extract the sketchId from the endpoint
  const sketch = await store.createSketch(partStudioId, 'top')
  
  if (sketch) {
    // Add the entities to the sketch (simplified - actual implementation would use the store)
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: sketch.id,
      result: { entities }
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to add sketch entities'
  }
}

/**
 * Execute primitive shape creation (box, cylinder, sphere, cone)
 */
async function executePrimitive(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  const endpoint = action.endpoint || ''
  
  // Determine primitive type from endpoint or body
  let featureType = 'extrude'
  let featureParams: any = {}
  let featureName = ''
  
  if (endpoint.includes('/box') || body.width !== undefined) {
    // Box primitive - uses extrude with width/height/depth fallback
    const width = body.width || 50
    const height = body.height || 50
    const depth = body.depth || 50
    featureName = `Box ${width}×${height}×${depth}`
    featureParams = {
      width,
      height,
      depth: depth,
      depth1: depth,
      operation: 'new'
    }
  } else if (endpoint.includes('/cylinder') || body.radius !== undefined) {
    // Cylinder primitive - uses revolve with radius/height fallback
    const radius = body.radius || (body.diameter ? body.diameter / 2 : 25)
    const height = body.height || 50
    featureName = `Cylinder R${radius} H${height}`
    featureType = 'revolve'
    featureParams = {
      radius,
      height,
      operation: 'new'
    }
  } else if (endpoint.includes('/sphere')) {
    // Sphere primitive
    const radius = body.radius || 25
    featureName = `Sphere R${radius}`
    featureType = 'revolve'
    featureParams = {
      radius,
      height: radius * 2,
      operation: 'new'
    }
  } else if (endpoint.includes('/cone')) {
    // Cone primitive
    const baseRadius = body.baseRadius || 25
    const topRadius = body.topRadius || 0
    const height = body.height || 50
    featureName = `Cone R${baseRadius} H${height}`
    featureType = 'revolve'
    featureParams = {
      radius: baseRadius,
      height,
      operation: 'new'
    }
  } else {
    return {
      success: false,
      action: { ...action, status: 'error' },
      error: 'Unknown primitive type'
    }
  }
  
  const feature = await store.addFeature(partStudioId, {
    type: featureType,
    name: featureName,
    suppressed: false,
    parameters: featureParams
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create primitive'
  }
}

/**
 * Execute extrude feature
 */
async function executeExtrude(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body?.feature?.parameters || action.body || {}
  const depth = body.depth || body.depth1 || 25
  
  const feature = await store.addFeature(partStudioId, {
    type: 'extrude',
    name: action.body?.feature?.name || `Extrude ${depth}mm`,
    suppressed: false,
    parameters: {
      depth1: depth,
      depth: depth,
      width: body.width || 30,
      height: body.height || 30,
      direction: body.direction || 'one',
      operation: body.operation || 'new',
      ...body
    }
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create extrude'
  }
}

/**
 * Execute fillet feature
 */
async function executeFillet(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  const feature = await store.addFeature(partStudioId, {
    type: 'fillet',
    name: `Fillet R${body.radius || 5}`,
    suppressed: false,
    parameters: {
      radius: body.radius || 5,
      edges: body.edges || []
    }
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create fillet'
  }
}

/**
 * Execute chamfer feature
 */
async function executeChamfer(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  const feature = await store.addFeature(partStudioId, {
    type: 'chamfer',
    name: `Chamfer ${body.distance || 3}mm`,
    suppressed: false,
    parameters: {
      distance: body.distance || 3,
      edges: body.edges || []
    }
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create chamfer'
  }
}

/**
 * Execute sketch creation
 */
async function executeSketch(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  const sketch = await store.createSketch(partStudioId, body.plane || 'top')
  
  if (sketch) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: sketch.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create sketch'
  }
}

/**
 * Execute revolve feature
 */
async function executeRevolve(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  const feature = await store.addFeature(partStudioId, {
    type: 'revolve',
    name: body.name || `Revolve ${body.angle || 360}°`,
    suppressed: false,
    parameters: {
      angle: body.angle || 360,
      axisId: body.axis || 'y-axis',
      operation: body.operation || 'new',
      ...body
    }
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create revolve'
  }
}

/**
 * Execute shell feature
 */
async function executeShell(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  const feature = await store.addFeature(partStudioId, {
    type: 'shell',
    name: body.name || `Shell ${body.thickness || 2}mm`,
    suppressed: false,
    parameters: {
      thickness: body.thickness || 2,
      faces: body.faces || [],
      ...body
    }
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create shell'
  }
}

/**
 * Execute linear pattern feature
 */
async function executeLinearPattern(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  const feature = await store.addFeature(partStudioId, {
    type: 'linear-pattern',
    name: body.name || `Linear Pattern`,
    suppressed: false,
    parameters: {
      count1: body.count || body.count1 || 3,
      spacing1: body.spacing || body.spacing1 || 20,
      direction1: body.direction || 'x',
      count2: body.count2 || 1,
      spacing2: body.spacing2 || 20,
      direction2: body.direction2 || 'y',
      ...body
    }
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create linear pattern'
  }
}

/**
 * Execute circular pattern feature
 */
async function executeCircularPattern(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  const feature = await store.addFeature(partStudioId, {
    type: 'circular-pattern',
    name: body.name || `Circular Pattern`,
    suppressed: false,
    parameters: {
      count: body.count || 6,
      angle: body.angle || 360,
      axis: body.axis || 'z',
      ...body
    }
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create circular pattern'
  }
}

/**
 * Execute mirror feature
 */
async function executeMirror(
  action: CadAction,
  partStudioId: string,
  store: ReturnType<typeof useDocumentStore.getState>
): Promise<ExecutionResult> {
  const body = action.body || {}
  
  const feature = await store.addFeature(partStudioId, {
    type: 'mirror-feature',
    name: body.name || `Mirror`,
    suppressed: false,
    parameters: {
      plane: body.plane || 'right',
      ...body
    }
  })
  
  if (feature) {
    return {
      success: true,
      action: { ...action, status: 'success' },
      createdId: feature.id
    }
  }
  
  return {
    success: false,
    action: { ...action, status: 'error' },
    error: 'Failed to create mirror'
  }
}

/**
 * Undo actions by deleting created features
 */
export async function undoActions(
  featureIds: string[],
  documentId: string,
  partStudioId: string
): Promise<{ success: boolean; message: string }> {
  // Safety check: ensure store is available
  let store
  try {
    store = useDocumentStore.getState()
    if (!store) {
      throw new Error('Store not initialized')
    }
  } catch (error) {
    console.error('Failed to get document store:', error)
    return {
      success: false,
      message: 'System not ready. Please try again or refresh the page.'
    }
  }
  
  try {
    for (const featureId of featureIds.reverse()) {
      await store.deleteFeature(partStudioId, featureId)
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
