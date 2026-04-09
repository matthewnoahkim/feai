import type { AnalysisResults, DisplacementResults, StressResults } from './types';
import { displacementApiToMmScale } from './integration-config';

function num(x: unknown, fallback: number): number {
  return typeof x === 'number' && Number.isFinite(x) ? x : fallback;
}

function scalePoint(p: unknown, s: number): [number, number, number] | undefined {
  if (!Array.isArray(p) || p.length < 3) return undefined;
  const a = num(p[0], 0);
  const b = num(p[1], 0);
  const c = num(p[2], 0);
  return [a * s, b * s, c * s];
}

/**
 * The public API examples omit some fields the UI expects (e.g. displacement magnitude, von_mises.min).
 * Fills those in so downstream code and CSV export stay stable.
 *
 * Displacement components are scaled to millimetres for the app (see displacementApiToMmScale).
 */
export function normalizeAnalysisResults(raw: AnalysisResults | Record<string, unknown>): AnalysisResults {
  const r = raw as AnalysisResults;
  const dScale = displacementApiToMmScale();

  const dm = r.displacements?.max as DisplacementResults['max'] | undefined;
  const x = num(dm?.x, 0) * dScale;
  const y = num(dm?.y, 0) * dScale;
  const z = num(dm?.z, 0) * dScale;
  const fromComponents = Math.sqrt(x * x + y * y + z * z);
  const magnitude =
    dm?.magnitude != null && Number.isFinite(dm.magnitude as number)
      ? num(dm.magnitude, 0) * dScale
      : fromComponents;

  const dmin = r.displacements?.min;
  const vm = r.stress?.von_mises as StressResults['von_mises'] | undefined;
  const vmax = num(vm?.max, 0);
  const vavg = num(vm?.avg, vmax);
  const vmin = num(vm?.min, vmax);

  const stressBlock = r.stress;

  return {
    ...r,
    job_id: typeof r.job_id === 'string' ? r.job_id : String(r.job_id ?? ''),
    status: 'completed',
    displacements: {
      ...(r.displacements ?? {}),
      max: { x, y, z, magnitude },
      min: {
        x: num(dmin?.x, 0) * dScale,
        y: num(dmin?.y, 0) * dScale,
        z: num(dmin?.z, 0) * dScale,
      },
      max_location: scalePoint(r.displacements?.max_location, dScale),
    },
    stress: {
      ...(stressBlock ?? {}),
      von_mises: {
        ...(stressBlock?.von_mises ?? {}),
        max: vmax,
        min: vmin,
        avg: vavg,
        max_location: scalePoint(stressBlock?.von_mises?.max_location, dScale),
      },
    },
    safety_factors: r.safety_factors
      ? {
          ...r.safety_factors,
          min_location: scalePoint(r.safety_factors.min_location, dScale),
        }
      : r.safety_factors,
  };
}
