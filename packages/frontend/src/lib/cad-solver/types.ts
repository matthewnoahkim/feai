/**
 * Request/response types for FEAI's modeling engine (packages/cad-server).
 * Mirrors packages/cad-server/app/schemas.py — keep the two in sync.
 */

export interface Plane {
  origin: number[]
  normal: number[]
  xAxis: number[]
}

export interface ProfileEntity {
  type: 'rectangle' | 'circle' | 'polygon'
  data: Record<string, any>
}

export interface PathEntity {
  type: 'line' | 'arc'
  data: Record<string, any>
}

export interface MeshData {
  positions: number[]
  normals: number[]
  indices: number[]
  /** One entry per triangle (indices.length / 3); value is the index into ShapeResult.faces
   * that triangle belongs to. Lets the viewport highlight/pick a whole face by its triangle range. */
  faceIndexByTriangle: number[]
}

export interface EdgePolyline {
  edgeId: string
  points: number[]
}

export interface FaceInfo {
  faceId: string
  /** A representative point on the face (world space) — for UI labeling, not a precise area centroid. */
  centroid: number[]
  /** Unit normal at `centroid` (world space). */
  normal: number[]
}

export interface VertexInfo {
  vertexId: string
  point: number[]
}

export interface MassProperties {
  volume: number
  surfaceArea: number
  mass: number
  centerOfMass: number[]
  momentOfInertia: number[]
  principalAxes: number[][]
  principalMoments: number[]
}

export interface ShapeResult {
  shapeId: string
  mesh: MeshData
  edges: EdgePolyline[]
  faces: FaceInfo[]
  vertices: VertexInfo[]
  massProperties: MassProperties
}

export interface PrimitiveRequest {
  type: 'box' | 'cylinder' | 'sphere' | 'cone'
  params: Record<string, number>
}

export interface ExtrudeParams {
  depth1: number
  flipDirection1: boolean
  useSecondDirection: boolean
  depth2: number
  useDraft: boolean
  draftAngle: number
  draftOutward: boolean
  endCondition1: string // 'blind' | 'symmetric' — kept as string to match documentStore.ts's ExtrudeParams
}

export interface ExtrudeRequest {
  profile: ProfileEntity
  plane: Plane
  params: ExtrudeParams
}

export interface RevolveParams {
  angle: number
  angle2: number
  directionType: 'full' | 'one-direction' | 'symmetric'
}

export interface RevolveRequest {
  profile: ProfileEntity
  plane: Plane
  axisPoint: number[]
  axisDirection: number[]
  params: RevolveParams
}

export interface SweepParams {
  orientation: 'follow-path' | 'fixed' | 'keep-normal'
  twistAngle: number
  endScale: number
}

export interface SweepRequest {
  profile: ProfileEntity
  profilePlane: Plane
  path: PathEntity
  pathPlane: Plane
  params: SweepParams
}

export interface LoftProfile {
  profile: ProfileEntity
  plane: Plane
}

export interface LoftParams {
  closedLoft: boolean
}

export interface LoftRequest {
  profiles: LoftProfile[]
  params: LoftParams
}

export type BooleanOp = 'union' | 'cut' | 'intersect'

export interface BooleanRequest {
  op: BooleanOp
  baseShapeId: string
  toolShapeId: string
}

export interface FilletRequest {
  shapeId: string
  edgeIndices: number[] // 0-based server edge indices; empty = all edges
  radius: number
}

export interface ChamferRequest {
  shapeId: string
  edgeIndices: number[] // empty = all edges
  distance: number
}

export interface MeshImportRequest {
  positions: number[]
  indices: number[]
  tolerance?: number
}

export interface LinearPatternRequest {
  shapeId: string
  direction1: number[]
  count1: number // total instances along direction1, including the original (>=1)
  spacing1: number
  direction2?: number[] | null
  count2?: number | null
  spacing2?: number | null
}

export interface CircularPatternRequest {
  shapeId: string
  axisPoint: number[]
  axisDirection: number[]
  count: number // total instances around the axis, including the original (>=1)
  angle?: number // total spread; default 360
}

export interface MirrorRequest {
  shapeId: string
  planeOrigin: number[]
  planeNormal: number[]
  merge?: boolean // fuse the mirrored copy onto the original rather than replacing it (default true)
}

export interface ShellRequest {
  shapeId: string
  // 0-based, into the shape's own Faces list; faces to remove (open up). Must be
  // non-empty — confirmed against a real FreeCAD 1.1.3 build that a fully enclosed
  // hollow shell (no faces removed) isn't supported. NOT shorthand for "all faces"
  // either, the way fillet/chamfer's edgeIndices is for "all edges".
  faceIndices: number[]
  thickness: number
}

export interface CadApiErrorBody {
  detail: string
}
