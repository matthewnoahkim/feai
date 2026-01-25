/**
 * useExternalAnalysis Hook
 * Manages analysis submission and polling for external FEA Solver
 */

import { useState, useCallback } from 'react';
import {
  submitAnalysis,
  pollJobUntilComplete,
  cancelJob,
  FEAApiError
} from '../client';
import type {
  AnalysisRequest,
  AnalysisResults,
  JobStatusResponse
} from '../types';

export type AnalysisState = 
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'queued'; jobId: string; position?: number }
  | { status: 'running'; jobId: string; progress: number; stage: string }
  | { status: 'completed'; jobId: string; results: AnalysisResults }
  | { status: 'failed'; jobId?: string; error: string }
  | { status: 'cancelled'; jobId: string };

export function useExternalAnalysis() {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });

  const runAnalysis = useCallback(async (request: AnalysisRequest) => {
    setState({ status: 'submitting' });

    try {
      // Submit the job
      const submitResponse = await submitAnalysis(request);
      const jobId = submitResponse.job_id;

      setState({
        status: 'queued',
        jobId,
        position: submitResponse.queue_position
      });

      // Poll until complete
      const results = await pollJobUntilComplete(jobId, {
        interval: 2000,
        onProgress: (status: JobStatusResponse) => {
          if (status.status === 'running') {
            setState({
              status: 'running',
              jobId,
              progress: status.progress || 0,
              stage: status.current_stage || 'Processing...'
            });
          } else if (status.status === 'queued') {
            setState({
              status: 'queued',
              jobId,
              position: undefined
            });
          }
        }
      });

      setState({
        status: 'completed',
        jobId,
        results
      });

      return results;

    } catch (error) {
      const message = error instanceof FEAApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState({
        status: 'failed',
        error: message
      });
      
      throw error;
    }
  }, []);

  const cancelAnalysis = useCallback(async () => {
    if (state.status === 'queued' || state.status === 'running') {
      const jobId = state.jobId;
      try {
        await cancelJob(jobId);
        setState({ status: 'cancelled', jobId });
      } catch (error) {
        // Job may have completed or failed already
        console.error('Failed to cancel job:', error);
      }
    }
  }, [state]);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return {
    state,
    runAnalysis,
    cancelAnalysis,
    reset,
    isLoading: state.status === 'submitting' || 
               state.status === 'queued' || 
               state.status === 'running'
  };
}
