/**
 * ResultsDashboard Component
 * Display analysis results with summary cards and detailed sections
 */

import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { downloadFile } from '../../../lib/fea-solver/client';
import type { AnalysisResults, UnitSystemType } from '../../../lib/fea-solver/types';

interface ResultsDashboardProps {
  results: AnalysisResults;
  units: UnitSystemType;
  onNewAnalysis?: () => void;
}

export function ResultsDashboard({ results, units, onNewAnalysis }: ResultsDashboardProps) {
  const handleDownloadVTK = async () => {
    try {
      const blob = await downloadFile(results.job_id, 'results.vtu');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${results.job_id}_results.vtu`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download VTK:', error);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const blob = await downloadFile(results.job_id, 'results.csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${results.job_id}_results.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV:', error);
    }
  };

  const lengthUnit = units === 'SI' ? 'm' : units === 'SI_MM' ? 'mm' : 'in';
  const stressUnit = units === 'SI' ? 'Pa' : units === 'SI_MM' ? 'MPa' : 'psi';
  const forceUnit = units === 'SI' ? 'N' : units === 'SI_MM' ? 'N' : 'lbf';

  // Format stress value based on unit system
  const formatStress = (value: number) => {
    if (units === 'SI_MM') {
      return `${(value / 1e6).toFixed(2)} MPa`;
    } else if (units === 'SI') {
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)} GPa`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(2)} MPa`;
      return `${value.toFixed(2)} Pa`;
    } else {
      return `${(value / 6894.76).toFixed(0)} psi`;
    }
  };

  // Format displacement value
  const formatDisplacement = (value: number) => {
    if (units === 'SI_MM') {
      if (Math.abs(value) < 0.001) return `${(value * 1000).toFixed(4)} μm`;
      return `${value.toFixed(4)} mm`;
    } else if (units === 'SI') {
      if (Math.abs(value) < 0.001) return `${(value * 1000).toFixed(4)} mm`;
      return `${value.toFixed(6)} m`;
    } else {
      return `${(value * 39.3701).toFixed(6)} in`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-cad-text">Analysis Results</h2>
              <p className="text-sm text-cad-text-dim mt-1">Job ID: {results.job_id}</p>
            </div>
            <div className="flex gap-2">
              {results.output_files?.vtk && (
                <Button onClick={handleDownloadVTK} variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  VTK
                </Button>
              )}
              {results.output_files?.csv && (
                <Button onClick={handleDownloadCSV} variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV
                </Button>
              )}
              {onNewAnalysis && (
                <Button onClick={onNewAnalysis} variant="secondary" size="sm">
                  New Analysis
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Max Displacement */}
        <Card>
          <CardContent className="py-4">
            <h3 className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">Max Displacement</h3>
            <p className="text-2xl font-bold text-cad-text mt-1">
              {formatDisplacement(results.displacements.max.magnitude)}
            </p>
          </CardContent>
        </Card>

        {/* Max Von Mises Stress */}
        <Card>
          <CardContent className="py-4">
            <h3 className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">Max Von Mises Stress</h3>
            <p className="text-2xl font-bold text-cad-text mt-1">
              {formatStress(results.stress.von_mises.max)}
            </p>
          </CardContent>
        </Card>

        {/* Min Safety Factor */}
        {results.safety_factors && (
          <Card>
            <CardContent className="py-4">
              <h3 className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">Min Safety Factor</h3>
              <p className={`text-2xl font-bold mt-1 ${
                results.safety_factors.min < 1 ? 'text-red-600' :
                results.safety_factors.min < 1.5 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {results.safety_factors.min.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mesh Info */}
        {results.mesh_quality && (
          <Card>
            <CardContent className="py-4">
              <h3 className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">Elements / Nodes</h3>
              <p className="text-2xl font-bold text-cad-text mt-1">
                {results.mesh_quality.num_elements.toLocaleString()} / {results.mesh_quality.num_nodes.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Displacement Results */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-cad-text">Displacements</h3>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cad-border">
                  <th className="text-left py-2 text-cad-text-dim font-medium">Component</th>
                  <th className="text-right py-2 text-cad-text-dim font-medium">Max</th>
                  <th className="text-right py-2 text-cad-text-dim font-medium">Min</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-cad-border/50">
                  <td className="py-2 text-cad-text">X</td>
                  <td className="text-right text-cad-text">{formatDisplacement(results.displacements.max.x)}</td>
                  <td className="text-right text-cad-text">{formatDisplacement(results.displacements.min.x)}</td>
                </tr>
                <tr className="border-b border-cad-border/50">
                  <td className="py-2 text-cad-text">Y</td>
                  <td className="text-right text-cad-text">{formatDisplacement(results.displacements.max.y)}</td>
                  <td className="text-right text-cad-text">{formatDisplacement(results.displacements.min.y)}</td>
                </tr>
                <tr className="border-b border-cad-border/50">
                  <td className="py-2 text-cad-text">Z</td>
                  <td className="text-right text-cad-text">{formatDisplacement(results.displacements.max.z)}</td>
                  <td className="text-right text-cad-text">{formatDisplacement(results.displacements.min.z)}</td>
                </tr>
                <tr className="font-medium">
                  <td className="py-2 text-cad-text">Magnitude</td>
                  <td className="text-right text-cad-accent">{formatDisplacement(results.displacements.max.magnitude)}</td>
                  <td className="text-right text-cad-text">-</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Stress Results */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-cad-text">Stresses</h3>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cad-border">
                  <th className="text-left py-2 text-cad-text-dim font-medium">Type</th>
                  <th className="text-right py-2 text-cad-text-dim font-medium">Max</th>
                  <th className="text-right py-2 text-cad-text-dim font-medium">Min</th>
                  <th className="text-right py-2 text-cad-text-dim font-medium">Avg</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-medium">
                  <td className="py-2 text-cad-text">Von Mises</td>
                  <td className="text-right text-cad-accent">{formatStress(results.stress.von_mises.max)}</td>
                  <td className="text-right text-cad-text">{formatStress(results.stress.von_mises.min)}</td>
                  <td className="text-right text-cad-text">{formatStress(results.stress.von_mises.avg)}</td>
                </tr>
                {results.stress.principal && (
                  <>
                    <tr className="border-t border-cad-border/50">
                      <td className="py-2 text-cad-text">σ₁ (Max Principal)</td>
                      <td className="text-right text-cad-text">{formatStress(results.stress.principal.sigma_1.max)}</td>
                      <td className="text-right text-cad-text">{formatStress(results.stress.principal.sigma_1.min)}</td>
                      <td className="text-right text-cad-text">-</td>
                    </tr>
                    <tr className="border-t border-cad-border/50">
                      <td className="py-2 text-cad-text">σ₂ (Mid Principal)</td>
                      <td className="text-right text-cad-text">{formatStress(results.stress.principal.sigma_2.max)}</td>
                      <td className="text-right text-cad-text">{formatStress(results.stress.principal.sigma_2.min)}</td>
                      <td className="text-right text-cad-text">-</td>
                    </tr>
                    <tr className="border-t border-cad-border/50">
                      <td className="py-2 text-cad-text">σ₃ (Min Principal)</td>
                      <td className="text-right text-cad-text">{formatStress(results.stress.principal.sigma_3.max)}</td>
                      <td className="text-right text-cad-text">{formatStress(results.stress.principal.sigma_3.min)}</td>
                      <td className="text-right text-cad-text">-</td>
                    </tr>
                  </>
                )}
                {results.stress.tresca && (
                  <tr className="border-t border-cad-border/50">
                    <td className="py-2 text-cad-text">Tresca</td>
                    <td className="text-right text-cad-text">{formatStress(results.stress.tresca.max)}</td>
                    <td className="text-right text-cad-text">-</td>
                    <td className="text-right text-cad-text">-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Reactions */}
        {results.reactions && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-cad-text">Reaction Forces</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-cad-text-dim">Fx:</span>
                    <span className="ml-2 font-medium text-cad-text">
                      {results.reactions.total_force[0].toFixed(2)} {forceUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-cad-text-dim">Fy:</span>
                    <span className="ml-2 font-medium text-cad-text">
                      {results.reactions.total_force[1].toFixed(2)} {forceUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-cad-text-dim">Fz:</span>
                    <span className="ml-2 font-medium text-cad-text">
                      {results.reactions.total_force[2].toFixed(2)} {forceUnit}
                    </span>
                  </div>
                </div>
                
                {results.reactions.equilibrium && (
                  <div className={`p-2 text-sm ${
                    results.reactions.equilibrium.is_balanced 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                  }`}>
                    {results.reactions.equilibrium.is_balanced 
                      ? '✓ Forces are in equilibrium'
                      : `⚠️ Force error: ${results.reactions.equilibrium.force_error_percent.toFixed(2)}%`
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Factors */}
        {results.safety_factors && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-cad-text">Safety Factors</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-cad-text-dim">Minimum:</span>
                    <p className={`text-xl font-bold ${
                      results.safety_factors.min < 1 ? 'text-red-600' :
                      results.safety_factors.min < 1.5 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {results.safety_factors.min.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-cad-text-dim">Average:</span>
                    <p className="text-xl font-bold text-cad-text">
                      {results.safety_factors.avg.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {results.safety_factors.distribution && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-cad-text-dim uppercase">Distribution</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-red-600">Below 1.0:</span>
                        <span className="font-medium">{(results.safety_factors.distribution.below_1_0 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-600">Below 1.5:</span>
                        <span className="font-medium">{(results.safety_factors.distribution.below_1_5 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cad-text">Below 2.0:</span>
                        <span className="font-medium">{(results.safety_factors.distribution.below_2_0 * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Computation Info */}
      {results.computation_time && (
        <p className="text-sm text-cad-text-dim text-center">
          Analysis completed in {results.computation_time.toFixed(1)} seconds
        </p>
      )}
    </div>
  );
}
