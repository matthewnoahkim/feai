/**
 * SolverOptions Component
 * Configure solver parameters and options
 */

import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import type { SolverOptions as SolverOptionsType } from '../../../lib/fea-solver/types';

interface SolverOptionsProps {
  value: SolverOptionsType;
  onChange: (options: Partial<SolverOptionsType>) => void;
}

export function SolverOptions({ value, onChange }: SolverOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-cad-text">Solver Options</h2>
        <p className="text-sm text-cad-text-dim mt-1">
          Configure analysis parameters
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Finite Element Degree */}
        <Select
          label="Element Degree"
          value={String(value.fe_degree || 1)}
          onChange={(e) => onChange({ fe_degree: parseInt(e.target.value) as 1 | 2 })}
          options={[
            { value: '1', label: 'Linear (1st order) - Faster' },
            { value: '2', label: 'Quadratic (2nd order) - More accurate' }
          ]}
          helperText="Higher degree = more accurate but slower"
        />

        {/* Refinement Cycles */}
        <Input
          label="Refinement Cycles"
          type="number"
          min={0}
          max={5}
          value={value.refinement_cycles ?? 2}
          onChange={(e) => onChange({ refinement_cycles: parseInt(e.target.value) || 0 })}
          helperText="0-5: More cycles = finer mesh, slower solve"
        />

        {/* Output Options */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-cad-text">Output Options</label>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.compute_reactions ?? true}
                onChange={(e) => onChange({ compute_reactions: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-cad-text">Compute Reaction Forces</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.compute_safety_factors ?? true}
                onChange={(e) => onChange({ compute_safety_factors: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-cad-text">Compute Safety Factors</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.adaptive_refinement ?? false}
                onChange={(e) => onChange({ adaptive_refinement: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-cad-text">Adaptive Mesh Refinement</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.large_deformation ?? false}
                onChange={(e) => onChange({ large_deformation: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-cad-text">Large Deformation (Geometric Nonlinearity)</span>
            </label>
          </div>
        </div>

        {/* Advanced Options (collapsed by default) */}
        <details className="mt-4">
          <summary className="text-sm font-medium text-cad-text cursor-pointer hover:text-cad-accent">
            Advanced Options
          </summary>
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-cad-border">
            <Input
              label="Max Iterations"
              type="number"
              min={100}
              max={10000}
              value={value.max_iterations ?? 1000}
              onChange={(e) => onChange({ max_iterations: parseInt(e.target.value) || 1000 })}
              helperText="For iterative solver"
            />
            <Input
              label="Tolerance"
              type="number"
              step="1e-8"
              min={1e-12}
              max={1e-4}
              value={value.tolerance ?? 1e-6}
              onChange={(e) => onChange({ tolerance: parseFloat(e.target.value) || 1e-6 })}
              helperText="Convergence tolerance"
            />
          </div>
        </details>

        {/* Info */}
        <div className="text-xs text-cad-text-dim bg-blue-50 p-3 border border-blue-200 mt-4">
          <strong className="text-cad-text">Tip:</strong> For initial analyses, use linear elements 
          with 1-2 refinement cycles. Increase accuracy settings once the model is validated.
        </div>
      </CardContent>
    </Card>
  );
}
