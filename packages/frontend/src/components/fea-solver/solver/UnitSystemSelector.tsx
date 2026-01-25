/**
 * UnitSystemSelector Component
 * Select the unit system for analysis
 */

import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import type { UnitSystemType } from '../../../lib/fea-solver/types';

interface UnitSystemSelectorProps {
  value: UnitSystemType;
  onChange: (type: UnitSystemType) => void;
}

const UNIT_SYSTEMS = [
  {
    type: 'SI' as UnitSystemType,
    name: 'SI (meters)',
    description: 'Length: m, Force: N, Stress: Pa',
    units: {
      length: 'm',
      force: 'N',
      stress: 'Pa',
      mass: 'kg'
    }
  },
  {
    type: 'SI_MM' as UnitSystemType,
    name: 'SI (millimeters)',
    description: 'Length: mm, Force: N, Stress: MPa',
    units: {
      length: 'mm',
      force: 'N',
      stress: 'MPa',
      mass: 'tonne'
    }
  },
  {
    type: 'US_CUSTOMARY' as UnitSystemType,
    name: 'US Customary',
    description: 'Length: in, Force: lbf, Stress: psi',
    units: {
      length: 'in',
      force: 'lbf',
      stress: 'psi',
      mass: 'lbm'
    }
  }
];

export function UnitSystemSelector({ value, onChange }: UnitSystemSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-cad-text">Unit System</h2>
        <p className="text-sm text-cad-text-dim mt-1">
          Select the unit system for input and output
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {UNIT_SYSTEMS.map((system) => (
            <button
              key={system.type}
              type="button"
              onClick={() => onChange(system.type)}
              className={`
                w-full p-3 text-left border transition-all
                ${value === system.type 
                  ? 'border-cad-accent bg-blue-50/50 ring-2 ring-cad-accent/20' 
                  : 'border-cad-border hover:border-cad-accent/50 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-cad-text">{system.name}</h4>
                  <p className="text-xs text-cad-text-dim mt-1">{system.description}</p>
                </div>
                {value === system.type && (
                  <svg className="w-5 h-5 text-cad-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected unit details */}
        <div className="mt-4 p-3 bg-gray-50 border border-cad-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-cad-text-dim">Length:</span>
              <span className="ml-2 font-medium text-cad-text">
                {UNIT_SYSTEMS.find(s => s.type === value)?.units.length}
              </span>
            </div>
            <div>
              <span className="text-cad-text-dim">Force:</span>
              <span className="ml-2 font-medium text-cad-text">
                {UNIT_SYSTEMS.find(s => s.type === value)?.units.force}
              </span>
            </div>
            <div>
              <span className="text-cad-text-dim">Stress:</span>
              <span className="ml-2 font-medium text-cad-text">
                {UNIT_SYSTEMS.find(s => s.type === value)?.units.stress}
              </span>
            </div>
            <div>
              <span className="text-cad-text-dim">Mass:</span>
              <span className="ml-2 font-medium text-cad-text">
                {UNIT_SYSTEMS.find(s => s.type === value)?.units.mass}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
