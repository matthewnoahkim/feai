/**
 * JobProgress Component
 * Display job status and progress
 */

import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import type { JobStatusType } from '../../../lib/fea-solver/types';

interface JobProgressProps {
  jobId: string;
  status: JobStatusType;
  progress?: number;
  stage?: string;
  error?: string;
  onCancel?: () => void;
}

const STATUS_COLORS: Record<JobStatusType, string> = {
  queued: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  running: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
};

const STAGE_ICONS: Record<string, string> = {
  'Queued': '⏳',
  'Reading mesh': '📥',
  'Setting up system': '🔧',
  'Assembling system matrix': '🧮',
  'Solving linear system': '⚙️',
  'Computing stresses': '📊',
  'Computing reactions': '⚖️',
  'Writing output': '💾',
  'Completed': '✅',
  'Processing...': '🔄'
};

export function JobProgress({ jobId, status, progress = 0, stage = 'Processing...', error, onCancel }: JobProgressProps) {
  const progressPercent = Math.round(progress * 100);
  const stageIcon = STAGE_ICONS[stage] || '🔄';
  
  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-cad-text">Analysis Progress</h3>
            <p className="text-sm text-cad-text-dim">Job ID: {jobId}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium border ${STATUS_COLORS[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {(status === 'queued' || status === 'running') && (
          <>
            <Progress 
              value={progressPercent} 
              className="mb-3"
              variant={status === 'running' ? 'default' : 'warning'}
            />
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-cad-text-dim flex items-center gap-2">
                <span>{stageIcon}</span>
                <span>{stage}</span>
              </span>
              <span className="font-medium text-cad-text">{progressPercent}%</span>
            </div>

            {/* Stage Progress Indicator */}
            <div className="mt-4 flex items-center gap-1">
              {['Reading', 'Setup', 'Assembly', 'Solve', 'Post'].map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-1 ${
                    progressPercent > (i + 1) * 20 
                      ? 'bg-cad-accent' 
                      : progressPercent > i * 20 
                        ? 'bg-cad-accent/50' 
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-cad-text-dim mt-1">
              <span>Start</span>
              <span>Mesh</span>
              <span>Solve</span>
              <span>Post</span>
              <span>Done</span>
            </div>

            {onCancel && status === 'queued' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancel}
                className="mt-4"
              >
                Cancel Job
              </Button>
            )}
          </>
        )}

        {status === 'failed' && error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {status === 'completed' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Analysis completed successfully</span>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 text-gray-700 text-sm">
            Analysis was cancelled
          </div>
        )}
      </CardContent>
    </Card>
  );
}
