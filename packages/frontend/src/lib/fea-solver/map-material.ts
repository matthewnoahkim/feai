/**
 * Maps workflow material IDs to FEA Solver API preset keys
 * (see https://fea-solver.vercel.app — GET /api/materials).
 */

export const FEA_SOLVER_DEFAULT_MATERIAL_PRESET = 'steel_structural';

/** Workflow library IDs → API material_id strings */
const WORKFLOW_ID_TO_API: Record<string, string> = {
  'steel-1018': 'steel_structural',
  'aluminum-6061': 'aluminum_6061_t6',
  'titanium-ti6al4v': 'titanium_ti6al4v',
  'stainless-304': 'stainless_304',
};

/**
 * Returns an API `materials.default` preset id.
 * Custom / unknown materials fall back to structural steel so the job can still run;
 * yield-based safety factors then refer to that preset, not the custom part material.
 */
export function workflowMaterialIdToApiPreset(materialId: string | null | undefined): string {
  if (!materialId) return FEA_SOLVER_DEFAULT_MATERIAL_PRESET;
  return WORKFLOW_ID_TO_API[materialId] ?? FEA_SOLVER_DEFAULT_MATERIAL_PRESET;
}
