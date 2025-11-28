/**
 * ResultsPanel - Results visualization controls and legend
 */

import React from 'react';
import { useFEAStore } from '../../store/feaStore';
import { 
  ResultField, 
  ColormapType, 
} from '@feai/shared';
import { COLORMAPS, interpolateColor, formatStress, formatDisplacement } from '../../utils/fea-utils';

const FieldOptions: { value: ResultField; label: string; unit: string }[] = [
  { value: 'vonMises', label: 'Von Mises Stress', unit: 'Pa' },
  { value: 'displacement', label: 'Total Displacement', unit: 'mm' },
  { value: 'ux', label: 'Displacement X', unit: 'mm' },
  { value: 'uy', label: 'Displacement Y', unit: 'mm' },
  { value: 'uz', label: 'Displacement Z', unit: 'mm' },
  { value: 'sxx', label: 'Stress XX', unit: 'Pa' },
  { value: 'syy', label: 'Stress YY', unit: 'Pa' },
  { value: 'szz', label: 'Stress ZZ', unit: 'Pa' },
];

const ColormapOptions: { value: ColormapType; label: string }[] = [
  { value: 'jet', label: 'Jet' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'viridis', label: 'Viridis' },
  { value: 'coolwarm', label: 'Cool-Warm' },
  { value: 'plasma', label: 'Plasma' },
  { value: 'turbo', label: 'Turbo' },
];

export function ResultsPanel() {
  const {
    results,
    resultsViewSettings,
    setResultsViewSettings,
    setActiveResultField,
    setDeformationScale,
    setColormap,
    toggleDeformed,
    toggleMeshOverlay,
    toggleLegend,
    probeLocation,
    probeValue,
    clearResults,
  } = useFEAStore();

  if (!results) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center">
        <svg className="w-12 h-12 text-cad-text-dim mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm text-cad-text-dim">No results available</p>
        <p className="text-xs text-cad-text-dim mt-1">Run a simulation to see results</p>
      </div>
    );
  }

  const staticResults = results.staticResults;
  if (!staticResults) {
    return (
      <div className="p-4 text-center text-sm text-cad-text-dim">
        Results format not supported
      </div>
    );
  }

  const { summary } = staticResults;
  const { activeField, deformationScale, colormap, showDeformed, showMesh, showLegend } = resultsViewSettings;

  // Get current field data
  const getFieldRange = () => {
    if (activeField === 'vonMises' || activeField.startsWith('s')) {
      return {
        min: staticResults.vonMisesStress.min,
        max: staticResults.vonMisesStress.max,
        unit: 'Pa',
        formatter: formatStress,
      };
    }
    return {
      min: staticResults.displacements.min,
      max: staticResults.displacements.max,
      unit: 'mm',
      formatter: formatDisplacement,
    };
  };

  const fieldRange = getFieldRange();

  // Generate colormap gradient
  const colormapStops = COLORMAPS[colormap];
  const gradientStops = colormapStops
    .map((stop) => `rgb(${stop.color.join(',')}) ${stop.position * 100}%`)
    .join(', ');

  return (
    <div className="p-4 space-y-4">
      {/* Summary Stats */}
      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Simulation Completed
        </div>
        <div className="text-xs text-cad-text-dim">
          Solve time: {results.solveTime.toFixed(2)}s
        </div>
      </div>

      {/* Key Results */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Key Results
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-cad-darker rounded-lg">
            <div className="text-xs text-cad-text-dim">Max Displacement</div>
            <div className="text-sm font-medium text-cad-text">
              {formatDisplacement(summary.maxDisplacement.magnitude)}
            </div>
          </div>
          <div className="p-2 bg-cad-darker rounded-lg">
            <div className="text-xs text-cad-text-dim">Max Stress</div>
            <div className="text-sm font-medium text-cad-text">
              {formatStress(summary.maxVonMisesStress.value)}
            </div>
          </div>
        </div>
      </div>

      {/* Field Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Display Field
        </label>
        <select
          value={activeField}
          onChange={(e) => setActiveResultField(e.target.value as ResultField)}
          className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded-lg text-sm text-cad-text focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {FieldOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({opt.unit})
            </option>
          ))}
        </select>
      </div>

      {/* Color Legend */}
      {showLegend && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
            Color Legend
          </label>
          <div className="bg-cad-darker rounded-lg p-3">
            <div
              className="h-4 rounded"
              style={{ background: `linear-gradient(to right, ${gradientStops})` }}
            />
            <div className="flex justify-between mt-1 text-xs text-cad-text">
              <span>{fieldRange.formatter(fieldRange.min)}</span>
              <span>{fieldRange.formatter((fieldRange.min + fieldRange.max) / 2)}</span>
              <span>{fieldRange.formatter(fieldRange.max)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Colormap Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Colormap
        </label>
        <div className="flex flex-wrap gap-1">
          {ColormapOptions.map((opt) => {
            const stops = COLORMAPS[opt.value];
            const grad = stops.map((s) => `rgb(${s.color.join(',')}) ${s.position * 100}%`).join(', ');
            return (
              <button
                key={opt.value}
                onClick={() => setColormap(opt.value)}
                className={`
                  px-2 py-1 rounded text-xs transition-all
                  ${colormap === opt.value
                    ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-cad-dark'
                    : 'hover:opacity-80'
                  }
                `}
                style={{ background: `linear-gradient(to right, ${grad})` }}
              >
                <span className="text-white text-shadow">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deformation Scale */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Deformation Scale: {deformationScale}×
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={deformationScale}
            onChange={(e) => setDeformationScale(parseInt(e.target.value))}
            className="flex-1 h-2 bg-cad-border rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <input
            type="number"
            min="1"
            max="1000"
            value={deformationScale}
            onChange={(e) => setDeformationScale(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 bg-cad-darker border border-cad-border rounded text-sm text-cad-text text-center"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDeformationScale(1)}
            className={`flex-1 py-1 rounded text-xs ${deformationScale === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-cad-border text-cad-text'}`}
          >
            1× (True)
          </button>
          <button
            onClick={() => setDeformationScale(10)}
            className={`flex-1 py-1 rounded text-xs ${deformationScale === 10 ? 'bg-blue-500/20 text-blue-400' : 'bg-cad-border text-cad-text'}`}
          >
            10×
          </button>
          <button
            onClick={() => setDeformationScale(50)}
            className={`flex-1 py-1 rounded text-xs ${deformationScale === 50 ? 'bg-blue-500/20 text-blue-400' : 'bg-cad-border text-cad-text'}`}
          >
            50×
          </button>
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Display Options
        </label>
        <div className="space-y-1">
          <label className="flex items-center gap-2 p-2 hover:bg-cad-darker rounded cursor-pointer">
            <input
              type="checkbox"
              checked={showDeformed}
              onChange={toggleDeformed}
              className="w-4 h-4 rounded border-cad-border text-blue-500 focus:ring-blue-500 focus:ring-offset-cad-dark"
            />
            <span className="text-xs text-cad-text">Show Deformed Shape</span>
          </label>
          <label className="flex items-center gap-2 p-2 hover:bg-cad-darker rounded cursor-pointer">
            <input
              type="checkbox"
              checked={showMesh}
              onChange={toggleMeshOverlay}
              className="w-4 h-4 rounded border-cad-border text-blue-500 focus:ring-blue-500 focus:ring-offset-cad-dark"
            />
            <span className="text-xs text-cad-text">Show Mesh Edges</span>
          </label>
          <label className="flex items-center gap-2 p-2 hover:bg-cad-darker rounded cursor-pointer">
            <input
              type="checkbox"
              checked={showLegend}
              onChange={toggleLegend}
              className="w-4 h-4 rounded border-cad-border text-blue-500 focus:ring-blue-500 focus:ring-offset-cad-dark"
            />
            <span className="text-xs text-cad-text">Show Legend</span>
          </label>
        </div>
      </div>

      {/* Probe Results */}
      {probeLocation && probeValue && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Probe Results
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-cad-text-dim">Location:</div>
            <div className="text-cad-text font-mono">
              ({probeLocation.x.toFixed(1)}, {probeLocation.y.toFixed(1)}, {probeLocation.z.toFixed(1)})
            </div>
            <div className="text-cad-text-dim">Displacement:</div>
            <div className="text-cad-text">{formatDisplacement(probeValue.displacement)}</div>
            <div className="text-cad-text-dim">Von Mises:</div>
            <div className="text-cad-text">{formatStress(probeValue.stress)}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 space-y-2">
        <button
          onClick={clearResults}
          className="w-full py-2 px-4 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/10 transition-colors"
        >
          Clear Results
        </button>
      </div>

      {/* Mesh Stats */}
      <div className="text-xs text-cad-text-dim text-center pt-2 border-t border-cad-border">
        {results.meshNodeCount.toLocaleString()} nodes • {results.meshElementCount.toLocaleString()} elements
      </div>
    </div>
  );
}

