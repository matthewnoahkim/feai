/**
 * MaterialPanel - Material library and assignment interface
 */

import React, { useState } from 'react';
import { useFEAStore } from '../../store/feaStore';
import { useDocumentStore } from '../../store/documentStore';
import { FEAMaterial, FEAMaterialCategory } from '@feai/shared';

const CategoryColors: Record<FEAMaterialCategory, string> = {
  metal: 'bg-slate-500',
  plastic: 'bg-purple-500',
  composite: 'bg-green-500',
  ceramic: 'bg-orange-500',
  rubber: 'bg-gray-700',
  custom: 'bg-blue-500',
};

export function MaterialPanel() {
  const { document } = useDocumentStore();
  const {
    availableMaterials,
    materialAssignments,
    assignMaterial,
    unassignMaterial,
    addMaterial,
  } = useFEAStore();

  const [showLibrary, setShowLibrary] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('steel-1018');
  
  // Custom material form state
  const [customMaterial, setCustomMaterial] = useState({
    name: '',
    youngsModulus: 200e9,
    poissonsRatio: 0.3,
    density: 7800,
    yieldStrength: 250e6,
  });

  // Get parts from document
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId);
  const parts = activePartStudio?.parts || [];

  const handleAssignToAll = () => {
    for (const part of parts) {
      assignMaterial(part.id, part.name, selectedMaterialId);
    }
  };

  const handleAddCustomMaterial = () => {
    const id = `custom-${Date.now()}`;
    const newMaterial: FEAMaterial = {
      id,
      name: customMaterial.name || 'Custom Material',
      category: 'custom',
      isPreset: false,
      properties: {
        youngsModulus: customMaterial.youngsModulus,
        poissonsRatio: customMaterial.poissonsRatio,
        density: customMaterial.density,
        yieldStrength: customMaterial.yieldStrength,
      },
    };
    addMaterial(newMaterial);
    setSelectedMaterialId(id);
    setShowCustomForm(false);
    setCustomMaterial({
      name: '',
      youngsModulus: 200e9,
      poissonsRatio: 0.3,
      density: 7800,
      yieldStrength: 250e6,
    });
  };

  const selectedMaterial = availableMaterials.find(m => m.id === selectedMaterialId);

  const formatValue = (value: number, type: 'modulus' | 'stress' | 'density') => {
    if (type === 'modulus' || type === 'stress') {
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)} GPa`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)} MPa`;
      return `${value.toFixed(0)} Pa`;
    }
    return `${value.toFixed(0)} kg/m³`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Material Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Select Material
        </label>
        <select
          value={selectedMaterialId}
          onChange={(e) => setSelectedMaterialId(e.target.value)}
          className="w-full px-3 py-2 bg-cad-darker border border-cad-border rounded-lg text-sm text-cad-text focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {availableMaterials.map((mat) => (
            <option key={mat.id} value={mat.id}>
              {mat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Material Properties Preview */}
      {selectedMaterial && (
        <div className="p-3 bg-cad-darker rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${CategoryColors[selectedMaterial.category]}`} />
            <span className="text-sm font-medium text-cad-text">{selectedMaterial.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-cad-text-dim">Young's Modulus:</div>
            <div className="text-cad-text font-medium">{formatValue(selectedMaterial.properties.youngsModulus, 'modulus')}</div>
            <div className="text-cad-text-dim">Poisson's Ratio:</div>
            <div className="text-cad-text font-medium">{selectedMaterial.properties.poissonsRatio.toFixed(3)}</div>
            {selectedMaterial.properties.density && (
              <>
                <div className="text-cad-text-dim">Density:</div>
                <div className="text-cad-text font-medium">{formatValue(selectedMaterial.properties.density, 'density')}</div>
              </>
            )}
            {selectedMaterial.properties.yieldStrength && (
              <>
                <div className="text-cad-text-dim">Yield Strength:</div>
                <div className="text-cad-text font-medium">{formatValue(selectedMaterial.properties.yieldStrength, 'stress')}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAssignToAll}
          className="flex-1 py-2 px-3 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors"
        >
          Assign to All Parts
        </button>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="py-2 px-3 bg-cad-border text-cad-text rounded-lg text-xs hover:bg-cad-border/70 transition-colors"
          title="Add Custom Material"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Custom Material Form */}
      {showCustomForm && (
        <div className="p-3 bg-cad-darker border border-cad-border rounded-lg space-y-3">
          <div className="text-sm font-medium text-cad-text">Add Custom Material</div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Material Name"
              value={customMaterial.name}
              onChange={(e) => setCustomMaterial({ ...customMaterial, name: e.target.value })}
              className="w-full px-2 py-1.5 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-cad-text-dim">E (GPa)</label>
                <input
                  type="number"
                  value={customMaterial.youngsModulus / 1e9}
                  onChange={(e) => setCustomMaterial({ ...customMaterial, youngsModulus: parseFloat(e.target.value) * 1e9 })}
                  className="w-full px-2 py-1 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                />
              </div>
              <div>
                <label className="text-xs text-cad-text-dim">Poisson (ν)</label>
                <input
                  type="number"
                  step="0.01"
                  value={customMaterial.poissonsRatio}
                  onChange={(e) => setCustomMaterial({ ...customMaterial, poissonsRatio: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                />
              </div>
              <div>
                <label className="text-xs text-cad-text-dim">Density (kg/m³)</label>
                <input
                  type="number"
                  value={customMaterial.density}
                  onChange={(e) => setCustomMaterial({ ...customMaterial, density: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                />
              </div>
              <div>
                <label className="text-xs text-cad-text-dim">Yield (MPa)</label>
                <input
                  type="number"
                  value={customMaterial.yieldStrength / 1e6}
                  onChange={(e) => setCustomMaterial({ ...customMaterial, yieldStrength: parseFloat(e.target.value) * 1e6 })}
                  className="w-full px-2 py-1 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddCustomMaterial}
              className="flex-1 py-1.5 bg-green-500/20 text-green-400 rounded text-xs font-medium hover:bg-green-500/30"
            >
              Add Material
            </button>
            <button
              onClick={() => setShowCustomForm(false)}
              className="py-1.5 px-3 text-cad-text-dim rounded text-xs hover:bg-cad-border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Part Assignments */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Part Assignments
        </label>
        
        {parts.length === 0 ? (
          <p className="text-xs text-cad-text-dim text-center py-4">
            No parts in the model
          </p>
        ) : (
          <div className="space-y-1">
            {parts.map((part) => {
              const assignment = materialAssignments.find(a => a.partId === part.id);
              const mat = assignment ? availableMaterials.find(m => m.id === assignment.materialId) : null;

              return (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-2 bg-cad-darker rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded bg-cad-border flex items-center justify-center">
                      <svg className="w-4 h-4 text-cad-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-cad-text truncate">{part.name}</div>
                      {mat ? (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <div className={`w-2 h-2 rounded ${CategoryColors[mat.category]}`} />
                          {mat.name}
                        </div>
                      ) : (
                        <div className="text-xs text-cad-text-dim">No material</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => assignMaterial(part.id, part.name, selectedMaterialId)}
                      className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                      title="Assign selected material"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    {assignment && (
                      <button
                        onClick={() => unassignMaterial(part.id)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        title="Remove assignment"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Material Library Toggle */}
      <button
        onClick={() => setShowLibrary(!showLibrary)}
        className="flex items-center gap-2 text-xs text-cad-text-dim hover:text-cad-text transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showLibrary ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Material Library ({availableMaterials.filter(m => m.isPreset).length} presets)
      </button>

      {/* Material Library List */}
      {showLibrary && (
        <div className="max-h-48 overflow-y-auto space-y-1 pl-4 border-l-2 border-cad-border">
          {availableMaterials.filter(m => m.isPreset).map((mat) => (
            <button
              key={mat.id}
              onClick={() => setSelectedMaterialId(mat.id)}
              className={`
                w-full flex items-center gap-2 p-2 rounded text-left text-xs transition-colors
                ${selectedMaterialId === mat.id
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'hover:bg-cad-border text-cad-text'
                }
              `}
            >
              <div className={`w-2 h-2 rounded ${CategoryColors[mat.category]}`} />
              <span className="flex-1 truncate">{mat.name}</span>
              <span className="text-cad-text-dim">{formatValue(mat.properties.youngsModulus, 'modulus')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

