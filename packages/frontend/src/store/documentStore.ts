/**
 * Document Store - Manages CAD document state
 */

import { create } from 'zustand'
import { api } from '../api/client'
import { cadSolverClient } from '../lib/cad-solver/client'
import type { Plane as CadPlane, ProfileEntity as CadProfileEntity, ShapeResult as CadShapeResult } from '../lib/cad-solver/types'

export type SketchConstraintType = 
  | 'coincident'     // Two points share location, or point on curve
  | 'horizontal'     // Line or point pair is horizontal
  | 'vertical'       // Line or point pair is vertical
  | 'parallel'       // Two lines are parallel
  | 'perpendicular'  // Two lines are perpendicular (90°)
  | 'tangent'        // Line tangent to curve, or curves tangent
  | 'equal'          // Two lengths or radii are equal
  | 'concentric'     // Two circles share center
  | 'midpoint'       // Point at midpoint of line
  | 'symmetric'      // Two items symmetric about a line
  | 'fixed'          // Entity position is locked

export type ConstraintStatus = 'satisfied' | 'unsatisfied' | 'redundant'

export interface SketchConstraint {
  id: string
  type: SketchConstraintType
  entityIds: string[]      // IDs of entities involved
  referenceId?: string     // For symmetric: the mirror line ID
  value?: number           // For dimensional constraints (angle, etc.)
  status: ConstraintStatus // Whether constraint is satisfied
  driven?: boolean         // If true, this is a reference constraint (doesn't drive geometry)
}

export type SketchStatus = 'under-constrained' | 'fully-constrained' | 'over-constrained'

export interface SketchEntity {
  id: string
  type: 'line' | 'circle' | 'arc' | 'rectangle' | 'polygon' | 'spline' | 'point'
  construction: boolean
  data: Record<string, any>
  constraintStatus?: 'under' | 'fully' | 'over' // Constraint status of this entity
}

export interface Sketch {
  id: string
  name: string
  plane: { origin: number[]; normal: number[]; xAxis: number[] }
  entities: SketchEntity[]
  constraints: SketchConstraint[]
  solved: boolean
  status: SketchStatus  // Overall constraint status
}

export interface Feature {
  id: string
  type: string
  name: string
  suppressed: boolean
  rollbackSuppressed?: boolean // Temporarily suppressed by history rollback
  parameters: Record<string, any>
  error?: string
  warning?: string
  dependencies?: string[] // IDs of features this depends on
}

export interface Part {
  id: string
  name: string
  material?: string
  color: string
  visible?: boolean  // Visibility state for hide/show
  mesh?: {
    vertices: number[]
    normals: number[]
    indices: number[]
  }
  edges?: Array<{ start: number[]; end: number[] }>
  /** Reference to the real B-rep shape in FEAI's modeling engine (packages/cad-server),
   * used to chain booleans/fillets/chamfers onto this body. Absent for imported parts
   * with no server-side shape. */
  shapeId?: string
}

export interface PartStudio {
  id: string
  name: string
  features: Feature[]
  sketches: Map<string, Sketch>
  parts: Part[]
}

export interface AssemblyInstance {
  id: string
  name: string
  partId: string
  transform: number[]
  visible: boolean
}

export interface Assembly {
  id: string
  name: string
  instances: AssemblyInstance[]
  mates: any[]
}

export interface Document {
  id: string
  name: string
  description?: string
  units: 'mm' | 'inch' | 'm'
  partStudios: PartStudio[]
  assemblies: Assembly[]
  activeElementId: string | null
  activeElementType: 'partStudio' | 'assembly' | null
  
  // Export settings
  exportSettings?: {
    excludeHiddenParts: boolean  // Whether to exclude hidden parts from exports
    excludeSuppressedFeatures: boolean  // Whether to exclude suppressed features
  }
}

interface DocumentState {
  document: Document | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
  
  // Undo/Redo state
  undoStack: Document[]
  redoStack: Document[]
  canUndo: boolean
  canRedo: boolean
  
  // Transform/Move operations
  transformBody: (bodyId: string, translation: { x: number; y: number; z: number }, rotation: { axis: 'x' | 'y' | 'z' | 'custom'; angle: number; customAxis?: { x: number; y: number; z: number } }, createCopy: boolean) => void
  
  // Visibility operations
  toggleBodyVisibility: (bodyId: string) => void
  showAllBodies: () => void
  
  // Actions
  createNewDocument: (name: string) => Promise<void>
  loadDocument: (id: string) => Promise<void>
  loadDocumentFromData: (data: Document) => void
  saveDocument: () => Promise<void>
  
  // Undo/Redo operations
  undo: () => Promise<void>
  redo: () => Promise<void>
  pushUndoState: () => void
  
  // Part Studio operations
  setActiveElement: (id: string, type: 'partStudio' | 'assembly') => void
  addFeature: (partStudioId: string, feature: Omit<Feature, 'id'>) => Promise<Feature | null>
  updateFeature: (partStudioId: string, featureId: string, params: Record<string, any>) => Promise<void>
  deleteFeature: (partStudioId: string, featureId: string) => Promise<void>
  copyFeature: (partStudioId: string, featureId: string) => Promise<Feature | null>
  toggleFeatureSuppression: (partStudioId: string, featureId: string) => void
  reorderFeature: (partStudioId: string, featureId: string, newIndex: number) => void
  renameFeature: (partStudioId: string, featureId: string, newName: string) => void
  
  // Sketch operations
  createSketch: (partStudioId: string, planeId: string) => Promise<Sketch | null>
  addSketchEntity: (sketchId: string, entity: Omit<SketchEntity, 'id'>) => void
  updateSketchEntity: (sketchId: string, entityId: string, data: Record<string, any>) => void
  deleteSketchEntity: (sketchId: string, entityId: string) => void
  addSketchConstraint: (sketchId: string, constraint: Omit<SketchConstraint, 'id'>) => void
  deleteSketchConstraint: (sketchId: string, constraintId: string) => void
  updateEntityConstraintStatus: (sketchId: string) => void
  solveSketch: (sketchId: string) => void
  
  // Part operations
  updatePartMaterial: (partId: string, material: string) => void
  updatePartColor: (partId: string, color: string) => void
  regenerateModel: (partStudioId: string) => Promise<void>
  
  // Import operations
  importSTLPart: (partStudioId: string, name: string, mesh: { vertices: number[], normals: number[], indices: number[] }) => void
  
  // Document operations
  updateDocumentName: (name: string) => void
  updateDocumentUnits: (units: 'mm' | 'inch' | 'm') => void
  updateExportSettings: (settings: Partial<Document['exportSettings']>) => void
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Deep clone a document for undo/redo
function cloneDocument(doc: Document): Document {
  return {
    ...doc,
    partStudios: doc.partStudios.map(ps => ({
      ...ps,
      features: [...ps.features],
      sketches: new Map(ps.sketches),
      parts: ps.parts.map(p => ({ ...p }))
    })),
    assemblies: doc.assemblies.map(a => ({ ...a }))
  }
}
// ============================================================================
// EXTRUDE MESH GENERATION FUNCTIONS
// ============================================================================

interface ExtrudeParams {
  depth1: number
  flipDirection1: boolean
  useSecondDirection: boolean
  depth2: number
  useDraft: boolean
  draftAngle: number
  draftOutward: boolean
  endCondition1: string
}
// ============================================================================
// REVOLVE MESH GENERATION FUNCTIONS
// ============================================================================

interface RevolveParams {
  angle: number          // Total angle in degrees
  angle2: number         // Second direction angle (if asymmetric)
  axisId: string         // Axis to revolve around ('x-axis', 'y-axis', 'z-axis', or entity ID)
  directionType: 'full' | 'one-direction' | 'symmetric'
}

// Resolve axis in WORLD coordinates from axis reference
function resolveAxisWorld(
  axisId: string,
  sketch: Sketch,
  partStudio?: PartStudio
): { pointWorld: [number, number, number], directionWorld: [number, number, number] } | null {
  // Case 1: Reference axes (already in world coords)
  switch (axisId) {
    case 'x-axis':
      return { pointWorld: [0, 0, 0], directionWorld: [1, 0, 0] }
    case 'y-axis':
      return { pointWorld: [0, 0, 0], directionWorld: [0, 1, 0] }
    case 'z-axis':
      return { pointWorld: [0, 0, 0], directionWorld: [0, 0, 1] }
  }
  
  // Case 2: Sketch construction line (transform from sketch local to world)
  if (partStudio) {
    for (const [, sketchItem] of partStudio.sketches) {
      const entity = sketchItem.entities.find(e => e.id === axisId)
      if (entity && entity.type === 'line') {
        const data = entity.data
        if (data.start && data.end) {
          // Get line endpoints in sketch local coordinates
          const start2D = { x: data.start.x, y: data.start.y }
          const end2D = { x: data.end.x, y: data.end.y }
          
          // Transform to world coordinates using sketch plane
          const plane = sketchItem.plane
          const startWorld = sketchLocalToWorld(start2D, plane)
          const endWorld = sketchLocalToWorld(end2D, plane)
          
          // Calculate direction and normalize
          const dx = endWorld[0] - startWorld[0]
          const dy = endWorld[1] - startWorld[1]
          const dz = endWorld[2] - startWorld[2]
          const length = Math.sqrt(dx * dx + dy * dy + dz * dz)
          
          if (length > 1e-6) {
            return {
              pointWorld: startWorld,
              directionWorld: [dx / length, dy / length, dz / length]
            }
          }
        }
      }
    }
  }
  
  // Case 3: Check in current sketch
  const entity = sketch.entities.find(e => e.id === axisId)
  if (entity && entity.type === 'line') {
    const data = entity.data
    if (data.start && data.end) {
      const start2D = { x: data.start.x, y: data.start.y }
      const end2D = { x: data.end.x, y: data.end.y }
      
      const startWorld = sketchLocalToWorld(start2D, sketch.plane)
      const endWorld = sketchLocalToWorld(end2D, sketch.plane)
      
      const dx = endWorld[0] - startWorld[0]
      const dy = endWorld[1] - startWorld[1]
      const dz = endWorld[2] - startWorld[2]
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz)
      
      if (length > 1e-6) {
        return {
          pointWorld: startWorld,
          directionWorld: [dx / length, dy / length, dz / length]
        }
      }
    }
  }
  
  return null
}

// Transform sketch local 2D coordinates to world 3D coordinates
function sketchLocalToWorld(
  point2D: { x: number, y: number },
  plane: { origin: number[], normal: number[], xAxis: number[] }
): [number, number, number] {
  // Extract plane properties
  const [ox, oy, oz] = plane.origin
  const [nx, ny, nz] = plane.normal
  
  // Simple case: if plane is aligned with XY (normal is Z)
  if (Math.abs(nz - 1) < 1e-6) {
    return [
      ox + point2D.x,
      oy + point2D.y,
      oz
    ]
  }
  
  // For other orientations, we need to compute the plane's coordinate frame
  // For now, use a simplified approach
  return [
    ox + point2D.x,
    oy + point2D.y,
    oz
  ]
}
// ============================================================================
// SWEEP MESH GENERATION FUNCTIONS
// ============================================================================

interface SweepParams {
  orientation: 'follow-path' | 'fixed' | 'keep-normal'
  twistAngle: number      // Total twist in degrees
  endScale: number        // Scale at end of path (1.0 = no change)
}
// ============================================================================
// FEAI MODELING ENGINE INTEGRATION (packages/cad-server)
// ============================================================================

function defaultPlane(): CadPlane {
  return { origin: [0, 0, 0], normal: [0, 0, 1], xAxis: [1, 0, 0] }
}

function sketchPlane(sketch: Sketch | undefined): CadPlane {
  return sketch ? { origin: sketch.plane.origin, normal: sketch.plane.normal, xAxis: sketch.plane.xAxis } : defaultPlane()
}

function toCadProfile(entity: SketchEntity): CadProfileEntity | null {
  if (entity.type === 'rectangle' || entity.type === 'circle' || entity.type === 'polygon') {
    return { type: entity.type, data: entity.data }
  }
  return null
}

function toCadPath(entity: SketchEntity): { type: 'line' | 'arc'; data: Record<string, any> } | null {
  if (entity.type === 'line' || entity.type === 'arc') {
    return { type: entity.type, data: entity.data }
  }
  return null
}

function resolveRevolveAxis(
  axisId: string,
  sketch: Sketch | undefined,
  partStudio: PartStudio
): { pointWorld: [number, number, number]; directionWorld: [number, number, number] } {
  if (sketch) {
    const resolved = resolveAxisWorld(axisId, sketch, partStudio)
    if (resolved) return resolved
  }
  switch (axisId) {
    case 'x-axis':
      return { pointWorld: [0, 0, 0], directionWorld: [1, 0, 0] }
    case 'z-axis':
      return { pointWorld: [0, 0, 0], directionWorld: [0, 0, 1] }
    default:
      return { pointWorld: [0, 0, 0], directionWorld: [0, 1, 0] }
  }
}

function shapeResultToPartFields(result: CadShapeResult): Pick<Part, 'mesh' | 'edges' | 'shapeId'> {
  const edges: Array<{ start: number[]; end: number[] }> = []
  for (const edge of result.edges) {
    for (let i = 0; i + 5 < edge.points.length; i += 3) {
      edges.push({
        start: [edge.points[i], edge.points[i + 1], edge.points[i + 2]],
        end: [edge.points[i + 3], edge.points[i + 4], edge.points[i + 5]],
      })
    }
  }
  return {
    mesh: {
      vertices: result.mesh.positions,
      normals: result.mesh.normals,
      indices: result.mesh.indices,
    },
    edges,
    shapeId: result.shapeId,
  }
}

/** Replaces an existing entry in `parts` by id, or appends a new one — `combineIntoBody`
 * returns a fresh object (never mutates in place), so the parts array needs updating
 * either way. */
function applyBody(parts: Part[], previous: Part | null, next: Part): Part {
  if (previous && previous.id === next.id) {
    const idx = parts.findIndex(p => p.id === next.id)
    if (idx >= 0) {
      parts[idx] = next
    } else {
      parts.push(next)
    }
  } else {
    parts.push(next)
  }
  return next
}

/** Combines a newly-created shape into the running body per the feature's operation
 * ('new' | 'add' | 'remove' | 'intersect'). Booleans need a real shapeId on both
 * sides — a body without one (e.g. an imported part with no server-side shape) can't
 * be combined, so the new shape replaces it outright instead. */
async function combineIntoBody(
  currentBody: Part | null,
  operation: string,
  newResult: CadShapeResult,
  bodyName: string
): Promise<Part> {
  const fields = shapeResultToPartFields(newResult)

  if (operation === 'new' || !currentBody) {
    return { id: generateId(), name: bodyName, color: '#6b7280', ...fields }
  }

  const booleanOp =
    operation === 'add' ? 'union' : operation === 'remove' ? 'cut' : operation === 'intersect' ? 'intersect' : null

  if (booleanOp && currentBody.shapeId) {
    try {
      const combined = await cadSolverClient.booleanOp({
        op: booleanOp,
        baseShapeId: currentBody.shapeId,
        toolShapeId: newResult.shapeId,
      })
      return {
        ...currentBody,
        ...shapeResultToPartFields(combined),
        color: operation === 'remove' ? '#ef4444' : currentBody.color,
      }
    } catch (error) {
      console.error('Boolean operation failed, falling back to the new shape alone:', error)
    }
  } else if (booleanOp) {
    console.warn('Cannot combine into a body with no server-side shapeId; using the new shape alone.')
  }

  return { ...currentBody, ...fields, color: operation === 'remove' ? '#ef4444' : currentBody.color }
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  isLoading: false,
  error: null,
  isDirty: false,
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,
  
  createNewDocument: async (name: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const psId = generateId()
      const newDoc: Document = {
        id: generateId(),
        name,
        units: 'mm',
        partStudios: [{
          id: psId,
          name: 'Part Studio 1',
          features: [],
          sketches: new Map(),
          parts: []
        }],
        assemblies: [],
        activeElementId: psId,
        activeElementType: 'partStudio'
      }
      
      set({ document: newDoc, isLoading: false, isDirty: true })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  loadDocument: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getDocument(id)
      // Transform API response to local format
      set({ document: response as unknown as Document, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  saveDocument: async () => {
    const { document } = get()
    if (!document) return
    
    set({ isLoading: true })
    try {
      // Convert Maps to plain objects for JSON serialization
      const serializableDoc = {
        ...document,
        partStudios: document.partStudios.map(ps => ({
          ...ps,
          sketches: Object.fromEntries(ps.sketches) // Convert Map to object
        }))
      }
      
      // Get project ID from URL or current project
      const projectIdMatch = window.location.pathname.match(/\/editor\/(.+)/)
      const projectId = projectIdMatch ? projectIdMatch[1] : null
      
      if (projectId) {
        const { saveProjectData } = await import('./projectStore').then(m => m.useProjectStore.getState())
        await saveProjectData(projectId, serializableDoc)
        set({ isLoading: false, isDirty: false })
        console.log('Document saved successfully')
      } else {
        // Fallback to localStorage if no project ID
        localStorage.setItem('cadDocument', JSON.stringify(serializableDoc))
        set({ isLoading: false, isDirty: false })
        console.log('Document saved to localStorage')
      }
    } catch (error) {
      console.error('Error saving document:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  loadDocumentFromData: (data: Document) => {
    try {
      // Convert sketches from plain object to Map if needed
      const partStudios = data.partStudios.map(ps => ({
        ...ps,
        sketches: ps.sketches instanceof Map ? ps.sketches : new Map<string, Sketch>(Object.entries(ps.sketches || {}))
      }))
      
      const normalizedData = {
        ...data,
        partStudios
      }
      
      set({ document: normalizedData, isDirty: false, isLoading: false, error: null })
      
      // Regenerate model for each part studio asynchronously
      const { regenerateModel } = get()
      partStudios.forEach(ps => {
        regenerateModel(ps.id).catch(err => {
          console.error('Error regenerating model for part studio:', ps.id, err)
        })
      })
    } catch (error) {
      console.error('Error loading document from data:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  pushUndoState: () => {
    const { document, undoStack } = get()
    if (!document) return
    
    // Clone current state
    const stateSnapshot = cloneDocument(document)
    
    // Add to undo stack (max 50 states)
    set({
      undoStack: [...undoStack, stateSnapshot].slice(-50),
      redoStack: [], // Clear redo stack on new action
      canUndo: true,
      canRedo: false
    })
  },
  
  undo: async () => {
    const { document, undoStack, redoStack } = get()
    if (!document || undoStack.length === 0) return
    
    // Save current state to redo stack
    const currentState = cloneDocument(document)
    const previousState = undoStack[undoStack.length - 1]
    
    set({
      document: previousState,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentState],
      canUndo: undoStack.length > 1,
      canRedo: true,
      isDirty: true
    })
    
    // Regenerate all models
    const { regenerateModel } = get()
    previousState.partStudios.forEach(ps => {
      regenerateModel(ps.id).catch(err => {
        console.error('Error regenerating model during undo:', err)
      })
    })
  },
  
  redo: async () => {
    const { document, undoStack, redoStack } = get()
    if (!document || redoStack.length === 0) return
    
    // Save current state to undo stack
    const currentState = cloneDocument(document)
    const nextState = redoStack[redoStack.length - 1]
    
    set({
      document: nextState,
      undoStack: [...undoStack, currentState],
      redoStack: redoStack.slice(0, -1),
      canUndo: true,
      canRedo: redoStack.length > 1,
      isDirty: true
    })
    
    // Regenerate all models
    const { regenerateModel } = get()
    nextState.partStudios.forEach(ps => {
      regenerateModel(ps.id).catch(err => {
        console.error('Error regenerating model during redo:', err)
      })
    })
  },
  
  transformBody: (bodyId, translation, rotation, createCopy) => {
    const { document } = get()
    if (!document) return
    
    // Save undo state
    get().pushUndoState()
    
    // Find the part/body
    let targetPart: Part | null = null
    let partStudioId: string | null = null
    
    for (const ps of document.partStudios) {
      const part = ps.parts.find(p => p.id === bodyId)
      if (part) {
        targetPart = part
        partStudioId = ps.id
        break
      }
    }
    
    if (!targetPart || !partStudioId) return
    
    // If creating a copy, duplicate the part first
    if (createCopy) {
      const newPart: Part = {
        ...targetPart,
        id: generateId(),
        name: `${targetPart.name} Copy`
      }
      
      set(state => ({
        document: state.document ? {
          ...state.document,
          partStudios: state.document.partStudios.map(ps => 
            ps.id === partStudioId ? {
              ...ps,
              parts: [...ps.parts, newPart]
            } : ps
          )
        } : null,
        isDirty: true
      }))
      
      // Update target to the new copy
      targetPart = newPart
    }
    
    // Apply transformation (this is a simplified version - proper CAD would transform geometry)
    // For now, we'll store the transform in the part's metadata
    const transformedPart: Part = {
      ...targetPart,
      // Add transform metadata (in a real CAD system, you'd transform the actual geometry)
      name: createCopy ? targetPart.name : `${targetPart.name} (Transformed)`
    }
    
    set(state => ({
      document: state.document ? {
        ...state.document,
        partStudios: state.document.partStudios.map(ps =>
          ps.id === partStudioId ? {
            ...ps,
            parts: ps.parts.map(p => p.id === transformedPart.id ? transformedPart : p)
          } : ps
        )
      } : null,
      isDirty: true
    }))
  },
  
  toggleBodyVisibility: (bodyId) => {
    const { document } = get()
    if (!document) return
    
    // Save undo state
    get().pushUndoState()
    
    // Find and toggle the part's visibility
    set(state => ({
      document: state.document ? {
        ...state.document,
        partStudios: state.document.partStudios.map(ps => ({
          ...ps,
          parts: ps.parts.map(p => 
            p.id === bodyId 
              ? { ...p, visible: p.visible === false ? true : false }
              : p
          )
        }))
      } : null,
      isDirty: true
    }))
    
    // Get the updated part to check its state
    const updatedDoc = get().document
    let isVisible = true
    if (updatedDoc) {
      for (const ps of updatedDoc.partStudios) {
        const part = ps.parts.find(p => p.id === bodyId)
        if (part) {
          isVisible = part.visible !== false
          break
        }
      }
    }
    
    // Flash visual feedback (clear selection to make the hide effect visible)
    const { clearSelection, addNotification } = require('./uiStore').useUIStore.getState()
    clearSelection()
    addNotification('info', isVisible ? 'Body shown' : 'Body hidden')
  },
  
  showAllBodies: () => {
    const { document } = get()
    if (!document) return
    
    // Save undo state
    get().pushUndoState()
    
    // Show all parts
    set(state => ({
      document: state.document ? {
        ...state.document,
        partStudios: state.document.partStudios.map(ps => ({
          ...ps,
          parts: ps.parts.map(p => ({ ...p, visible: true }))
        }))
      } : null,
      isDirty: true
    }))
    
    const { addNotification } = require('./uiStore').useUIStore.getState()
    addNotification('success', 'All bodies shown')
  },
  
  setActiveElement: (id, type) => {
    set(state => ({
      document: state.document ? {
        ...state.document,
        activeElementId: id,
        activeElementType: type
      } : null
    }))
  },
  
  addFeature: async (partStudioId, feature) => {
    const { document, undoStack } = get()
    if (!document) return null
    
    // Check if we're in rollback mode
    const uiStoreModule = await import('./uiStore')
    const { rollbackState } = uiStoreModule.useUIStore.getState()
    
    // Save state to undo stack before making changes
    const stateSnapshot = cloneDocument(document)
    
    const newFeature: Feature = {
      ...feature,
      id: generateId()
    }
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        
        // If in rollback mode for this part studio, insert the feature after the rollback point
        let insertIndex = ps.features.length // Default: append to end
        if (rollbackState.isActive && rollbackState.partStudioId === partStudioId && rollbackState.featureId) {
          const rollbackIndex = ps.features.findIndex(f => f.id === rollbackState.featureId)
          if (rollbackIndex >= 0) {
            insertIndex = rollbackIndex + 1
          }
        }
        
        // Insert at the calculated position
        const features = [...ps.features]
        features.splice(insertIndex, 0, newFeature)
        
        return {
          ...ps,
          features
        }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true,
        undoStack: [...undoStack, stateSnapshot].slice(-50), // Keep last 50 states
        redoStack: [], // Clear redo stack on new action
        canUndo: true,
        canRedo: false
      }
    })
    
    // Regenerate model after adding feature
    await get().regenerateModel(partStudioId)
    
    return newFeature
  },
  
  updateFeature: async (partStudioId, featureId, params) => {
    const { document, undoStack } = get()
    if (!document) return
    
    // Save state to undo stack before making changes
    const stateSnapshot = cloneDocument(document)
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        return {
          ...ps,
          features: ps.features.map(f => 
            f.id === featureId 
              ? { ...f, parameters: { ...f.parameters, ...params } }
              : f
          )
        }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true,
        undoStack: [...undoStack, stateSnapshot].slice(-50),
        redoStack: [],
        canUndo: true,
        canRedo: false
      }
    })
    
    await get().regenerateModel(partStudioId)
  },
  
  deleteFeature: async (partStudioId, featureId) => {
    const { document, undoStack } = get()
    if (!document) return
    
    // Save state to undo stack before making changes
    const stateSnapshot = cloneDocument(document)
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        return {
          ...ps,
          features: ps.features.filter(f => f.id !== featureId)
        }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true,
        undoStack: [...undoStack, stateSnapshot].slice(-50),
        redoStack: [],
        canUndo: true,
        canRedo: false
      }
    })
    
    await get().regenerateModel(partStudioId)
  },
  
  copyFeature: async (partStudioId, featureId) => {
    const { document } = get()
    if (!document) return null
    
    // Save undo state
    get().pushUndoState()
    
    // Find the feature to copy
    const partStudio = document.partStudios.find(ps => ps.id === partStudioId)
    if (!partStudio) return null
    
    const featureToCopy = partStudio.features.find(f => f.id === featureId)
    if (!featureToCopy) return null
    
    // Count existing features of this type for naming
    const sameTypeCount = partStudio.features.filter(f => f.type === featureToCopy.type).length
    
    // Create a copy of the feature with new ID and name
    const copiedFeature: Feature = {
      ...featureToCopy,
      id: generateId(),
      name: `${featureToCopy.name} Copy`,
      // Deep copy parameters to avoid reference issues
      parameters: JSON.parse(JSON.stringify(featureToCopy.parameters))
    }
    
    // Add the copied feature to the end of the feature list
    let addedFeature: Feature | null = null
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        return {
          ...ps,
          features: [...ps.features, copiedFeature]
        }
      })
      
      addedFeature = copiedFeature
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
    
    // Regenerate model to include the copied feature
    try {
      await get().regenerateModel(partStudioId)
    } catch (error) {
      console.error('Error regenerating model after copy:', error)
      // Feature was added but regeneration failed - user can edit to fix
    }
    
    return addedFeature
  },

  toggleFeatureSuppression: (partStudioId, featureId) => {
    const { document } = get()
    if (!document) return
    
    // Save undo state
    get().pushUndoState()
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        return {
          ...ps,
          features: ps.features.map(f => 
            f.id === featureId ? { ...f, suppressed: !f.suppressed } : f
          )
        }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
    
    // Regenerate the model to reflect suppression change
    get().regenerateModel(partStudioId).catch(err => {
      console.error('Error regenerating model after suppress:', err)
    })
  },
  
  reorderFeature: (partStudioId, featureId, newIndex) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        
        const features = [...ps.features]
        const currentIndex = features.findIndex(f => f.id === featureId)
        if (currentIndex === -1) return ps
        
        const [feature] = features.splice(currentIndex, 1)
        features.splice(newIndex, 0, feature)
        
        return { ...ps, features }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  renameFeature: (partStudioId, featureId, newName) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        return {
          ...ps,
          features: ps.features.map(f => 
            f.id === featureId ? { ...f, name: newName } : f
          )
        }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  createSketch: async (partStudioId, planeId) => {
    const { document } = get()
    if (!document) return null
    
    // Determine plane from planeId
    let plane = { origin: [0, 0, 0], normal: [0, 0, 1], xAxis: [1, 0, 0] }
    if (planeId === 'top' || planeId === 'xy') {
      plane = { origin: [0, 0, 0], normal: [0, 0, 1], xAxis: [1, 0, 0] }
    } else if (planeId === 'front' || planeId === 'xz') {
      plane = { origin: [0, 0, 0], normal: [0, 1, 0], xAxis: [1, 0, 0] }
    } else if (planeId === 'right' || planeId === 'yz') {
      plane = { origin: [0, 0, 0], normal: [1, 0, 0], xAxis: [0, 1, 0] }
    }
    
    // Count existing sketches to generate sequential name
    const partStudio = document.partStudios.find(ps => ps.id === partStudioId)
    const existingSketchCount = partStudio?.sketches.size || 0
    const sketchNumber = existingSketchCount + 1
    
    const sketchId = generateId()
    const sketch: Sketch = {
      id: sketchId,
      name: `Sketch ${sketchNumber}`,
      plane,
      entities: [],
      constraints: [],
      solved: true,
      status: 'under-constrained'
    }
    
    // Add sketch as a feature
    const feature: Feature = {
      id: sketchId,
      type: 'sketch',
      name: sketch.name,
      suppressed: false,
      parameters: { planeId, sketchId }
    }
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        const sketches = new Map(ps.sketches)
        sketches.set(sketchId, sketch)
        return {
          ...ps,
          features: [...ps.features, feature],
          sketches
        }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
    
    return sketch
  },
  
  addSketchEntity: (sketchId, entity) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps
        
        const newEntity: SketchEntity = { ...entity, id: generateId() }
        const updatedSketch = {
          ...sketch,
          entities: [...sketch.entities, newEntity]
        }
        
        const sketches = new Map(ps.sketches)
        sketches.set(sketchId, updatedSketch)
        
        return { ...ps, sketches }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  updateSketchEntity: (sketchId, entityId, data) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps
        
        const updatedSketch = {
          ...sketch,
          entities: sketch.entities.map(e =>
            e.id === entityId ? { ...e, data: { ...e.data, ...data } } : e
          )
        }
        
        const sketches = new Map(ps.sketches)
        sketches.set(sketchId, updatedSketch)
        
        return { ...ps, sketches }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  deleteSketchEntity: (sketchId, entityId) => {
    const { document } = get()
    if (!document) return
    
    // Save undo state
    get().pushUndoState()
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps
        
        // Remove the entity
        const updatedEntities = sketch.entities.filter(e => e.id !== entityId)
        
        // Remove all constraints that reference this entity
        const updatedConstraints = sketch.constraints.filter(c => 
          !c.entityIds.includes(entityId)
        )
        
        const updatedSketch = {
          ...sketch,
          entities: updatedEntities,
          constraints: updatedConstraints
        }
        
        const sketches = new Map(ps.sketches)
        sketches.set(sketchId, updatedSketch)
        
        return { ...ps, sketches }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  addSketchConstraint: (sketchId, constraint) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps
        
        const newConstraint: SketchConstraint = { 
          ...constraint, 
          id: generateId(),
          status: constraint.status || 'satisfied'
        }
        const updatedSketch = {
          ...sketch,
          constraints: [...sketch.constraints, newConstraint]
        }
        
        const sketches = new Map(ps.sketches)
        sketches.set(sketchId, updatedSketch)
        
        return { ...ps, sketches }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  deleteSketchConstraint: (sketchId, constraintId) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps
        
        const updatedSketch = {
          ...sketch,
          constraints: sketch.constraints.filter(c => c.id !== constraintId)
        }
        
        const sketches = new Map(ps.sketches)
        sketches.set(sketchId, updatedSketch)
        
        return { ...ps, sketches }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  updateEntityConstraintStatus: (sketchId) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps
        
        // Count constraints per entity
        const entityConstraintCount = new Map<string, number>()
        sketch.constraints.forEach(constraint => {
          constraint.entityIds.forEach(entityId => {
            entityConstraintCount.set(entityId, (entityConstraintCount.get(entityId) || 0) + 1)
          })
        })
        
        // Update entity constraint status based on constraint count
        // This is a simplified heuristic - real solver would be more sophisticated
        const updatedEntities = sketch.entities.map(entity => {
          const constraintCount = entityConstraintCount.get(entity.id) || 0
          let constraintStatus: 'under' | 'fully' | 'over' = 'under'
          
          // Rough heuristic: 
          // - Lines need 4 constraints (2 endpoints x 2 DOF each)
          // - Circles need 3 constraints (center x,y + radius)
          // - Points need 2 constraints (x, y)
          const requiredConstraints = entity.type === 'line' ? 3 : 
                                       entity.type === 'circle' ? 3 : 
                                       entity.type === 'arc' ? 4 :
                                       entity.type === 'point' ? 2 : 3
          
          if (constraintCount >= requiredConstraints + 2) {
            constraintStatus = 'over'
          } else if (constraintCount >= requiredConstraints) {
            constraintStatus = 'fully'
          } else {
            constraintStatus = 'under'
          }
          
          return { ...entity, constraintStatus }
        })
        
        // Determine overall sketch status
        const hasOver = updatedEntities.some(e => e.constraintStatus === 'over')
        const allFully = updatedEntities.every(e => e.constraintStatus === 'fully' || e.constraintStatus === 'over')
        const overallStatus: SketchStatus = hasOver ? 'over-constrained' : 
                                             allFully ? 'fully-constrained' : 'under-constrained'
        
        const updatedSketch = {
          ...sketch,
          entities: updatedEntities,
          status: overallStatus
        }
        
        const sketches = new Map(ps.sketches)
        sketches.set(sketchId, updatedSketch)
        
        return { ...ps, sketches }
      })
      
      return {
        document: { ...state.document, partStudios }
      }
    })
  },
  
  solveSketch: (sketchId) => {
    const { document } = get()
    if (!document) return
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps
        
        // Apply constraints to modify entity geometry
        const entities = [...sketch.entities]
        const constraints = sketch.constraints
        
        constraints.forEach(constraint => {
          try {
            switch (constraint.type) {
              case 'horizontal': {
                // Make line horizontal
                const entityId = constraint.entityIds[0]
                const entity = entities.find(e => e.id === entityId)
                if (entity?.type === 'line' && entity.data.start && entity.data.end) {
                  // Keep start point, adjust end point Y to match
                  const avgY = (entity.data.start.y + entity.data.end.y) / 2
                  entity.data.start = { ...entity.data.start, y: avgY }
                  entity.data.end = { ...entity.data.end, y: avgY }
                }
                break
              }
              
              case 'vertical': {
                // Make line vertical
                const entityId = constraint.entityIds[0]
                const entity = entities.find(e => e.id === entityId)
                if (entity?.type === 'line' && entity.data.start && entity.data.end) {
                  const avgX = (entity.data.start.x + entity.data.end.x) / 2
                  entity.data.start = { ...entity.data.start, x: avgX }
                  entity.data.end = { ...entity.data.end, x: avgX }
                }
                break
              }
              
              case 'equal': {
                // Make two lines equal length
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  
                  if (entity1?.type === 'line' && entity2?.type === 'line') {
                    const len1 = Math.hypot(
                      entity1.data.end.x - entity1.data.start.x,
                      entity1.data.end.y - entity1.data.start.y
                    )
                    const len2 = Math.hypot(
                      entity2.data.end.x - entity2.data.start.x,
                      entity2.data.end.y - entity2.data.start.y
                    )
                    
                    // Scale entity2 to match entity1's length
                    const avgLen = (len1 + len2) / 2
                    const scale = avgLen / len2
                    
                    const dx = entity2.data.end.x - entity2.data.start.x
                    const dy = entity2.data.end.y - entity2.data.start.y
                    
                    entity2.data.end = {
                      x: entity2.data.start.x + dx * scale,
                      y: entity2.data.start.y + dy * scale,
                      z: entity2.data.start.z || 0
                    }
                  }
                  
                  // Equal radius for circles
                  if (entity1?.type === 'circle' && entity2?.type === 'circle') {
                    const avgRadius = (entity1.data.radius + entity2.data.radius) / 2
                    entity2.data.radius = avgRadius
                  }
                }
                break
              }
              
              case 'parallel': {
                // Make two lines parallel
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  
                  if (entity1?.type === 'line' && entity2?.type === 'line') {
                    // Get direction of line1
                    const dx1 = entity1.data.end.x - entity1.data.start.x
                    const dy1 = entity1.data.end.y - entity1.data.start.y
                    const len1 = Math.hypot(dx1, dy1)
                    
                    // Get length of line2
                    const dx2 = entity2.data.end.x - entity2.data.start.x
                    const dy2 = entity2.data.end.y - entity2.data.start.y
                    const len2 = Math.hypot(dx2, dy2)
                    
                    if (len1 > 0 && len2 > 0) {
                      // Adjust line2 direction to match line1
                      const unitX = dx1 / len1
                      const unitY = dy1 / len1
                      
                      entity2.data.end = {
                        x: entity2.data.start.x + unitX * len2,
                        y: entity2.data.start.y + unitY * len2,
                        z: entity2.data.start.z || 0
                      }
                    }
                  }
                }
                break
              }
              
              case 'perpendicular': {
                // Make two lines perpendicular
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  
                  if (entity1?.type === 'line' && entity2?.type === 'line') {
                    const dx1 = entity1.data.end.x - entity1.data.start.x
                    const dy1 = entity1.data.end.y - entity1.data.start.y
                    const len1 = Math.hypot(dx1, dy1)
                    
                    const dx2 = entity2.data.end.x - entity2.data.start.x
                    const dy2 = entity2.data.end.y - entity2.data.start.y
                    const len2 = Math.hypot(dx2, dy2)
                    
                    if (len1 > 0 && len2 > 0) {
                      // Rotate line1's direction by 90°
                      const perpX = -dy1 / len1
                      const perpY = dx1 / len1
                      
                      entity2.data.end = {
                        x: entity2.data.start.x + perpX * len2,
                        y: entity2.data.start.y + perpY * len2,
                        z: entity2.data.start.z || 0
                      }
                    }
                  }
                }
                break
              }
              
              case 'concentric': {
                // Make two circles share the same center
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  
                  if ((entity1?.type === 'circle' || entity1?.type === 'arc') && 
                      (entity2?.type === 'circle' || entity2?.type === 'arc')) {
                    entity2.data.center = { ...entity1.data.center }
                  }
                }
                break
              }
              
              case 'coincident': {
                // Make two points coincide
                // This is a simplified implementation
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  
                  // Various combinations of coincident
                  if (entity1?.type === 'point' && entity2?.type === 'point') {
                    entity2.data = { ...entity1.data }
                  }
                }
                break
              }
              
              // Other constraints would be implemented similarly
            }
          } catch (e) {
            console.warn('Constraint solving error:', e)
          }
        })
        
        const updatedSketch = {
          ...sketch,
          entities,
          solved: true
        }
        
        const sketches = new Map(ps.sketches)
        sketches.set(sketchId, updatedSketch)
        
        return { ...ps, sketches }
      })
      
      return {
        document: { ...state.document, partStudios }
      }
    })
    
    // Update constraint status after solving
    get().updateEntityConstraintStatus(sketchId)
  },
  
  updatePartMaterial: (partId, material) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => ({
        ...ps,
        parts: ps.parts.map(p =>
          p.id === partId ? { ...p, material } : p
        )
      }))
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  updatePartColor: (partId, color) => {
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => ({
        ...ps,
        parts: ps.parts.map(p =>
          p.id === partId ? { ...p, color } : p
        )
      }))
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  regenerateModel: async (partStudioId) => {
    const { document } = get()
    if (!document) return
    
    const partStudio = document.partStudios.find(ps => ps.id === partStudioId)
    if (!partStudio) return
    
    // Process features to generate geometry
    const parts: Part[] = []
    let currentBody: Part | null = null
    
    for (const feature of partStudio.features) {
      if (feature.suppressed) continue
      
      switch (feature.type) {
        case 'sketch':
          // Sketches don't create geometry directly
          break
          
        case 'import': {
          // Preserve imported parts - find the corresponding part by part ID stored in feature parameters
          const partId = feature.parameters.partId
          const existingPart = partStudio.parts.find(p => p.id === partId)
          if (existingPart) {
            parts.push(existingPart)
            currentBody = existingPart
          }
          break
        }
          
        case 'extrude': {
          const featureParams = feature.parameters
          const sketchId = featureParams.sketchId
          const profileIds: string[] = featureParams.profileIds || []
          const operation = featureParams.operation || 'new'

          const extrudeParams: ExtrudeParams = {
            depth1: featureParams.depth1 || featureParams.depth || 25,
            flipDirection1: featureParams.flipDirection1 || false,
            useSecondDirection: featureParams.useSecondDirection || false,
            depth2: featureParams.depth2 || 0,
            useDraft: featureParams.useDraft || false,
            draftAngle: featureParams.draftAngle || 0,
            draftOutward: featureParams.draftOutward || false,
            endCondition1: featureParams.endCondition1 || 'blind'
          }

          const sketch = partStudio.sketches.get(sketchId)
          let candidateEntities: SketchEntity[] = []
          if (sketch) {
            if (profileIds.length > 0) {
              candidateEntities = profileIds
                .map(id => sketch.entities.find(e => e.id === id))
                .filter((e): e is SketchEntity => !!e)
            } else {
              // No specific profiles selected - extrude the first valid entity only
              const first = sketch.entities.find(e => e.type === 'rectangle' || e.type === 'circle' || e.type === 'polygon')
              if (first) candidateEntities = [first]
            }
          }

          let createdAny = false
          for (const entity of candidateEntities) {
            const profile = toCadProfile(entity)
            if (!profile) continue
            try {
              const result = await cadSolverClient.extrude({ profile, plane: sketchPlane(sketch), params: extrudeParams })
              currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`))
              createdAny = true
            } catch (error) {
              console.error('Extrude failed for profile', entity.id, error)
            }
          }

          if (!createdAny) {
            // Fallback: no sketch profile found - extrude a default box footprint
            const width = featureParams.width || 30
            const footprintDepth = featureParams.height || 30
            try {
              const result = await cadSolverClient.makePrimitive({
                type: 'box',
                params: { width, depth: footprintDepth, height: extrudeParams.depth1 }
              })
              currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`))
            } catch (error) {
              console.error('Extrude fallback primitive failed:', error)
            }
          }
          break
        }

        case 'revolve': {
          const featureParams = feature.parameters
          const sketchId = featureParams.sketchId
          const profileId = featureParams.profileId
          const operation = featureParams.operation || 'new'

          const revolveParams: RevolveParams = {
            angle: featureParams.angle || 360,
            angle2: featureParams.angle2 || 0,
            axisId: featureParams.axisId || 'y-axis',
            directionType: featureParams.directionType || 'full'
          }

          const sketch = partStudio.sketches.get(sketchId)
          const entity = sketch
            ? (profileId
                ? sketch.entities.find(e => e.id === profileId)
                : sketch.entities.find(e => e.type === 'rectangle' || e.type === 'circle' || e.type === 'polygon'))
            : undefined
          const profile = entity ? toCadProfile(entity) : null
          const axis = resolveRevolveAxis(revolveParams.axisId, sketch, partStudio)

          let result: CadShapeResult | null = null
          if (profile) {
            try {
              result = await cadSolverClient.revolve({
                profile,
                plane: sketchPlane(sketch),
                axisPoint: axis.pointWorld,
                axisDirection: axis.directionWorld,
                params: revolveParams
              })
            } catch (error) {
              console.error('Revolve failed:', error)
            }
          }

          if (!result) {
            // Fallback: no sketch profile found - revolve a default cylinder
            try {
              result = await cadSolverClient.makePrimitive({
                type: 'cylinder',
                params: { radius: featureParams.radius || 15, height: featureParams.height || 30 }
              })
            } catch (error) {
              console.error('Revolve fallback primitive failed:', error)
              break
            }
          }
          currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`))
          break
        }

        case 'sweep': {
          const featureParams = feature.parameters
          const profileSketchId = featureParams.profileSketchId
          const profileId = featureParams.profileId
          const pathSketchId = featureParams.pathSketchId
          const pathId = featureParams.pathId
          const operation = featureParams.operation || 'new'

          const sweepParams: SweepParams = {
            orientation: featureParams.orientation || 'follow-path',
            twistAngle: featureParams.twistAngle || 0,
            endScale: featureParams.endScale || 1.0
          }

          const profileSketch = partStudio.sketches.get(profileSketchId)
          const pathSketch = partStudio.sketches.get(pathSketchId)

          let result: CadShapeResult | null = null

          if (profileSketch && pathSketch && profileId && pathId) {
            const profileEntity = profileSketch.entities.find(e => e.id === profileId)
            // Handle chain paths - use first line in sketch as path
            const pathEntity = pathId.endsWith('-chain')
              ? pathSketch.entities.find(e => e.type === 'line')
              : pathSketch.entities.find(e => e.id === pathId)

            const profile = profileEntity ? toCadProfile(profileEntity) : null
            const path = pathEntity ? toCadPath(pathEntity) : null

            if (profile && path) {
              try {
                result = await cadSolverClient.sweep({
                  profile,
                  profilePlane: sketchPlane(profileSketch),
                  path,
                  pathPlane: sketchPlane(pathSketch),
                  params: sweepParams
                })
              } catch (error) {
                console.error('Sweep failed:', error)
              }
            }
          }

          if (!result) {
            // Fallback: create a simple swept tube along Z axis
            try {
              result = await cadSolverClient.makePrimitive({ type: 'cylinder', params: { radius: 10, height: 50 } })
            } catch (error) {
              console.error('Sweep fallback primitive failed:', error)
              break
            }
          }
          currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`))
          break
        }

        case 'loft': {
          const featureParams = feature.parameters
          const profileConfigs: Array<{ sketchId: string; entityId: string }> = featureParams.profiles || []
          const operation = featureParams.operation || 'new'
          const closedLoft = featureParams.closedLoft || false

          const loftProfiles: { profile: CadProfileEntity; plane: CadPlane }[] = []
          profileConfigs.forEach((config, i) => {
            const sketch = partStudio.sketches.get(config.sketchId)
            const entity = sketch?.entities.find(e => e.id === config.entityId)
            const profile = entity ? toCadProfile(entity) : null
            if (!sketch || !profile) return

            // Spread profiles evenly along the sketch plane's normal (simplified - matches
            // the previous local-mesh-gen's synthetic 30-unit spacing convention)
            const zOffset = i * 30
            const basePlane = sketchPlane(sketch)
            loftProfiles.push({
              profile,
              plane: {
                origin: [
                  basePlane.origin[0] + basePlane.normal[0] * zOffset,
                  basePlane.origin[1] + basePlane.normal[1] * zOffset,
                  basePlane.origin[2] + basePlane.normal[2] * zOffset,
                ],
                normal: basePlane.normal,
                xAxis: basePlane.xAxis,
              }
            })
          })

          let result: CadShapeResult | null = null
          if (loftProfiles.length >= 2) {
            try {
              result = await cadSolverClient.loft({ profiles: loftProfiles, params: { closedLoft } })
            } catch (error) {
              console.error('Loft failed:', error)
            }
          }

          if (!result) {
            // Fallback: fewer than two profiles - create a simple cone
            try {
              result = await cadSolverClient.makePrimitive({ type: 'cone', params: { radius1: 15, radius2: 0, height: 50 } })
            } catch (error) {
              console.error('Loft fallback primitive failed:', error)
              break
            }
          }
          currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`))
          break
        }

        case 'fillet': {
          // The edge-picker UI (FilletDialog) doesn't yet resolve picks to real B-rep
          // edge indices - it selects from a mocked edge list. Until that's wired to
          // real picking, apply to the first N real edges (N = number "selected").
          if (!currentBody?.shapeId) {
            console.warn('Fillet skipped: no server-side shape on the current body')
            break
          }
          const edgeCount = (feature.parameters.edges || []).length
          if (edgeCount === 0) break
          const edgeIndices = Array.from({ length: edgeCount }, (_, i) => i)
          const radius = feature.parameters.radius || 5
          try {
            const result = await cadSolverClient.fillet({ shapeId: currentBody.shapeId, edgeIndices, radius })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            console.error('Fillet failed:', error)
          }
          break
        }

        case 'chamfer': {
          if (!currentBody?.shapeId) {
            console.warn('Chamfer skipped: no server-side shape on the current body')
            break
          }
          const edgeCount = (feature.parameters.edges || []).length
          if (edgeCount === 0) break
          const edgeIndices = Array.from({ length: edgeCount }, (_, i) => i)
          const distance = feature.parameters.distance ?? feature.parameters.size ?? feature.parameters.radius ?? 2
          try {
            const result = await cadSolverClient.chamfer({ shapeId: currentBody.shapeId, edgeIndices, distance })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            console.error('Chamfer failed:', error)
          }
          break
        }
      }
    }
    
    // If no parts generated, create default
    if (parts.length === 0 && partStudio.features.length === 0) {
      // Empty part studio, no parts
    }
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps =>
        ps.id === partStudioId ? { ...ps, parts } : ps
      )
      
      return {
        document: { ...state.document, partStudios }
      }
    })
  },
  
  importSTLPart: (partStudioId, name, mesh) => {
    const partId = generateId()
    const featureId = generateId()
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        
        return {
          ...ps,
          features: [...ps.features, {
            id: featureId,
            type: 'import',
            name: `Imported: ${name}`,
            suppressed: false,
            parameters: { filename: name, partId: partId }
          }],
          parts: [...ps.parts, {
            id: partId,
            name: name,
            color: '#6b7280',
            mesh: mesh
          }]
        }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },
  
  updateDocumentName: (name: string) => {
    set(state => {
      if (!state.document) return state
      return {
        document: { ...state.document, name },
        isDirty: true
      }
    })
  },
  
  updateDocumentUnits: (units: 'mm' | 'inch' | 'm') => {
    set(state => {
      if (!state.document) return state
      return {
        document: { ...state.document, units },
        isDirty: true
      }
    })
  },
  
  updateExportSettings: (settings) => {
    set(state => {
      if (!state.document) return state
      return {
        document: { 
          ...state.document, 
          exportSettings: {
            excludeHiddenParts: state.document.exportSettings?.excludeHiddenParts ?? true,
            excludeSuppressedFeatures: state.document.exportSettings?.excludeSuppressedFeatures ?? false,
            ...settings
          }
        },
        isDirty: true
      }
    })
  }
}))

// Expose document store globally for FEA module
if (typeof window !== 'undefined') {
  (window as any).__documentStore = useDocumentStore;
}

