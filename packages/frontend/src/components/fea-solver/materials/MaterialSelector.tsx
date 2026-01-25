/**
 * MaterialSelector Component
 * Material selection from preset library
 */

import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useMaterials } from '../../../lib/fea-solver/hooks/useMaterials';
import type { MaterialProperties } from '../../../lib/fea-solver/types';

interface MaterialSelectorProps {
  value: string;
  onChange: (materialId: string) => void;
}

function MaterialCard({ 
  material, 
  isSelected, 
  onClick,
  formatValue 
}: { 
  material: MaterialProperties; 
  isSelected: boolean; 
  onClick: () => void;
  formatValue: (value: number, unit: string) => string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full p-4 text-left border transition-all
        ${isSelected 
          ? 'border-cad-accent bg-blue-50/50 ring-2 ring-cad-accent/20' 
          : 'border-cad-border hover:border-cad-accent/50 hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-cad-text">{material.name}</h4>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-cad-text-dim">
            <span>E: {formatValue(material.youngs_modulus, 'Pa')}</span>
            <span>ν: {material.poissons_ratio.toFixed(2)}</span>
            <span>ρ: {material.density.toLocaleString()} kg/m³</span>
            {material.yield_strength && (
              <span>σy: {formatValue(material.yield_strength, 'Pa')}</span>
            )}
          </div>
        </div>
        {isSelected && (
          <div className="flex-shrink-0 ml-2">
            <svg className="w-5 h-5 text-cad-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

export function MaterialSelector({ value, onChange }: MaterialSelectorProps) {
  const { materials, isLoading, formatPropertyValue } = useMaterials();
  
  // Group materials by category
  const metals = materials.filter(m => 
    m.id.includes('steel') || m.id.includes('aluminum') || 
    m.id.includes('titanium') || m.id.includes('copper') ||
    m.id.includes('stainless')
  );
  
  const plastics = materials.filter(m => 
    m.id.includes('plastic') || m.id.includes('nylon') || m.id.includes('abs')
  );
  
  const other = materials.filter(m => 
    !metals.includes(m) && !plastics.includes(m)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-cad-text">Material</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-cad-accent" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-2 text-sm text-cad-text-dim">Loading materials...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-cad-text">Material</h2>
        <p className="text-sm text-cad-text-dim mt-1">
          Select a material for the analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metals */}
        {metals.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-cad-text-dim uppercase tracking-wide mb-2">
              Metals
            </h3>
            <div className="space-y-2">
              {metals.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isSelected={value === material.id}
                  onClick={() => onChange(material.id)}
                  formatValue={formatPropertyValue}
                />
              ))}
            </div>
          </div>
        )}

        {/* Plastics */}
        {plastics.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-cad-text-dim uppercase tracking-wide mb-2">
              Plastics
            </h3>
            <div className="space-y-2">
              {plastics.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isSelected={value === material.id}
                  onClick={() => onChange(material.id)}
                  formatValue={formatPropertyValue}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other */}
        {other.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-cad-text-dim uppercase tracking-wide mb-2">
              Other
            </h3>
            <div className="space-y-2">
              {other.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isSelected={value === material.id}
                  onClick={() => onChange(material.id)}
                  formatValue={formatPropertyValue}
                />
              ))}
            </div>
          </div>
        )}

        {/* Selected Material Summary */}
        {value && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cad-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-cad-text">
                <strong>{materials.find(m => m.id === value)?.name}</strong> selected
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
