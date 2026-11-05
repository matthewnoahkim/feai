/**
 * Boomilever wall-joint test simulation: a fully specified FEA workflow (material, mesh,
 * boundary conditions, loads, solved results), built from the wall_joint_NX / block_NX
 * parts in boomilever_wall_joints/.
 *
 * Geometry (mm, read from the uploaded STEP files): a 1/8" (3.175 mm) basswood plate,
 * 19.175 mm wide x 120 mm long. The plate has a 16 mm wide slot at the wall end (y = 0) that
 * is N x 4.7625 mm (N x 3/16") deep for the "NX" variant. block_NX (16 x N*4.7625 x 3.175)
 * fills that slot exactly.
 *
 * Load case: the joint + block, bonded as one basswood body, cantilevered off the wall.
 * The whole wall face (y = 0) is fixed. A 5 N tip load acts in -Z on the free end face
 * (y = 120), and self-weight acts in -Z.
 *
 * The solver handles a single isotropic material only. Basswood is orthotropic, so this
 * model uses its along-grain (L) properties, which is the direction that governs a
 * cantilever in bending. Values are from the USDA Wood Handbook (basswood, 12% MC).
 *
 * The mesh is a structured, conforming linear-tet mesh of the real joint + block solid.
 * Grid lines fall on every edge of the slot, so each part is meshed on its own footprint
 * and the two share nodes at the glue line. Each hex cell is split into 6 tets with the
 * Kuhn split, so neighboring cells' tets meet face to face.
 */

import type {
  AnalysisResultData,
  BoundaryConditionDef,
  LoadDef,
  MeshData,
  MeshElementRecord,
  MeshNodeRecord,
  WorkflowStep,
} from '../../store/workflowStore'
import type { SchematicNode, Connection } from '../../store/schematicStore'
import type { Material } from '../../store/materialLibraryStore'
import type { AnalysisResults } from '../fea-solver/types'

export const BOOMILEVER_PROJECT_NAME = 'boomilever'

export type BoomileverVariant = 1 | 2 | 3 | 4

// ---- geometry (mm) ----
export const PLATE_THICKNESS = 3.175 // 1/8"
export const PLATE_HALF_WIDTH = 9.5875
export const SLOT_HALF_WIDTH = 8
export const SLOT_DEPTH_PER_X = 4.7625 // 3/16"
export const PLATE_LENGTH = 120

// ---- load case ----
export const TIP_LOAD_N = 5
export const GRAVITY: [number, number, number] = [0, 0, -9.81]

/** Basswood (Tilia americana), along-grain, 12% moisture content. "Yield" is the
 * compressive strength parallel to grain, the first limit a bending member reaches. */
export const BOOMILEVER_MATERIAL: Omit<Material, 'id' | 'isPreset' | 'presetKey'> = {
  name: 'Basswood (along grain)',
  category: 'other',
  youngsModulus: 10.07e9,
  poissonsRatio: 0.3,
  density: 415,
  yieldStrength: 32.6e6,
  ultimateStrength: 59.9e6,
  thermalExpansion: 3.5e-6,
  color: '#E3C99A',
}

export function slotDepth(variant: BoomileverVariant): number {
  return variant * SLOT_DEPTH_PER_X
}

// ---------------------------------------------------------------------------
// Mesh
// ---------------------------------------------------------------------------

/** Evenly fills [a, b] with ceil((b - a) / target) cells, endpoints included. */
function span(a: number, b: number, target: number): number[] {
  const n = Math.max(1, Math.ceil((b - a) / target - 1e-9))
  return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n)
}

function joinSpans(...spans: number[][]): number[] {
  const out = [...spans[0]]
  for (const s of spans.slice(1)) out.push(...s.slice(1))
  return out
}

// Kuhn split of a hex into 6 tets that all share the 0-7 diagonal. Corner index = bx + 2*by + 4*bz.
const KUHN_TETS: [number, number, number, number][] = [
  [0, 1, 3, 7], [0, 1, 5, 7], [0, 2, 3, 7], [0, 2, 6, 7], [0, 4, 5, 7], [0, 4, 6, 7],
]

/** Linear tets lock in bending, so the length (Y) and thickness (Z) resolution are what
 * matter. At this density the tip deflection is within a few percent of the converged
 * value for this mesher (about 4.7 vs 5.0 mm at twice the resolution). The stored mesh
 * is about 2.5M characters of JSON, which still fits the browser-side workflow store's
 * localStorage budget. */
export const DEFAULT_MESH = { widthSize: 4, lengthSize: 1, thicknessLayers: 8 }

export interface BoomileverMeshOptions {
  /** Target element size across the width, X (mm). Bending here is about X, so this
   * direction barely affects accuracy and can stay coarse. */
  widthSize?: number
  /** Target element size along the length, Y (mm). */
  lengthSize?: number
  /** Element layers through the 3.175 mm thickness. */
  thicknessLayers?: number
}

export function buildBoomileverMesh(variant: BoomileverVariant, opts: BoomileverMeshOptions = {}): MeshData {
  const hx = opts.widthSize ?? DEFAULT_MESH.widthSize
  const hy = opts.lengthSize ?? DEFAULT_MESH.lengthSize
  const layers = opts.thicknessLayers ?? DEFAULT_MESH.thicknessLayers
  const depth = slotDepth(variant)

  const xs = joinSpans(
    span(-PLATE_HALF_WIDTH, -SLOT_HALF_WIDTH, hx),
    span(-SLOT_HALF_WIDTH, SLOT_HALF_WIDTH, hx),
    span(SLOT_HALF_WIDTH, PLATE_HALF_WIDTH, hx),
  )
  const ys = joinSpans(span(0, depth, hy), span(depth, PLATE_LENGTH, hy))
  const zs = Array.from({ length: layers + 1 }, (_, i) => (PLATE_THICKNESS * i) / layers)

  const nx = xs.length, ny = ys.length
  const nodeId = (i: number, j: number, k: number) => 1 + i + nx * (j + ny * k)

  const nodes: MeshNodeRecord[] = []
  for (let k = 0; k < zs.length; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++)
        nodes.push({ id: nodeId(i, j, k), x: xs[i], y: ys[j], z: zs[k] })

  const pos = (id: number) => nodes[id - 1]
  const elements: MeshElementRecord[] = []
  const ratios: number[] = []
  for (let k = 0; k < zs.length - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        const corner = [0, 1, 2, 3, 4, 5, 6, 7].map((c) =>
          nodeId(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1)))
        for (const t of KUHN_TETS) {
          let ids = t.map((c) => corner[c])
          // Positive orientation (right-handed), the convention gmsh and most viewers expect.
          const [p0, p1, p2, p3] = ids.map(pos)
          const a = [p1.x - p0.x, p1.y - p0.y, p1.z - p0.z]
          const b = [p2.x - p0.x, p2.y - p0.y, p2.z - p0.z]
          const c = [p3.x - p0.x, p3.y - p0.y, p3.z - p0.z]
          const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])
          if (det < 0) ids = [ids[0], ids[2], ids[1], ids[3]]
          elements.push({ id: elements.length + 1, type: 'C3D4', nodeIds: ids })
          ratios.push(edgeRatio(ids.map(pos)))
        }
      }

  return {
    nodeCount: nodes.length,
    elementCount: elements.length,
    elementType: 'C3D4',
    quality: {
      avgAspectRatio: ratios.reduce((s, r) => s + r, 0) / ratios.length,
      minAspectRatio: Math.min(...ratios),
      maxAspectRatio: Math.max(...ratios),
      warningCount: ratios.filter((r) => r > 20).length,
    },
    nodes,
    elements,
    boundingBox: {
      min: { x: -PLATE_HALF_WIDTH, y: 0, z: 0 },
      max: { x: PLATE_HALF_WIDTH, y: PLATE_LENGTH, z: PLATE_THICKNESS },
    },
  }
}

/** Longest edge / shortest edge: the simple aspect metric the mesh page displays. */
function edgeRatio(p: MeshNodeRecord[]): number {
  let lo = Infinity, hi = 0
  for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
    const d = Math.hypot(p[a].x - p[b].x, p[a].y - p[b].y, p[a].z - p[b].z)
    lo = Math.min(lo, d); hi = Math.max(hi, d)
  }
  return hi / lo
}

// ---------------------------------------------------------------------------
// Setup: boundary conditions and loads
// ---------------------------------------------------------------------------

const EPS = 0.01 // mm, slack around the selection boxes

export const BOOMILEVER_BOUNDARY_CONDITIONS: BoundaryConditionDef[] = [
  {
    id: 'bc-boomilever-wall',
    type: 'fixed',
    name: 'Wall face (y = 0) bonded to wall',
    target: {
      type: 'box',
      min: [-PLATE_HALF_WIDTH - EPS, -EPS, -EPS],
      max: [PLATE_HALF_WIDTH + EPS, EPS, PLATE_THICKNESS + EPS],
    },
    enabled: true,
  },
]

const TIP_FACE_AREA_M2 = (2 * PLATE_HALF_WIDTH * PLATE_THICKNESS) * 1e-6

export const BOOMILEVER_LOADS: LoadDef[] = [
  {
    id: 'load-boomilever-tip',
    type: 'surface_force',
    name: `Tip load ${TIP_LOAD_N} N (-Z) on free end`,
    target: {
      type: 'box',
      min: [-PLATE_HALF_WIDTH - EPS, PLATE_LENGTH - EPS, -EPS],
      max: [PLATE_HALF_WIDTH + EPS, PLATE_LENGTH + EPS, PLATE_THICKNESS + EPS],
    },
    // Uniform traction over the 19.175 x 3.175 mm end face that totals TIP_LOAD_N.
    forcePerArea: [0, 0, -TIP_LOAD_N / TIP_FACE_AREA_M2],
    enabled: true,
  },
  {
    id: 'load-boomilever-gravity',
    type: 'gravity',
    name: 'Self-weight',
    acceleration: GRAVITY,
    enabled: true,
  },
]

/** Euler-Bernoulli tip deflection (mm) for the load case above, as a sanity reference. */
export function beamTheoryTipDeflectionMm(): number {
  const E = BOOMILEVER_MATERIAL.youngsModulus / 1e6 // N/mm^2
  const I = (2 * PLATE_HALF_WIDTH * PLATE_THICKNESS ** 3) / 12 // mm^4
  return (TIP_LOAD_N * PLATE_LENGTH ** 3) / (3 * E * I)
}

// ---------------------------------------------------------------------------
// Results and the stored snapshot
// ---------------------------------------------------------------------------

/** The results page's own conversion from a normalized solver result to workflow state. */
export function toAnalysisResultData(results: AnalysisResults): AnalysisResultData {
  return {
    jobId: results.job_id,
    status: 'completed',
    displacements: { max: results.displacements.max, min: results.displacements.min },
    stress: {
      vonMises: results.stress.von_mises,
      principal: results.stress.principal ? {
        sigma1: results.stress.principal.sigma_1,
        sigma2: results.stress.principal.sigma_2,
        sigma3: results.stress.principal.sigma_3,
      } : undefined,
    },
    reactions: results.reactions ? {
      totalForce: results.reactions.total_force,
      totalMoment: results.reactions.total_moment,
    } : undefined,
    safetyFactors: results.safety_factors ? {
      min: results.safety_factors.min,
      avg: results.safety_factors.avg,
    } : undefined,
    computationTime: results.computation_time,
    // No outputFiles: the VTU download is served from the solver client's in-memory job
    // cache, which won't hold a job that was solved ahead of time.
  }
}

/** Stored at project.data.workflow. ProjectLayout loads it into the browser-side
 * workflow and schematic stores the first time the project is opened in a browser. */
export interface ProjectWorkflowSnapshot {
  version: 1
  stepStatus: Record<WorkflowStep, 'pending' | 'in-progress' | 'complete'>
  defaultMaterialId: string | null
  meshSettings: {
    globalSize: number
    minSize?: number
    maxSize?: number
    elementType: 'C3D4' | 'C3D10' | 'C3D8' | 'C3D20'
    growthRate: number
    curvatureSensitivity: number
  }
  meshData: MeshData | null
  boundaryConditions: BoundaryConditionDef[]
  loads: LoadDef[]
  analysisResults: AnalysisResultData | null
  schematic?: { nodes: SchematicNode[]; connections: Connection[] }
}

const STEPS: WorkflowStep[] = ['engineering-data', 'geometry', 'mesh', 'setup', 'results']
const STEP_NAMES: Record<WorkflowStep, string> = {
  'engineering-data': 'Engineering Data', geometry: 'Geometry', mesh: 'Mesh', setup: 'Setup', results: 'Results',
}

export function completedSchematic(now = Date.now()): { nodes: SchematicNode[]; connections: Connection[] } {
  const nodes: SchematicNode[] = STEPS.map((type, i) => ({
    id: `node-boomilever-${type}`,
    type,
    name: STEP_NAMES[type],
    x: 80 + i * 240,
    y: 160,
    status: 'complete',
    lastUpdated: now,
  }))
  const connections: Connection[] = nodes.slice(1).map((n, i) => ({
    id: `conn-boomilever-${i}`,
    sourceId: nodes[i].id,
    targetId: n.id,
  }))
  return { nodes, connections }
}

export function buildBoomileverSnapshot(input: {
  materialId: string
  meshData: MeshData
  analysisResults: AnalysisResultData
}): ProjectWorkflowSnapshot {
  return {
    version: 1,
    stepStatus: Object.fromEntries(STEPS.map((s) => [s, 'complete'])) as ProjectWorkflowSnapshot['stepStatus'],
    defaultMaterialId: input.materialId,
    meshSettings: { globalSize: DEFAULT_MESH.lengthSize, minSize: PLATE_THICKNESS / DEFAULT_MESH.thicknessLayers, maxSize: DEFAULT_MESH.widthSize, elementType: 'C3D4', growthRate: 1, curvatureSensitivity: 0.5 },
    meshData: input.meshData,
    boundaryConditions: BOOMILEVER_BOUNDARY_CONDITIONS,
    loads: BOOMILEVER_LOADS,
    analysisResults: input.analysisResults,
    schematic: completedSchematic(),
  }
}

// ---------------------------------------------------------------------------
// CAD document
// ---------------------------------------------------------------------------

export interface TriangleMesh { vertices: number[]; normals: number[]; indices: number[] }

/** Binary STL to the flat, unindexed triangle mesh the document stores for imported parts. */
export function parseBinaryStl(buf: Uint8Array): TriangleMesh {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const count = view.getUint32(80, true)
  if (84 + count * 50 !== buf.byteLength) throw new Error('Not a binary STL (size does not match triangle count)')
  const vertices: number[] = [], normals: number[] = [], indices: number[] = []
  for (let t = 0; t < count; t++) {
    const o = 84 + t * 50
    const p = [0, 1, 2].map((v) => [0, 1, 2].map((d) => view.getFloat32(o + 12 + v * 12 + d * 4, true)))
    // Recompute the facet normal rather than trusting the file's.
    const u = [0, 1, 2].map((d) => p[1][d] - p[0][d]), w = [0, 1, 2].map((d) => p[2][d] - p[0][d])
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
    const len = Math.hypot(n[0], n[1], n[2]) || 1
    for (const q of p) {
      indices.push(vertices.length / 3)
      vertices.push(q[0], q[1], q[2])
      normals.push(n[0] / len, n[1] / len, n[2] / len)
    }
  }
  return { vertices, normals, indices }
}

/** Serialized document (the shape serializeDocument produces) holding the joint and its
 * block as imported parts, the block seated in the slot, which is how the two are simulated. */
export function buildBoomileverDocument(input: {
  variant: BoomileverVariant
  wallJoint: TriangleMesh
  block: TriangleMesh
  now?: string
}): Record<string, unknown> {
  const v = input.variant
  const studioId = 'ps-boomilever'
  const parts = [
    { id: `part-wall-joint-${v}x`, name: `wall_joint_${v}X`, color: '#C9A66B', mesh: input.wallJoint, file: `wall_joint_${v}X.stl` },
    { id: `part-block-${v}x`, name: `block_${v}X`, color: '#8B6B3E', mesh: input.block, file: `block_${v}X.stl` },
  ]
  return {
    id: 'doc-boomilever',
    name: BOOMILEVER_PROJECT_NAME,
    description: `Boomilever wall joint ${v}X with block ${v}X: cantilever test simulation`,
    units: 'mm',
    partStudios: [{
      id: studioId,
      name: `Wall Joint ${v}X Assembly`,
      features: parts.map((p) => ({
        id: `feat-import-${p.id}`,
        type: 'import',
        name: `Imported: ${p.file}`,
        suppressed: false,
        parameters: { filename: p.file, partId: p.id },
      })),
      sketches: {},
      parts: parts.map((p) => ({ id: p.id, name: p.name, color: p.color, material: BOOMILEVER_MATERIAL.name, mesh: p.mesh })),
    }],
    assemblies: [],
    drawings: [],
    activeElementId: studioId,
    activeElementType: 'partStudio',
  }
}
