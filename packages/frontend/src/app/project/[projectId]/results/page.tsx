'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  BarChart3, 
  Play, 
  Download, 
  RefreshCw,
  Check,
  AlertCircle,
  FileSpreadsheet,
  FileType,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useProjectStore } from '@/store/projectStore';
import { useDocumentStore } from '@/store/documentStore';
import { feaSolverClient } from '@/lib/fea-solver/client';
import type { AnalysisRequest, AnalysisResults, BoundaryCondition, Load } from '@/lib/fea-solver/types';

// Dynamically import 3D viewport
const Viewport3D = dynamic(() => import('@/components/Viewport3D').then(m => ({ default: m.Viewport3D })), { ssr: false });

// Simple bar chart component
function BarChart({ 
  data, 
  labels, 
  title,
  color = '#3b82f6'
}: { 
  data: number[]; 
  labels: string[]; 
  title: string;
  color?: string;
}) {
  const maxValue = Math.max(...data);
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-sans font-medium text-cad-text">{title}</h4>
      <div className="space-y-1">
        {data.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-cad-text-dim font-sans w-16 truncate">{labels[i]}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
              <div 
                className="h-full rounded transition-all duration-300"
                style={{ 
                  width: `${(value / maxValue) * 100}%`,
                  backgroundColor: color
                }}
              />
            </div>
            <span className="text-xs text-cad-text font-sans w-20 text-right">
              {formatNumber(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)} G`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)} M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)} K`;
  if (Math.abs(value) < 0.001 && value !== 0) return `${(value * 1000).toFixed(4)} m`;
  return value.toFixed(4);
}

function formatStress(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} GPa`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)} MPa`;
  return `${value.toFixed(2)} Pa`;
}

function formatDisplacement(value: number): string {
  if (Math.abs(value) < 0.001) return `${(value * 1000).toFixed(4)} μm`;
  return `${value.toFixed(4)} mm`;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const {
    meshData,
    materials,
    defaultMaterialId,
    boundaryConditions,
    loads,
    analysisResults,
    setAnalysisResults,
    isRunning,
    setRunning,
    runProgress,
    setRunProgress,
    runError,
    setRunError,
    updateStepStatus,
    setCurrentStep,
  } = useWorkflowStore();

  const { fetchProject } = useProjectStore();
  const { document, loadDocumentFromData } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<'summary' | 'displacement' | 'stress' | 'export'>('summary');
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep('results');
    
    fetchProject(projectId).then((project) => {
      if (project?.data) {
        loadDocumentFromData(project.data);
      }
    });
  }, [projectId]);

  const runAnalysis = useCallback(async () => {
    if (!meshData) {
      setRunError('No mesh generated');
      return;
    }

    if (boundaryConditions.filter(bc => bc.enabled).length === 0) {
      setRunError('No boundary conditions defined');
      return;
    }

    setRunning(true);
    setRunProgress(0);
    setRunError(null);
    setAnalysisResults(null);

    try {
      // Get default material
      const material = materials.find(m => m.id === defaultMaterialId) || materials[0];
      
      // Build analysis request
      const request: AnalysisRequest = {
        mesh: {
          type: 'box',
          min: [-50, -50, -50],
          max: [50, 50, 50],
          subdivisions: [10, 10, 10],
        },
        materials: {
          default: material?.name || 'steel',
        },
        boundary_conditions: boundaryConditions
          .filter(bc => bc.enabled)
          .map(bc => {
            const apiBC: BoundaryCondition = {
              type: bc.type,
              target: {
                type: bc.target.type === 'point' ? 'point' : 
                      bc.target.type === 'box' ? 'box' : 
                      bc.target.type === 'sphere' ? 'sphere' : 'box',
                ...(bc.target.type === 'point' && bc.target.location && { location: bc.target.location }),
                ...(bc.target.type === 'box' && bc.target.min && bc.target.max && { 
                  min: bc.target.min, 
                  max: bc.target.max 
                }),
                ...(bc.target.type === 'sphere' && bc.target.center && { 
                  center: bc.target.center, 
                  radius: bc.target.radius || 5 
                }),
              },
              description: bc.name,
            } as BoundaryCondition;
            
            if (bc.type === 'displacement' && bc.values) {
              (apiBC as any).values = bc.values;
            }
            if (bc.type === 'symmetry' && bc.planeNormal) {
              (apiBC as any).plane_normal = bc.planeNormal;
            }
            
            return apiBC;
          }),
        loads: loads
          .filter(l => l.enabled)
          .map(l => {
            const apiLoad: Load = {
              type: l.type,
              description: l.name,
            } as Load;
            
            if (l.type === 'gravity' && l.acceleration) {
              (apiLoad as any).acceleration = l.acceleration;
            }
            if (l.type === 'pressure' && l.target) {
              (apiLoad as any).target = {
                type: l.target.type,
                ...(l.target.min && l.target.max && { min: l.target.min, max: l.target.max }),
              };
              (apiLoad as any).value = l.value;
            }
            if (l.type === 'point_force' && l.location && l.force) {
              (apiLoad as any).location = l.location;
              (apiLoad as any).force = l.force;
            }
            if (l.type === 'thermal') {
              (apiLoad as any).reference_temperature = l.referenceTemperature;
              (apiLoad as any).applied_temperature = l.appliedTemperature;
            }
            if (l.type === 'centrifugal') {
              (apiLoad as any).axis_point = l.axisPoint;
              (apiLoad as any).axis_direction = l.axisDirection;
              (apiLoad as any).angular_velocity = l.angularVelocity;
            }
            
            return apiLoad;
          }),
        solver_options: {
          fe_degree: 1,
          refinement_cycles: 0,
          compute_reactions: true,
          compute_safety_factors: true,
        },
        units: { type: 'SI_MM' },
      };

      // Submit analysis
      const submitResponse = await feaSolverClient.submitAnalysis(request);
      setJobId(submitResponse.job_id);
      setRunProgress(10);

      // Poll for results
      const results = await feaSolverClient.pollJobUntilComplete(submitResponse.job_id, {
        interval: 2000,
        onProgress: (status) => {
          const progress = status.progress || 0;
          setRunProgress(10 + progress * 0.9);
        },
      });

      // Convert to our format
      setAnalysisResults({
        jobId: results.job_id,
        status: 'completed',
        displacements: {
          max: results.displacements.max,
          min: results.displacements.min,
        },
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
      });

      updateStepStatus('results', 'complete');
      setRunProgress(100);

    } catch (error: any) {
      console.error('[Results] Analysis failed:', error);
      setRunError(error.message || 'Analysis failed');
    } finally {
      setRunning(false);
    }
  }, [meshData, boundaryConditions, loads, materials, defaultMaterialId]);

  const cancelAnalysis = useCallback(async () => {
    if (jobId) {
      try {
        await feaSolverClient.cancelJob(jobId);
      } catch (error) {
        console.error('Failed to cancel job:', error);
      }
    }
    setRunning(false);
    setJobId(null);
  }, [jobId]);

  const exportCSV = useCallback(() => {
    if (!analysisResults) return;
    
    const rows = [
      ['Metric', 'Value', 'Unit'],
      ['Max Displacement X', analysisResults.displacements.max.x.toString(), 'mm'],
      ['Max Displacement Y', analysisResults.displacements.max.y.toString(), 'mm'],
      ['Max Displacement Z', analysisResults.displacements.max.z.toString(), 'mm'],
      ['Max Displacement Magnitude', analysisResults.displacements.max.magnitude.toString(), 'mm'],
      ['Max Von Mises Stress', analysisResults.stress.vonMises.max.toString(), 'Pa'],
      ['Min Von Mises Stress', analysisResults.stress.vonMises.min.toString(), 'Pa'],
      ['Avg Von Mises Stress', analysisResults.stress.vonMises.avg.toString(), 'Pa'],
    ];

    if (analysisResults.safetyFactors) {
      rows.push(['Min Safety Factor', analysisResults.safetyFactors.min.toString(), '-']);
      rows.push(['Avg Safety Factor', analysisResults.safetyFactors.avg.toString(), '-']);
    }

    if (analysisResults.reactions) {
      rows.push(['Reaction Force X', analysisResults.reactions.totalForce[0].toString(), 'N']);
      rows.push(['Reaction Force Y', analysisResults.reactions.totalForce[1].toString(), 'N']);
      rows.push(['Reaction Force Z', analysisResults.reactions.totalForce[2].toString(), 'N']);
    }

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    if (typeof window !== 'undefined') {
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `analysis_results_${analysisResults.jobId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [analysisResults]);

  const downloadVTK = useCallback(async () => {
    if (!analysisResults?.outputFiles?.vtk) return;
    
    try {
      const blob = await feaSolverClient.downloadFile(analysisResults.jobId, 'results.vtu');
      const url = URL.createObjectURL(blob);
      if (typeof window !== 'undefined') {
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${analysisResults.jobId}_results.vtu`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download VTK:', error);
    }
  }, [analysisResults]);

  const canRunAnalysis = meshData && boundaryConditions.filter(bc => bc.enabled).length > 0 && !isRunning;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-cad-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/project/${projectId}/schematic`}
              className="flex items-center gap-2 text-cad-text-dim hover:text-cad-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-sans">Schematic</span>
            </Link>
            <div className="w-px h-6 bg-cad-border" />
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cad-accent" />
              <h1 className="font-serif text-lg text-cad-text">Analysis Results</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={cancelAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-sans hover:bg-red-600 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Cancel
              </button>
            ) : (
              <button
                onClick={runAnalysis}
                disabled={!canRunAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-sans hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Run Analysis
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      {isRunning && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center gap-4">
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            <div className="flex-1">
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${runProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-blue-700 font-sans">{runProgress.toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Error Message */}
          {runError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-700 font-sans font-medium">Analysis Failed</h4>
                <p className="text-red-600 text-sm font-sans mt-1">{runError}</p>
              </div>
            </div>
          )}

          {/* Pre-analysis warnings */}
          {!meshData && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-700 font-sans font-medium">Mesh Required</h4>
                <p className="text-yellow-600 text-sm font-sans mt-1">
                  Generate a mesh before running the analysis.{' '}
                  <Link href={`/project/${projectId}/mesh`} className="text-cad-accent hover:underline">
                    Go to Mesh →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {boundaryConditions.filter(bc => bc.enabled).length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-700 font-sans font-medium">Boundary Conditions Required</h4>
                <p className="text-yellow-600 text-sm font-sans mt-1">
                  Add at least one boundary condition before running the analysis.{' '}
                  <Link href={`/project/${projectId}/setup`} className="text-cad-accent hover:underline">
                    Go to Setup →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Results Content */}
          {analysisResults ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Results Panel */}
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-cad-border bg-white">
                  {(['summary', 'displacement', 'stress', 'export'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-sm font-sans font-medium border-b-2 transition-colors capitalize ${
                        activeTab === tab
                          ? 'text-cad-accent border-cad-accent'
                          : 'text-cad-text-dim border-transparent hover:text-cad-text'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Summary Tab */}
                {activeTab === 'summary' && (
                  <div className="bg-white border border-cad-border p-6 space-y-6">
                    {/* Success Badge */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="text-green-700 font-sans font-medium">Analysis Complete</span>
                        {analysisResults.computationTime && (
                          <span className="text-green-600 text-sm font-sans ml-2">
                            ({analysisResults.computationTime.toFixed(1)}s)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key Results */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded">
                        <span className="text-xs text-cad-text-dim font-sans block">Max Displacement</span>
                        <span className="text-lg font-sans font-semibold text-cad-text">
                          {formatDisplacement(analysisResults.displacements.max.magnitude)}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded">
                        <span className="text-xs text-cad-text-dim font-sans block">Max Von Mises Stress</span>
                        <span className="text-lg font-sans font-semibold text-cad-text">
                          {formatStress(analysisResults.stress.vonMises.max)}
                        </span>
                      </div>
                    </div>

                    {/* Safety Factor */}
                    {analysisResults.safetyFactors && (
                      <div className="p-4 border border-cad-border rounded">
                        <span className="text-xs text-cad-text-dim font-sans block mb-2">Safety Factor</span>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-xs text-cad-text-dim font-sans">Min:</span>
                            <span className={`text-xl font-sans font-bold ml-2 ${
                              analysisResults.safetyFactors.min < 1 ? 'text-red-600' :
                              analysisResults.safetyFactors.min < 1.5 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {analysisResults.safetyFactors.min.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-cad-text-dim font-sans">Avg:</span>
                            <span className="text-xl font-sans font-bold text-cad-text ml-2">
                              {analysisResults.safetyFactors.avg.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reactions */}
                    {analysisResults.reactions && (
                      <div className="p-4 border border-cad-border rounded">
                        <span className="text-xs text-cad-text-dim font-sans block mb-2">Reaction Forces</span>
                        <div className="grid grid-cols-3 gap-2 text-sm font-sans">
                          <div>
                            <span className="text-cad-text-dim">Fx:</span>
                            <span className="ml-1 text-cad-text">{formatNumber(analysisResults.reactions.totalForce[0])} N</span>
                          </div>
                          <div>
                            <span className="text-cad-text-dim">Fy:</span>
                            <span className="ml-1 text-cad-text">{formatNumber(analysisResults.reactions.totalForce[1])} N</span>
                          </div>
                          <div>
                            <span className="text-cad-text-dim">Fz:</span>
                            <span className="ml-1 text-cad-text">{formatNumber(analysisResults.reactions.totalForce[2])} N</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Displacement Tab */}
                {activeTab === 'displacement' && (
                  <div className="bg-white border border-cad-border p-6 space-y-6">
                    <BarChart
                      title="Displacement Components"
                      data={[
                        analysisResults.displacements.max.x,
                        analysisResults.displacements.max.y,
                        analysisResults.displacements.max.z,
                        analysisResults.displacements.max.magnitude,
                      ]}
                      labels={['X', 'Y', 'Z', 'Magnitude']}
                      color="#3b82f6"
                    />

                    <div className="space-y-3 pt-4 border-t border-cad-border">
                      <h4 className="text-sm font-sans font-medium text-cad-text">Max Displacements</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm font-sans">
                        <div className="flex justify-between">
                          <span className="text-cad-text-dim">X:</span>
                          <span className="text-cad-text">{formatDisplacement(analysisResults.displacements.max.x)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cad-text-dim">Y:</span>
                          <span className="text-cad-text">{formatDisplacement(analysisResults.displacements.max.y)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cad-text-dim">Z:</span>
                          <span className="text-cad-text">{formatDisplacement(analysisResults.displacements.max.z)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cad-text-dim">Magnitude:</span>
                          <span className="text-cad-accent font-medium">{formatDisplacement(analysisResults.displacements.max.magnitude)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stress Tab */}
                {activeTab === 'stress' && (
                  <div className="bg-white border border-cad-border p-6 space-y-6">
                    <BarChart
                      title="Von Mises Stress"
                      data={[
                        analysisResults.stress.vonMises.max,
                        analysisResults.stress.vonMises.avg,
                        analysisResults.stress.vonMises.min,
                      ]}
                      labels={['Max', 'Avg', 'Min']}
                      color="#ef4444"
                    />

                    <div className="space-y-3 pt-4 border-t border-cad-border">
                      <h4 className="text-sm font-sans font-medium text-cad-text">Stress Values</h4>
                      <div className="space-y-2 text-sm font-sans">
                        <div className="flex justify-between">
                          <span className="text-cad-text-dim">Max Von Mises:</span>
                          <span className="text-red-600 font-medium">{formatStress(analysisResults.stress.vonMises.max)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cad-text-dim">Average:</span>
                          <span className="text-cad-text">{formatStress(analysisResults.stress.vonMises.avg)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cad-text-dim">Min:</span>
                          <span className="text-cad-text">{formatStress(analysisResults.stress.vonMises.min)}</span>
                        </div>
                      </div>
                    </div>

                    {analysisResults.stress.principal && (
                      <div className="space-y-3 pt-4 border-t border-cad-border">
                        <h4 className="text-sm font-sans font-medium text-cad-text">Principal Stresses</h4>
                        <div className="space-y-2 text-sm font-sans">
                          <div className="flex justify-between">
                            <span className="text-cad-text-dim">σ₁ (Max):</span>
                            <span className="text-cad-text">{formatStress(analysisResults.stress.principal.sigma1.max)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cad-text-dim">σ₂ (Mid):</span>
                            <span className="text-cad-text">{formatStress(analysisResults.stress.principal.sigma2.max)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-cad-text-dim">σ₃ (Min):</span>
                            <span className="text-cad-text">{formatStress(analysisResults.stress.principal.sigma3.max)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Export Tab */}
                {activeTab === 'export' && (
                  <div className="bg-white border border-cad-border p-6 space-y-4">
                    <h3 className="text-base font-sans font-medium text-cad-text">Export Results</h3>
                    
                    <button
                      onClick={exportCSV}
                      className="w-full flex items-center gap-3 p-4 border border-cad-border hover:border-cad-accent hover:bg-cad-accent/5 transition-colors"
                    >
                      <FileSpreadsheet className="w-6 h-6 text-green-600" />
                      <div className="text-left">
                        <span className="block text-sm font-sans font-medium text-cad-text">Export CSV</span>
                        <span className="text-xs text-cad-text-dim font-sans">Spreadsheet-compatible format</span>
                      </div>
                      <Download className="w-4 h-4 text-cad-text-dim ml-auto" />
                    </button>

                    {analysisResults.outputFiles?.vtk && (
                      <button
                        onClick={downloadVTK}
                        className="w-full flex items-center gap-3 p-4 border border-cad-border hover:border-cad-accent hover:bg-cad-accent/5 transition-colors"
                      >
                        <FileType className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                          <span className="block text-sm font-sans font-medium text-cad-text">Download VTK</span>
                          <span className="text-xs text-cad-text-dim font-sans">For ParaView visualization</span>
                        </div>
                        <Download className="w-4 h-4 text-cad-text-dim ml-auto" />
                      </button>
                    )}

                    <div className="pt-4 border-t border-cad-border">
                      <span className="text-xs text-cad-text-dim font-sans">Job ID: {analysisResults.jobId}</span>
                    </div>
                  </div>
                )}

                {/* Run Again Button */}
                <button
                  onClick={runAnalysis}
                  disabled={isRunning}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-cad-text text-sm font-sans hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Run Analysis Again
                </button>
              </div>

              {/* 3D Preview */}
              <div className="lg:col-span-2 bg-white border border-cad-border">
                <div className="p-4 border-b border-cad-border">
                  <h2 className="font-serif text-lg text-cad-text">Results Visualization</h2>
                </div>
                
                <div className="h-[600px] relative">
                  <Viewport3D />
                </div>
              </div>
            </div>
          ) : (
            /* No Results Yet */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-cad-border p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-serif text-lg text-cad-text mb-2">No Results Yet</h3>
                <p className="text-sm text-cad-text-dim font-sans mb-6">
                  Click "Run Analysis" to solve the finite element model and view results.
                </p>
                <button
                  onClick={runAnalysis}
                  disabled={!canRunAnalysis}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white text-sm font-sans hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Run Analysis
                </button>
              </div>

              {/* 3D Preview */}
              <div className="lg:col-span-2 bg-white border border-cad-border">
                <div className="p-4 border-b border-cad-border">
                  <h2 className="font-serif text-lg text-cad-text">Model Preview</h2>
                </div>
                
                <div className="h-[600px] relative">
                  <Viewport3D />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
