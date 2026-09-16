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
}

export interface EdgePolyline {
  edgeId: string
  points: number[]
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

export interface CadApiErrorBody {
  detail: string
}
