/**
 * FEA Solver API Client
 * Communicates with external FEA Solver at https://fea-solver.vercel.app
 */

import type {
  AnalysisRequest,
  AnalysisResults,
  JobSubmitResponse,
  JobStatusResponse,
  MeshQualityResponse,
  MaterialProperties,
  HealthResponse,
  ApiError,
  Mesh
} from './types';

const API_BASE_URL = import.meta.env.VITE_FEA_API_URL || 'https://fea-solver.vercel.app';

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
    const errorData: ApiError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`
    }));
    throw new FEAApiError(
      errorData.error,
      response.status,
      errorData.details
    );
  }
  return response.json();
}

// ============================================================================
// Analysis Endpoints
// ============================================================================

export async function submitAnalysis(request: AnalysisRequest): Promise<JobSubmitResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<JobSubmitResponse>(response);
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
  return handleResponse<JobStatusResponse>(response);
}

export async function getJobResults(jobId: string): Promise<AnalysisResults> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/results`);
  return handleResponse<AnalysisResults>(response);
}

export async function cancelJob(jobId: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
    method: 'DELETE',
  });
  return handleResponse<{ status: string }>(response);
}

export async function downloadFile(jobId: string, filename: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/files/${filename}`);
  if (!response.ok) {
    throw new FEAApiError('Failed to download file', response.status);
  }
  return response.blob();
}

// ============================================================================
// Mesh Quality Endpoint
// ============================================================================

export async function checkMeshQuality(mesh: Mesh): Promise<MeshQualityResponse> {
  const response = await fetch(`${API_BASE_URL}/api/mesh/quality`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mesh }),
  });
  return handleResponse<MeshQualityResponse>(response);
}

// ============================================================================
// Materials Endpoint
// ============================================================================

export async function getMaterials(): Promise<{ materials: MaterialProperties[] }> {
  const response = await fetch(`${API_BASE_URL}/api/materials`);
  return handleResponse<{ materials: MaterialProperties[] }>(response);
}

// ============================================================================
// Health Endpoint
// ============================================================================

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
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

export async function pollJobUntilComplete(
  jobId: string,
  options: PollOptions = {}
): Promise<AnalysisResults> {
  const {
    interval = 2000,
    maxAttempts = 300,  // 10 minutes at 2s intervals
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
  checkMeshQuality,
  getMaterials,
  getHealth,
  pollJobUntilComplete,
};

export default feaSolverClient;
