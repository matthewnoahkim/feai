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
  beamTheoryTipDeflectionMm,
  buildBoomileverMesh,
  slotDepth,
  type BoomileverVariant,
} from '../boomilever'
import { buildAnalysisRequestFromWorkflow } from '../../fea-solver/workflow-request'
import { normalizeAnalysisResults } from '../../fea-solver/normalize-results'
import { runAnalysis } from '../../fea-engine/analyze'
import type { Material } from '../../../store/materialLibraryStore'

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
  const weightN = BOOMILEVER_MATERIAL.density * 9.81 * (19.175 * 3.175 * 120) * 1e-9

  // Linear tets are stiff in bending, and the fully fixed root also restrains the Poisson
  // contraction that beam theory lets happen freely, so the 3D answer lands somewhat below
  // Euler-Bernoulli (5.59 mm). Self-weight adds about 0.4%.
  const beam = beamTheoryTipDeflectionMm()
  expect(-results.displacements.min.z).toBeGreaterThan(0.8 * beam)
  expect(-results.displacements.min.z).toBeLessThan(1.0 * beam)

  expect(results.reactions!.total_force[2]).toBeCloseTo(TIP_LOAD_N + weightN, 3)
  expect(results.reactions!.equilibrium!.is_balanced).toBe(true)

  // Root bending stress M*c/I = 5 * 120 * 1.5875 / 51.14 = 18.6 MPa; the peak sits at
  // the fixed edge, so it's at least the nominal value.
  expect(results.stress.von_mises.max).toBeGreaterThan(15e6)
  expect(results.safety_factors!.min).toBeGreaterThan(1)
})
