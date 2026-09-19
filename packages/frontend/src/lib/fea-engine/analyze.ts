/**
 * In-app linear-static finite element solver (linear tetrahedra, isotropic elasticity).
 *
 * Replaces the external fea-solver gateway, which had no compute backend behind it (its
 * /api/analyze answered 503 "Compute server URL not configured"). Same request contract
 * (lib/fea-solver/types.ts AnalysisRequest) and a result shape the existing
 * normalizeAnalysisResults already understands, so the workflow pages don't change.
 *
 * Everything is solved in SI internally: with units SI_MM the mesh, targets, and
 * displacement BC values are millimetres and get scaled to metres up front; loads
 * (N, Pa, m/s^2) and material properties are already SI. Displacements come back in
 * metres, which is what displacementApiToMmScale (x1000) expects.
 *
 * Scope, deliberately narrow and enforced with clear 400s rather than silently
 * approximated: linear tets only (fe_degree 1), small deformation, one material for the
 * whole mesh, box or MSH 2.2 meshes, point/box/sphere targets (no boundary_id — nothing
 * here produces the boundary groups it would name), axis-aligned symmetry planes.
 */

import type {
  AnalysisRequest, AnalysisResults, BoundaryTarget, MaterialProperties,
} from '../fea-solver/types'
import {
  boxMesh, decodeMeshData, nodeCount, parseMsh22, SolverInputError, tetCount, type TetMesh,
} from './mesh'
import { addElementBlock, buildPattern, matvec, solveCG } from './linear-algebra'

export { SolverInputError } from './mesh'

/** The problem was well-formed but the solve itself couldn't produce an answer (didn't
 * converge, ran out of time) — distinct from SolverInputError so callers can pick 422. */
export class SolverFailure extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SolverFailure'
  }
}

export const MATERIAL_PRESETS: MaterialProperties[] = [
  { id: 'steel_structural', name: 'Structural Steel', youngs_modulus: 200e9, poissons_ratio: 0.3, density: 7850, thermal_expansion: 1.2e-5, yield_strength: 250e6, ultimate_strength: 400e6 },
  { id: 'aluminum_6061_t6', name: 'Aluminum 6061-T6', youngs_modulus: 68.9e9, poissons_ratio: 0.33, density: 2700, thermal_expansion: 2.36e-5, yield_strength: 276e6, ultimate_strength: 310e6 },
  { id: 'titanium_ti6al4v', name: 'Titanium Ti-6Al-4V', youngs_modulus: 113.8e9, poissons_ratio: 0.342, density: 4430, thermal_expansion: 8.6e-6, yield_strength: 880e6, ultimate_strength: 950e6 },
  { id: 'stainless_304', name: 'Stainless Steel 304', youngs_modulus: 193e9, poissons_ratio: 0.29, density: 8000, thermal_expansion: 1.73e-5, yield_strength: 215e6 },
  { id: 'copper_annealed', name: 'Copper (annealed)', youngs_modulus: 110e9, poissons_ratio: 0.343, density: 8960, thermal_expansion: 1.65e-5, yield_strength: 70e6 },
]

export interface AnalyzeOptions {
  /** Hard node cap; the solve is O(nodes) memory and iteration count grows with it. */
  maxNodes?: number
  /** Absolute ms timestamp after which CG gives up (serverless functions are killed). */
  deadline?: number
}

export interface AnalyzeOutput {
  results: Omit<AnalysisResults, 'job_id'>
  vtu: string | null
}

type V3 = [number, number, number]

function resolveMaterial(req: AnalysisRequest): MaterialProperties {
  const m = req.materials
  if (m?.regions && m.regions.length > 0) {
    throw new SolverInputError('Per-region materials are not supported; assign one material to the whole mesh')
  }
  if (m?.custom) {
    const c = m.custom
    if (!(c.youngs_modulus > 0) || !(c.poissons_ratio >= 0 && c.poissons_ratio < 0.5) || !(c.density >= 0)) {
      throw new SolverInputError('Custom material needs youngs_modulus > 0, 0 <= poissons_ratio < 0.5, density >= 0')
    }
    return c
  }
  const id = m?.default ?? 'steel_structural'
  const preset = MATERIAL_PRESETS.find((p) => p.id === id)
  if (!preset) throw new SolverInputError(`Unknown material "${id}"`, [`Available: ${MATERIAL_PRESETS.map((p) => p.id).join(', ')}`])
  return preset
}

function buildMesh(req: AnalysisRequest, s: number): TetMesh {
  const mesh = req.mesh
  let tm: TetMesh
  if (mesh.type === 'box') {
    tm = boxMesh(mesh.min, mesh.max, mesh.subdivisions ?? [10, 10, 10])
  } else if (mesh.type === 'file') {
    if (mesh.format !== 'msh') throw new SolverInputError(`Mesh format "${mesh.format}" is not supported; use msh (Gmsh 2.2 ASCII)`)
    tm = parseMsh22(decodeMeshData(mesh.data))
  } else {
    throw new SolverInputError(`Mesh type "${(mesh as { type: string }).type}" is not supported; use a box or an msh file`)
  }
  if (s !== 1) for (let i = 0; i < tm.nodes.length; i++) tm.nodes[i] *= s
  return tm
}

/** Volume and physical shape-function gradients (4x3, row per node) of one tet. */
function tetGeometry(nodes: Float64Array, tets: Int32Array, e: number, g: Float64Array): number {
  const n1 = 3 * tets[4 * e], n2 = 3 * tets[4 * e + 1], n3 = 3 * tets[4 * e + 2], n4 = 3 * tets[4 * e + 3]
  const ax = nodes[n2] - nodes[n1], ay = nodes[n2 + 1] - nodes[n1 + 1], az = nodes[n2 + 2] - nodes[n1 + 2]
  const bx = nodes[n3] - nodes[n1], by = nodes[n3 + 1] - nodes[n1 + 1], bz = nodes[n3 + 2] - nodes[n1 + 2]
  const cx = nodes[n4] - nodes[n1], cy = nodes[n4 + 1] - nodes[n1 + 1], cz = nodes[n4 + 2] - nodes[n1 + 2]
  // rows of inverse(M), M = [a b c] as columns: (b x c), (c x a), (a x b), each / det
  const r1x = by * cz - bz * cy, r1y = bz * cx - bx * cz, r1z = bx * cy - by * cx
  const det = ax * r1x + ay * r1y + az * r1z
  if (Math.abs(det) < 1e-300) throw new SolverInputError(`Mesh contains a degenerate (zero-volume) element (#${e})`)
  const r2x = cy * az - cz * ay, r2y = cz * ax - cx * az, r2z = cx * ay - cy * ax
  const r3x = ay * bz - az * by, r3y = az * bx - ax * bz, r3z = ax * by - ay * bx
  const inv = 1 / det
  g[3] = r1x * inv; g[4] = r1y * inv; g[5] = r1z * inv
  g[6] = r2x * inv; g[7] = r2y * inv; g[8] = r2z * inv
  g[9] = r3x * inv; g[10] = r3y * inv; g[11] = r3z * inv
  g[0] = -(g[3] + g[6] + g[9]); g[1] = -(g[4] + g[7] + g[10]); g[2] = -(g[5] + g[8] + g[11])
  return Math.abs(det) / 6
}

/** 6x12 strain-displacement matrix (engineering shear), row-major. */
function fillB(g: Float64Array, B: Float64Array): void {
  B.fill(0)
  for (let i = 0; i < 4; i++) {
    const gx = g[3 * i], gy = g[3 * i + 1], gz = g[3 * i + 2], c = 3 * i
    B[0 * 12 + c] = gx
    B[1 * 12 + c + 1] = gy
    B[2 * 12 + c + 2] = gz
    B[3 * 12 + c] = gy; B[3 * 12 + c + 1] = gx
    B[4 * 12 + c + 1] = gz; B[4 * 12 + c + 2] = gy
    B[5 * 12 + c] = gz; B[5 * 12 + c + 2] = gx
  }
}

function fillD(E: number, nu: number, D: Float64Array): void {
  const lam = (E * nu) / ((1 + nu) * (1 - 2 * nu))
  const mu = E / (2 * (1 + nu))
  D.fill(0)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) D[i * 6 + j] = i === j ? lam + 2 * mu : lam
  D[3 * 6 + 3] = mu; D[4 * 6 + 4] = mu; D[5 * 6 + 5] = mu
}

function vonMises(s: ArrayLike<number>): number {
  const [x, y, z, xy, yz, zx] = [s[0], s[1], s[2], s[3], s[4], s[5]]
  return Math.sqrt(0.5 * ((x - y) ** 2 + (y - z) ** 2 + (z - x) ** 2) + 3 * (xy * xy + yz * yz + zx * zx))
}

/** Principal stresses (descending) of a symmetric 3x3, via the trigonometric method. */
function principal(s: ArrayLike<number>): [number, number, number] {
  const a = s[0], b = s[1], c = s[2], d = s[3], e = s[4], f = s[5] // xx yy zz xy yz zx
  const p1 = d * d + e * e + f * f
  const q = (a + b + c) / 3
  if (p1 < 1e-30 * (1 + a * a + b * b + c * c)) {
    const v = [a, b, c].sort((x, y) => y - x)
    return [v[0], v[1], v[2]]
  }
  const p2 = (a - q) ** 2 + (b - q) ** 2 + (c - q) ** 2 + 2 * p1
  const p = Math.sqrt(p2 / 6)
  const B = [(a - q) / p, d / p, f / p, d / p, (b - q) / p, e / p, f / p, e / p, (c - q) / p]
  const detB =
    B[0] * (B[4] * B[8] - B[5] * B[7]) - B[1] * (B[3] * B[8] - B[5] * B[6]) + B[2] * (B[3] * B[7] - B[4] * B[6])
  const r = Math.max(-1, Math.min(1, detB / 2))
  const phi = Math.acos(r) / 3
  const e1 = q + 2 * p * Math.cos(phi)
  const e3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3)
  return [e1, 3 * q - e1 - e3, e3]
}

interface BoundaryFace { nodes: [number, number, number]; normal: V3; area: number; centroid: V3 }

function boundaryFaces(mesh: TetMesh): BoundaryFace[] {
  const n = nodeCount(mesh)
  const open = new Map<number, [number, number, number, number]>()
  const combos = [[0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 3, 1], [1, 2, 3, 0]]
  for (let e = 0; e < tetCount(mesh); e++) {
    for (const [a, b, c, opp] of combos) {
      const tri = [mesh.tets[4 * e + a], mesh.tets[4 * e + b], mesh.tets[4 * e + c]].sort((x, y) => x - y)
      const key = (tri[0] * n + tri[1]) * n + tri[2]
      if (open.has(key)) open.delete(key)
      else open.set(key, [tri[0], tri[1], tri[2], mesh.tets[4 * e + opp]])
    }
  }
  const N = mesh.nodes
  const faces: BoundaryFace[] = []
  for (const [a, b, c, opp] of open.values()) {
    const ux = N[3 * b] - N[3 * a], uy = N[3 * b + 1] - N[3 * a + 1], uz = N[3 * b + 2] - N[3 * a + 2]
    const vx = N[3 * c] - N[3 * a], vy = N[3 * c + 1] - N[3 * a + 1], vz = N[3 * c + 2] - N[3 * a + 2]
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx
    const len = Math.hypot(nx, ny, nz)
    if (len === 0) continue
    const cen: V3 = [
      (N[3 * a] + N[3 * b] + N[3 * c]) / 3, (N[3 * a + 1] + N[3 * b + 1] + N[3 * c + 1]) / 3, (N[3 * a + 2] + N[3 * b + 2] + N[3 * c + 2]) / 3,
    ]
    // Outward = away from the tet's fourth node.
    if (nx * (cen[0] - N[3 * opp]) + ny * (cen[1] - N[3 * opp + 1]) + nz * (cen[2] - N[3 * opp + 2]) < 0) {
      nx = -nx; ny = -ny; nz = -nz
    }
    faces.push({ nodes: [a, b, c], normal: [nx / len, ny / len, nz / len], area: len / 2, centroid: cen })
  }
  return faces
}

function targetContains(target: BoundaryTarget, s: number, tol: number): (p: V3) => boolean {
  switch (target.type) {
    case 'box': {
      const lo = target.min.map((v) => v * s - tol), hi = target.max.map((v) => v * s + tol)
      return (p) => p[0] >= lo[0] && p[0] <= hi[0] && p[1] >= lo[1] && p[1] <= hi[1] && p[2] >= lo[2] && p[2] <= hi[2]
    }
    case 'sphere': {
      const c = target.center.map((v) => v * s), r = target.radius * s + tol
      return (p) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) <= r
    }
    case 'point': {
      const c = target.location.map((v) => v * s), r = (target.tolerance ?? 0) * s + tol
      return (p) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) <= r
    }
    case 'boundary_id':
      throw new SolverInputError('boundary_id targets are not supported; use a point, box, or sphere region')
    default:
      throw new SolverInputError(`Unknown target type "${(target as { type: string }).type}"`)
  }
}

function nearestNode(mesh: TetMesh, p: V3): number {
  let best = 0, bestD = Infinity
  for (let i = 0; i < nodeCount(mesh); i++) {
    const d = (mesh.nodes[3 * i] - p[0]) ** 2 + (mesh.nodes[3 * i + 1] - p[1]) ** 2 + (mesh.nodes[3 * i + 2] - p[2]) ** 2
    if (d < bestD) { bestD = d; best = i }
  }
  return best
}

export function runAnalysis(req: AnalysisRequest, options: AnalyzeOptions = {}): AnalyzeOutput {
  const started = Date.now()
  const warnings: string[] = []
  const so = req.solver_options ?? {}
  if (so.fe_degree === 2) throw new SolverInputError('Quadratic elements (fe_degree 2) are not supported; the solver uses linear tetrahedra')
  if (so.large_deformation) throw new SolverInputError('Large-deformation analysis is not supported; the solver is linear-static')
  if (so.adaptive_refinement || (so.refinement_cycles ?? 0) > 0) warnings.push('Mesh refinement options are ignored; the mesh is solved as given')
  const unitType = req.units?.type ?? 'SI'
  if (unitType === 'US_CUSTOMARY') throw new SolverInputError('US_CUSTOMARY units are not supported; use SI or SI_MM')
  const s = unitType === 'SI_MM' ? 1e-3 : 1

  if (!Array.isArray(req.boundary_conditions) || req.boundary_conditions.length === 0) {
    throw new SolverInputError('At least one boundary condition is required')
  }

  const mat = resolveMaterial(req)
  const mesh = buildMesh(req, s)
  const n = nodeCount(mesh), ne = tetCount(mesh)
  const maxNodes = options.maxNodes ?? 35000
  if (n > maxNodes) throw new SolverInputError(`Mesh has ${n.toLocaleString()} nodes; the limit is ${maxNodes.toLocaleString()}. Use a larger element size.`)
  const deadline = options.deadline ?? started + 50_000

  let minC = [Infinity, Infinity, Infinity], maxC = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < n; i++) for (let d = 0; d < 3; d++) {
    minC[d] = Math.min(minC[d], mesh.nodes[3 * i + d]); maxC[d] = Math.max(maxC[d], mesh.nodes[3 * i + d])
  }
  const diag = Math.hypot(maxC[0] - minC[0], maxC[1] - minC[1], maxC[2] - minC[2])
  const tol = 1e-6 * diag

  // ---- assemble stiffness, plus body/thermal loads ----
  const K = buildPattern(n, mesh.tets)
  const f = new Float64Array(3 * n)
  const D = new Float64Array(36), B = new Float64Array(72), DB = new Float64Array(72)
  const ke = new Float64Array(144), g = new Float64Array(12)
  fillD(mat.youngs_modulus, mat.poissons_ratio, D)

  const loads = req.loads ?? []
  const gravity: V3 = [0, 0, 0]
  let centrifugal: { p0: V3; axis: V3; w2: number } | null = null
  let dT = 0
  for (const l of loads) {
    if (l.type === 'gravity') { for (let d = 0; d < 3; d++) gravity[d] += l.acceleration[d] }
    else if (l.type === 'centrifugal') {
      const len = Math.hypot(...l.axis_direction)
      if (len === 0) throw new SolverInputError('Centrifugal load needs a non-zero axis_direction')
      centrifugal = { p0: l.axis_point.map((v) => v * s) as V3, axis: l.axis_direction.map((v) => v / len) as V3, w2: l.angular_velocity ** 2 }
    } else if (l.type === 'thermal') {
      dT += l.applied_temperature - l.reference_temperature
    }
  }
  const alpha = mat.thermal_expansion ?? 0
  if (dT !== 0 && !alpha) warnings.push('Thermal load applied but the material has no thermal_expansion; it has no effect')
  const epsTh = [alpha * dT, alpha * dT, alpha * dT, 0, 0, 0]
  const sigTh = new Float64Array(6)
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) sigTh[i] += D[i * 6 + j] * epsTh[j]

  const volumes = new Float64Array(ne)
  let totalVolume = 0
  for (let e = 0; e < ne; e++) {
    const V = tetGeometry(mesh.nodes, mesh.tets, e, g)
    volumes[e] = V
    totalVolume += V
    fillB(g, B)
    for (let i = 0; i < 6; i++) for (let j = 0; j < 12; j++) {
      let sum = 0
      for (let k = 0; k < 6; k++) sum += D[i * 6 + k] * B[k * 12 + j]
      DB[i * 12 + j] = sum
    }
    for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) {
      let sum = 0
      for (let k = 0; k < 6; k++) sum += B[k * 12 + i] * DB[k * 12 + j]
      ke[i * 12 + j] = V * sum
    }
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
      addElementBlock(K, mesh.tets[4 * e + a], mesh.tets[4 * e + b], ke, a, b)
    }

    for (let a = 0; a < 4; a++) {
      const node = mesh.tets[4 * e + a]
      const share = (mat.density * V) / 4
      for (let d = 0; d < 3; d++) f[3 * node + d] += share * gravity[d]
      if (centrifugal) {
        const rx = mesh.nodes[3 * node] - centrifugal.p0[0], ry = mesh.nodes[3 * node + 1] - centrifugal.p0[1], rz = mesh.nodes[3 * node + 2] - centrifugal.p0[2]
        const along = rx * centrifugal.axis[0] + ry * centrifugal.axis[1] + rz * centrifugal.axis[2]
        const perp = [rx - along * centrifugal.axis[0], ry - along * centrifugal.axis[1], rz - along * centrifugal.axis[2]]
        for (let d = 0; d < 3; d++) f[3 * node + d] += share * centrifugal.w2 * perp[d]
      }
      if (dT !== 0 && alpha) {
        // V * B^T * (D * eps_th), this node's three rows
        for (let d = 0; d < 3; d++) {
          let sum = 0
          for (let k = 0; k < 6; k++) sum += B[k * 12 + 3 * a + d] * sigTh[k]
          f[3 * node + d] += V * sum
        }
      }
    }
  }

  // ---- surface loads / springs / point forces ----
  let faces: BoundaryFace[] | null = null
  const getFaces = () => (faces ??= boundaryFaces(mesh))
  const springs = new Float64Array(3 * n)
  const applyFaces = (target: BoundaryTarget, what: string, fn: (face: BoundaryFace) => void) => {
    if (target.type === 'point') throw new SolverInputError(`${what} needs a box or sphere target (a single point has no surface)`)
    const inside = targetContains(target, s, tol)
    let hit = 0
    for (const face of getFaces()) if (inside(face.centroid)) { fn(face); hit++ }
    if (hit === 0) throw new SolverInputError(`${what} target does not touch any boundary face of the mesh`)
  }

  for (const l of loads) {
    if (l.type === 'pressure') {
      applyFaces(l.target, 'Pressure load', (face) => {
        for (const node of face.nodes) for (let d = 0; d < 3; d++) f[3 * node + d] += (-l.value * face.normal[d] * face.area) / 3
      })
    } else if (l.type === 'surface_force') {
      applyFaces(l.target, 'Surface force', (face) => {
        for (const node of face.nodes) for (let d = 0; d < 3; d++) f[3 * node + d] += (l.force_per_area[d] * face.area) / 3
      })
    } else if (l.type === 'point_force') {
      const p = l.location.map((v) => v * s) as V3
      let nodes: number[]
      const radius = (l.distribution_radius ?? 0) * s
      if (radius > 0) {
        nodes = []
        for (let i = 0; i < n; i++) if (Math.hypot(mesh.nodes[3 * i] - p[0], mesh.nodes[3 * i + 1] - p[1], mesh.nodes[3 * i + 2] - p[2]) <= radius) nodes.push(i)
        if (nodes.length === 0) nodes = [nearestNode(mesh, p)]
      } else nodes = [nearestNode(mesh, p)]
      for (const node of nodes) for (let d = 0; d < 3; d++) f[3 * node + d] += l.force[d] / nodes.length
    }
  }

  // ---- constraints ----
  const constrained = new Uint8Array(3 * n)
  const prescribed = new Float64Array(3 * n)
  const constrain = (node: number, d: number, value: number) => { constrained[3 * node + d] = 1; prescribed[3 * node + d] = value }
  const selectNodes = (target: BoundaryTarget): number[] => {
    if (target.type === 'point') {
      const p = target.location.map((v) => v * s) as V3
      const within = targetContains(target, s, tol)
      const hit: number[] = []
      for (let i = 0; i < n; i++) if (within([mesh.nodes[3 * i], mesh.nodes[3 * i + 1], mesh.nodes[3 * i + 2]])) hit.push(i)
      return hit.length ? hit : [nearestNode(mesh, p)]
    }
    const inside = targetContains(target, s, tol)
    const hit: number[] = []
    for (let i = 0; i < n; i++) if (inside([mesh.nodes[3 * i], mesh.nodes[3 * i + 1], mesh.nodes[3 * i + 2]])) hit.push(i)
    return hit
  }

  for (const bc of req.boundary_conditions) {
    if (bc.type === 'elastic_support') {
      applyFaces(bc.target, 'Elastic support', (face) => {
        for (const node of face.nodes) for (let d = 0; d < 3; d++) springs[3 * node + d] += (bc.stiffness_per_area[d] * face.area) / 3
      })
      continue
    }
    const nodes = selectNodes(bc.target)
    if (nodes.length === 0) throw new SolverInputError(`Boundary condition "${bc.description ?? bc.type}" target does not contain any mesh nodes`)
    if (bc.type === 'fixed') {
      for (const node of nodes) for (let d = 0; d < 3; d++) constrain(node, d, 0)
    } else if (bc.type === 'displacement') {
      for (const node of nodes) for (let d = 0; d < 3; d++) {
        const v = bc.values[d]
        if (v !== null && v !== undefined) constrain(node, d, v * s)
      }
    } else if (bc.type === 'symmetry') {
      const nrm = bc.plane_normal
      const len = Math.hypot(...nrm)
      const axis = len === 0 ? -1 : nrm.findIndex((c) => Math.abs(c / len) > 1 - 1e-9)
      if (axis < 0) throw new SolverInputError('Symmetry planes must be axis-aligned (plane_normal along X, Y, or Z)')
      for (const node of nodes) constrain(node, axis, 0)
    }
  }
  if (!constrained.some((c) => c) && !springs.some((v) => v > 0)) {
    throw new SolverInputError('Model is unsupported: no node is constrained')
  }
  for (let i = 0; i < n; i++) for (let d = 0; d < 3; d++) {
    if (springs[3 * i + d] > 0) K.vals[9 * K.diagPos[i] + 4 * d] += springs[3 * i + d]
  }

  // ---- solve K_ff u_f = f_f - K_fp u_p ----
  const rhs = Float64Array.from(f)
  if (prescribed.some((v) => v !== 0)) {
    const Kup = new Float64Array(3 * n)
    matvec(K, prescribed, Kup)
    for (let i = 0; i < rhs.length; i++) rhs[i] -= Kup[i]
  }
  for (let i = 0; i < rhs.length; i++) if (constrained[i]) rhs[i] = 0

  const cg = solveCG(K, rhs, constrained, {
    tolerance: so.tolerance ?? 1e-10,
    maxIterations: so.max_iterations ?? 20000,
    deadline,
  })
  if (cg.timedOut) throw new SolverFailure('The solve ran out of time. Use a larger element size to reduce the problem size.')
  if (!cg.converged) {
    throw new SolverFailure(
      `The solver did not converge (residual ${cg.relativeResidual.toExponential(2)} after ${cg.iterations} iterations). ` +
      'The model may be under-constrained (free rigid-body motion) or contain badly shaped elements.'
    )
  }
  const u = cg.x
  for (let i = 0; i < u.length; i++) if (constrained[i]) u[i] = prescribed[i]

  // ---- reactions & equilibrium ----
  const Ku = new Float64Array(3 * n)
  matvec(K, u, Ku)
  const reaction: V3 = [0, 0, 0], moment: V3 = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    const r: V3 = [0, 0, 0]
    for (let d = 0; d < 3; d++) if (constrained[3 * i + d]) r[d] = Ku[3 * i + d] - f[3 * i + d]
    reaction[0] += r[0]; reaction[1] += r[1]; reaction[2] += r[2]
    const x = mesh.nodes[3 * i], y = mesh.nodes[3 * i + 1], z = mesh.nodes[3 * i + 2]
    moment[0] += y * r[2] - z * r[1]; moment[1] += z * r[0] - x * r[2]; moment[2] += x * r[1] - y * r[0]
  }
  const applied: V3 = [0, 0, 0], springForce: V3 = [0, 0, 0]
  for (let i = 0; i < n; i++) for (let d = 0; d < 3; d++) {
    applied[d] += f[3 * i + d]
    springForce[d] += springs[3 * i + d] * u[3 * i + d]
  }
  // Global balance: reactions + applied loads - spring restoring force = 0.
  const imbalance = Math.hypot(...([0, 1, 2].map((d) => reaction[d] + applied[d] - springForce[d]) as V3))
  const scale = Math.max(Math.hypot(...applied), Math.hypot(...reaction), 1e-30)
  const forceErrorPercent = (100 * imbalance) / scale

  // ---- displacement results ----
  const dMax = [-Infinity, -Infinity, -Infinity], dMin = [Infinity, Infinity, Infinity]
  let maxMag = -1, maxMagNode = 0
  for (let i = 0; i < n; i++) {
    for (let d = 0; d < 3; d++) {
      dMax[d] = Math.max(dMax[d], u[3 * i + d]); dMin[d] = Math.min(dMin[d], u[3 * i + d])
    }
    const mag = Math.hypot(u[3 * i], u[3 * i + 1], u[3 * i + 2])
    if (mag > maxMag) { maxMag = mag; maxMagNode = i }
  }

  // ---- element stress recovery ----
  const vm = new Float64Array(ne)
  const sigma = new Float64Array(6), eps = new Float64Array(6)
  let vmMax = -Infinity, vmMin = Infinity, vmWeighted = 0, vmMaxElem = 0
  const p1 = { max: -Infinity, min: Infinity }, p2 = { max: -Infinity, min: Infinity }, p3 = { max: -Infinity, min: Infinity }
  let trescaMax = 0, strainEnergy = 0
  const yieldStrength = mat.yield_strength
  let sfMin = Infinity, sfMinElem = 0, sfWeighted = 0
  const below = { b10: 0, b15: 0, b20: 0 }
  for (let e = 0; e < ne; e++) {
    tetGeometry(mesh.nodes, mesh.tets, e, g)
    fillB(g, B)
    for (let i = 0; i < 6; i++) {
      let sum = 0
      for (let a = 0; a < 4; a++) {
        const node = mesh.tets[4 * e + a]
        for (let d = 0; d < 3; d++) sum += B[i * 12 + 3 * a + d] * u[3 * node + d]
      }
      eps[i] = sum
    }
    for (let i = 0; i < 6; i++) {
      let sum = 0
      for (let j = 0; j < 6; j++) sum += D[i * 6 + j] * (eps[j] - epsTh[j])
      sigma[i] = sum
    }
    const V = volumes[e]
    const v = vonMises(sigma)
    vm[e] = v
    vmWeighted += v * V
    if (v > vmMax) { vmMax = v; vmMaxElem = e }
    if (v < vmMin) vmMin = v
    const [s1, s2, s3] = principal(sigma)
    p1.max = Math.max(p1.max, s1); p1.min = Math.min(p1.min, s1)
    p2.max = Math.max(p2.max, s2); p2.min = Math.min(p2.min, s2)
    p3.max = Math.max(p3.max, s3); p3.min = Math.min(p3.min, s3)
    trescaMax = Math.max(trescaMax, s1 - s3)
    let w = 0
    for (let i = 0; i < 6; i++) w += sigma[i] * (eps[i] - epsTh[i])
    strainEnergy += 0.5 * w * V
    if (yieldStrength) {
      const sf = v > 0 ? yieldStrength / v : Infinity
      if (sf < sfMin) { sfMin = sf; sfMinElem = e }
      const capped = Math.min(sf, 1e3)
      sfWeighted += capped * V
      if (sf < 1) below.b10 += V
      if (sf < 1.5) below.b15 += V
      if (sf < 2) below.b20 += V
    }
  }
  const centroid = (e: number): V3 => {
    const t = mesh.tets, N = mesh.nodes
    return [0, 1, 2].map((d) => (N[3 * t[4 * e] + d] + N[3 * t[4 * e + 1] + d] + N[3 * t[4 * e + 2] + d] + N[3 * t[4 * e + 3] + d]) / 4) as V3
  }

  const results: AnalyzeOutput['results'] = {
    status: 'completed',
    displacements: {
      max: { x: dMax[0], y: dMax[1], z: dMax[2], magnitude: maxMag },
      min: { x: dMin[0], y: dMin[1], z: dMin[2] },
      max_location: [mesh.nodes[3 * maxMagNode], mesh.nodes[3 * maxMagNode + 1], mesh.nodes[3 * maxMagNode + 2]],
    },
    stress: {
      von_mises: { max: vmMax, min: vmMin, avg: vmWeighted / totalVolume, max_location: centroid(vmMaxElem) },
      principal: { sigma_1: p1, sigma_2: p2, sigma_3: p3 },
      tresca: { max: trescaMax },
    },
    reactions: {
      total_force: reaction,
      total_moment: moment,
      equilibrium: { force_error_percent: forceErrorPercent, is_balanced: forceErrorPercent < 1 },
    },
    strain_energy: { total: strainEnergy },
    mesh_quality: { num_elements: ne, num_nodes: n },
    computation_time: (Date.now() - started) / 1000,
    solver: { iterations: cg.iterations, relative_residual: cg.relativeResidual },
    ...(warnings.length ? { warnings } : {}),
  }
  if (yieldStrength && Number.isFinite(sfMin)) {
    results.safety_factors = {
      min: sfMin,
      avg: sfWeighted / totalVolume,
      min_location: centroid(sfMinElem),
      distribution: {
        below_1_0: (100 * below.b10) / totalVolume,
        below_1_5: (100 * below.b15) / totalVolume,
        below_2_0: (100 * below.b20) / totalVolume,
      },
    }
  }

  return { results, vtu: ne <= 60000 ? buildVtu(mesh, u, vm) : null }
}

function buildVtu(mesh: TetMesh, u: Float64Array, vm: Float64Array): string {
  const n = nodeCount(mesh), ne = tetCount(mesh)
  const num = (v: number) => v.toPrecision(7)
  const pts: string[] = [], disp: string[] = []
  for (let i = 0; i < n; i++) {
    pts.push(`${num(mesh.nodes[3 * i])} ${num(mesh.nodes[3 * i + 1])} ${num(mesh.nodes[3 * i + 2])}`)
    disp.push(`${num(u[3 * i])} ${num(u[3 * i + 1])} ${num(u[3 * i + 2])}`)
  }
  const conn: string[] = [], offsets: string[] = [], types: string[] = [], stress: string[] = []
  for (let e = 0; e < ne; e++) {
    conn.push(`${mesh.tets[4 * e]} ${mesh.tets[4 * e + 1]} ${mesh.tets[4 * e + 2]} ${mesh.tets[4 * e + 3]}`)
    offsets.push(String(4 * (e + 1)))
    types.push('10')
    stress.push(num(vm[e]))
  }
  return [
    '<?xml version="1.0"?>',
    '<VTKFile type="UnstructuredGrid" version="0.1" byte_order="LittleEndian">',
    '<UnstructuredGrid>',
    `<Piece NumberOfPoints="${n}" NumberOfCells="${ne}">`,
    '<PointData Vectors="displacement_m">',
    `<DataArray type="Float64" Name="displacement_m" NumberOfComponents="3" format="ascii">${disp.join(' ')}</DataArray>`,
    '</PointData>',
    '<CellData Scalars="von_mises_Pa">',
    `<DataArray type="Float64" Name="von_mises_Pa" format="ascii">${stress.join(' ')}</DataArray>`,
    '</CellData>',
    '<Points>',
    `<DataArray type="Float64" NumberOfComponents="3" format="ascii">${pts.join(' ')}</DataArray>`,
    '</Points>',
    '<Cells>',
    `<DataArray type="Int32" Name="connectivity" format="ascii">${conn.join(' ')}</DataArray>`,
    `<DataArray type="Int32" Name="offsets" format="ascii">${offsets.join(' ')}</DataArray>`,
    `<DataArray type="UInt8" Name="types" format="ascii">${types.join(' ')}</DataArray>`,
    '</Cells>',
    '</Piece>',
    '</UnstructuredGrid>',
    '</VTKFile>',
  ].join('\n')
}
