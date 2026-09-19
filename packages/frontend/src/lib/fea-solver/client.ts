/**
 * FEA Solver API Client - talks to the in-app solver (app/api/solver/*, implemented in
 * lib/fea-engine) on the same origin. It replaces the external fea-solver.vercel.app
 * gateway, which had no compute backend behind it.
 *
 * The solve is synchronous: POST /analyze returns the finished result. To keep the
 * submit -> status -> results -> download surface the workflow pages already use, this
 * client holds each completed job's result in memory (per browser tab) and serves the
 * later calls from that.
 */

import type {
  AnalysisRequest,
  AnalysisResults,
  JobSubmitResponse,
  JobStatusResponse,
  MaterialProperties,
  HealthResponse,
  ApiError,
} from './types';
import { normalizeAnalysisResults } from './normalize-results';

const API_BASE_URL = '/api/solver';

export class FEAApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string[]
  ) {
    super(message);
    this.name = 'FEAApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiError | { error?: { message?: string } } = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`
    }));
    // Solver routes answer { error: string }; the shared auth/rate-limit helpers answer
    // { success: false, error: { code, message } }.
    const raw = (errorData as { error?: unknown }).error;
    const message = typeof raw === 'string' ? raw : (raw as { message?: string } | undefined)?.message;
    throw new FEAApiError(
      message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      (errorData as ApiError).details
    );
  }
  return response.json();
}

// ============================================================================
// Analysis Endpoints
// ============================================================================

interface CompletedJob {
  results: AnalysisResults;
  vtu: string | null;
}

const completedJobs = new Map<string, CompletedJob>();
let inFlight: AbortController | null = null;

/** A tetrahedral MSH is several MB as text, past Vercel's 4.5 MB request cap, so the JSON
 * is gzipped when the browser can (see app/api/solver/analyze/route.ts). */
async function encodeBody(payload: unknown): Promise<{ body: BodyInit; headers: Record<string, string> }> {
  const json = JSON.stringify(payload);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof CompressionStream !== 'undefined') {
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
    headers['X-Body-Encoding'] = 'gzip';
    return { body: await new Response(stream).blob(), headers };
  }
  return { body: json, headers };
}

export async function submitAnalysis(request: AnalysisRequest): Promise<JobSubmitResponse> {
  const controller = new AbortController();
  inFlight = controller;
  try {
    const { body, headers } = await encodeBody(request);
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    const data = await handleResponse<{
      job_id: string;
      status: 'completed';
      results: AnalysisResults;
      vtu?: string;
    }>(response);
    completedJobs.set(data.job_id, { results: data.results, vtu: data.vtu ?? null });
    return { job_id: data.job_id, status: 'completed' };
  } catch (error) {
    if ((error as { name?: string }).name === 'AbortError') {
      throw new FEAApiError('Analysis cancelled', 499);
    }
    throw error;
  } finally {
    if (inFlight === controller) inFlight = null;
  }
}

function requireJob(jobId: string): CompletedJob {
  const job = completedJobs.get(jobId);
  if (!job) throw new FEAApiError('Unknown job - results are only kept in the tab that ran the analysis', 404);
  return job;
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  requireJob(jobId);
  return { job_id: jobId, status: 'completed', progress: 100 };
}

export async function getJobResults(jobId: string): Promise<AnalysisResults> {
  return normalizeAnalysisResults(requireJob(jobId).results);
}

/** Aborts the in-flight request. The server-side solve can't be interrupted once
 * started, but the client stops waiting on it and discards the result. */
export async function cancelJob(jobId: string): Promise<{ status: string }> {
  inFlight?.abort();
  completedJobs.delete(jobId);
  return { status: 'cancelled' };
}

export async function downloadFile(jobId: string, filename: string): Promise<Blob> {
  const job = completedJobs.get(jobId);
  if (!job || !job.vtu || !filename.endsWith('.vtu')) {
    throw new FEAApiError('Failed to download file', 404);
  }
  return new Blob([job.vtu], { type: 'application/xml' });
}

// ============================================================================
// Materials Endpoint
// ============================================================================

export async function getMaterials(): Promise<{ materials: MaterialProperties[] }> {
  const response = await fetch(`${API_BASE_URL}/materials`);
  return handleResponse<{ materials: MaterialProperties[] }>(response);
}

// ============================================================================
// Health Endpoint
// ============================================================================

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<HealthResponse>(response);
}

// ============================================================================
// Polling Helper
// ============================================================================

export interface PollOptions {
  interval?: number;
  maxAttempts?: number;
  onProgress?: (status: JobStatusResponse) => void;
}

/**
 * Polls job status until completed, failed, or cancelled. Slow or hung upstream responses
 * can hit the gateway’s short GET timeout even while the job is still running on compute.
 */
export async function pollJobUntilComplete(
  jobId: string,
  options: PollOptions = {}
): Promise<AnalysisResults> {
  const {
    interval = 2000,
    maxAttempts = 300, // ~10 minutes at 2s intervals (longer than gateway per-request timeouts)
    onProgress
  } = options;

  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await getJobStatus(jobId);
    
    if (onProgress) {
      onProgress(status);
    }

    if (status.status === 'completed') {
      return getJobResults(jobId);
    }

    if (status.status === 'failed') {
      throw new FEAApiError(
        status.error || 'Analysis failed',
        500
      );
    }

    if (status.status === 'cancelled') {
      throw new FEAApiError('Analysis was cancelled', 400);
    }

    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }

  throw new FEAApiError('Analysis timed out', 408);
}

// ============================================================================
// Unified Client Object
// ============================================================================

export const feaSolverClient = {
  submitAnalysis,
  getJobStatus,
  getJobResults,
  cancelJob,
  downloadFile,
  getMaterials,
  getHealth,
  pollJobUntilComplete,
};
