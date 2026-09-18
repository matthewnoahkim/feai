/**
 * Document Store - Manages CAD document state
 */

import { create } from 'zustand'
import { api } from '../api/client'
import { cadSolverClient } from '../lib/cad-solver/client'
import { normalizeFeature } from './featureAdapter'
import type {
  MassProperties as CadMassProperties,
  Plane as CadPlane,
  ProfileEntity as CadProfileEntity,
  ShapeResult as CadShapeResult,
} from '../lib/cad-solver/types'
import {
  identityTransform,
  solveFaceMateTransform,
  transformPoint,
  transformDirection,
  type Vec3,
} from '../lib/assembly/mateSolver'

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
    /** One entry per triangle; value is the index into `faces` that triangle belongs to.
     * Drives face highlighting/picking without needing per-face draw calls. Absent for a
     * raw imported mesh that never made it through the modeling engine (see importSTLPart's
     * fallback), since there's no server-side face data to index into. */
    faceIndexByTriangle?: number[]
  }
  /** Real B-rep edges from the modeling engine, one polyline (flat xyz) per topological
   * edge, id `e<N>` where N is the server-side edge index. Drives edge picking. */
  edges?: Array<{ edgeId: string; points: number[] }>
  /** Real B-rep faces from the modeling engine, id `f<N>` where N is the server-side face
   * index (same index space as `mesh.faceIndexByTriangle`). Drives face picking. */
  faces?: Array<{ faceId: string; centroid: number[]; normal: number[] }>
  /** Real B-rep vertices from the modeling engine, id `v<N>`. Drives vertex picking. */
  vertices?: Array<{ vertexId: string; point: number[] }>
  massProperties?: CadMassProperties
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
  mates: Mate[]
}

/** A face-to-face or offset relationship between two assembly instances. There's no
 * DOF/simultaneous solver here — see solveMateTransform — so 'mates' is a small, fixed
 * set of closed-form relationships rather than the general constraint graph a real
 * assembly mate solver would support. */
export interface Mate {
  id: string
  type: 'coincident' | 'distance'
  // The instance that gets moved (see addMate/solveMateTransform); the other instance's
  // referenced face is treated as the fixed target.
  movingInstanceId: string
  movingFaceId: string // '<partId>-face-<N>' in the moving instance's own (untransformed) part
  targetInstanceId: string
  targetFaceId: string
  // 'coincident': faces touch, normals opposed (flush) — offset is an optional gap.
  // 'distance': like coincident, but offset is the required gap, not optional.
  offset: number
}

/** One projection of a part studio's current body onto a 2D drawing sheet — see
 * lib/drawing/projection.ts for the actual projection math. Not a regenerable feature:
 * a drawing view is a derived snapshot of "however the model looks right now", the way
 * a real CAD drawing sheet keeps its own placed views rather than replaying feature
 * history. */
export interface DrawingView {
  id: string
  direction: 'front' | 'top' | 'right' | 'iso'
  origin: { x: number; y: number } // this view's placement on the sheet
  scale: number
}

export interface DrawingSheet {
  id: string
  name: string
  partStudioId: string
  views: DrawingView[]
}

export interface Document {
  id: string
  name: string
  description?: string
  units: 'mm' | 'inch' | 'm'
  partStudios: PartStudio[]
  assemblies: Assembly[]
  drawings: DrawingSheet[]
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
  /** Dialog submit: updates the feature being edited (dialogData.isEditing/featureId from
   * openFeatureForEdit) instead of appending a duplicate; otherwise adds a new one. */
  submitFeature: (
    partStudioId: string,
    feature: Omit<Feature, 'id'>,
    dialogData: { isEditing?: boolean; featureId?: string } | null | undefined
  ) => Promise<Feature | null>
  deleteFeature: (partStudioId: string, featureId: string) => Promise<void>
  copyFeature: (partStudioId: string, featureId: string) => Promise<Feature | null>
  toggleFeatureSuppression: (partStudioId: string, featureId: string) => void
  reorderFeature: (partStudioId: string, featureId: string, newIndex: number) => void
  renameFeature: (partStudioId: string, featureId: string, newName: string) => void
  
  // Sketch operations
  createSketch: (partStudioId: string, planeId: string) => Promise<Sketch | null>
  addSketchEntity: (sketchId: string, entity: Omit<SketchEntity, 'id'>) => string
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

  // Assembly operations — a real transform/mate model, but no DOF solver (see
  // lib/assembly/mateSolver.ts); cad-server has no assembly concept either.
  createAssembly: (name: string) => string
  deleteAssembly: (assemblyId: string) => void
  addAssemblyInstance: (assemblyId: string, partStudioId: string, partId: string) => string | null
  deleteAssemblyInstance: (assemblyId: string, instanceId: string) => void
  updateInstanceTransform: (assemblyId: string, instanceId: string, transform: number[]) => void
  /** Solves the mate immediately (closed-form — see solveFaceMateTransform) and writes
   * the resulting transform onto the moving instance; there's nothing further to
   * "regenerate" later the way a feature-tree op would. */
  addMate: (assemblyId: string, mate: Omit<Mate, 'id'>) => void
  deleteMate: (assemblyId: string, mateId: string) => void

  // Drawing operations — 2D projections of a part studio's current body onto a sheet
  // (see lib/drawing/projection.ts). Not a regenerable feature; a view is a snapshot.
  createDrawingSheet: (partStudioId: string, name: string) => string
  deleteDrawingSheet: (sheetId: string) => void
  addDrawingView: (sheetId: string, direction: DrawingView['direction']) => void
  updateDrawingView: (sheetId: string, viewId: string, updates: Partial<Pick<DrawingView, 'origin' | 'scale'>>) => void
  deleteDrawingView: (sheetId: string, viewId: string) => void

  // Import operations
  importSTLPart: (partStudioId: string, name: string, mesh: { vertices: number[], normals: number[], indices: number[] }) => Promise<void>
  /** A STEP/IGES file can contain multiple independent solids; each becomes its own
   * part (documentStore has no assembly concept to group them under yet). */
  importStepPart: (partStudioId: string, name: string, fileContentBase64: string, format?: 'step' | 'iges') => Promise<void>

  // Document operations
  updateDocumentName: (name: string) => void
  updateDocumentUnits: (units: 'mm' | 'inch' | 'm') => void
  updateExportSettings: (settings: Partial<Document['exportSettings']>) => void
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

/** JSON-safe form of a document for persistence (.feai, project data, autosave). Maps
 * become objects, and parts drop everything the engine rebuilds on load (mesh, edges,
 * mass properties, server shapeId) — except imported meshes, which are source data. */
export function serializeDocument(doc: Document): Record<string, any> {
  return {
    ...doc,
    partStudios: doc.partStudios.map(ps => {
      const importedPartIds = new Set(
        ps.features.filter(f => f.type === 'import').map(f => f.parameters.partId)
      )
      return {
        ...ps,
        sketches: Object.fromEntries(ps.sketches),
        parts: ps.parts.map(p => {
          const { mesh, edges, faces, vertices, massProperties, shapeId, ...rest } = p
          return importedPartIds.has(p.id) ? { ...rest, mesh } : rest
        }),
      }
    }),
  }
}

/** Inverse of serializeDocument: tolerates older payloads (missing arrays, Map already built). */
export function deserializeDocument(data: any): Document {
  return {
    ...data,
    partStudios: (data.partStudios || []).map((ps: any) => ({
      ...ps,
      features: ps.features || [],
      parts: ps.parts || [],
      sketches: ps.sketches instanceof Map
        ? ps.sketches
        : new Map<string, Sketch>(Object.entries(ps.sketches || {})),
    })),
    assemblies: data.assemblies || [],
    drawings: data.drawings || [],
  }
}

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
    assemblies: doc.assemblies.map(a => ({ ...a, instances: a.instances.map(i => ({ ...i })), mates: a.mates.map(m => ({ ...m })) })),
    drawings: doc.drawings.map(d => ({ ...d, views: d.views.map(v => ({ ...v })) })),
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

/** Revolving a semicircular arc 360° around its own diameter is the standard way to build
 * a sphere by hand in a real CAD tool, and it's what the chat assistant does too since it's
 * not told about a "sphere" action - but toCadProfile can't turn a bare arc into a
 * ProfileEntity (that type only covers rectangle/circle/polygon; see cad-server's
 * schemas.py), so the revolve below always fell through to its generic cylinder fallback
 * regardless of the arc's own radius. Recognizing this specific, extremely common
 * construction and asking the kernel for its native sphere primitive instead is far more
 * useful than a fixed-size cylinder no matter what was actually sketched. A non-360 revolve
 * of a semicircle (a dome/bowl) or a non-semicircular arc still isn't a real profile the
 * kernel understands - true arbitrary arc-profile revolution needs actual geometry support
 * added to cad-server, not just this heuristic. */
function sphereRadiusFromSemicircleRevolve(
  entity: SketchEntity | undefined,
  revolveAngleDegrees: number
): number | null {
  if (!entity || entity.type !== 'arc') return null
  if (Math.abs(revolveAngleDegrees - 360) > 1) return null

  const { startAngle, endAngle, radius } = entity.data
  if (typeof radius !== 'number' || typeof startAngle !== 'number' || typeof endAngle !== 'number') return null

  let span = Math.abs(endAngle - startAngle) % (Math.PI * 2)
  if (span > Math.PI) span = Math.PI * 2 - span
  const isSemicircle = Math.abs(span - Math.PI) < (Math.PI / 180) * 3 // within 3 degrees

  return isSemicircle ? radius : null
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

function shapeResultToPartFields(
  result: CadShapeResult
): Pick<Part, 'mesh' | 'edges' | 'faces' | 'vertices' | 'shapeId' | 'massProperties'> {
  return {
    mesh: {
      vertices: result.mesh.positions,
      normals: result.mesh.normals,
      indices: result.mesh.indices,
      faceIndexByTriangle: result.mesh.faceIndexByTriangle,
    },
    edges: result.edges.map(e => ({ edgeId: e.edgeId, points: e.points })),
    faces: result.faces.map(f => ({ faceId: f.faceId, centroid: f.centroid, normal: f.normal })),
    vertices: result.vertices.map(v => ({ vertexId: v.vertexId, point: v.point })),
    shapeId: result.shapeId,
    massProperties: result.massProperties,
  }
}

/** Picked sub-elements arrive as `<partId>-<kind>-<N>` (FreeCAD's sub-element-style
 * naming, scoped to a part), where N is the server-side index into that kind's array
 * (shape.Edges / shape.Faces / shape.Vertexes). Returns the indices for `partId`; ids
 * for other parts are ignored. */
function subShapeIndicesFromIds(ids: string[], partId: string, kind: 'edge' | 'face' | 'vertex'): number[] {
  const pattern = new RegExp(`^(.*)-${kind}-(\\d+)$`)
  const indices: number[] = []
  for (const id of ids) {
    const match = pattern.exec(id)
    if (match && match[1] === partId) indices.push(parseInt(match[2], 10))
  }
  return indices
}

/** Fillet/chamfer's convention: an empty result means "all edges" to the modeling
 * engine (the chat/AI path, which has no edge ids to give). */
function edgeIndicesFromIds(edgeIds: string[], partId: string): number[] {
  return subShapeIndicesFromIds(edgeIds, partId, 'edge')
}

/** Shell's convention differs from fillet/chamfer's: an empty faceIndices list is never
 * shorthand for "all faces" — but unlike what an earlier version of this comment assumed,
 * it's not a valid "fully enclosed shell" either. Confirmed against a real FreeCAD 1.1.3
 * build: cad-server's /shell rejects an empty list outright (OCC's
 * BRepOffsetAPI_MakeThickSolid has no zero-opening mode), so at least one face must
 * always be picked. */
function faceIndicesFromIds(faceIds: string[], partId: string): number[] {
  return subShapeIndicesFromIds(faceIds, partId, 'face')
}

/** LinearPatternDialog's direction reference resolves to a world-space unit vector: a
 * fixed world axis ('x-axis'|'y-axis'|'z-axis'), a real picked edge (`<partId>-edge-<N>`,
 * direction = that edge polyline's own tangent, last point minus first), or a real picked
 * planar face (`<partId>-face-<N>`, direction = that face's own normal — the standard CAD
 * convention of using a flat face as a direction reference). Anything else falls back to
 * `fallback`. */
function resolvePatternDirectionVector(
  directionId: string | null | undefined,
  flip: boolean | undefined,
  currentBody: Part | null,
  fallback: [number, number, number] = [1, 0, 0]
): [number, number, number] {
  let vector: [number, number, number] = fallback
  if (directionId === 'x-axis') vector = [1, 0, 0]
  else if (directionId === 'y-axis') vector = [0, 1, 0]
  else if (directionId === 'z-axis') vector = [0, 0, 1]
  else if (currentBody) {
    const edgeIndex = subShapeIndicesFromIds([directionId || ''], currentBody.id, 'edge')[0]
    const edge = edgeIndex !== undefined ? currentBody.edges?.[edgeIndex] : undefined
    if (edge && edge.points.length >= 6) {
      const n = edge.points.length
      const dx = edge.points[n - 3] - edge.points[0]
      const dy = edge.points[n - 2] - edge.points[1]
      const dz = edge.points[n - 1] - edge.points[2]
      const len = Math.hypot(dx, dy, dz)
      if (len > 1e-9) vector = [dx / len, dy / len, dz / len]
    } else {
      const faceIndex = subShapeIndicesFromIds([directionId || ''], currentBody.id, 'face')[0]
      const face = faceIndex !== undefined ? currentBody.faces?.[faceIndex] : undefined
      if (face) vector = face.normal as [number, number, number]
    }
  }
  return flip ? [-vector[0], -vector[1], -vector[2]] : vector
}

/** CircularPatternDialog's axis reference resolves to a (point, direction) pair. A fixed
 * world axis rotates around the body's own center of mass. A real picked planar face
 * (`<partId>-face-<N>`) rotates around that face's own centroid using its normal as the
 * rotation axis — the natural pick for something like a cylindrical boss's flat end cap. */
function resolvePatternAxis(
  axisId: string | null | undefined,
  currentBody: Part | null
): { point: [number, number, number]; direction: [number, number, number] } {
  const centerOfMass = (currentBody?.massProperties?.centerOfMass as [number, number, number] | undefined) ?? [0, 0, 0]
  if (currentBody) {
    const faceIndex = subShapeIndicesFromIds([axisId || ''], currentBody.id, 'face')[0]
    const face = faceIndex !== undefined ? currentBody.faces?.[faceIndex] : undefined
    if (face) {
      return { point: face.centroid as [number, number, number], direction: face.normal as [number, number, number] }
    }
  }
  let direction: [number, number, number] = [0, 0, 1]
  if (axisId === 'x-axis') direction = [1, 0, 0]
  else if (axisId === 'y-axis') direction = [0, 1, 0]
  else if (axisId === 'z-axis') direction = [0, 0, 1]
  return { point: centerOfMass, direction }
}

/** MirrorFeatureDialog's plane ids are either a fixed world reference plane through the
 * origin (matching createSketch's exact 'top'/'front'/'right' convention) or a picked
 * face on the current body (`<partId>-face-<N>`) — for the latter, use the face's real
 * Phase-0B centroid/normal rather than a guess, now that real per-face data exists. */
function resolveMirrorPlane(
  planeId: string | null | undefined,
  currentBody: Part | null
): { origin: [number, number, number]; normal: [number, number, number] } {
  if (currentBody) {
    const faceIndices = faceIndicesFromIds([planeId || ''], currentBody.id)
    const face = faceIndices.length > 0 ? currentBody.faces?.[faceIndices[0]] : undefined
    if (face) {
      return {
        origin: [face.centroid[0], face.centroid[1], face.centroid[2]],
        normal: [face.normal[0], face.normal[1], face.normal[2]],
      }
    }
  }
  switch (planeId) {
    case 'front-plane':
      return { origin: [0, 0, 0], normal: [0, 1, 0] }
    case 'right-plane':
      return { origin: [0, 0, 0], normal: [1, 0, 0] }
    default: // 'top-plane' and any unrecognized id
      return { origin: [0, 0, 0], normal: [0, 0, 1] }
  }
}

// ============================================================================
// Sketch constraint solving helpers
// ============================================================================

interface Point2 { x: number; y: number; z?: number }

function dist2(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Perpendicular foot of `point` onto the infinite line through `a`/`b`, and the
 * distance to it — used by the 'tangent' (line-circle) and 'symmetric' constraints. */
function projectPointOntoLine(point: Point2, a: Point2, b: Point2): { foot: Point2; distance: number } {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq < 1e-12) return { foot: { x: a.x, y: a.y }, distance: dist2(point, a) }
  const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq
  const foot = { x: a.x + t * dx, y: a.y + t * dy }
  return { foot, distance: dist2(point, foot) }
}

/** Mirrors `point` across the infinite line through `a`/`b`. */
function reflectPointAcrossLine(point: Point2, a: Point2, b: Point2): Point2 {
  const { foot } = projectPointOntoLine(point, a, b)
  return { x: 2 * foot.x - point.x, y: 2 * foot.y - point.y, z: point.z }
}

/** A 'fixed' constraint pins an entity in place. Every 2-entity constraint case in
 * solveSketch used to always adjust "entity2" unconditionally; this picks whichever
 * side isn't fixed instead (falling back to entity1 if entity2 is the fixed one), or
 * null if both are fixed (or either entity is missing) and there's nothing safe to
 * adjust — the constraint is simply left unsatisfied for this pass rather than
 * fighting the fixed entity. */
function pickAdjustable(
  entity1: SketchEntity | undefined,
  entity2: SketchEntity | undefined,
  fixedIds: Set<string>
): { reference: SketchEntity; adjustable: SketchEntity } | null {
  if (!entity1 || !entity2) return null
  if (!fixedIds.has(entity2.id)) return { reference: entity1, adjustable: entity2 }
  if (!fixedIds.has(entity1.id)) return { reference: entity2, adjustable: entity1 }
  return null
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
  bodyName: string,
  bodyId: string
): Promise<Part> {
  const fields = shapeResultToPartFields(newResult)

  if (operation === 'new' || !currentBody) {
    // Deterministic id (from the creating feature) so picked edge ids like
    // `<partId>-edge-3` survive the next regenerate instead of silently unmatching.
    return { id: bodyId, name: bodyName, color: '#6b7280', ...fields }
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
        drawings: [],
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
      const serializableDoc = serializeDocument(document)
      
      // Prefer the loaded project; fall back to the URL. Both editor routes count -
      // matching only /editor/ silently sent production (/project/<id>/…) saves to localStorage.
      const projectStore = await import('./projectStore').then(m => m.useProjectStore.getState())
      const urlMatch = window.location.pathname.match(/\/(?:editor|project)\/([^/]+)/)
      const projectId = projectStore.currentProject?.id ?? (urlMatch ? urlMatch[1] : null)
      
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
      const deserialized = deserializeDocument(data)
      const normalizedData = {
        ...deserialized,
        partStudios: deserialized.partStudios.map(ps => ({
          ...ps,
          features: ps.features.map(normalizeFeature),
        })),
      }
      const partStudios = normalizedData.partStudios
      
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
    
    const newFeature: Feature = normalizeFeature({
      ...feature,
      id: generateId()
    })
    
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
  
  submitFeature: async (partStudioId, feature, dialogData) => {
    if (dialogData?.isEditing && dialogData.featureId) {
      const featureId = dialogData.featureId
      await get().updateFeature(partStudioId, featureId, feature.parameters)
      const studio = get().document?.partStudios.find(ps => ps.id === partStudioId)
      return studio?.features.find(f => f.id === featureId) ?? null
    }
    return get().addFeature(partStudioId, feature)
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
    // Generated up front (not inside set()'s updater) so the caller can act on the same
    // id right away — e.g. SketchCanvas wiring a just-drawn line's length dimension
    // input to the entity it actually measures, rather than discarding that link.
    const id = generateId()
    set(state => {
      if (!state.document) return state

      const partStudios = state.document.partStudios.map(ps => {
        const sketch = ps.sketches.get(sketchId)
        if (!sketch) return ps

        const newEntity: SketchEntity = { ...entity, id }
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
    return id
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

        // A 'fixed' constraint pins that entity so every other case below adjusts the
        // other side of a pair instead (see pickAdjustable).
        const fixedIds = new Set(
          constraints.filter(c => c.type === 'fixed').flatMap(c => c.entityIds)
        )

        // Each pass only propagates one constraint's effect into the entities it touches
        // directly; a chain (e.g. A equal B, B parallel C) needs several passes before it
        // settles. Repeating the full pass is a simple Gauss-Seidel-style relaxation —
        // not a real simultaneous DOF solve, but it converges for the kind of small,
        // non-conflicting constraint sets this sketcher's UI can actually build, and a
        // genuinely over-constrained sketch just stops changing (still flagged
        // 'over-constrained' by updateEntityConstraintStatus's DOF heuristic).
        const MAX_ITERATIONS = 10
        for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        constraints.forEach(constraint => {
          try {
            switch (constraint.type) {
              case 'horizontal': {
                // Make line horizontal
                const entityId = constraint.entityIds[0]
                const entity = entities.find(e => e.id === entityId)
                if (fixedIds.has(entityId)) break
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
                if (fixedIds.has(entityId)) break
                if (entity?.type === 'line' && entity.data.start && entity.data.end) {
                  const avgX = (entity.data.start.x + entity.data.end.x) / 2
                  entity.data.start = { ...entity.data.start, x: avgX }
                  entity.data.end = { ...entity.data.end, x: avgX }
                }
                break
              }

              case 'equal': {
                // Make two lines' lengths (or two circles'/arcs' radii) equal by
                // snapping the adjustable side to the reference side's value exactly —
                // matches concentric/coincident's "adjustable adopts reference" convention
                // below, rather than averaging (averaging both sides drifts under any
                // second constraint touching either entity and never settles).
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  const picked = pickAdjustable(entity1, entity2, fixedIds)
                  if (!picked) break
                  const { reference, adjustable } = picked

                  if (reference.type === 'line' && adjustable.type === 'line') {
                    const refLen = dist2(reference.data.start, reference.data.end)
                    const dx = adjustable.data.end.x - adjustable.data.start.x
                    const dy = adjustable.data.end.y - adjustable.data.start.y
                    const curLen = Math.hypot(dx, dy)
                    if (curLen > 1e-9) {
                      const scale = refLen / curLen
                      adjustable.data.end = {
                        x: adjustable.data.start.x + dx * scale,
                        y: adjustable.data.start.y + dy * scale,
                        z: adjustable.data.start.z || 0
                      }
                    }
                  } else if (
                    (reference.type === 'circle' || reference.type === 'arc') &&
                    (adjustable.type === 'circle' || adjustable.type === 'arc')
                  ) {
                    adjustable.data.radius = reference.data.radius
                  }
                }
                break
              }

              case 'parallel': {
                // Make two lines parallel
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  const picked = pickAdjustable(entity1, entity2, fixedIds)
                  if (!picked) break
                  const { reference, adjustable } = picked

                  if (reference.type === 'line' && adjustable.type === 'line') {
                    const dx1 = reference.data.end.x - reference.data.start.x
                    const dy1 = reference.data.end.y - reference.data.start.y
                    const len1 = Math.hypot(dx1, dy1)

                    const dx2 = adjustable.data.end.x - adjustable.data.start.x
                    const dy2 = adjustable.data.end.y - adjustable.data.start.y
                    const len2 = Math.hypot(dx2, dy2)

                    if (len1 > 0 && len2 > 0) {
                      const unitX = dx1 / len1
                      const unitY = dy1 / len1

                      adjustable.data.end = {
                        x: adjustable.data.start.x + unitX * len2,
                        y: adjustable.data.start.y + unitY * len2,
                        z: adjustable.data.start.z || 0
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
                  const picked = pickAdjustable(entity1, entity2, fixedIds)
                  if (!picked) break
                  const { reference, adjustable } = picked

                  if (reference.type === 'line' && adjustable.type === 'line') {
                    const dx1 = reference.data.end.x - reference.data.start.x
                    const dy1 = reference.data.end.y - reference.data.start.y
                    const len1 = Math.hypot(dx1, dy1)

                    const dx2 = adjustable.data.end.x - adjustable.data.start.x
                    const dy2 = adjustable.data.end.y - adjustable.data.start.y
                    const len2 = Math.hypot(dx2, dy2)

                    if (len1 > 0 && len2 > 0) {
                      // Rotate the reference line's direction by 90°
                      const perpX = -dy1 / len1
                      const perpY = dx1 / len1

                      adjustable.data.end = {
                        x: adjustable.data.start.x + perpX * len2,
                        y: adjustable.data.start.y + perpY * len2,
                        z: adjustable.data.start.z || 0
                      }
                    }
                  }
                }
                break
              }

              case 'concentric': {
                // Make two circles/arcs share the same center
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  const picked = pickAdjustable(entity1, entity2, fixedIds)
                  if (!picked) break
                  const { reference, adjustable } = picked

                  if ((reference.type === 'circle' || reference.type === 'arc') &&
                      (adjustable.type === 'circle' || adjustable.type === 'arc')) {
                    adjustable.data.center = { ...reference.data.center }
                  }
                }
                break
              }

              case 'coincident': {
                // Make two points coincide
                if (constraint.entityIds.length >= 2) {
                  const entity1 = entities.find(e => e.id === constraint.entityIds[0])
                  const entity2 = entities.find(e => e.id === constraint.entityIds[1])
                  const picked = pickAdjustable(entity1, entity2, fixedIds)
                  if (!picked) break
                  const { reference, adjustable } = picked

                  if (reference.type === 'point' && adjustable.type === 'point') {
                    adjustable.data = { ...reference.data }
                  }
                }
                break
              }

              case 'tangent': {
                // Line tangent to a circle/arc (adjust the circle's radius to match its
                // center's distance to the line), or two circles/arcs externally
                // tangent (adjust one radius so distance(centers) == r1 + r2).
                if (constraint.entityIds.length < 2) break
                const e1 = entities.find(e => e.id === constraint.entityIds[0])
                const e2 = entities.find(e => e.id === constraint.entityIds[1])
                if (!e1 || !e2) break
                const isCircular = (e: SketchEntity) => e.type === 'circle' || e.type === 'arc'
                const line = e1.type === 'line' ? e1 : e2.type === 'line' ? e2 : undefined

                if (line) {
                  const circle = isCircular(e1) ? e1 : isCircular(e2) ? e2 : undefined
                  if (!circle || fixedIds.has(circle.id)) break
                  const { distance } = projectPointOntoLine(circle.data.center, line.data.start, line.data.end)
                  circle.data.radius = distance
                } else if (isCircular(e1) && isCircular(e2)) {
                  const picked = pickAdjustable(e1, e2, fixedIds)
                  if (!picked) break
                  const { reference, adjustable } = picked
                  const centerDistance = dist2(reference.data.center, adjustable.data.center)
                  const newRadius = centerDistance - reference.data.radius
                  if (newRadius > 1e-6) adjustable.data.radius = newRadius
                }
                break
              }

              case 'midpoint': {
                // A point sits at the midpoint of a line — always solved by moving the
                // point (never the line; "point at midpoint" is about placing the
                // point, not deforming the line it's referencing).
                if (constraint.entityIds.length < 2) break
                const e1 = entities.find(e => e.id === constraint.entityIds[0])
                const e2 = entities.find(e => e.id === constraint.entityIds[1])
                const line = e1?.type === 'line' ? e1 : e2?.type === 'line' ? e2 : undefined
                const point = e1?.type === 'point' ? e1 : e2?.type === 'point' ? e2 : undefined
                if (!line || !point || fixedIds.has(point.id)) break
                point.data = {
                  x: (line.data.start.x + line.data.end.x) / 2,
                  y: (line.data.start.y + line.data.end.y) / 2,
                  z: line.data.start.z || 0,
                }
                break
              }

              case 'symmetric': {
                // Two entities mirrored about a third line (constraint.referenceId) —
                // reflects whichever side is adjustable to the other's mirror image.
                if (constraint.entityIds.length < 2 || !constraint.referenceId) break
                const mirrorLine = entities.find(e => e.id === constraint.referenceId)
                if (mirrorLine?.type !== 'line') break
                const e1 = entities.find(e => e.id === constraint.entityIds[0])
                const e2 = entities.find(e => e.id === constraint.entityIds[1])
                const picked = pickAdjustable(e1, e2, fixedIds)
                if (!picked) break
                const { reference, adjustable } = picked
                const { start, end } = mirrorLine.data

                if (reference.type === 'point' && adjustable.type === 'point') {
                  adjustable.data = reflectPointAcrossLine(reference.data as Point2, start, end)
                } else if (reference.type === 'line' && adjustable.type === 'line') {
                  adjustable.data = {
                    ...adjustable.data,
                    start: reflectPointAcrossLine(reference.data.start, start, end),
                    end: reflectPointAcrossLine(reference.data.end, start, end),
                  }
                } else if (
                  (reference.type === 'circle' || reference.type === 'arc') &&
                  adjustable.type === reference.type
                ) {
                  adjustable.data = {
                    ...adjustable.data,
                    center: reflectPointAcrossLine(reference.data.center, start, end),
                    radius: reference.data.radius,
                  }
                }
                break
              }

              case 'fixed':
                // No geometry to apply — fixedIds (computed above) already keeps every
                // other case in this switch from moving this entity.
                break
            }
          } catch (e) {
            console.warn('Constraint solving error:', e)
          }
        })
        }
        
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
    const featureErrors: Record<string, string> = {}

    for (const feature of partStudio.features) {
      if (feature.suppressed) continue

      // Surface failures on the feature itself (FeatureTree renders feature.error)
      // instead of only logging - a silent no-op is worse than a visible error.
      const recordError = (message: string, error?: unknown) => {
        const detail = error instanceof Error ? error.message : error ? String(error) : ''
        featureErrors[feature.id] = detail ? `${message}: ${detail}` : message
        console.error(message, error ?? '')
      }

      switch (feature.type) {
        case 'sketch':
          // Sketches don't create geometry directly
          break
          
        case 'import': {
          // Imported parts are source data, not regenerable from features. Their persisted
          // raw mesh is re-solidified here so, like every other body, they have a live
          // shapeId after a reload or an engine restart.
          const partId = feature.parameters.partId
          const existingPart = partStudio.parts.find(p => p.id === partId)
          if (!existingPart) break
          let part = existingPart
          if (!part.shapeId && part.mesh) {
            try {
              const result = await cadSolverClient.importMesh({ positions: part.mesh.vertices, indices: part.mesh.indices })
              part = { ...part, ...shapeResultToPartFields(result) }
            } catch (error) {
              recordError('Imported mesh could not be re-solidified', error)
            }
          }
          parts.push(part)
          currentBody = part
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
              currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`, `body-${feature.id}-${entity.id}`))
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
              currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`, `body-${feature.id}`))
            } catch (error) {
              recordError('Extrude failed', error)
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
                // 'arc' is included here (not just in the explicit-profileId lookup above)
                // so a semicircle sketched without an accompanying profileId can still be
                // picked up by sphereRadiusFromSemicircleRevolve below instead of silently
                // falling back to a generic cylinder.
                : sketch.entities.find(e => e.type === 'rectangle' || e.type === 'circle' || e.type === 'polygon' || e.type === 'arc'))
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
            // No sketch profile the kernel understands (see toCadProfile) - fall back to
            // a native primitive. Prefer an explicit primitiveType (set by cadExecutor's
            // sphere/cone shortcuts, which never have a sketch at all) over guessing, then
            // check for the semicircle-revolve-360 = sphere pattern, and only default to a
            // generic cylinder if neither applies.
            const sphereRadius = sphereRadiusFromSemicircleRevolve(entity, revolveParams.angle)
            try {
              if (featureParams.primitiveType === 'sphere') {
                result = await cadSolverClient.makePrimitive({
                  type: 'sphere',
                  params: { radius: featureParams.radius || 15 }
                })
              } else if (featureParams.primitiveType === 'cone') {
                result = await cadSolverClient.makePrimitive({
                  type: 'cone',
                  params: { radius1: featureParams.radius || 15, radius2: featureParams.radius2 || 0, height: featureParams.height || 30 }
                })
              } else if (sphereRadius != null) {
                result = await cadSolverClient.makePrimitive({
                  type: 'sphere',
                  params: { radius: sphereRadius }
                })
              } else {
                result = await cadSolverClient.makePrimitive({
                  type: 'cylinder',
                  params: { radius: featureParams.radius || 15, height: featureParams.height || 30 }
                })
              }
            } catch (error) {
              recordError('Revolve failed', error)
              break
            }
          }
          currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`, `body-${feature.id}`))
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
              recordError('Sweep failed', error)
              break
            }
          }
          currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`, `body-${feature.id}`))
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
              recordError('Loft failed', error)
              break
            }
          }
          currentBody = applyBody(parts, currentBody, await combineIntoBody(currentBody, operation, result, `Part from ${feature.name}`, `body-${feature.id}`))
          break
        }

        case 'fillet': {
          if (!currentBody?.shapeId) {
            recordError('Fillet skipped: the current body has no modeling-engine shape')
            break
          }
          // Picked ids (`<partId>-edge-N`) map to real server indices; an empty list means
          // all edges, which is what the chat/AI path sends since it has no ids to give.
          const edgeIndices = edgeIndicesFromIds(feature.parameters.edges || [], currentBody.id)
          const radius = feature.parameters.radius || 5
          try {
            const result = await cadSolverClient.fillet({ shapeId: currentBody.shapeId, edgeIndices, radius })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            recordError('Fillet failed', error)
          }
          break
        }

        case 'chamfer': {
          if (!currentBody?.shapeId) {
            recordError('Chamfer skipped: the current body has no modeling-engine shape')
            break
          }
          const edgeIndices = edgeIndicesFromIds(feature.parameters.edges || [], currentBody.id)
          // ChamferDialog sends distance1 (plus distance2/angle); the chat path sends distance.
          const distance = feature.parameters.distance1 ?? feature.parameters.distance ?? 2
          try {
            const result = await cadSolverClient.chamfer({ shapeId: currentBody.shapeId, edgeIndices, distance })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            recordError('Chamfer failed', error)
          }
          break
        }

        // Patterns/mirror/shell operate on the whole current body's shapeId (like
        // fillet/chamfer above), not on an individual feature or face within it —
        // cad-server has no feature-history graph to pattern a sub-feature against.
        // LinearPatternDialog/CircularPatternDialog/MirrorFeatureDialog's richer
        // per-feature modes, skip-instances, and centered/reapply options aren't backed
        // by a real operation yet and are ignored here; direction/axis/plane references
        // ARE real (see resolvePatternDirectionVector/resolvePatternAxis/resolveMirrorPlane).
        case 'linearPattern': {
          if (!currentBody?.shapeId) {
            recordError('Linear pattern skipped: the current body has no modeling-engine shape')
            break
          }
          const p = feature.parameters
          const direction1 = resolvePatternDirectionVector(p.direction1, p.flip1, currentBody)
          const count1 = Math.max(1, Math.round(p.count1 ?? 2))
          const spacing1 = p.spacing1 ?? 20
          const useDirection2 = !!p.useDirection2 && (p.count2 ?? 0) > 1
          try {
            const result = await cadSolverClient.linearPattern({
              shapeId: currentBody.shapeId,
              direction1,
              count1,
              spacing1,
              direction2: useDirection2 ? resolvePatternDirectionVector(p.direction2, p.flip2, currentBody, [0, 1, 0]) : undefined,
              count2: useDirection2 ? Math.max(1, Math.round(p.count2)) : undefined,
              spacing2: useDirection2 ? (p.spacing2 ?? 20) : undefined,
            })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            recordError('Linear pattern failed', error)
          }
          break
        }

        case 'circularPattern': {
          if (!currentBody?.shapeId) {
            recordError('Circular pattern skipped: the current body has no modeling-engine shape')
            break
          }
          const p = feature.parameters
          const { point: axisPoint, direction: axisDirection } = resolvePatternAxis(p.axis, currentBody)
          const count = Math.max(1, Math.round(p.instanceCount ?? 6))
          const angle = p.fullCircle === false ? (p.totalAngle ?? 360) : 360
          try {
            const result = await cadSolverClient.circularPattern({
              shapeId: currentBody.shapeId, axisPoint, axisDirection, count, angle,
            })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            recordError('Circular pattern failed', error)
          }
          break
        }

        case 'mirror': {
          if (!currentBody?.shapeId) {
            recordError('Mirror skipped: the current body has no modeling-engine shape')
            break
          }
          const p = feature.parameters
          const plane = resolveMirrorPlane(p.planeId, currentBody)
          // 'new'/'remove'/'intersect' result operations aren't wired to a real op yet
          // (cad-server's /mirror only ever fuses onto or replaces the body it's given);
          // any operation other than 'add' still runs as a merge, same as 'add' would.
          const merge = p.operation !== 'new'
          try {
            const result = await cadSolverClient.mirror({
              shapeId: currentBody.shapeId, planeOrigin: plane.origin, planeNormal: plane.normal, merge,
            })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            recordError('Mirror failed', error)
          }
          break
        }

        case 'shell': {
          if (!currentBody?.shapeId) {
            recordError('Shell skipped: the current body has no modeling-engine shape')
            break
          }
          const p = feature.parameters
          const faceIndices = faceIndicesFromIds(p.facesToRemove || [], currentBody.id)
          const thickness = p.thickness || 2
          try {
            const result = await cadSolverClient.shell({ shapeId: currentBody.shapeId, faceIndices, thickness })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            recordError('Shell failed', error)
          }
          break
        }

        // Push/pull a single picked face. The stored faceId is a positional index into
        // the *current* shape's Faces list — an earlier feature's edit can silently
        // change what that index points to (the same topological-naming fragility
        // fillet/chamfer's edgeIndices already has, just more visible here since this
        // is the kind of edit users repeat interactively). If the index no longer
        // exists, cad-server's own range check rejects it and that surfaces here as a
        // normal feature.error, same as any other failed op — not something silently
        // worked around.
        case 'directEdit': {
          if (!currentBody?.shapeId) {
            recordError('Direct edit skipped: the current body has no modeling-engine shape')
            break
          }
          const p = feature.parameters
          const faceIndices = subShapeIndicesFromIds(p.faceId ? [p.faceId] : [], currentBody.id, 'face')
          if (faceIndices.length === 0) {
            recordError('Direct edit skipped: no face selected')
            break
          }
          const distance = p.distance ?? 0
          try {
            const result = await cadSolverClient.directEdit({ shapeId: currentBody.shapeId, faceIndex: faceIndices[0], distance })
            currentBody = applyBody(parts, currentBody, { ...currentBody, ...shapeResultToPartFields(result) })
          } catch (error) {
            recordError('Direct edit failed', error)
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
        ps.id === partStudioId
          ? {
              ...ps,
              parts,
              features: ps.features.map(f =>
                featureErrors[f.id] === f.error ? f : { ...f, error: featureErrors[f.id] }
              ),
            }
          : ps
      )
      
      return {
        document: { ...state.document, partStudios }
      }
    })
  },

  createAssembly: (name) => {
    const id = generateId()
    set(state => {
      if (!state.document) return state
      return {
        document: { ...state.document, assemblies: [...state.document.assemblies, { id, name, instances: [], mates: [] }] },
        isDirty: true,
      }
    })
    return id
  },

  deleteAssembly: (assemblyId) => {
    set(state => {
      if (!state.document) return state
      return {
        document: { ...state.document, assemblies: state.document.assemblies.filter(a => a.id !== assemblyId) },
        isDirty: true,
      }
    })
  },

  addAssemblyInstance: (assemblyId, partStudioId, partId) => {
    const { document } = get()
    const partStudio = document?.partStudios.find(ps => ps.id === partStudioId)
    const part = partStudio?.parts.find(p => p.id === partId)
    if (!part) return null

    const id = generateId()
    set(state => {
      if (!state.document) return state
      const assemblies = state.document.assemblies.map(a =>
        a.id === assemblyId
          ? { ...a, instances: [...a.instances, { id, name: part.name, partId, transform: identityTransform(), visible: true }] }
          : a
      )
      return { document: { ...state.document, assemblies }, isDirty: true }
    })
    return id
  },

  deleteAssemblyInstance: (assemblyId, instanceId) => {
    set(state => {
      if (!state.document) return state
      const assemblies = state.document.assemblies.map(a =>
        a.id === assemblyId
          ? {
              ...a,
              instances: a.instances.filter(i => i.id !== instanceId),
              // A mate referencing a deleted instance can't be resolved any more.
              mates: a.mates.filter(m => m.movingInstanceId !== instanceId && m.targetInstanceId !== instanceId),
            }
          : a
      )
      return { document: { ...state.document, assemblies }, isDirty: true }
    })
  },

  updateInstanceTransform: (assemblyId, instanceId, transform) => {
    set(state => {
      if (!state.document) return state
      const assemblies = state.document.assemblies.map(a =>
        a.id === assemblyId
          ? { ...a, instances: a.instances.map(i => (i.id === instanceId ? { ...i, transform } : i)) }
          : a
      )
      return { document: { ...state.document, assemblies }, isDirty: true }
    })
  },

  addMate: (assemblyId, mateInput) => {
    const { document } = get()
    const assembly = document?.assemblies.find(a => a.id === assemblyId)
    const movingInstance = assembly?.instances.find(i => i.id === mateInput.movingInstanceId)
    const targetInstance = assembly?.instances.find(i => i.id === mateInput.targetInstanceId)
    if (!assembly || !movingInstance || !targetInstance) return

    // Faces live on the Part each instance references, not the instance itself — find
    // both parts across every part studio (an assembly can combine bodies from any of them).
    const findPart = (partId: string) => {
      for (const ps of document!.partStudios) {
        const part = ps.parts.find(p => p.id === partId)
        if (part) return part
      }
      return undefined
    }
    const movingPart = findPart(movingInstance.partId)
    const targetPart = findPart(targetInstance.partId)
    const movingFaceIndex = subShapeIndicesFromIds([mateInput.movingFaceId], movingInstance.partId, 'face')[0]
    const targetFaceIndex = subShapeIndicesFromIds([mateInput.targetFaceId], targetInstance.partId, 'face')[0]
    const movingFace = movingFaceIndex !== undefined ? movingPart?.faces?.[movingFaceIndex] : undefined
    const targetFace = targetFaceIndex !== undefined ? targetPart?.faces?.[targetFaceIndex] : undefined
    if (!movingFace || !targetFace) return

    // The target face's world position/normal is its own local data carried through the
    // TARGET instance's current transform (the target instance is the fixed reference
    // for this mate — see addMate's own doc comment on movingInstanceId).
    const targetWorldCentroid = transformPoint(targetInstance.transform, targetFace.centroid as Vec3)
    const targetWorldNormal = transformDirection(targetInstance.transform, targetFace.normal as Vec3)
    const requiredWorldNormal: Vec3 = [-targetWorldNormal[0], -targetWorldNormal[1], -targetWorldNormal[2]]
    const requiredWorldCentroid: Vec3 = [
      targetWorldCentroid[0] + targetWorldNormal[0] * mateInput.offset,
      targetWorldCentroid[1] + targetWorldNormal[1] * mateInput.offset,
      targetWorldCentroid[2] + targetWorldNormal[2] * mateInput.offset,
    ]

    const newTransform = solveFaceMateTransform(
      movingFace.centroid as Vec3, movingFace.normal as Vec3,
      requiredWorldCentroid, requiredWorldNormal
    )

    const id = generateId()
    set(state => {
      if (!state.document) return state
      const assemblies = state.document.assemblies.map(a =>
        a.id === assemblyId
          ? {
              ...a,
              mates: [...a.mates, { ...mateInput, id }],
              instances: a.instances.map(i => (i.id === mateInput.movingInstanceId ? { ...i, transform: newTransform } : i)),
            }
          : a
      )
      return { document: { ...state.document, assemblies }, isDirty: true }
    })
  },

  deleteMate: (assemblyId, mateId) => {
    set(state => {
      if (!state.document) return state
      const assemblies = state.document.assemblies.map(a =>
        a.id === assemblyId ? { ...a, mates: a.mates.filter(m => m.id !== mateId) } : a
      )
      return { document: { ...state.document, assemblies }, isDirty: true }
    })
  },

  createDrawingSheet: (partStudioId, name) => {
    const id = generateId()
    set(state => {
      if (!state.document) return state
      const sheet: DrawingSheet = {
        id, name, partStudioId,
        views: [{ id: generateId(), direction: 'iso', origin: { x: 0, y: 0 }, scale: 1 }],
      }
      return { document: { ...state.document, drawings: [...state.document.drawings, sheet] }, isDirty: true }
    })
    return id
  },

  deleteDrawingSheet: (sheetId) => {
    set(state => {
      if (!state.document) return state
      return { document: { ...state.document, drawings: state.document.drawings.filter(d => d.id !== sheetId) }, isDirty: true }
    })
  },

  addDrawingView: (sheetId, direction) => {
    set(state => {
      if (!state.document) return state
      const drawings = state.document.drawings.map(sheet => {
        if (sheet.id !== sheetId) return sheet
        // Simple auto-layout: place each new view to the right of the last one so views
        // never start out stacked on top of each other.
        const lastOrigin = sheet.views[sheet.views.length - 1]?.origin ?? { x: -220, y: 0 }
        const view: DrawingView = { id: generateId(), direction, origin: { x: lastOrigin.x + 220, y: lastOrigin.y }, scale: 1 }
        return { ...sheet, views: [...sheet.views, view] }
      })
      return { document: { ...state.document, drawings }, isDirty: true }
    })
  },

  updateDrawingView: (sheetId, viewId, updates) => {
    set(state => {
      if (!state.document) return state
      const drawings = state.document.drawings.map(sheet =>
        sheet.id === sheetId
          ? { ...sheet, views: sheet.views.map(v => (v.id === viewId ? { ...v, ...updates } : v)) }
          : sheet
      )
      return { document: { ...state.document, drawings }, isDirty: true }
    })
  },

  deleteDrawingView: (sheetId, viewId) => {
    set(state => {
      if (!state.document) return state
      const drawings = state.document.drawings.map(sheet =>
        sheet.id === sheetId ? { ...sheet, views: sheet.views.filter(v => v.id !== viewId) } : sheet
      )
      return { document: { ...state.document, drawings }, isDirty: true }
    })
  },

  importSTLPart: async (partStudioId, name, mesh) => {
    const partId = generateId()
    const featureId = generateId()

    // Route the mesh through the modeling engine so the imported body gets a real solid
    // (shapeId) that later booleans/fillets can use; keep the raw mesh if that fails.
    let fields: Partial<Part> = { mesh }
    let error: string | undefined
    try {
      const result = await cadSolverClient.importMesh({ positions: mesh.vertices, indices: mesh.indices })
      fields = shapeResultToPartFields(result)
    } catch (err) {
      error = `Imported as a raw mesh (no solid): ${err instanceof Error ? err.message : String(err)}`
      console.error('Mesh import via modeling engine failed:', err)
    }

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
            parameters: { filename: name, partId: partId },
            error
          }],
          parts: [...ps.parts, {
            id: partId,
            name: name,
            color: '#6b7280',
            ...fields
          }]
        }
      })

      return {
        document: { ...state.document, partStudios },
        isDirty: true
      }
    })
  },

  importStepPart: async (partStudioId, name, fileContentBase64, format) => {
    let results: CadShapeResult[] = []
    let error: string | undefined
    try {
      results = await cadSolverClient.importStep({ fileContent: fileContentBase64, format })
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
      console.error('STEP/IGES import failed:', err)
    }

    set(state => {
      if (!state.document) return state

      const partStudios = state.document.partStudios.map(ps => {
        if (ps.id !== partStudioId) return ps

        // Unlike importSTLPart, there's no raw-mesh fallback to keep on failure — a
        // STEP/IGES import either yields real B-rep solids or nothing usable at all.
        // Still record the attempt as a visible failed feature, matching how every
        // other op surfaces failure (feature.error), rather than failing silently.
        if (error || results.length === 0) {
          return {
            ...ps,
            features: [...ps.features, {
              id: generateId(),
              type: 'import',
              name: `Imported: ${name}`,
              suppressed: false,
              parameters: { filename: name },
              error: error || 'File contained no usable geometry',
            }],
          }
        }

        const newFeatures: Feature[] = []
        const newParts: Part[] = []
        results.forEach((result, i) => {
          const partId = generateId()
          // A multi-solid file becomes N independent parts (no assembly concept yet
          // to group them under) — number them so they're distinguishable in the tree.
          const partName = results.length > 1 ? `${name} (${i + 1})` : name
          newFeatures.push({
            id: generateId(),
            type: 'import',
            name: `Imported: ${partName}`,
            suppressed: false,
            parameters: { filename: name, partId },
          })
          newParts.push({
            id: partId,
            name: partName,
            color: '#6b7280',
            ...shapeResultToPartFields(result),
          })
        })

        return { ...ps, features: [...ps.features, ...newFeatures], parts: [...ps.parts, ...newParts] }
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

