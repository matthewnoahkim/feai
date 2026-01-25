/**
 * FEASolverPage - Main page for external FEA Solver integration
 * Allows users to define geometry, materials, BCs, loads and run analysis
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { MeshBuilder } from '../components/fea-solver/mesh';
import { MaterialSelector } from '../components/fea-solver/materials';
import { BCEditor } from '../components/fea-solver/boundary-conditions';
import { LoadEditor } from '../components/fea-solver/loads';
import { SolverOptions, UnitSystemSelector } from '../components/fea-solver/solver';
import { JobProgress, ResultsDashboard } from '../components/fea-solver/results';
import { Card, CardHeader, CardContent, Button } from '../components/fea-solver/ui';
import { useExternalFEAStore } from '../lib/fea-solver/store';
import { useExternalAnalysis } from '../lib/fea-solver/hooks/useExternalAnalysis';

// Icons
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const AnalysisIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export function FEASolverPage() {
  const {
    mesh,
    materials,
    boundaryConditions,
    loads,
    solverOptions,
    units,
    setMesh,
    setMaterials,
    addBoundaryCondition,
    removeBoundaryCondition,
    updateBoundaryCondition,
    addLoad,
    removeLoad,
    updateLoad,
    setSolverOptions,
    setUnitType,
    getAnalysisRequest,
    isValid,
    reset: resetStore
  } = useExternalFEAStore();

  const { state, runAnalysis, cancelAnalysis, reset: resetAnalysis, isLoading } = useExternalAnalysis();

  const handleSubmit = async () => {
    const request = getAnalysisRequest();
    if (!request) return;
    
    try {
      await runAnalysis(request);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleNewAnalysis = () => {
    resetAnalysis();
  };

  const handleResetAll = () => {
    resetStore();
    resetAnalysis();
  };

  const validation = isValid();

  // Show results if completed
  if (state.status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-cad-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/editor"
                className="flex items-center gap-2 text-cad-text-dim hover:text-cad-text transition-colors"
              >
                <BackIcon />
                <span>Back to Editor</span>
              </Link>
              <div className="h-6 w-px bg-cad-border" />
              <div className="flex items-center gap-2">
                <AnalysisIcon />
                <h1 className="text-xl font-bold text-cad-text">FEA Results</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Results Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <ResultsDashboard 
            results={state.results} 
            units={units.type}
            onNewAnalysis={handleNewAnalysis}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-cad-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/editor"
              className="flex items-center gap-2 text-cad-text-dim hover:text-cad-text transition-colors"
            >
              <BackIcon />
              <span>Back to Editor</span>
            </Link>
            <div className="h-6 w-px bg-cad-border" />
            <div className="flex items-center gap-2">
              <AnalysisIcon />
              <h1 className="text-xl font-bold text-cad-text">FEA Structural Analysis</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleResetAll}>
            Reset All
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Show progress if running */}
        {(state.status === 'queued' || state.status === 'running' || state.status === 'submitting') && (
          <div className="mb-8">
            {state.status === 'submitting' ? (
              <Card>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-cad-accent" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-cad-text">Submitting analysis...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <JobProgress 
                jobId={state.jobId}
                status={state.status}
                progress={state.status === 'running' ? state.progress : 0}
                stage={state.status === 'running' ? state.stage : 'Waiting in queue'}
                onCancel={state.status === 'queued' ? cancelAnalysis : undefined}
              />
            )}
          </div>
        )}

        {/* Show error if failed */}
        {state.status === 'failed' && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="py-6">
              <h3 className="text-lg font-medium text-red-800">Analysis Failed</h3>
              <p className="text-red-600 mt-1">{state.error}</p>
              <Button onClick={resetAnalysis} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Setup form (hide when running) */}
        {(state.status === 'idle' || state.status === 'failed' || state.status === 'cancelled') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Mesh & Materials */}
            <div className="space-y-6">
              <MeshBuilder 
                value={mesh}
                onChange={setMesh}
                units={units.type}
              />

              <MaterialSelector
                value={materials.default || 'steel_structural'}
                onChange={(id) => setMaterials({ default: id })}
              />

              <UnitSystemSelector
                value={units.type}
                onChange={setUnitType}
              />
            </div>

            {/* Middle Column: BCs & Loads */}
            <div className="space-y-6">
              <BCEditor
                boundaryConditions={boundaryConditions}
                onAdd={addBoundaryCondition}
                onRemove={removeBoundaryCondition}
                onUpdate={updateBoundaryCondition}
              />

              <LoadEditor
                loads={loads}
                onAdd={addLoad}
                onRemove={removeLoad}
                onUpdate={updateLoad}
                units={units.type}
              />
            </div>

            {/* Right Column: Solver & Submit */}
            <div className="space-y-6">
              <SolverOptions
                value={solverOptions}
                onChange={setSolverOptions}
              />

              {/* Run Analysis Card */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-cad-text">Run Analysis</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Validation Messages */}
                  {!validation.valid && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                      <strong>Please fix the following:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {validation.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="text-sm space-y-1 text-cad-text-dim">
                    <div className="flex justify-between">
                      <span>Geometry:</span>
                      <span className={mesh ? 'text-green-600 font-medium' : 'text-red-500'}>
                        {mesh ? `${mesh.type.charAt(0).toUpperCase() + mesh.type.slice(1)} mesh` : 'Not defined'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Material:</span>
                      <span className="text-cad-text font-medium">
                        {materials.default || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Boundary Conditions:</span>
                      <span className={boundaryConditions.length > 0 ? 'text-green-600 font-medium' : 'text-red-500'}>
                        {boundaryConditions.length} defined
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loads:</span>
                      <span className="text-cad-text font-medium">
                        {loads.length} defined
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!validation.valid || isLoading}
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Run Analysis'}
                  </Button>

                  <p className="text-xs text-cad-text-dim text-center">
                    Analysis typically takes 10-60 seconds depending on mesh size
                  </p>
                </CardContent>
              </Card>

              {/* API Info */}
              <div className="text-xs text-cad-text-dim bg-gray-100 p-3 border border-cad-border">
                <strong className="text-cad-text">Powered by:</strong>
                <p className="mt-1">
                  External FEA Solver API at{' '}
                  <a 
                    href="https://fea-solver.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cad-accent hover:underline"
                  >
                    fea-solver.vercel.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default FEASolverPage;
