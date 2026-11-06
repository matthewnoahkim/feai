import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { gunzipSync } from 'zlib';
import { requireAuth } from '@/lib/auth';
import { checkAndRecordRateLimit } from '@/lib/rateLimit';
import { runAnalysis, SolverFailure, SolverInputError } from '@/lib/fea-engine/analyze';
import type { AnalysisRequest } from '@/lib/fea-solver/types';

/**
 * POST /api/solver/analyze - runs the in-app linear-static FE solver
 * (lib/fea-engine) and returns the finished result in the same response.
 *
 * Synchronous on purpose: Vercel functions share no memory between invocations, so a
 * submit-then-poll job model would need a database table just to hand a result from one
 * invocation to the next. The client (fea-solver/client.ts) keeps the returned result
 * for its own getJobStatus/getJobResults/downloadFile calls instead.
 *
 * Two Vercel platform limits shape this route:
 *  - Request bodies are capped at 4.5 MB, and a real tetrahedral MSH file is larger than
 *    that as plain text, so the client gzips the JSON and says so via X-Body-Encoding
 *    (a custom header rather than Content-Encoding, so no intermediary tries to decode it).
 *  - Execution time: maxDuration below, with the solver's own deadline set a little
 *    earlier so it fails with a clear message instead of being killed mid-response.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SOLVE_BUDGET_MS = 52_000;
const MAX_DECOMPRESSED_BYTES = 64 * 1024 * 1024;
// Vercel caps a function response at 4.5 MB. The per-node contour fields and the VTU
// export share this budget: the fields drive the results page's color plot, so they go
// first and the optional VTU is dropped if both don't fit.
const MAX_PAYLOAD_CHARS = 4_000_000;

function badRequest(error: string, details?: string[], status = 400) {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!checkAndRecordRateLimit(`solver:${user.id}`, { max: 10 })) {
    return NextResponse.json({ error: 'Too many analyses - please wait a minute and try again.' }, { status: 429 });
  }

  let payload: AnalysisRequest;
  try {
    let bytes: Buffer = Buffer.from(await request.arrayBuffer());
    if (request.headers.get('x-body-encoding') === 'gzip') {
      bytes = gunzipSync(bytes, { maxOutputLength: MAX_DECOMPRESSED_BYTES });
    }
    payload = JSON.parse(bytes.toString('utf8'));
  } catch {
    return badRequest('Request body is not valid (optionally gzipped) JSON');
  }

  if (!payload || typeof payload !== 'object' || !payload.mesh || !Array.isArray(payload.boundary_conditions)) {
    return badRequest('Request needs a "mesh" and a "boundary_conditions" array');
  }

  try {
    const { results, vtu } = runAnalysis(payload, { deadline: Date.now() + SOLVE_BUDGET_MS });
    const jobId = randomUUID();
    let fieldChars = results.nodal_fields ? JSON.stringify(results.nodal_fields).length : 0;
    if (fieldChars > MAX_PAYLOAD_CHARS) {
      delete results.nodal_fields;
      fieldChars = 0;
    }
    const includeVtu = vtu !== null && vtu.length + fieldChars <= MAX_PAYLOAD_CHARS;
    return NextResponse.json({
      job_id: jobId,
      status: 'completed',
      results: {
        job_id: jobId,
        ...results,
        ...(includeVtu ? { output_files: { vtk: 'results.vtu' } } : {}),
      },
      ...(includeVtu ? { vtu } : {}),
    });
  } catch (err) {
    if (err instanceof SolverInputError) return badRequest(err.message, err.details);
    if (err instanceof SolverFailure) return badRequest(err.message, undefined, 422);
    console.error('Solver crashed:', err);
    return badRequest('The solver hit an unexpected error.', undefined, 500);
  }
}
