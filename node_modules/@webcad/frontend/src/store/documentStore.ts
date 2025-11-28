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
  warning?: string
  dependencies?: string[] // IDs of features this depends on
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
  loadDocumentFromData: (data: Document) => void
  saveDocument: () => Promise<void>
  
  // Part Studio operations
  setActiveElement: (id: string, type: 'partStudio' | 'assembly') => void
  addFeature: (partStudioId: string, feature: Omit<Feature, 'id'>) => Promise<Feature | null>
  updateFeature: (partStudioId: string, featureId: string, params: Record<string, any>) => Promise<void>
  deleteFeature: (partStudioId: string, featureId: string) => Promise<void>
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

// Create extruded rectangle mesh from sketch entity
function createExtrudedRectangleMesh(
  entity: SketchEntity, 
  params: ExtrudeParams
): { vertices: number[], normals: number[], indices: number[] } {
  const data = entity.data
  let width: number, height: number, cx: number, cy: number
  
  if (data.corner1 && data.corner2) {
    // Standard corner-to-corner rectangle (from SketchCanvas)
    const x1 = data.corner1.x, y1 = data.corner1.y
    const x2 = data.corner2.x, y2 = data.corner2.y
    width = Math.abs(x2 - x1)
    height = Math.abs(y2 - y1)
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
  } else if (data.start && data.end) {
    // Alternative corner-to-corner rectangle format
    const x1 = data.start.x, y1 = data.start.y
    const x2 = data.end.x, y2 = data.end.y
    width = Math.abs(x2 - x1)
    height = Math.abs(y2 - y1)
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
  } else if (data.center && data.corner) {
    // Center-to-corner rectangle
    cx = data.center.x
    cy = data.center.y
    width = Math.abs(data.corner.x - cx) * 2
    height = Math.abs(data.corner.y - cy) * 2
  } else {
    // Default fallback
    width = 30
    height = 30
    cx = 0
    cy = 0
  }
  
  const hw = width / 2, hh = height / 2
  
  // Calculate Z positions based on direction and depth
  let zBottom = 0, zTop = params.depth1
  
  if (params.endCondition1 === 'symmetric') {
    zBottom = -params.depth1 / 2
    zTop = params.depth1 / 2
  } else if (params.flipDirection1) {
    zBottom = -params.depth1
    zTop = 0
  }
  
  // Handle second direction
  if (params.useSecondDirection && params.endCondition1 !== 'symmetric') {
    if (params.flipDirection1) {
      zTop = params.depth2
    } else {
      zBottom = -params.depth2
    }
  }
  
  // Apply draft angle if specified
  let topHW = hw, topHH = hh
  let bottomHW = hw, bottomHH = hh
  
  if (params.useDraft && params.draftAngle > 0) {
    const draftRad = (params.draftAngle * Math.PI) / 180
    const totalDepth = Math.abs(zTop - zBottom)
    const taper = Math.tan(draftRad) * totalDepth
    
    if (params.draftOutward) {
      // Draft outward: top is larger
      topHW = hw + taper / 2
      topHH = hh + taper / 2
    } else {
      // Draft inward: top is smaller
      topHW = Math.max(0.1, hw - taper / 2)
      topHH = Math.max(0.1, hh - taper / 2)
    }
  }
  
  const vertices = [
    // Front face (Y-)
    cx - bottomHW, cy - bottomHH, zBottom,  cx + bottomHW, cy - bottomHH, zBottom,  cx + topHW, cy - topHH, zTop,  cx - topHW, cy - topHH, zTop,
    // Back face (Y+)
    cx + bottomHW, cy + bottomHH, zBottom,  cx - bottomHW, cy + bottomHH, zBottom,  cx - topHW, cy + topHH, zTop,  cx + topHW, cy + topHH, zTop,
    // Top face (Z+)
    cx - topHW, cy - topHH, zTop,  cx + topHW, cy - topHH, zTop,  cx + topHW, cy + topHH, zTop,  cx - topHW, cy + topHH, zTop,
    // Bottom face (Z-)
    cx - bottomHW, cy + bottomHH, zBottom,  cx + bottomHW, cy + bottomHH, zBottom,  cx + bottomHW, cy - bottomHH, zBottom,  cx - bottomHW, cy - bottomHH, zBottom,
    // Right face (X+)
    cx + bottomHW, cy - bottomHH, zBottom,  cx + bottomHW, cy + bottomHH, zBottom,  cx + topHW, cy + topHH, zTop,  cx + topHW, cy - topHH, zTop,
    // Left face (X-)
    cx - bottomHW, cy + bottomHH, zBottom,  cx - bottomHW, cy - bottomHH, zBottom,  cx - topHW, cy - topHH, zTop,  cx - topHW, cy + topHH, zTop,
  ]
  
  const normals = [
    // Front
    0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
    // Back
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    // Top
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    // Bottom
    0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
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

// Create extruded circle mesh from sketch entity
function createExtrudedCircleMesh(
  entity: SketchEntity, 
  params: ExtrudeParams,
  segments: number = 32
): { vertices: number[], normals: number[], indices: number[] } {
  const data = entity.data
  const cx = data.center?.x || 0
  const cy = data.center?.y || 0
  const radius = data.radius || 15
  
  // Calculate Z positions
  let zBottom = 0, zTop = params.depth1
  
  if (params.endCondition1 === 'symmetric') {
    zBottom = -params.depth1 / 2
    zTop = params.depth1 / 2
  } else if (params.flipDirection1) {
    zBottom = -params.depth1
    zTop = 0
  }
  
  if (params.useSecondDirection && params.endCondition1 !== 'symmetric') {
    if (params.flipDirection1) {
      zTop = params.depth2
    } else {
      zBottom = -params.depth2
    }
  }
  
  // Apply draft angle
  let topRadius = radius
  let bottomRadius = radius
  
  if (params.useDraft && params.draftAngle > 0) {
    const draftRad = (params.draftAngle * Math.PI) / 180
    const totalDepth = Math.abs(zTop - zBottom)
    const taper = Math.tan(draftRad) * totalDepth
    
    if (params.draftOutward) {
      topRadius = radius + taper
    } else {
      topRadius = Math.max(0.1, radius - taper)
    }
  }
  
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  // Side vertices
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    const cosT = Math.cos(theta)
    const sinT = Math.sin(theta)
    
    // Bottom vertex
    vertices.push(cx + cosT * bottomRadius, cy + sinT * bottomRadius, zBottom)
    normals.push(cosT, sinT, 0)
    
    // Top vertex
    vertices.push(cx + cosT * topRadius, cy + sinT * topRadius, zTop)
    normals.push(cosT, sinT, 0)
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
  vertices.push(cx, cy, zTop)
  normals.push(0, 0, 1)
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    vertices.push(cx + Math.cos(theta) * topRadius, cy + Math.sin(theta) * topRadius, zTop)
    normals.push(0, 0, 1)
  }
  
  for (let i = 0; i < segments; i++) {
    indices.push(topCenterIdx, topCenterIdx + 1 + i, topCenterIdx + 2 + i)
  }
  
  // Bottom cap
  const bottomCenterIdx = vertices.length / 3
  vertices.push(cx, cy, zBottom)
  normals.push(0, 0, -1)
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    vertices.push(cx + Math.cos(theta) * bottomRadius, cy + Math.sin(theta) * bottomRadius, zBottom)
    normals.push(0, 0, -1)
  }
  
  for (let i = 0; i < segments; i++) {
    indices.push(bottomCenterIdx, bottomCenterIdx + 2 + i, bottomCenterIdx + 1 + i)
  }
  
  return { vertices, normals, indices }
}

// Create extruded polygon mesh from sketch entity
function createExtrudedPolygonMesh(
  entity: SketchEntity, 
  params: ExtrudeParams
): { vertices: number[], normals: number[], indices: number[] } {
  const data = entity.data
  const cx = data.center?.x || 0
  const cy = data.center?.y || 0
  const radius = data.radius || 15
  const sides = data.sides || 6
  const inscribed = data.inscribed !== false
  
  // Calculate Z positions
  let zBottom = 0, zTop = params.depth1
  
  if (params.endCondition1 === 'symmetric') {
    zBottom = -params.depth1 / 2
    zTop = params.depth1 / 2
  } else if (params.flipDirection1) {
    zBottom = -params.depth1
    zTop = 0
  }
  
  if (params.useSecondDirection && params.endCondition1 !== 'symmetric') {
    if (params.flipDirection1) {
      zTop = params.depth2
    } else {
      zBottom = -params.depth2
    }
  }
  
  // Calculate actual radius based on inscribed/circumscribed
  const actualRadius = inscribed ? radius : radius * Math.cos(Math.PI / sides)
  
  // Apply draft angle
  let topRadius = actualRadius
  
  if (params.useDraft && params.draftAngle > 0) {
    const draftRad = (params.draftAngle * Math.PI) / 180
    const totalDepth = Math.abs(zTop - zBottom)
    const taper = Math.tan(draftRad) * totalDepth
    
    if (params.draftOutward) {
      topRadius = actualRadius + taper
    } else {
      topRadius = Math.max(0.1, actualRadius - taper)
    }
  }
  
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  // Calculate polygon vertices
  const bottomVerts: [number, number][] = []
  const topVerts: [number, number][] = []
  
  for (let i = 0; i < sides; i++) {
    const theta = (i / sides) * Math.PI * 2 - Math.PI / 2 // Start from top
    bottomVerts.push([cx + Math.cos(theta) * actualRadius, cy + Math.sin(theta) * actualRadius])
    topVerts.push([cx + Math.cos(theta) * topRadius, cy + Math.sin(theta) * topRadius])
  }
  
  // Side faces
  for (let i = 0; i < sides; i++) {
    const nextI = (i + 1) % sides
    const baseIdx = vertices.length / 3
    
    // Calculate face normal
    const dx = bottomVerts[nextI][0] - bottomVerts[i][0]
    const dy = bottomVerts[nextI][1] - bottomVerts[i][1]
    const len = Math.sqrt(dx * dx + dy * dy)
    const nx = dy / len
    const ny = -dx / len
    
    // Add 4 vertices for this face
    vertices.push(bottomVerts[i][0], bottomVerts[i][1], zBottom)
    vertices.push(bottomVerts[nextI][0], bottomVerts[nextI][1], zBottom)
    vertices.push(topVerts[nextI][0], topVerts[nextI][1], zTop)
    vertices.push(topVerts[i][0], topVerts[i][1], zTop)
    
    for (let j = 0; j < 4; j++) {
      normals.push(nx, ny, 0)
    }
    
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3)
  }
  
  // Top cap (fan triangulation)
  const topCenterIdx = vertices.length / 3
  vertices.push(cx, cy, zTop)
  normals.push(0, 0, 1)
  
  for (let i = 0; i < sides; i++) {
    vertices.push(topVerts[i][0], topVerts[i][1], zTop)
    normals.push(0, 0, 1)
  }
  
  for (let i = 0; i < sides; i++) {
    const nextI = (i + 1) % sides
    indices.push(topCenterIdx, topCenterIdx + 1 + i, topCenterIdx + 1 + nextI)
  }
  
  // Bottom cap (fan triangulation, reversed winding)
  const bottomCenterIdx = vertices.length / 3
  vertices.push(cx, cy, zBottom)
  normals.push(0, 0, -1)
  
  for (let i = 0; i < sides; i++) {
    vertices.push(bottomVerts[i][0], bottomVerts[i][1], zBottom)
    normals.push(0, 0, -1)
  }
  
  for (let i = 0; i < sides; i++) {
    const nextI = (i + 1) % sides
    indices.push(bottomCenterIdx, bottomCenterIdx + 1 + nextI, bottomCenterIdx + 1 + i)
  }
  
  return { vertices, normals, indices }
}

// Validate mesh data to prevent WebGL crashes
function validateMesh(mesh: { vertices: number[], normals: number[], indices: number[] } | null): { vertices: number[], normals: number[], indices: number[] } | null {
  if (!mesh) return null
  
  // Check for NaN or Infinity values in vertices
  for (let i = 0; i < mesh.vertices.length; i++) {
    if (!Number.isFinite(mesh.vertices[i])) {
      console.error('Invalid vertex value at index', i, ':', mesh.vertices[i])
      return null
    }
  }
  
  // Check for NaN or Infinity values in normals
  for (let i = 0; i < mesh.normals.length; i++) {
    if (!Number.isFinite(mesh.normals[i])) {
      console.error('Invalid normal value at index', i, ':', mesh.normals[i])
      return null
    }
  }
  
  // Check that indices are valid
  const maxIndex = mesh.vertices.length / 3 - 1
  for (let i = 0; i < mesh.indices.length; i++) {
    if (mesh.indices[i] < 0 || mesh.indices[i] > maxIndex || !Number.isInteger(mesh.indices[i])) {
      console.error('Invalid index at', i, ':', mesh.indices[i], 'max:', maxIndex)
      return null
    }
  }
  
  // Check minimum requirements
  if (mesh.vertices.length < 9 || mesh.indices.length < 3) {
    console.error('Mesh too small:', mesh.vertices.length, 'vertices,', mesh.indices.length, 'indices')
    return null
  }
  
  return mesh
}

// Create mesh from sketch entity for extrusion
function createMeshFromSketchEntity(
  entity: SketchEntity,
  params: ExtrudeParams
): { vertices: number[], normals: number[], indices: number[] } | null {
  try {
    let mesh: { vertices: number[], normals: number[], indices: number[] } | null = null
    
    switch (entity.type) {
      case 'rectangle':
        mesh = createExtrudedRectangleMesh(entity, params)
        break
      case 'circle':
        mesh = createExtrudedCircleMesh(entity, params)
        break
      case 'polygon':
        mesh = createExtrudedPolygonMesh(entity, params)
        break
      case 'line':
        // Lines can't be extruded as solid - would need to detect closed profiles
        return null
      default:
        return null
    }
    
    return validateMesh(mesh)
  } catch (error) {
    console.error('Error creating mesh from sketch entity:', error)
    return null
  }
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

// Get axis vector from axis ID
function getAxisVector(axisId: string): { origin: [number, number, number], direction: [number, number, number] } {
  switch (axisId) {
    case 'x-axis':
      return { origin: [0, 0, 0], direction: [1, 0, 0] }
    case 'y-axis':
      return { origin: [0, 0, 0], direction: [0, 1, 0] }
    case 'z-axis':
      return { origin: [0, 0, 0], direction: [0, 0, 1] }
    default:
      // Default to Y axis for unknown axes
      return { origin: [0, 0, 0], direction: [0, 1, 0] }
  }
}

// Create revolved rectangle mesh (creates a box-like shape revolved around axis)
function createRevolvedRectangleMesh(
  entity: SketchEntity,
  params: RevolveParams,
  segments: number = 32
): { vertices: number[], normals: number[], indices: number[] } {
  const data = entity.data
  let cx: number, cy: number, hw: number, hh: number
  
  if (data.start && data.end) {
    const x1 = data.start.x, y1 = data.start.y
    const x2 = data.end.x, y2 = data.end.y
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    hw = width / 2
    hh = height / 2
  } else if (data.corner1 && data.corner2) {
    const c1 = data.corner1, c2 = data.corner2
    const width = Math.abs(c2.x - c1.x)
    const height = Math.abs(c2.y - c1.y)
    cx = (c1.x + c2.x) / 2
    cy = (c1.y + c2.y) / 2
    hw = width / 2
    hh = height / 2
  } else {
    cx = 0
    cy = 15
    hw = 10
    hh = 10
  }
  
  const axis = getAxisVector(params.axisId)
  
  // Calculate angle range
  let startAngle = 0
  let endAngle = (params.angle * Math.PI) / 180
  
  if (params.directionType === 'symmetric') {
    startAngle = -((params.angle * Math.PI) / 180)
    endAngle = (params.angle * Math.PI) / 180
  } else if (params.angle2 > 0) {
    startAngle = -((params.angle2 * Math.PI) / 180)
  }
  
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  // Create profile points (rectangle corners relative to axis)
  // For Y-axis revolve, the profile is in the XY plane, offset from the axis
  const profilePoints: [number, number][] = []
  
  // Ensure the rectangle is offset from the axis (for a proper revolve)
  const minRadius = Math.max(cx - hw, 5) // Minimum distance from axis
  
  // 4 corners of the rectangle profile
  profilePoints.push([minRadius, cy - hh])           // Bottom left
  profilePoints.push([minRadius + hw * 2, cy - hh])  // Bottom right
  profilePoints.push([minRadius + hw * 2, cy + hh])  // Top right
  profilePoints.push([minRadius, cy + hh])           // Top left
  
  const numProfilePoints = profilePoints.length
  const numSegments = Math.max(8, Math.ceil(segments * Math.abs(endAngle - startAngle) / (2 * Math.PI)))
  
  // Generate vertices by revolving profile around axis
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments
    const angle = startAngle + t * (endAngle - startAngle)
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    
    for (const [r, y] of profilePoints) {
      // Revolve around Y-axis: x' = r*cos(angle), z' = r*sin(angle), y' = y
      if (axis.direction[1] === 1) {
        vertices.push(r * cosA, y, r * sinA)
      } else if (axis.direction[0] === 1) {
        // Revolve around X-axis
        vertices.push(y, r * cosA, r * sinA)
      } else {
        // Revolve around Z-axis
        vertices.push(r * cosA, r * sinA, y)
      }
      
      // Normal pointing outward
      normals.push(cosA, 0, sinA)
    }
  }
  
  // Generate indices for the revolved surface
  for (let i = 0; i < numSegments; i++) {
    for (let j = 0; j < numProfilePoints; j++) {
      const nextJ = (j + 1) % numProfilePoints
      
      const i0 = i * numProfilePoints + j
      const i1 = i * numProfilePoints + nextJ
      const i2 = (i + 1) * numProfilePoints + j
      const i3 = (i + 1) * numProfilePoints + nextJ
      
      indices.push(i0, i2, i1)
      indices.push(i1, i2, i3)
    }
  }
  
  // Add end caps if not full revolution
  if (Math.abs(endAngle - startAngle) < Math.PI * 2 - 0.01) {
    // Start cap
    const startCapCenter = vertices.length / 3
    const startCx = axis.direction[1] === 1 ? 0 : (minRadius + hw)
    const startCy = axis.direction[1] === 1 ? cy : 0
    const startCz = 0
    
    vertices.push(startCx, startCy, startCz)
    normals.push(-Math.sin(startAngle), 0, Math.cos(startAngle))
    
    for (let j = 0; j < numProfilePoints; j++) {
      const idx = j
      vertices.push(vertices[idx * 3], vertices[idx * 3 + 1], vertices[idx * 3 + 2])
      normals.push(-Math.sin(startAngle), 0, Math.cos(startAngle))
    }
    
    for (let j = 0; j < numProfilePoints; j++) {
      const nextJ = (j + 1) % numProfilePoints
      indices.push(startCapCenter, startCapCenter + 1 + nextJ, startCapCenter + 1 + j)
    }
    
    // End cap
    const endCapCenter = vertices.length / 3
    const lastRingStart = numSegments * numProfilePoints
    
    vertices.push(
      vertices[lastRingStart * 3],
      vertices[lastRingStart * 3 + 1],
      vertices[lastRingStart * 3 + 2]
    )
    normals.push(Math.sin(endAngle), 0, -Math.cos(endAngle))
    
    for (let j = 0; j < numProfilePoints; j++) {
      const idx = lastRingStart + j
      vertices.push(vertices[idx * 3], vertices[idx * 3 + 1], vertices[idx * 3 + 2])
      normals.push(Math.sin(endAngle), 0, -Math.cos(endAngle))
    }
    
    for (let j = 0; j < numProfilePoints; j++) {
      const nextJ = (j + 1) % numProfilePoints
      indices.push(endCapCenter, endCapCenter + 1 + j, endCapCenter + 1 + nextJ)
    }
  }
  
  return { vertices, normals, indices }
}

// Create revolved circle mesh (creates a torus or sphere-like shape)
function createRevolvedCircleMesh(
  entity: SketchEntity,
  params: RevolveParams,
  segments: number = 32
): { vertices: number[], normals: number[], indices: number[] } {
  const data = entity.data
  const cx = data.center?.x || 20  // Circle center X (distance from axis)
  const cy = data.center?.y || 0   // Circle center Y (height along axis)
  const radius = data.radius || 10
  
  const axis = getAxisVector(params.axisId)
  
  // Calculate angle range
  let startAngle = 0
  let endAngle = (params.angle * Math.PI) / 180
  
  if (params.directionType === 'symmetric') {
    startAngle = -((params.angle * Math.PI) / 180)
    endAngle = (params.angle * Math.PI) / 180
  } else if (params.angle2 > 0) {
    startAngle = -((params.angle2 * Math.PI) / 180)
  }
  
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  // Number of segments for the profile circle and revolve
  const profileSegments = 24
  const revolveSegments = Math.max(8, Math.ceil(segments * Math.abs(endAngle - startAngle) / (2 * Math.PI)))
  
  // Ensure circle is offset from axis (torus condition)
  const tubeRadius = radius
  const torusRadius = Math.max(cx, radius + 5)
  
  // Generate torus vertices
  for (let i = 0; i <= revolveSegments; i++) {
    const u = i / revolveSegments
    const theta = startAngle + u * (endAngle - startAngle)
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    
    for (let j = 0; j <= profileSegments; j++) {
      const v = j / profileSegments
      const phi = v * Math.PI * 2
      const cosPhi = Math.cos(phi)
      const sinPhi = Math.sin(phi)
      
      // Position on torus
      const r = torusRadius + tubeRadius * cosPhi
      
      if (axis.direction[1] === 1) {
        // Y-axis revolve
        vertices.push(
          r * cosTheta,
          cy + tubeRadius * sinPhi,
          r * sinTheta
        )
        normals.push(
          cosPhi * cosTheta,
          sinPhi,
          cosPhi * sinTheta
        )
      } else if (axis.direction[0] === 1) {
        // X-axis revolve
        vertices.push(
          cy + tubeRadius * sinPhi,
          r * cosTheta,
          r * sinTheta
        )
        normals.push(
          sinPhi,
          cosPhi * cosTheta,
          cosPhi * sinTheta
        )
      } else {
        // Z-axis revolve
        vertices.push(
          r * cosTheta,
          r * sinTheta,
          cy + tubeRadius * sinPhi
        )
        normals.push(
          cosPhi * cosTheta,
          cosPhi * sinTheta,
          sinPhi
        )
      }
    }
  }
  
  // Generate indices
  for (let i = 0; i < revolveSegments; i++) {
    for (let j = 0; j < profileSegments; j++) {
      const i0 = i * (profileSegments + 1) + j
      const i1 = i0 + 1
      const i2 = i0 + (profileSegments + 1)
      const i3 = i2 + 1
      
      indices.push(i0, i2, i1)
      indices.push(i1, i2, i3)
    }
  }
  
  return { vertices, normals, indices }
}

// Create revolved polygon mesh
function createRevolvedPolygonMesh(
  entity: SketchEntity,
  params: RevolveParams,
  segments: number = 32
): { vertices: number[], normals: number[], indices: number[] } {
  const data = entity.data
  const cx = data.center?.x || 20  // Polygon center X (distance from axis)
  const cy = data.center?.y || 0   // Polygon center Y
  const radius = data.radius || 10
  const sides = data.sides || 6
  
  const axis = getAxisVector(params.axisId)
  
  // Calculate angle range
  let startAngle = 0
  let endAngle = (params.angle * Math.PI) / 180
  
  if (params.directionType === 'symmetric') {
    startAngle = -((params.angle * Math.PI) / 180)
    endAngle = (params.angle * Math.PI) / 180
  } else if (params.angle2 > 0) {
    startAngle = -((params.angle2 * Math.PI) / 180)
  }
  
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  // Create profile points (polygon vertices)
  const profilePoints: [number, number][] = []
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    profilePoints.push([
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius
    ])
  }
  
  const numProfilePoints = profilePoints.length
  const revolveSegments = Math.max(8, Math.ceil(segments * Math.abs(endAngle - startAngle) / (2 * Math.PI)))
  
  // Generate vertices by revolving profile
  for (let i = 0; i <= revolveSegments; i++) {
    const t = i / revolveSegments
    const theta = startAngle + t * (endAngle - startAngle)
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    
    for (const [r, y] of profilePoints) {
      if (axis.direction[1] === 1) {
        vertices.push(r * cosTheta, y, r * sinTheta)
        normals.push(cosTheta, 0, sinTheta)
      } else if (axis.direction[0] === 1) {
        vertices.push(y, r * cosTheta, r * sinTheta)
        normals.push(0, cosTheta, sinTheta)
      } else {
        vertices.push(r * cosTheta, r * sinTheta, y)
        normals.push(cosTheta, sinTheta, 0)
      }
    }
  }
  
  // Generate indices
  for (let i = 0; i < revolveSegments; i++) {
    for (let j = 0; j < numProfilePoints; j++) {
      const nextJ = (j + 1) % numProfilePoints
      
      const i0 = i * numProfilePoints + j
      const i1 = i * numProfilePoints + nextJ
      const i2 = (i + 1) * numProfilePoints + j
      const i3 = (i + 1) * numProfilePoints + nextJ
      
      indices.push(i0, i2, i1)
      indices.push(i1, i2, i3)
    }
  }
  
  return { vertices, normals, indices }
}

// Create mesh from sketch entity for revolve
function createMeshFromSketchEntityRevolve(
  entity: SketchEntity,
  params: RevolveParams
): { vertices: number[], normals: number[], indices: number[] } | null {
  switch (entity.type) {
    case 'rectangle':
      return createRevolvedRectangleMesh(entity, params)
    case 'circle':
      return createRevolvedCircleMesh(entity, params)
    case 'polygon':
      return createRevolvedPolygonMesh(entity, params)
    default:
      return null
  }
}

// ============================================================================
// SWEEP MESH GENERATION FUNCTIONS
// ============================================================================

interface SweepParams {
  orientation: 'follow-path' | 'fixed' | 'keep-normal'
  twistAngle: number      // Total twist in degrees
  endScale: number        // Scale at end of path (1.0 = no change)
}

// Generate path points from a line entity
function getPathPointsFromLine(entity: SketchEntity, segments: number = 20): [number, number, number][] {
  const points: [number, number, number][] = []
  const data = entity.data
  
  if (data.start && data.end) {
    const x1 = data.start.x, y1 = data.start.y, z1 = data.start.z || 0
    const x2 = data.end.x, y2 = data.end.y, z2 = data.end.z || 0
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      points.push([
        x1 + (x2 - x1) * t,
        y1 + (y2 - y1) * t,
        z1 + (z2 - z1) * t
      ])
    }
  }
  
  return points
}

// Generate path points from an arc entity
function getPathPointsFromArc(entity: SketchEntity, segments: number = 20): [number, number, number][] {
  const points: [number, number, number][] = []
  const data = entity.data
  
  if (data.center && data.radius && data.startAngle !== undefined && data.endAngle !== undefined) {
    const cx = data.center.x, cy = data.center.y, cz = data.center.z || 0
    const r = data.radius
    const startAngle = data.startAngle
    const endAngle = data.endAngle
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = startAngle + (endAngle - startAngle) * t
      points.push([
        cx + Math.cos(angle) * r,
        cy + Math.sin(angle) * r,
        cz
      ])
    }
  }
  
  return points
}

// Generate path points from entity
function getPathPoints(pathEntity: SketchEntity, segments: number = 20): [number, number, number][] {
  switch (pathEntity.type) {
    case 'line':
      return getPathPointsFromLine(pathEntity, segments)
    case 'arc':
      return getPathPointsFromArc(pathEntity, segments)
    default:
      // Default: create a simple straight path
      return [
        [0, 0, 0],
        [0, 0, 50]
      ]
  }
}

// Calculate tangent vector at a point on the path
function calculateTangent(
  pathPoints: [number, number, number][],
  index: number
): [number, number, number] {
  const n = pathPoints.length
  if (n < 2) return [0, 0, 1]
  
  let dx: number, dy: number, dz: number
  
  if (index === 0) {
    dx = pathPoints[1][0] - pathPoints[0][0]
    dy = pathPoints[1][1] - pathPoints[0][1]
    dz = pathPoints[1][2] - pathPoints[0][2]
  } else if (index >= n - 1) {
    dx = pathPoints[n - 1][0] - pathPoints[n - 2][0]
    dy = pathPoints[n - 1][1] - pathPoints[n - 2][1]
    dz = pathPoints[n - 1][2] - pathPoints[n - 2][2]
  } else {
    dx = pathPoints[index + 1][0] - pathPoints[index - 1][0]
    dy = pathPoints[index + 1][1] - pathPoints[index - 1][1]
    dz = pathPoints[index + 1][2] - pathPoints[index - 1][2]
  }
  
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
  if (len < 0.0001) return [0, 0, 1]
  
  return [dx / len, dy / len, dz / len]
}

// Calculate normal and binormal for a Frenet frame
function calculateFrenetFrame(
  tangent: [number, number, number]
): { normal: [number, number, number], binormal: [number, number, number] } {
  // Pick a reference vector that's not parallel to tangent
  let ref: [number, number, number] = [0, 1, 0]
  if (Math.abs(tangent[1]) > 0.9) {
    ref = [1, 0, 0]
  }
  
  // Calculate normal as cross product of tangent and reference
  const nx = tangent[1] * ref[2] - tangent[2] * ref[1]
  const ny = tangent[2] * ref[0] - tangent[0] * ref[2]
  const nz = tangent[0] * ref[1] - tangent[1] * ref[0]
  
  const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz)
  const normal: [number, number, number] = nlen > 0.0001 
    ? [nx / nlen, ny / nlen, nz / nlen]
    : [1, 0, 0]
  
  // Calculate binormal as cross product of tangent and normal
  const bx = tangent[1] * normal[2] - tangent[2] * normal[1]
  const by = tangent[2] * normal[0] - tangent[0] * normal[2]
  const bz = tangent[0] * normal[1] - tangent[1] * normal[0]
  
  const binormal: [number, number, number] = [bx, by, bz]
  
  return { normal, binormal }
}

// Get profile points for a shape (in local XY plane)
function getProfilePoints(entity: SketchEntity): [number, number][] {
  const data = entity.data
  
  if (entity.type === 'circle') {
    const r = data.radius || 10
    const points: [number, number][] = []
    const segments = 16
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push([Math.cos(angle) * r, Math.sin(angle) * r])
    }
    return points
    
  } else if (entity.type === 'rectangle') {
    let hw = 15, hh = 10
    if (data.start && data.end) {
      hw = Math.abs(data.end.x - data.start.x) / 2
      hh = Math.abs(data.end.y - data.start.y) / 2
    } else if (data.corner1 && data.corner2) {
      hw = Math.abs(data.corner2.x - data.corner1.x) / 2
      hh = Math.abs(data.corner2.y - data.corner1.y) / 2
    }
    return [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, hh]
    ]
    
  } else if (entity.type === 'polygon') {
    const r = data.radius || 10
    const sides = data.sides || 6
    const points: [number, number][] = []
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
      points.push([Math.cos(angle) * r, Math.sin(angle) * r])
    }
    return points
  }
  
  // Default circle
  const r = 5
  const points: [number, number][] = []
  const segments = 16
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    points.push([Math.cos(angle) * r, Math.sin(angle) * r])
  }
  return points
}

// Create swept mesh from profile and path
function createSweptMesh(
  profileEntity: SketchEntity,
  pathEntity: SketchEntity,
  params: SweepParams
): { vertices: number[], normals: number[], indices: number[] } {
  const pathPoints = getPathPoints(pathEntity, 24)
  const profilePoints = getProfilePoints(profileEntity)
  
  const numPathPoints = pathPoints.length
  const numProfilePoints = profilePoints.length
  
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  const twistRadians = (params.twistAngle * Math.PI) / 180
  
  // Generate vertices along the path
  for (let i = 0; i < numPathPoints; i++) {
    const t = i / (numPathPoints - 1)
    const pathPoint = pathPoints[i]
    const tangent = calculateTangent(pathPoints, i)
    const { normal, binormal } = calculateFrenetFrame(tangent)
    
    // Apply twist rotation around tangent
    const twist = twistRadians * t
    const cosTwist = Math.cos(twist)
    const sinTwist = Math.sin(twist)
    
    // Rotate normal and binormal by twist angle around tangent
    const rotatedNormal: [number, number, number] = [
      normal[0] * cosTwist + binormal[0] * sinTwist,
      normal[1] * cosTwist + binormal[1] * sinTwist,
      normal[2] * cosTwist + binormal[2] * sinTwist
    ]
    const rotatedBinormal: [number, number, number] = [
      -normal[0] * sinTwist + binormal[0] * cosTwist,
      -normal[1] * sinTwist + binormal[1] * cosTwist,
      -normal[2] * sinTwist + binormal[2] * cosTwist
    ]
    
    // Apply scale
    const scale = 1 + (params.endScale - 1) * t
    
    // Transform each profile point to world coordinates
    for (const [px, py] of profilePoints) {
      const scaledPx = px * scale
      const scaledPy = py * scale
      
      // Transform using Frenet frame (with twist applied)
      const x = pathPoint[0] + scaledPx * rotatedNormal[0] + scaledPy * rotatedBinormal[0]
      const y = pathPoint[1] + scaledPx * rotatedNormal[1] + scaledPy * rotatedBinormal[1]
      const z = pathPoint[2] + scaledPx * rotatedNormal[2] + scaledPy * rotatedBinormal[2]
      
      vertices.push(x, y, z)
      
      // Normal pointing outward from profile center
      const nx = scaledPx * rotatedNormal[0] + scaledPy * rotatedBinormal[0]
      const ny = scaledPx * rotatedNormal[1] + scaledPy * rotatedBinormal[1]
      const nz = scaledPx * rotatedNormal[2] + scaledPy * rotatedBinormal[2]
      const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz)
      if (nlen > 0.0001) {
        normals.push(nx / nlen, ny / nlen, nz / nlen)
      } else {
        normals.push(0, 0, 1)
      }
    }
  }
  
  // Generate indices for the swept surface
  for (let i = 0; i < numPathPoints - 1; i++) {
    for (let j = 0; j < numProfilePoints; j++) {
      const nextJ = (j + 1) % numProfilePoints
      
      const i0 = i * numProfilePoints + j
      const i1 = i * numProfilePoints + nextJ
      const i2 = (i + 1) * numProfilePoints + j
      const i3 = (i + 1) * numProfilePoints + nextJ
      
      indices.push(i0, i2, i1)
      indices.push(i1, i2, i3)
    }
  }
  
  // Add end caps
  // Start cap
  const startCenterIdx = vertices.length / 3
  const startPoint = pathPoints[0]
  vertices.push(startPoint[0], startPoint[1], startPoint[2])
  const startTangent = calculateTangent(pathPoints, 0)
  normals.push(-startTangent[0], -startTangent[1], -startTangent[2])
  
  for (let j = 0; j < numProfilePoints; j++) {
    const idx = j
    vertices.push(vertices[idx * 3], vertices[idx * 3 + 1], vertices[idx * 3 + 2])
    normals.push(-startTangent[0], -startTangent[1], -startTangent[2])
  }
  
  for (let j = 0; j < numProfilePoints; j++) {
    const nextJ = (j + 1) % numProfilePoints
    indices.push(startCenterIdx, startCenterIdx + 1 + nextJ, startCenterIdx + 1 + j)
  }
  
  // End cap
  const endCenterIdx = vertices.length / 3
  const endPoint = pathPoints[numPathPoints - 1]
  vertices.push(endPoint[0], endPoint[1], endPoint[2])
  const endTangent = calculateTangent(pathPoints, numPathPoints - 1)
  normals.push(endTangent[0], endTangent[1], endTangent[2])
  
  const lastRingStart = (numPathPoints - 1) * numProfilePoints
  for (let j = 0; j < numProfilePoints; j++) {
    const idx = lastRingStart + j
    vertices.push(vertices[idx * 3], vertices[idx * 3 + 1], vertices[idx * 3 + 2])
    normals.push(endTangent[0], endTangent[1], endTangent[2])
  }
  
  for (let j = 0; j < numProfilePoints; j++) {
    const nextJ = (j + 1) % numProfilePoints
    indices.push(endCenterIdx, endCenterIdx + 1 + j, endCenterIdx + 1 + nextJ)
  }
  
  return { vertices, normals, indices }
}

// Create mesh from sketch entities for sweep
function createMeshFromSketchEntitiesSweep(
  profileEntity: SketchEntity,
  pathEntity: SketchEntity,
  params: SweepParams
): { vertices: number[], normals: number[], indices: number[] } | null {
  // Both profile and path must be valid
  if (!profileEntity || !pathEntity) return null
  
  // Profile must be a closed shape
  if (profileEntity.type !== 'rectangle' && profileEntity.type !== 'circle' && profileEntity.type !== 'polygon') {
    return null
  }
  
  // Path must be a line, arc, or spline
  if (pathEntity.type !== 'line' && pathEntity.type !== 'arc' && pathEntity.type !== 'spline') {
    return null
  }
  
  return createSweptMesh(profileEntity, pathEntity, params)
}

// ============================================================================
// LOFT MESH GENERATION FUNCTIONS
// ============================================================================

interface LoftParams {
  closedLoft: boolean           // Connect last profile to first
  startCondition: 'free' | 'normal' | 'tangent' | 'curvature'
  endCondition: 'free' | 'normal' | 'tangent' | 'curvature'
  startMagnitude: number
  endMagnitude: number
}

// Get profile points with offset to position profile in 3D
function getLoftProfilePoints(
  entity: SketchEntity,
  zOffset: number
): { points: [number, number, number][], center: [number, number, number] } {
  const data = entity.data
  const points: [number, number, number][] = []
  let centerX = 0, centerY = 0
  
  if (entity.type === 'circle') {
    const cx = data.center?.x || 0
    const cy = data.center?.y || 0
    const r = data.radius || 10
    centerX = cx
    centerY = cy
    
    const segments = 24
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push([
        cx + Math.cos(angle) * r,
        cy + Math.sin(angle) * r,
        zOffset
      ])
    }
    
  } else if (entity.type === 'rectangle') {
    let x1 = 0, y1 = 0, x2 = 20, y2 = 20
    if (data.start && data.end) {
      x1 = data.start.x; y1 = data.start.y
      x2 = data.end.x; y2 = data.end.y
    } else if (data.corner1 && data.corner2) {
      x1 = data.corner1.x; y1 = data.corner1.y
      x2 = data.corner2.x; y2 = data.corner2.y
    }
    centerX = (x1 + x2) / 2
    centerY = (y1 + y2) / 2
    
    // Create rectangle points with subdivision for smoother loft
    const hw = Math.abs(x2 - x1) / 2
    const hh = Math.abs(y2 - y1) / 2
    const subdivs = 6
    
    // Bottom edge
    for (let i = 0; i <= subdivs; i++) {
      const t = i / subdivs
      points.push([centerX - hw + (2 * hw) * t, centerY - hh, zOffset])
    }
    // Right edge (skip first point, already added)
    for (let i = 1; i <= subdivs; i++) {
      const t = i / subdivs
      points.push([centerX + hw, centerY - hh + (2 * hh) * t, zOffset])
    }
    // Top edge (skip first point)
    for (let i = 1; i <= subdivs; i++) {
      const t = i / subdivs
      points.push([centerX + hw - (2 * hw) * t, centerY + hh, zOffset])
    }
    // Left edge (skip first and last points)
    for (let i = 1; i < subdivs; i++) {
      const t = i / subdivs
      points.push([centerX - hw, centerY + hh - (2 * hh) * t, zOffset])
    }
    
  } else if (entity.type === 'polygon') {
    const cx = data.center?.x || 0
    const cy = data.center?.y || 0
    const r = data.radius || 10
    const sides = data.sides || 6
    centerX = cx
    centerY = cy
    
    // Create polygon points with subdivision for smoother loft
    const subdivs = Math.max(1, Math.floor(24 / sides))
    for (let i = 0; i < sides; i++) {
      const angle1 = (i / sides) * Math.PI * 2 - Math.PI / 2
      const angle2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2
      
      const x1 = cx + Math.cos(angle1) * r
      const y1 = cy + Math.sin(angle1) * r
      const x2 = cx + Math.cos(angle2) * r
      const y2 = cy + Math.sin(angle2) * r
      
      for (let j = 0; j < subdivs; j++) {
        const t = j / subdivs
        points.push([
          x1 + (x2 - x1) * t,
          y1 + (y2 - y1) * t,
          zOffset
        ])
      }
    }
  }
  
  return { points, center: [centerX, centerY, zOffset] }
}

// Interpolate between two profile point sets with blending
function interpolateProfiles(
  profile1: [number, number, number][],
  profile2: [number, number, number][],
  t: number,
  startCondition: string,
  endCondition: string,
  startMag: number,
  endMag: number
): [number, number, number][] {
  // Ensure profiles have same number of points
  const numPoints = Math.min(profile1.length, profile2.length)
  const result: [number, number, number][] = []
  
  // Apply tangency conditions with smooth blending
  let blendT = t
  
  // Hermite interpolation for smoother results
  if (startCondition !== 'free' || endCondition !== 'free') {
    const h00 = 2 * t * t * t - 3 * t * t + 1
    const h01 = -2 * t * t * t + 3 * t * t
    const h10 = t * t * t - 2 * t * t + t
    const h11 = t * t * t - t * t
    
    blendT = h00 * 0 + h01 * 1 + h10 * startMag * 0.5 + h11 * endMag * 0.5
  }
  
  for (let i = 0; i < numPoints; i++) {
    const p1 = profile1[i % profile1.length]
    const p2 = profile2[i % profile2.length]
    
    result.push([
      p1[0] + (p2[0] - p1[0]) * blendT,
      p1[1] + (p2[1] - p1[1]) * blendT,
      p1[2] + (p2[2] - p1[2]) * t  // Z always interpolates linearly
    ])
  }
  
  return result
}

// Create lofted mesh between multiple profiles
function createLoftedMesh(
  profiles: { points: [number, number, number][], center: [number, number, number] }[],
  params: LoftParams
): { vertices: number[], normals: number[], indices: number[] } {
  if (profiles.length < 2) {
    return { vertices: [], normals: [], indices: [] }
  }
  
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  
  // Normalize profile point counts to match
  const targetPointCount = profiles[0].points.length
  const normalizedProfiles = profiles.map(profile => {
    if (profile.points.length === targetPointCount) {
      return profile.points
    }
    // Resample profile to match target point count
    const resampled: [number, number, number][] = []
    for (let i = 0; i < targetPointCount; i++) {
      const srcIdx = (i / targetPointCount) * profile.points.length
      const idx0 = Math.floor(srcIdx) % profile.points.length
      const idx1 = (idx0 + 1) % profile.points.length
      const t = srcIdx - Math.floor(srcIdx)
      
      const p0 = profile.points[idx0]
      const p1 = profile.points[idx1]
      resampled.push([
        p0[0] + (p1[0] - p0[0]) * t,
        p0[1] + (p1[1] - p0[1]) * t,
        p0[2] + (p1[2] - p0[2]) * t
      ])
    }
    return resampled
  })
  
  // Generate intermediate sections between each pair of profiles
  const sectionsPerSegment = 8
  const allSections: [number, number, number][][] = []
  
  for (let i = 0; i < normalizedProfiles.length - 1; i++) {
    const profile1 = normalizedProfiles[i]
    const profile2 = normalizedProfiles[i + 1]
    
    // Determine conditions for this segment
    const isFirstSegment = i === 0
    const isLastSegment = i === normalizedProfiles.length - 2
    const segStartCond = isFirstSegment ? params.startCondition : 'free'
    const segEndCond = isLastSegment ? params.endCondition : 'free'
    
    for (let j = 0; j <= sectionsPerSegment; j++) {
      // Skip first section of non-first segments (already added)
      if (i > 0 && j === 0) continue
      
      const t = j / sectionsPerSegment
      const section = interpolateProfiles(
        profile1, profile2, t,
        segStartCond, segEndCond,
        params.startMagnitude, params.endMagnitude
      )
      allSections.push(section)
    }
  }
  
  // If closed loft, add interpolation back to first profile
  if (params.closedLoft && normalizedProfiles.length >= 2) {
    const lastProfile = normalizedProfiles[normalizedProfiles.length - 1]
    const firstProfile = normalizedProfiles[0]
    
    for (let j = 1; j <= sectionsPerSegment; j++) {
      const t = j / sectionsPerSegment
      const section = interpolateProfiles(
        lastProfile, firstProfile, t,
        'free', 'free', 1, 1
      )
      allSections.push(section)
    }
  }
  
  const numSections = allSections.length
  const numPointsPerSection = targetPointCount
  
  // Add vertices and normals for each section
  for (let i = 0; i < numSections; i++) {
    const section = allSections[i]
    for (let j = 0; j < numPointsPerSection; j++) {
      const p = section[j]
      vertices.push(p[0], p[1], p[2])
      
      // Calculate approximate normal
      const prevJ = (j - 1 + numPointsPerSection) % numPointsPerSection
      const nextJ = (j + 1) % numPointsPerSection
      const prevP = section[prevJ]
      const nextP = section[nextJ]
      
      // Tangent along the profile
      const tx = nextP[0] - prevP[0]
      const ty = nextP[1] - prevP[1]
      const tz = nextP[2] - prevP[2]
      
      // Direction along loft (approximate)
      let dx = 0, dy = 0, dz = 1
      if (i < numSections - 1) {
        const nextSection = allSections[i + 1]
        const nextP = nextSection[j]
        dx = nextP[0] - p[0]
        dy = nextP[1] - p[1]
        dz = nextP[2] - p[2]
      } else if (i > 0) {
        const prevSection = allSections[i - 1]
        const prevP = prevSection[j]
        dx = p[0] - prevP[0]
        dy = p[1] - prevP[1]
        dz = p[2] - prevP[2]
      }
      
      // Normal is cross product of tangent and direction
      const nx = ty * dz - tz * dy
      const ny = tz * dx - tx * dz
      const nz = tx * dy - ty * dx
      
      const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz)
      if (nlen > 0.0001) {
        normals.push(nx / nlen, ny / nlen, nz / nlen)
      } else {
        normals.push(0, 0, 1)
      }
    }
  }
  
  // Generate indices for the loft surface
  for (let i = 0; i < numSections - 1; i++) {
    for (let j = 0; j < numPointsPerSection; j++) {
      const nextJ = (j + 1) % numPointsPerSection
      
      const i0 = i * numPointsPerSection + j
      const i1 = i * numPointsPerSection + nextJ
      const i2 = (i + 1) * numPointsPerSection + j
      const i3 = (i + 1) * numPointsPerSection + nextJ
      
      indices.push(i0, i2, i1)
      indices.push(i1, i2, i3)
    }
  }
  
  // Connect last to first for closed loft
  if (params.closedLoft) {
    const lastSection = numSections - 1
    for (let j = 0; j < numPointsPerSection; j++) {
      const nextJ = (j + 1) % numPointsPerSection
      
      const i0 = lastSection * numPointsPerSection + j
      const i1 = lastSection * numPointsPerSection + nextJ
      const i2 = j
      const i3 = nextJ
      
      indices.push(i0, i2, i1)
      indices.push(i1, i2, i3)
    }
  } else {
    // Add end caps for non-closed loft
    // Start cap
    const startCenterIdx = vertices.length / 3
    const firstSection = allSections[0]
    let startCx = 0, startCy = 0, startCz = 0
    for (const p of firstSection) {
      startCx += p[0]
      startCy += p[1]
      startCz += p[2]
    }
    startCx /= firstSection.length
    startCy /= firstSection.length
    startCz /= firstSection.length
    
    vertices.push(startCx, startCy, startCz)
    normals.push(0, 0, -1)
    
    for (let j = 0; j < numPointsPerSection; j++) {
      const p = firstSection[j]
      vertices.push(p[0], p[1], p[2])
      normals.push(0, 0, -1)
    }
    
    for (let j = 0; j < numPointsPerSection; j++) {
      const nextJ = (j + 1) % numPointsPerSection
      indices.push(startCenterIdx, startCenterIdx + 1 + nextJ, startCenterIdx + 1 + j)
    }
    
    // End cap
    const endCenterIdx = vertices.length / 3
    const lastSectionPoints = allSections[numSections - 1]
    let endCx = 0, endCy = 0, endCz = 0
    for (const p of lastSectionPoints) {
      endCx += p[0]
      endCy += p[1]
      endCz += p[2]
    }
    endCx /= lastSectionPoints.length
    endCy /= lastSectionPoints.length
    endCz /= lastSectionPoints.length
    
    vertices.push(endCx, endCy, endCz)
    normals.push(0, 0, 1)
    
    for (let j = 0; j < numPointsPerSection; j++) {
      const p = lastSectionPoints[j]
      vertices.push(p[0], p[1], p[2])
      normals.push(0, 0, 1)
    }
    
    for (let j = 0; j < numPointsPerSection; j++) {
      const nextJ = (j + 1) % numPointsPerSection
      indices.push(endCenterIdx, endCenterIdx + 1 + j, endCenterIdx + 1 + nextJ)
    }
  }
  
  return { vertices, normals, indices }
}

// Create mesh from multiple sketch entities for loft
function createMeshFromSketchEntitiesLoft(
  profileEntities: { entity: SketchEntity, zOffset: number }[],
  params: LoftParams
): { vertices: number[], normals: number[], indices: number[] } | null {
  if (profileEntities.length < 2) return null
  
  // Get profile points for each entity
  const profiles = profileEntities.map(({ entity, zOffset }) => 
    getLoftProfilePoints(entity, zOffset)
  )
  
  return createLoftedMesh(profiles, params)
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
  
  loadDocumentFromData: (data: Document) => {
    set({ document: data, isDirty: false, isLoading: false, error: null })
    
    // Regenerate model for each part studio
    const { regenerateModel } = get()
    data.partStudios.forEach(ps => {
      regenerateModel(ps.id)
    })
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
          const featureParams = feature.parameters
          const sketchId = featureParams.sketchId
          const profileIds = featureParams.profileIds || []
          
          // Build extrude params
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
          
          const operation = featureParams.operation || 'new'
          
          // Get sketch and create meshes from profiles
          const sketch = partStudio.sketches.get(sketchId)
          let meshCreated = false
          
          if (sketch && profileIds.length > 0) {
            // Extrude from specified sketch profiles
            for (const profileId of profileIds) {
              const entity = sketch.entities.find(e => e.id === profileId)
              if (!entity) continue
              
              const mesh = createMeshFromSketchEntity(entity, extrudeParams)
              if (!mesh) continue
              
              meshCreated = true
              
              if (operation === 'new' || !currentBody) {
                currentBody = {
                  id: generateId(),
                  name: `Part from ${feature.name}`,
                  color: '#6b7280',
                  mesh
                }
                parts.push(currentBody)
              } else if (operation === 'add') {
                // Simplified: replace mesh (real CAD would do CSG union)
                currentBody.mesh = mesh
              } else if (operation === 'remove') {
                // Simplified: indicate cut operation visually
                currentBody.color = '#ef4444'
                currentBody.mesh = mesh
              } else if (operation === 'intersect') {
                // Simplified: replace mesh
                currentBody.mesh = mesh
              }
            }
          } else if (sketch && sketch.entities.length > 0) {
            // No specific profiles selected - try to extrude first valid entity
            for (const entity of sketch.entities) {
              if (entity.type === 'rectangle' || entity.type === 'circle' || entity.type === 'polygon') {
                const mesh = createMeshFromSketchEntity(entity, extrudeParams)
                if (mesh) {
                  meshCreated = true
                  
                  if (operation === 'new' || !currentBody) {
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
                  break // Only extrude first valid profile
                }
              }
            }
          }
          
          // Fallback: create default box mesh if no sketch profiles found
          if (!meshCreated) {
            const width = featureParams.width || 30
            const height = featureParams.height || 30
            const depth = extrudeParams.depth1
            
            const mesh = createBoxMesh(width, depth, height)
            
            if (operation === 'new' || !currentBody) {
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
          }
          break
        }
        
        case 'revolve': {
          const featureParams = feature.parameters
          const sketchId = featureParams.sketchId
          const profileId = featureParams.profileId
          
          // Build revolve params
          const revolveParams: RevolveParams = {
            angle: featureParams.angle || 360,
            angle2: featureParams.angle2 || 0,
            axisId: featureParams.axisId || 'y-axis',
            directionType: featureParams.directionType || 'full'
          }
          
          const operation = featureParams.operation || 'new'
          
          // Get sketch and create mesh from profile
          const sketch = partStudio.sketches.get(sketchId)
          let meshCreated = false
          
          if (sketch && profileId) {
            const entity = sketch.entities.find(e => e.id === profileId)
            if (entity) {
              const mesh = createMeshFromSketchEntityRevolve(entity, revolveParams)
              if (mesh) {
                meshCreated = true
                
                if (operation === 'new' || !currentBody) {
                  currentBody = {
                    id: generateId(),
                    name: `Part from ${feature.name}`,
                    color: '#6b7280',
                    mesh
                  }
                  parts.push(currentBody)
                } else if (operation === 'add') {
                  currentBody.mesh = mesh
                } else if (operation === 'remove') {
                  currentBody.color = '#ef4444'
                  currentBody.mesh = mesh
                } else if (operation === 'intersect') {
                  currentBody.mesh = mesh
                }
              }
            }
          } else if (sketch && sketch.entities.length > 0) {
            // No specific profile selected - try first valid entity
            for (const entity of sketch.entities) {
              if (entity.type === 'rectangle' || entity.type === 'circle' || entity.type === 'polygon') {
                const mesh = createMeshFromSketchEntityRevolve(entity, revolveParams)
                if (mesh) {
                  meshCreated = true
                  
                  if (operation === 'new' || !currentBody) {
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
              }
            }
          }
          
          // Fallback: create default cylinder mesh
          if (!meshCreated) {
            const radius = featureParams.radius || 15
            const height = featureParams.height || 30
            
            const mesh = createCylinderMesh(radius, height)
            
            if (operation === 'new' || !currentBody) {
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
          }
          break
        }
        
        case 'sweep': {
          const featureParams = feature.parameters
          const profileSketchId = featureParams.profileSketchId
          const profileId = featureParams.profileId
          const pathSketchId = featureParams.pathSketchId
          const pathId = featureParams.pathId
          
          // Build sweep params
          const sweepParams: SweepParams = {
            orientation: featureParams.orientation || 'follow-path',
            twistAngle: featureParams.twistAngle || 0,
            endScale: featureParams.endScale || 1.0
          }
          
          const operation = featureParams.operation || 'new'
          
          // Get profile and path sketches
          const profileSketch = partStudio.sketches.get(profileSketchId)
          const pathSketch = partStudio.sketches.get(pathSketchId)
          
          let meshCreated = false
          
          if (profileSketch && pathSketch && profileId && pathId) {
            const profileEntity = profileSketch.entities.find(e => e.id === profileId)
            // Handle chain paths
            let pathEntity: SketchEntity | undefined
            if (pathId.endsWith('-chain')) {
              // Use first line in sketch as path
              pathEntity = pathSketch.entities.find(e => e.type === 'line')
            } else {
              pathEntity = pathSketch.entities.find(e => e.id === pathId)
            }
            
            if (profileEntity && pathEntity) {
              const mesh = createMeshFromSketchEntitiesSweep(profileEntity, pathEntity, sweepParams)
              if (mesh) {
                meshCreated = true
                
                if (operation === 'new' || !currentBody) {
                  currentBody = {
                    id: generateId(),
                    name: `Part from ${feature.name}`,
                    color: '#6b7280',
                    mesh
                  }
                  parts.push(currentBody)
                } else if (operation === 'add') {
                  currentBody.mesh = mesh
                } else if (operation === 'remove') {
                  currentBody.color = '#ef4444'
                  currentBody.mesh = mesh
                } else if (operation === 'intersect') {
                  currentBody.mesh = mesh
                }
              }
            }
          }
          
          // Fallback: create a simple swept tube along Z axis
          if (!meshCreated) {
            const radius = 10
            const length = 50
            const mesh = createCylinderMesh(radius, length)
            
            if (operation === 'new' || !currentBody) {
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
          }
          break
        }
        
        case 'loft': {
          const featureParams = feature.parameters
          const profileConfigs = featureParams.profiles || []
          
          // Build loft params
          const loftParams: LoftParams = {
            closedLoft: featureParams.closedLoft || false,
            startCondition: featureParams.startCondition || 'free',
            endCondition: featureParams.endCondition || 'free',
            startMagnitude: featureParams.startMagnitude || 1.0,
            endMagnitude: featureParams.endMagnitude || 1.0
          }
          
          const operation = featureParams.operation || 'new'
          
          // Gather profile entities
          const profileEntities: { entity: SketchEntity, zOffset: number }[] = []
          
          for (let i = 0; i < profileConfigs.length; i++) {
            const config = profileConfigs[i]
            const sketch = partStudio.sketches.get(config.sketchId)
            
            if (sketch) {
              const entity = sketch.entities.find(e => e.id === config.entityId)
              if (entity) {
                // Calculate Z offset based on order (simplified - spread evenly)
                const zOffset = i * 30  // 30 units between each profile
                profileEntities.push({ entity, zOffset })
              }
            }
          }
          
          let meshCreated = false
          
          if (profileEntities.length >= 2) {
            const mesh = createMeshFromSketchEntitiesLoft(profileEntities, loftParams)
            if (mesh && mesh.vertices.length > 0) {
              meshCreated = true
              
              if (operation === 'new' || !currentBody) {
                currentBody = {
                  id: generateId(),
                  name: `Part from ${feature.name}`,
                  color: '#6b7280',
                  mesh
                }
                parts.push(currentBody)
              } else if (operation === 'add') {
                currentBody.mesh = mesh
              } else if (operation === 'remove') {
                currentBody.color = '#ef4444'
                currentBody.mesh = mesh
              } else if (operation === 'intersect') {
                currentBody.mesh = mesh
              }
            }
          }
          
          // Fallback: create a simple cone/tapered cylinder
          if (!meshCreated) {
            const radius = 15
            const height = 50
            const mesh = createCylinderMesh(radius, height)
            
            if (operation === 'new' || !currentBody) {
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

