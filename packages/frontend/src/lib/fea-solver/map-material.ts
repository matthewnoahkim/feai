/**
 * Maps workflow material IDs to FEA Solver API preset keys
 * (the solver's own preset list: GET /api/solver/materials, lib/fea-engine MATERIAL_PRESETS).
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
 *
 * Keys off `presetKey` (the historical literal id, e.g. 'steel-1018') rather than `id`,
 * since preset materials are now real per-user DB rows with a server-generated cuid()
 * `id` — `presetKey` is the only stable thing WORKFLOW_ID_TO_API can still match against.
 * Custom materials have no presetKey, so they fall through to `id` (a cuid(), never a
 * match) and correctly land on the default fallback, same as before this change.
 */
export function workflowMaterialIdToApiPreset(
  material: { id: string; presetKey?: string | null } | null | undefined
): string {
  if (!material) return FEA_SOLVER_DEFAULT_MATERIAL_PRESET;
  const key = material.presetKey ?? material.id;
  return WORKFLOW_ID_TO_API[key] ?? FEA_SOLVER_DEFAULT_MATERIAL_PRESET;
}
