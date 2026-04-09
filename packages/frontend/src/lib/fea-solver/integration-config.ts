/**
 * FEAI ↔ FEA Solver gateway integration toggles.
 *
 * The Vercel gateway validates little of the analyze payload and proxies to COMPUTE_SERVER_URL.
 * Encoding, result units, and timeouts are not fully specified in the gateway repo—use these
 * env vars until the compute API documents them.
 */

/** ~50 MB JSON body limit on analyze (gateway bodyParser). */
export const FEA_GATEWAY_MAX_ANALYZE_BODY_BYTES = 50 * 1024 * 1024;

/**
 * `mesh.data` for type "file": gateway only checks that a string is present.
 * - default / unset: base64 (ASCII-safe in JSON)
 * - NEXT_PUBLIC_FEA_FILE_MESH_DATA_ENCODING=plain: raw .msh text (JSON-escaped)
 */
export function encodeFileMeshData(msh: string): string {
  const mode = process.env.NEXT_PUBLIC_FEA_FILE_MESH_DATA_ENCODING?.toLowerCase();
  if (mode === 'plain') return msh;
  if (typeof btoa === 'function') return btoa(msh);
  return msh;
}

/**
 * Published doc examples use displacement components ~1e-4 (metres). The gateway does not
 * define output units. We scale to mm for UI labels unless you confirm the API already
 * returns millimetres.
 *
 * Set NEXT_PUBLIC_FEA_API_DISPLACEMENT_MM=1 (or true) if displacements are already in mm.
 */
export function displacementApiToMmScale(): number {
  const v = process.env.NEXT_PUBLIC_FEA_API_DISPLACEMENT_MM?.toLowerCase();
  if (v === '1' || v === 'true') return 1;
  return 1000;
}
