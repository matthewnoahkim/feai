/**
 * Document Store - Manages CAD document state
 */

import { create } from 'zustand'
import { api } from '../api/client'

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
  parameters: Record<string, any>
  error?: string
}

export interface Part {
  id: string
  name: string
  material?: string
  color: string
  mesh?: {
    vertices: number[]
    normals: number[]
    indices: number[]
  }
  edges?: Array<{ start: number[]; end: number[] }>
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
  partStudios: PartStudio[]
  assemblies: Assembly[]
  activeElementId: string | null
  activeElementType: 'partStudio' | 'assembly' | null
}

interface DocumentState {
  document: Document | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
  
  // Actions
  createNewDocument: (name: string) => Promise<void>
  loadDocument: (id: string) => Promise<void>
  saveDocument: () => Promise<void>
  
  // Part Studio operations
  setActiveElement: (id: string, type: 'partStudio' | 'assembly') => void
  addFeature: (partStudioId: string, feature: Omit<Feature, 'id'>) => Promise<Feature | null>
  updateFeature: (partStudioId: string, featureId: string, params: Record<string, any>) => Promise<void>
  deleteFeature: (partStudioId: string, featureId: string) => Promise<void>
  toggleFeatureSuppression: (partStudioId: string, featureId: string) => void
  reorderFeature: (partStudioId: string, featureId: string, newIndex: number) => void
  
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
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Create a default box mesh for testing
function createBoxMesh(width: number, height: number, depth: number): { vertices: number[], normals: number[], indices: number[] } {
  const hw = width / 2, hh = height / 2, hd = depth / 2
  
  const vertices = [
    // Front face
    -hw, -hh, hd,  hw, -hh, hd,  hw, hh, hd,  -hw, hh, hd,
    // Back face
    hw, -hh, -hd,  -hw, -hh, -hd,  -hw, hh, -hd,  hw, hh, -hd,
    // Top face
    -hw, hh, hd,  hw, hh, hd,  hw, hh, -hd,  -hw, hh, -hd,
    // Bottom face
    -hw, -hh, -hd,  hw, -hh, -hd,  hw, -hh, hd,  -hw, -hh, hd,
    // Right face
    hw, -hh, hd,  hw, -hh, -hd,  hw, hh, -hd,  hw, hh, hd,
    // Left face
    -hw, -hh, -hd,  -hw, -hh, hd,  -hw, hh, hd,  -hw, hh, -hd,
  ]
  
  const normals = [
    // Front
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    // Back
    0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
    // Top
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    // Bottom
    0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
    // Right
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    // Left
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
  ]
  
  const indices = [
    0, 1, 2, 0, 2, 3,       // Front
    4, 5, 6, 4, 6, 7,       // Back
    8, 9, 10, 8, 10, 11,    // Top
    12, 13, 14, 12, 14, 15, // Bottom
    16, 17, 18, 16, 18, 19, // Right
    20, 21, 22, 20, 22, 23, // Left
  ]
  
  return { vertices, normals, indices }
}

// Create cylinder mesh
function createCylinderMesh(radius: number, height: number, segments: number = 32): { vertices: number[], normals: number[], indices: number[] } {
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  const hh = height / 2
  
  // Side vertices
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    const x = Math.cos(theta) * radius
    const z = Math.sin(theta) * radius
    
    // Bottom vertex
    vertices.push(x, -hh, z)
    normals.push(Math.cos(theta), 0, Math.sin(theta))
    
    // Top vertex
    vertices.push(x, hh, z)
    normals.push(Math.cos(theta), 0, Math.sin(theta))
  }
  
  // Side faces
  for (let i = 0; i < segments; i++) {
    const i0 = i * 2
    const i1 = i * 2 + 1
    const i2 = (i + 1) * 2
    const i3 = (i + 1) * 2 + 1
    indices.push(i0, i2, i1, i1, i2, i3)
  }
  
  // Top cap
  const topCenterIdx = vertices.length / 3
  vertices.push(0, hh, 0)
  normals.push(0, 1, 0)
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    const x = Math.cos(theta) * radius
    const z = Math.sin(theta) * radius
    vertices.push(x, hh, z)
    normals.push(0, 1, 0)
  }
  
  for (let i = 0; i < segments; i++) {
    indices.push(topCenterIdx, topCenterIdx + 1 + i, topCenterIdx + 2 + i)
  }
  
  // Bottom cap
  const bottomCenterIdx = vertices.length / 3
  vertices.push(0, -hh, 0)
  normals.push(0, -1, 0)
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    const x = Math.cos(theta) * radius
    const z = Math.sin(theta) * radius
    vertices.push(x, -hh, z)
    normals.push(0, -1, 0)
  }
  
  for (let i = 0; i < segments; i++) {
    indices.push(bottomCenterIdx, bottomCenterIdx + 2 + i, bottomCenterIdx + 1 + i)
  }
  
  return { vertices, normals, indices }
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  isLoading: false,
  error: null,
  isDirty: false,
  
  createNewDocument: async (name: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const psId = generateId()
      const newDoc: Document = {
        id: generateId(),
        name,
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
      // Save to API
      set({ isLoading: false, isDirty: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
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
    const { document } = get()
    if (!document) return null
    
    const newFeature: Feature = {
      ...feature,
      id: generateId()
    }
    
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps
        return {
          ...ps,
          features: [...ps.features, newFeature]
        }
      })
      
      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
    
    // Regenerate model after adding feature
    await get().regenerateModel(partStudioId)
    
    return newFeature
  },
  
  updateFeature: async (partStudioId, featureId, params) => {
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
        isDirty: true
      }
    })
    
    await get().regenerateModel(partStudioId)
  },
  
  deleteFeature: async (partStudioId, featureId) => {
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
        isDirty: true
      }
    })
    
    await get().regenerateModel(partStudioId)
  },
  
  toggleFeatureSuppression: (partStudioId, featureId) => {
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
    set(state => {
      if (!state.document) return state
      
      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps
        
        const updatedSketch = {
          ...sketch,
          entities: sketch.entities.filter(e => e.id !== entityId)
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
          
        case 'extrude': {
          const params = feature.parameters
          const depth = params.depth || 25
          const width = params.width || 30
          const height = params.height || 30
          
          // Create box mesh from extrusion
          const mesh = createBoxMesh(width, depth, height)
          
          if (params.operation === 'new' || !currentBody) {
            currentBody = {
              id: generateId(),
              name: `Part from ${feature.name}`,
              color: '#6b7280',
              mesh
            }
            parts.push(currentBody)
          } else {
            // Add/subtract from current body (simplified)
            currentBody.mesh = mesh
          }
          break
        }
        
        case 'revolve': {
          const params = feature.parameters
          const radius = params.radius || 15
          const height = params.height || 30
          
          const mesh = createCylinderMesh(radius, height)
          
          if (params.operation === 'new' || !currentBody) {
            currentBody = {
              id: generateId(),
              name: `Part from ${feature.name}`,
              color: '#6b7280',
              mesh
            }
            parts.push(currentBody)
          } else {
            currentBody.mesh = mesh
          }
          break
        }
        
        case 'fillet':
        case 'chamfer':
          // Simplified: fillets/chamfers don't change geometry in this demo
          break
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
  }
}))

