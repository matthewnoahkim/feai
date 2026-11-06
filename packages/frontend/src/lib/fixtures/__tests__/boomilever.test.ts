/**
 * The boomilever fixture solved end to end through the same path the results page uses
 * (buildAnalysisRequestFromWorkflow, runAnalysis, normalizeAnalysisResults), checked
 * against beam theory and static equilibrium.
 */

import {
  BOOMILEVER_BOUNDARY_CONDITIONS,
  BOOMILEVER_LOADS,
  BOOMILEVER_MATERIAL,
  TIP_LOAD_N,
  beamTheoryProngRootStressPa,
  beamTheoryTipDeflectionMm,
  boomileverVolumeMm3,
  buildBoomileverMesh,
  slotDepth,
  type BoomileverVariant,
} from '../boomilever'
import { buildAnalysisRequestFromWorkflow } from '../../fea-solver/workflow-request'
import { normalizeAnalysisResults } from '../../fea-solver/normalize-results'
import { runAnalysis } from '../../fea-engine/analyze'
import { buildBoomileverSnapshot } from '../boomilever'
import { solveBoomilever, upgradeStaleBoomileverData } from '../boomilever-solve'
import type { Material } from '../../../store/materialLibraryStore'

// Each solve below takes a few seconds; leave headroom when suites run in parallel.
jest.setTimeout(30_000)

const material: Material = { ...BOOMILEVER_MATERIAL, id: 'basswood-test', isPreset: false, presetKey: null }

function solve(variant: BoomileverVariant) {
  const meshData = buildBoomileverMesh(variant)
  const built = buildAnalysisRequestFromWorkflow({
    meshData,
    boundaryConditions: BOOMILEVER_BOUNDARY_CONDITIONS,
    loads: BOOMILEVER_LOADS,
    materials: [material],
    defaultMaterialId: material.id,
  })
  if (!built.ok) throw new Error(built.error)
  const { results } = runAnalysis(built.request)
  return { meshData, results: normalizeAnalysisResults({ job_id: 'test', ...results }) }
}

test.each([1, 2, 3, 4] as BoomileverVariant[])('mesh for %iX is conforming and puts grid lines on the slot', (v) => {
  const mesh = buildBoomileverMesh(v)
  expect(mesh.nodes!.some((n) => Math.abs(n.y - slotDepth(v)) < 1e-9 && Math.abs(n.x - 8) < 1e-9)).toBe(true)
  // Every interior triangle is shared by exactly two tets, so no faces are hanging.
  const count = new Map<string, number>()
  for (const e of mesh.elements!) {
    const ids = e.nodeIds
    for (const tri of [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]]) {
      const key = tri.map((t) => ids[t]).sort((a, b) => a - b).join(',')
      count.set(key, (count.get(key) ?? 0) + 1)
    }
  }
  expect(Math.max(...count.values())).toBe(2)
  expect(mesh.quality!.maxAspectRatio).toBeLessThan(15)
})

test('1X cantilever is within 20% of beam theory and balances the applied load', () => {
  const { results } = solve(1)
  const weightN = BOOMILEVER_MATERIAL.density * 9.81 * boomileverVolumeMm3(1) * 1e-9

  // Linear tets are stiff in bending, and the fully fixed root also restrains the Poisson
  // contraction that beam theory lets happen freely, so the 3D answer lands somewhat below
  // Euler-Bernoulli. Self-weight adds a fraction of a percent.
  const beam = beamTheoryTipDeflectionMm(1)
  expect(-results.displacements.min.z).toBeGreaterThan(0.8 * beam)
  expect(-results.displacements.min.z).toBeLessThan(1.0 * beam)

  expect(results.reactions!.total_force[2]).toBeCloseTo(TIP_LOAD_N + weightN, 3)
  expect(results.reactions!.equilibrium!.is_balanced).toBe(true)

  // The thin prongs carry the moment past the solid wall end; the peak sits at their
  // roots (a re-entrant corner), so it's at least the nominal beam value.
  expect(results.stress.von_mises.max).toBeGreaterThan(0.8 * beamTheoryProngRootStressPa(1))
})

test.each([1, 4] as BoomileverVariant[])('mesh for %iX leaves the slot between the prongs open', (v) => {
  const mesh = buildBoomileverMesh(v)
  const byId = new Map(mesh.nodes!.map((n) => [n.id, n]))
  for (const e of mesh.elements!) {
    const c = e.nodeIds.map((id) => byId.get(id)!)
    const cx = c.reduce((s, p) => s + p.x, 0) / 4, cy = c.reduce((s, p) => s + p.y, 0) / 4
    expect(Math.abs(cx) < 8 && cy > slotDepth(v)).toBe(false)
  }
})

test('per-node fields map back to the right mesh nodes for the color plot', () => {
  const { meshData, results } = solve(2)
  const f = results.nodal_fields!
  expect(f.node_ids).toHaveLength(meshData.nodeCount)
  const byId = new Map(meshData.nodes!.map((n) => [n.id, n]))

  // Wall-face nodes are fixed (zero displacement: blue); the largest nodal displacement
  // is at the free tip (red) and equals the reported maximum.
  let maxMag = 0, maxY = 0
  f.node_ids!.forEach((id, i) => {
    const node = byId.get(id)!
    const mag = Math.hypot(f.displacement[3 * i], f.displacement[3 * i + 1], f.displacement[3 * i + 2])
    if (node.y === 0) expect(mag).toBe(0)
    if (mag > maxMag) { maxMag = mag; maxY = node.y }
  })
  expect(maxY).toBe(120)
  expect(maxMag).toBeCloseTo(results.displacements.max.magnitude, 4)

  // Nodal (averaged) stress is highest near the wall, where the bending moment peaks.
  const peak = f.von_mises.indexOf(Math.max(...f.von_mises))
  expect(byId.get(f.node_ids![peak])!.y).toBeLessThan(20)
})

test('mesh tags the block cells inside the slot as their own part', () => {
  const mesh = buildBoomileverMesh(3)
  const byId = new Map(mesh.nodes!.map((n) => [n.id, n]))
  expect(mesh.regions!.names).toEqual(['wall_joint_3X', 'block_3X'])
  mesh.elements!.forEach((e, i) => {
    const c = e.nodeIds.map((id) => byId.get(id)!)
    const cx = c.reduce((s, p) => s + p.x, 0) / 4, cy = c.reduce((s, p) => s + p.y, 0) / 4
    const inSlot = Math.abs(cx) < 8 && cy < slotDepth(3)
    expect(mesh.regions!.elementRegion[i]).toBe(inSlot ? 1 : 0)
  })
})

test('a stored project from an older boomilever seed is re-meshed and re-solved', () => {
  const { meshData, analysisResults } = solveBoomilever(1, 'basswood-test')
  const current = buildBoomileverSnapshot({ materialId: 'basswood-test', meshData, analysisResults })
  expect(upgradeStaleBoomileverData({ workflow: current })).toBeNull()
  expect(upgradeStaleBoomileverData({ workflow: { version: 1 } })).toBeNull()

  const stale = { name: 'doc', workflow: { ...current, seed: 'boomilever-v2-wall_joint_1X', meshData: { ...meshData, nodeCount: 1 } } }
  const upgraded = upgradeStaleBoomileverData(stale) as { name: string; workflow: typeof current }
  expect(upgraded.name).toBe('doc')
  expect(upgraded.workflow.seed).toBe(current.seed)
  expect(upgraded.workflow.meshData!.nodeCount).toBe(meshData.nodeCount)
  expect(upgraded.workflow.analysisResults!.fields).toBeTruthy()
})
