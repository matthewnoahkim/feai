/**
 * Boomilever wall-joint test simulation: a fully specified FEA workflow (material, mesh,
 * boundary conditions, loads, solved results), built from the wall_joint_NX / block_NX
 * parts in boomilever_wall_joints/.
 *
 * Geometry (mm, read from the uploaded STL/STEP files): a 1/8" (3.175 mm) basswood fork,
 * 19.175 mm wide x 120 mm long. The wall end (y = 0 to N x 4.7625 mm, N x 3/16", for the
 * "NX" variant) is solid across the full width. Past that, a 16 mm wide slot runs out
 * through the free end (y = 120), leaving two 1.5875 mm prongs. block_NX
 * (16 x N*4.7625 x 3.175) sits where the files place it, over the middle of the solid wall
 * end; the mesh tags those cells as the block.
 *
 * Load case (how the joint is tested): the joint is held by the bolt through the solid
 * end where the block sits. The joint + block are bonded as one basswood body. The back
 * face (z = 0) of the block's footprint is fixed, as if clamped by the bolt and washer.
 * A 5 N load pushes the prong ends (y = 120) down, -Z, orthogonal to the joint's plate,
 * so each prong bends as a cantilever off the solid end; self-weight acts down (-Z) too.
 *
 * The solver handles a single isotropic material only. Basswood is orthotropic, so this
 * model uses its along-grain (L) properties, the direction that governs prongs bending
 * along their length. Values are from the USDA Wood Handbook (basswood, 12% MC).
 *
 * The mesh is a structured, conforming linear-tet mesh of the real joint + block solid.
 * Grid lines fall on every edge of the slot, so each part is meshed on its own footprint
 * and the two share nodes at the glue line. Each hex cell is split into 6 tets with the
 * Kuhn split, mirrored in every other cell along each axis. A mirrored neighbor shares
 * the same diagonal on the face between them, so tets still meet face to face, and the
 * alternating diagonals keep the split's built-in bias from adding up: with one
 * orientation everywhere, a straight-down load on the prongs also swayed them sideways.
 * Each prong is at least two cells wide for the same reason.
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
export { toAnalysisResultData } from '../fea-solver/workflow-results'

export const BOOMILEVER_PROJECT_NAME = 'boomilever'

/** v2: mesh elements tagged by part (joint vs. block) so the results view can outline
 * each part, plus per-node fields for the color plot.
 * v3: the slot between the prongs is left open, matching the real geometry (v2 meshed it
 * as solid plate).
 * v4: tested the way the joint is loaded: block bolted flat to the wall, prongs pulled
 * along their length (v3 was a cantilever off the end face with a sideways tip load).
 * v5: the prong ends are pushed down, orthogonal to the plate (-Z), not pulled along
 * the prongs. */
export const BOOMILEVER_SEED = 'boomilever-v5'

/** When the boomilever test projects were made: their created/updated dates, the solve
 * date in their result ids, and their workflow timestamps. */
export const BOOMILEVER_CREATED_AT = new Date('2025-11-05T17:00:00.000Z')

export function boomileverProjectName(variant: BoomileverVariant): string {
  return `${BOOMILEVER_PROJECT_NAME} ${variant}X`
}

export type BoomileverVariant = 1 | 2 | 3 | 4

// ---- geometry (mm) ----
export const PLATE_THICKNESS = 3.175 // 1/8"
export const PLATE_HALF_WIDTH = 9.5875
export const SLOT_HALF_WIDTH = 8
export const SLOT_DEPTH_PER_X = 4.7625 // 3/16"
export const PLATE_LENGTH = 120
/** Width of each prong beside the slot. */
export const PRONG_WIDTH = PLATE_HALF_WIDTH - SLOT_HALF_WIDTH

// ---- load case ----
/** Total load on the prong ends, pushing them down (-Z), orthogonal to the plate. */
export const TIP_LOAD_N = 5
/** Down is -Z, the same direction as the prong load. */
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
  return Array.from({ length: n + 1 }, (_, i) => (i === n ? b : a + ((b - a) * i) / n))
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
    span(-PLATE_HALF_WIDTH, -SLOT_HALF_WIDTH, Math.min(hx, PRONG_WIDTH / 2)),
    span(-SLOT_HALF_WIDTH, SLOT_HALF_WIDTH, hx),
    span(SLOT_HALF_WIDTH, PLATE_HALF_WIDTH, Math.min(hx, PRONG_WIDTH / 2)),
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
  const elementRegion: number[] = []
  const ratios: number[] = []
  for (let k = 0; k < zs.length - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        // Past the solid wall end, the slot between the prongs is empty: no cells there.
        // Region 1 (the block) is the middle of the wall end, where block_NX sits;
        // everything else is the joint.
        const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2
        const inMiddle = Math.abs(cx) < SLOT_HALF_WIDTH
        if (inMiddle && cy > depth) continue
        const region = inMiddle ? 1 : 0
        // Mirror the split in every other cell along each axis (flip the corner bits).
        const mirror = (i & 1) | ((j & 1) << 1) | ((k & 1) << 2)
        const corner = [0, 1, 2, 3, 4, 5, 6, 7].map((c0) => {
          const c = c0 ^ mirror
          return nodeId(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))
        })
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
          elementRegion.push(region)
          ratios.push(edgeRatio(ids.map(pos)))
        }
      }

  // Grid nodes inside the open slot belong to no cell; leave them out.
  const used = new Set<number>()
  for (const e of elements) for (const id of e.nodeIds) used.add(id)
  const meshNodes = nodes.filter((n) => used.has(n.id))

  return {
    nodeCount: meshNodes.length,
    elementCount: elements.length,
    elementType: 'C3D4',
    quality: {
      avgAspectRatio: ratios.reduce((s, r) => s + r, 0) / ratios.length,
      minAspectRatio: Math.min(...ratios),
      maxAspectRatio: Math.max(...ratios),
      warningCount: ratios.filter((r) => r > 20).length,
    },
    nodes: meshNodes,
    elements,
    regions: { names: [`wall_joint_${variant}X`, `block_${variant}X`], elementRegion },
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

/** The back face (z = 0) of the block's footprint, clamped flat to the wall by the bolt. */
export function boomileverBoundaryConditions(variant: BoomileverVariant): BoundaryConditionDef[] {
  return [
    {
      id: 'bc-boomilever-bolt',
      type: 'fixed',
      name: `Back face under block_${variant}X bolted to wall`,
      target: {
        type: 'box',
        min: [-SLOT_HALF_WIDTH - EPS, -EPS, -EPS],
        max: [SLOT_HALF_WIDTH + EPS, slotDepth(variant) + EPS, EPS],
      },
      enabled: true,
    },
  ]
}

// The free end face is just the two prong ends; the slot is open there.
const TIP_FACE_AREA_M2 = (2 * PRONG_WIDTH * PLATE_THICKNESS) * 1e-6

export const BOOMILEVER_LOADS: LoadDef[] = [
  {
    id: 'load-boomilever-push',
    type: 'surface_force',
    name: `Prong ends pushed ${TIP_LOAD_N} N down (-Z, orthogonal to the joint)`,
    target: {
      type: 'box',
      min: [-PLATE_HALF_WIDTH - EPS, PLATE_LENGTH - EPS, -EPS],
      max: [PLATE_HALF_WIDTH + EPS, PLATE_LENGTH + EPS, PLATE_THICKNESS + EPS],
    },
    // Uniform traction over the two 1.5875 x 3.175 mm prong end faces, totaling TIP_LOAD_N.
    forcePerArea: [0, 0, -TIP_LOAD_N / TIP_FACE_AREA_M2],
    enabled: true,
  },
  {
    id: 'load-boomilever-gravity',
    type: 'gravity',
    name: 'Self-weight (-Z)',
    acceleration: GRAVITY,
    enabled: true,
  },
]

/** Second moment of area (mm^4) of the two prongs together, bending about X. */
export const PRONG_I_MM4 = (2 * PRONG_WIDTH * PLATE_THICKNESS ** 3) / 12

/** Euler-Bernoulli tip deflection (mm) of the prongs as a cantilever clamped at their
 * roots (y = slot depth): P L^3 / (3 E I). The real roots sit beside the clamped patch,
 * not on it, so the solid end adds some more rotation and the 3D answer runs higher. */
export function beamTheoryProngTipDeflectionMm(variant: BoomileverVariant): number {
  const E = BOOMILEVER_MATERIAL.youngsModulus / 1e6 // N/mm^2
  const L = PLATE_LENGTH - slotDepth(variant)
  return (TIP_LOAD_N * L ** 3) / (3 * E * PRONG_I_MM4)
}

/** Euler-Bernoulli bending stress (Pa) at the prong roots, M c / I. */
export function beamTheoryProngRootStressPa(variant: BoomileverVariant): number {
  const M = TIP_LOAD_N * (PLATE_LENGTH - slotDepth(variant)) // N*mm
  return ((M * PLATE_THICKNESS) / 2 / PRONG_I_MM4) * 1e6
}

/** Solid volume (mm^3): the full-width wall end plus the two prongs. */
export function boomileverVolumeMm3(variant: BoomileverVariant): number {
  const d = slotDepth(variant)
  return PLATE_THICKNESS * (2 * PLATE_HALF_WIDTH * d + 2 * PRONG_WIDTH * (PLATE_LENGTH - d))
}

// ---------------------------------------------------------------------------
// Results and the stored snapshot
// ---------------------------------------------------------------------------

/** Stored at project.data.workflow. ProjectLayout loads it into the browser-side
 * workflow and schematic stores the first time the project is opened in a browser. */
export interface ProjectWorkflowSnapshot {
  version: 1
  /** Identifies this seed; bump BOOMILEVER_SEED when the stored simulation changes so
   * browsers holding an older, untouched copy pick up the new one. */
  seed?: string
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

export function completedSchematic(now = BOOMILEVER_CREATED_AT.getTime()): { nodes: SchematicNode[]; connections: Connection[] } {
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
  variant: BoomileverVariant
  meshData: MeshData
  analysisResults: AnalysisResultData
}): ProjectWorkflowSnapshot {
  return {
    version: 1,
    seed: `${BOOMILEVER_SEED}-${input.meshData.regions?.names[0] ?? ''}`,
    stepStatus: Object.fromEntries(STEPS.map((s) => [s, 'complete'])) as ProjectWorkflowSnapshot['stepStatus'],
    defaultMaterialId: input.materialId,
    meshSettings: { globalSize: DEFAULT_MESH.lengthSize, minSize: PLATE_THICKNESS / DEFAULT_MESH.thicknessLayers, maxSize: DEFAULT_MESH.widthSize, elementType: 'C3D4', growthRate: 1, curvatureSensitivity: 0.5 },
    meshData: input.meshData,
    boundaryConditions: boomileverBoundaryConditions(input.variant),
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
    name: boomileverProjectName(v),
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
