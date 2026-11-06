/**
 * Seeds the boomilever test simulations into a user's account: a Basswood material in
 * their library, plus one project per wall joint variant ("boomilever 1X" to "4X"), each holding the wall joint + block geometry, a conforming tet
 * mesh, setup (fixed wall face, 5 N tip load, self-weight), and results solved here
 * with the app's own FE solver (lib/fea-engine). Opening the project in the app loads all
 * of it into the workflow (see ProjectLayout / workflowStore.hydrateFromSnapshot).
 *
 * Run from the repo root (reads DATABASE_URL from .env):
 *   npm run seed:boomilever -w @feai/frontend -- [--email you@x.com] [--variant 1-4|all] [--dry-run]
 *
 * Re-running it updates the existing projects in place instead of making a
 * new one.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient, Prisma } from '@prisma/client'
import {
  BOOMILEVER_BOUNDARY_CONDITIONS,
  BOOMILEVER_LOADS,
  BOOMILEVER_MATERIAL,
  BOOMILEVER_PROJECT_NAME,
  boomileverProjectName,
  beamTheoryTipDeflectionMm,
  buildBoomileverDocument,
  buildBoomileverMesh,
  buildBoomileverSnapshot,
  parseBinaryStl,
  toAnalysisResultData,
  type BoomileverVariant,
} from '../src/lib/fixtures/boomilever'
import { buildAnalysisRequestFromWorkflow } from '../src/lib/fea-solver/workflow-request'
import { normalizeAnalysisResults } from '../src/lib/fea-solver/normalize-results'
import { runAnalysis } from '../src/lib/fea-engine/analyze'
import type { Material } from '../src/store/materialLibraryStore'

const REPO_ROOT = resolve(__dirname, '../../..')

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function main() {
  const email = arg('email') ?? 'mattnoahkim@gmail.com'
  const variantArg = arg('variant') ?? 'all'
  const variants = (variantArg === 'all' ? [1, 2, 3, 4] : [Number(variantArg)]) as BoomileverVariant[]
  if (!variants.every((v) => [1, 2, 3, 4].includes(v))) throw new Error('--variant must be 1, 2, 3, 4, or all')
  const stlDir = resolve(arg('stl-dir') ?? resolve(REPO_ROOT, 'boomilever_wall_joints'))
  const dryRun = process.argv.includes('--dry-run')

  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error(`No account with email ${email}. Sign in to the app once first.`)

    // ---- material: reuse the user's Basswood row if this already ran ----
    let material = await prisma.material.findFirst({
      where: { userId: user.id, name: BOOMILEVER_MATERIAL.name, isPreset: false },
    })
    if (!material && !dryRun) {
      material = await prisma.material.create({ data: { ...BOOMILEVER_MATERIAL, userId: user.id, isPreset: false } })
    }
    const materialForSolve: Material = {
      ...BOOMILEVER_MATERIAL,
      id: material?.id ?? 'dry-run-material',
      isPreset: false,
      presetKey: null,
    }

    for (const variant of variants) {
    // ---- mesh + solve, through the same request builder the results page uses ----
    const meshData = buildBoomileverMesh(variant)
    const built = buildAnalysisRequestFromWorkflow({
      meshData,
      boundaryConditions: BOOMILEVER_BOUNDARY_CONDITIONS,
      loads: BOOMILEVER_LOADS,
      materials: [materialForSolve],
      defaultMaterialId: materialForSolve.id,
    })
    if (!built.ok) throw new Error(built.error)
    console.log(`Solving wall joint ${variant}X + block ${variant}X: ${meshData.nodeCount} nodes, ${meshData.elementCount} tets...`)
    const { results } = runAnalysis(built.request, { deadline: Date.now() + 120_000 })
    const jobId = `boomilever-${variant}x-${new Date().toISOString().slice(0, 10)}`
    const analysisResults = toAnalysisResultData(normalizeAnalysisResults({ job_id: jobId, ...results }))

    const tip = -analysisResults.displacements.min.z
    console.log(`  tip deflection   ${tip.toFixed(3)} mm  (Euler-Bernoulli ${beamTheoryTipDeflectionMm(variant).toFixed(3)} mm)`)
    console.log(`  max von Mises    ${(analysisResults.stress.vonMises.max / 1e6).toFixed(2)} MPa`)
    console.log(`  min safety factor ${analysisResults.safetyFactors?.min.toFixed(2)} (vs ${BOOMILEVER_MATERIAL.yieldStrength! / 1e6} MPa)`)
    console.log(`  reaction force   [${analysisResults.reactions?.totalForce.map((f) => f.toFixed(4)).join(', ')}] N`)
    console.log(`  solve time       ${analysisResults.computationTime?.toFixed(2)} s, equilibrium error ${results.reactions?.equilibrium?.force_error_percent?.toExponential(1)}%`)

    // ---- document + stored workflow ----
    const stl = (name: string) => parseBinaryStl(readFileSync(resolve(stlDir, name)))
    const document = buildBoomileverDocument({
      variant,
      wallJoint: stl(`wall_joint_${variant}X.stl`),
      block: stl(`block_${variant}X.stl`),
    })
    const data = {
      ...document,
      workflow: buildBoomileverSnapshot({ materialId: materialForSolve.id, meshData, analysisResults }),
    }
    console.log(`  project data     ${(JSON.stringify(data).length / 1e6).toFixed(2)} MB`)

    if (dryRun) {
      console.log('  dry run: nothing written.')
      continue
    }

    const description = `Test simulation: wall joint ${variant}X + block ${variant}X (basswood), cantilevered from the wall with a 5 N tip load.`
    const json = data as unknown as Prisma.InputJsonValue
    const name = boomileverProjectName(variant)
    // The first version of this script made a single project named just "boomilever" for
    // 1X; that one becomes "boomilever 1X" rather than leaving a duplicate behind.
    const existing =
      (await prisma.project.findFirst({ where: { userId: user.id, name } })) ??
      (variant === 1
        ? await prisma.project.findFirst({ where: { userId: user.id, name: BOOMILEVER_PROJECT_NAME } })
        : null)
    const project = existing
      ? await prisma.project.update({
          where: { id: existing.id },
          data: { name, description, data: json },
        })
      : await prisma.project.create({
          data: { name, description, userId: user.id, data: json },
        })
    console.log(`  ${existing ? 'Updated' : 'Created'} project "${project.name}" (${project.id}) for ${email}`)
    console.log(`  open: /project/${project.id}/results`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
