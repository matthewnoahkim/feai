/**
 * Analysis Type Selector Component
 * Allows user to choose between different FEA analysis types:
 * - Static Structural
 * - Modal (Eigenfrequency)
 * - Buckling
 * - Thermal (Steady-State)
 * - Nonlinear Static
 */

import React from 'react';
import type { AnalysisType } from '@feai/shared';

interface AnalysisTypeSelectorProps {
  value: AnalysisType;
  onChange: (type: AnalysisType) => void;
  disabled?: boolean;
}

interface AnalysisTypeInfo {
  type: AnalysisType;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const ANALYSIS_TYPES: AnalysisTypeInfo[] = [
  {
    type: 'static',
    label: 'Static Structural',
    description: 'Linear static stress analysis under constant loads',
    icon: '📊',
    enabled: true,
  },
  {
    type: 'modal',
    label: 'Modal Analysis',
    description: 'Natural frequencies and mode shapes',
    icon: '🎵',
    enabled: true,
  },
  {
    type: 'buckling',
    label: 'Buckling',
    description: 'Critical buckling loads and modes',
    icon: '📉',
    enabled: true,
  },
  {
    type: 'thermal',
    label: 'Thermal',
    description: 'Steady-state heat transfer analysis',
    icon: '🌡️',
    enabled: true,
  },
  {
    type: 'nonlinearStatic',
    label: 'Nonlinear Static',
    description: 'Static analysis with nonlinear effects (Advanced)',
    icon: '🔧',
    enabled: false, // Not yet fully implemented
  },
];

export function AnalysisTypeSelector({ value, onChange, disabled }: AnalysisTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Analysis Type
      </label>
      
      <div className="grid grid-cols-1 gap-2">
        {ANALYSIS_TYPES.map((analysisType) => (
          <button
            key={analysisType.type}
            type="button"
            disabled={disabled || !analysisType.enabled}
            onClick={() => onChange(analysisType.type)}
            className={`
              relative flex items-start p-3 border-2 text-left transition
              ${
                value === analysisType.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
              ${disabled || !analysisType.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex-shrink-0 text-2xl mr-3">
              {analysisType.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${value === analysisType.type ? 'text-blue-900' : 'text-gray-900'}`}>
                  {analysisType.label}
                </span>
                {!analysisType.enabled && (
                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600">
                    Coming Soon
                  </span>
                )}
              </div>
              
              <p className={`text-sm mt-1 ${value === analysisType.type ? 'text-blue-700' : 'text-gray-500'}`}>
                {analysisType.description}
              </p>
            </div>
            
            {value === analysisType.type && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-5 h-5 bg-cad-accent flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Analysis-specific settings panel */}
      <AnalysisSettings type={value} />
    </div>
  );
}

interface AnalysisSettingsProps {
  type: AnalysisType;
}

function AnalysisSettings({ type }: AnalysisSettingsProps) {
  if (type === 'modal') {
    return (
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Modes
        </label>
        <input
          type="number"
          min="1"
          max="50"
          defaultValue="10"
          className="w-full px-3 py-2 border border-gray-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          Number of natural frequencies and mode shapes to compute (1-50)
        </p>
      </div>
    );
  }
  
  if (type === 'buckling') {
    return (
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Buckling Modes
        </label>
        <input
          type="number"
          min="1"
          max="20"
          defaultValue="5"
          className="w-full px-3 py-2 border border-gray-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          Number of buckling modes to compute (1-20)
        </p>
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200">
          <p className="text-xs text-yellow-800">
            ⚠️ Buckling analysis requires compressive loads to be applied
          </p>
        </div>
      </div>
    );
  }
  
  if (type === 'thermal') {
    return (
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
        <p className="text-sm text-gray-600">
          For thermal analysis:
        </p>
        <ul className="text-xs text-gray-500 mt-2 space-y-1 list-disc list-inside">
          <li>Use temperature constraints for fixed temperatures</li>
          <li>Materials must have thermal properties defined</li>
          <li>Results will show temperature distribution</li>
        </ul>
      </div>
    );
  }
  
  if (type === 'nonlinearStatic') {
    return (
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
        <div className="p-2 bg-orange-50 border border-orange-200">
          <p className="text-xs text-orange-800">
            🚧 Nonlinear analysis is currently in development
          </p>
        </div>
      </div>
    );
  }
  
  // Static - no special settings
  return null;
}

export default AnalysisTypeSelector;

