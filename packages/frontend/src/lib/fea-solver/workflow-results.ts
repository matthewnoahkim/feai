/**
 * Solver result (normalized, see normalize-results.ts) to the workflow store's
 * AnalysisResultData, the shape the results page renders and persists.
 */

import type { AnalysisResultData } from '../../store/workflowStore';
import type { AnalysisResults } from './types';

export function toAnalysisResultData(results: AnalysisResults): AnalysisResultData {
  return {
    jobId: results.job_id,
    status: 'completed',
    displacements: { max: results.displacements.max, min: results.displacements.min },
    stress: {
      vonMises: results.stress.von_mises,
      principal: results.stress.principal ? {
        sigma1: results.stress.principal.sigma_1,
        sigma2: results.stress.principal.sigma_2,
        sigma3: results.stress.principal.sigma_3,
      } : undefined,
    },
    reactions: results.reactions ? {
      totalForce: results.reactions.total_force,
      totalMoment: results.reactions.total_moment,
    } : undefined,
    safetyFactors: results.safety_factors ? {
      min: results.safety_factors.min,
      avg: results.safety_factors.avg,
    } : undefined,
    computationTime: results.computation_time,
    outputFiles: results.output_files,
    fields: results.nodal_fields ? {
      nodeIds: results.nodal_fields.node_ids,
      displacement: results.nodal_fields.displacement,
      vonMises: results.nodal_fields.von_mises,
    } : undefined,
  };
}
