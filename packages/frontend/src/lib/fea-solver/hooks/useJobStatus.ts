/**
 * useJobStatus Hook
 * Tracks job status for external FEA Solver
 */

import { useState, useEffect, useCallback } from 'react';
import { getJobStatus, getJobResults } from '../client';
import type { JobStatusResponse, AnalysisResults } from '../types';

interface UseJobStatusOptions {
  pollInterval?: number;
  enabled?: boolean;
}

export function useJobStatus(jobId: string | null, options: UseJobStatusOptions = {}) {
  const { pollInterval = 2000, enabled = true } = options;
  
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    try {
      const statusResponse = await getJobStatus(jobId);
      setStatus(statusResponse);
      
      if (statusResponse.status === 'completed') {
        const resultsResponse = await getJobResults(jobId);
        setResults(resultsResponse);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId || !enabled) return;

    fetchStatus();

    // Only poll if job is not in a terminal state
    const shouldPoll = status?.status === 'queued' || status?.status === 'running';
    
    if (shouldPoll) {
      const interval = setInterval(fetchStatus, pollInterval);
      return () => clearInterval(interval);
    }
  }, [jobId, enabled, pollInterval, fetchStatus, status?.status]);

  return {
    status,
    results,
    error,
    isLoading,
    refetch: fetchStatus
  };
}
