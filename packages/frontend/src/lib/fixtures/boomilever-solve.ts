/**
 * Server-side half of the boomilever fixture: meshes and solves a variant with the app's
 * own FE solver (lib/fea-engine), and upgrades a stored project whose workflow came from
 * an older seed. Kept out of boomilever.ts so client code that only needs the fixture's
 * types and constants doesn't pull in the solver.
 */

import {
  BOOMILEVER_CREATED_AT,
  BOOMILEVER_LOADS,
  BOOMILEVER_MATERIAL,
  BOOMILEVER_SEED,
  boomileverBoundaryConditions,
  buildBoomileverMesh,
  buildBoomileverSnapshot,
  toAnalysisResultData,
  type BoomileverVariant,
  type ProjectWorkflowSnapshot,
} from './boomilever'
import { buildAnalysisRequestFromWorkflow } from '../fea-solver/workflow-request'
import { normalizeAnalysisResults } from '../fea-solver/normalize-results'
import { runAnalysis } from '../fea-engine/analyze'
import type { Material } from '../../store/materialLibraryStore'

export function solveBoomilever(variant: BoomileverVariant, materialId: string, deadlineMs = 120_000) {
  const material: Material = { ...BOOMILEVER_MATERIAL, id: materialId, isPreset: false, presetKey: null }
  const meshData = buildBoomileverMesh(variant)
  const built = buildAnalysisRequestFromWorkflow({
    meshData,
    boundaryConditions: boomileverBoundaryConditions(variant),
    loads: BOOMILEVER_LOADS,
    materials: [material],
    defaultMaterialId: material.id,
  })
  if (!built.ok) throw new Error(built.error)
  const { results } = runAnalysis(built.request, { deadline: Date.now() + deadlineMs })
  const jobId = `boomilever-${variant}x-${BOOMILEVER_CREATED_AT.toISOString().slice(0, 10)}`
  const analysisResults = toAnalysisResultData(normalizeAnalysisResults({ job_id: jobId, ...results }))
  return { meshData, analysisResults, results }
}

/**
 * If project.data holds a boomilever workflow from an older seed, returns the data with
 * that workflow re-meshed and re-solved under the current seed; otherwise null. Only
 * stored seeds are touched: the workflow in project.data is written by the seed script
 * alone (the app keeps a user's own edits in the browser), so nothing a user did is lost.
 */
export function upgradeStaleBoomileverData(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null
  const workflow = (data as { workflow?: ProjectWorkflowSnapshot }).workflow
  // The first seed had no seed id; it's recognizable by its "boomilever-" result id.
  const seed = workflow?.seed
    ?? (workflow?.analysisResults?.jobId?.startsWith('boomilever-') ? 'boomilever-v1' : undefined)
  if (!workflow || !seed?.startsWith('boomilever-')) return null
  const partName = workflow.meshData?.regions?.names[0] ?? ''
  const variant = Number(/^wall_joint_([1-4])X$/.exec(partName)?.[1]) as BoomileverVariant
  if (!variant) return null
  if (seed === `${BOOMILEVER_SEED}-${partName}`) return null

  const materialId = workflow.defaultMaterialId ?? 'basswood'
  const { meshData, analysisResults } = solveBoomilever(variant, materialId, 45_000)
  const upgraded = buildBoomileverSnapshot({ variant, materialId, meshData, analysisResults })
  return { ...(data as Record<string, unknown>), workflow: upgraded }
}
