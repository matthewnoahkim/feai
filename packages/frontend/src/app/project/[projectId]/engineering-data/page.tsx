'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Check, 
  Star,
  Edit2,
  X,
  Database
} from 'lucide-react';
import { useWorkflowStore, CustomMaterial } from '@/store/workflowStore';
import { useProjectStore } from '@/store/projectStore';

const CATEGORY_COLORS: Record<string, string> = {
  steel: '#71797E',
  aluminum: '#A8A9AD',
  titanium: '#878681',
  stainless: '#C0C0C0',
  plastic: '#2C2C2C',
  nylon: '#F5F5DC',
  custom: '#3b82f6',
};

function getMaterialCategory(material: CustomMaterial): string {
  const name = material.name.toLowerCase();
  if (name.includes('steel')) return 'steel';
  if (name.includes('aluminum') || name.includes('aluminium')) return 'aluminum';
  if (name.includes('titanium')) return 'titanium';
  if (name.includes('stainless')) return 'stainless';
  if (name.includes('abs') || name.includes('plastic')) return 'plastic';
  if (name.includes('nylon')) return 'nylon';
  return 'custom';
}

function formatValue(value: number, type: 'modulus' | 'stress' | 'density'): string {
  if (type === 'modulus' || type === 'stress') {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)} GPa`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)} MPa`;
    return `${value.toFixed(0)} Pa`;
  }
  return `${value.toFixed(0)} kg/m³`;
}

interface MaterialFormData {
  name: string;
  youngsModulus: number;
  poissonsRatio: number;
  density: number;
  yieldStrength: number;
  ultimateStrength: number;
  thermalExpansion: number;
  color: string;
}

const DEFAULT_FORM_DATA: MaterialFormData = {
  name: '',
  youngsModulus: 200,
  poissonsRatio: 0.3,
  density: 7800,
  yieldStrength: 250,
  ultimateStrength: 400,
  thermalExpansion: 12,
  color: '#3b82f6',
};

export default function EngineeringDataPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const {
    materials,
    defaultMaterialId,
    addMaterial,
    updateMaterial,
    removeMaterial,
    setDefaultMaterial,
    updateStepStatus,
    setCurrentStep,
  } = useWorkflowStore();
  
  const { fetchProject, currentProject } = useProjectStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(DEFAULT_FORM_DATA);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep('engineering-data');
    updateStepStatus('engineering-data', 'in-progress');
    fetchProject(projectId);
  }, [projectId]);

  const handleAddMaterial = () => {
    if (!formData.name.trim()) return;
    
    addMaterial({
      name: formData.name,
      youngsModulus: formData.youngsModulus * 1e9,
      poissonsRatio: formData.poissonsRatio,
      density: formData.density,
      yieldStrength: formData.yieldStrength * 1e6,
      ultimateStrength: formData.ultimateStrength * 1e6,
      thermalExpansion: formData.thermalExpansion * 1e-6,
      color: formData.color,
      isCustom: true,
    });
    
    setFormData(DEFAULT_FORM_DATA);
    setShowAddForm(false);
  };

  const handleUpdateMaterial = () => {
    if (!editingMaterial || !formData.name.trim()) return;
    
    updateMaterial(editingMaterial, {
      name: formData.name,
      youngsModulus: formData.youngsModulus * 1e9,
      poissonsRatio: formData.poissonsRatio,
      density: formData.density,
      yieldStrength: formData.yieldStrength * 1e6,
      ultimateStrength: formData.ultimateStrength * 1e6,
      thermalExpansion: formData.thermalExpansion * 1e-6,
      color: formData.color,
    });
    
    setEditingMaterial(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const startEditing = (material: CustomMaterial) => {
    setEditingMaterial(material.id);
    setFormData({
      name: material.name,
      youngsModulus: material.youngsModulus / 1e9,
      poissonsRatio: material.poissonsRatio,
      density: material.density,
      yieldStrength: (material.yieldStrength || 0) / 1e6,
      ultimateStrength: (material.ultimateStrength || 0) / 1e6,
      thermalExpansion: (material.thermalExpansion || 0) * 1e6,
      color: material.color || '#3b82f6',
    });
    setShowAddForm(false);
  };

  const selectedMaterial = selectedMaterialId 
    ? materials.find((m) => m.id === selectedMaterialId) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-cad-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
            <span className="text-white font-serif font-bold text-sm">F</span>
          </div>
          <div className="w-px h-6 bg-cad-border" />
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cad-accent" />
            <h1 className="font-serif text-lg text-cad-text">Engineering Data</h1>
          </div>
          <span className="text-xs text-cad-text-dim font-sans">
            {currentProject?.name || 'Project'}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Materials List */}
            <div className="lg:col-span-2 bg-white border border-cad-border">
              <div className="p-4 border-b border-cad-border flex items-center justify-between">
                <h2 className="font-serif text-lg text-cad-text">Material Library</h2>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingMaterial(null);
                    setFormData(DEFAULT_FORM_DATA);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cad-accent/10 text-cad-accent text-sm font-sans hover:bg-cad-accent/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Material
                </button>
              </div>
              
              <div className="divide-y divide-cad-border max-h-[600px] overflow-y-auto">
                {materials.map((material) => {
                  const category = getMaterialCategory(material);
                  const isDefault = material.id === defaultMaterialId;
                  const isSelected = material.id === selectedMaterialId;
                  
                  return (
                    <div
                      key={material.id}
                      onClick={() => setSelectedMaterialId(material.id)}
                      className={`
                        p-4 cursor-pointer transition-colors
                        ${isSelected ? 'bg-cad-accent/5' : 'hover:bg-gray-50'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: material.color || CATEGORY_COLORS[category] }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-medium text-cad-text">
                                {material.name}
                              </span>
                              {isDefault && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-sans rounded">
                                  Default
                                </span>
                              )}
                              {material.isCustom && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-sans rounded">
                                  Custom
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-cad-text-dim font-sans mt-0.5">
                              E = {formatValue(material.youngsModulus, 'modulus')} • 
                              ν = {material.poissonsRatio.toFixed(2)} • 
                              ρ = {formatValue(material.density, 'density')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultMaterial(material.id);
                              }}
                              className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                              title="Set as default"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          {isDefault && (
                            <div className="p-2 text-yellow-500">
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                          )}
                          {material.isCustom && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(material);
                                }}
                                className="p-2 text-gray-400 hover:text-cad-accent transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMaterial(material.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Panel */}
            <div className="space-y-6">
              {/* Material Form (Add/Edit) */}
              {(showAddForm || editingMaterial) && (
                <div className="bg-white border border-cad-border">
                  <div className="p-4 border-b border-cad-border flex items-center justify-between">
                    <h3 className="font-serif text-base text-cad-text">
                      {editingMaterial ? 'Edit Material' : 'Add New Material'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingMaterial(null);
                        setFormData(DEFAULT_FORM_DATA);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-xs text-cad-text-dim font-sans mb-1">
                        Material Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Custom Steel Alloy"
                        className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">
                          Young's Modulus (GPa)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.youngsModulus}
                          onChange={(e) => setFormData({ ...formData, youngsModulus: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">
                          Poisson's Ratio
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="0.5"
                          value={formData.poissonsRatio}
                          onChange={(e) => setFormData({ ...formData, poissonsRatio: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-cad-text-dim font-sans mb-1">
                        Density (kg/m³)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={formData.density}
                        onChange={(e) => setFormData({ ...formData, density: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">
                          Yield Strength (MPa)
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={formData.yieldStrength}
                          onChange={(e) => setFormData({ ...formData, yieldStrength: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">
                          Ultimate Strength (MPa)
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={formData.ultimateStrength}
                          onChange={(e) => setFormData({ ...formData, ultimateStrength: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">
                          Thermal Expansion (μm/m·K)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.thermalExpansion}
                          onChange={(e) => setFormData({ ...formData, thermalExpansion: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">
                          Display Color
                        </label>
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-full h-10 border border-cad-border cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={editingMaterial ? handleUpdateMaterial : handleAddMaterial}
                      disabled={!formData.name.trim()}
                      className="w-full py-2 bg-cad-accent text-white text-sm font-sans hover:bg-cad-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingMaterial ? 'Update Material' : 'Add Material'}
                    </button>
                  </div>
                </div>
              )}

              {/* Selected Material Details */}
              {selectedMaterial && !showAddForm && !editingMaterial && (
                <div className="bg-white border border-cad-border">
                  <div className="p-4 border-b border-cad-border">
                    <h3 className="font-serif text-base text-cad-text">Material Properties</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded"
                        style={{ backgroundColor: selectedMaterial.color || CATEGORY_COLORS[getMaterialCategory(selectedMaterial)] }}
                      />
                      <div>
                        <h4 className="font-sans font-medium text-cad-text">{selectedMaterial.name}</h4>
                        <p className="text-xs text-cad-text-dim font-sans">
                          {selectedMaterial.isCustom ? 'Custom Material' : 'Library Material'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <PropertyRow label="Young's Modulus" value={formatValue(selectedMaterial.youngsModulus, 'modulus')} />
                      <PropertyRow label="Poisson's Ratio" value={selectedMaterial.poissonsRatio.toFixed(3)} />
                      <PropertyRow label="Density" value={formatValue(selectedMaterial.density, 'density')} />
                      {selectedMaterial.yieldStrength && (
                        <PropertyRow label="Yield Strength" value={formatValue(selectedMaterial.yieldStrength, 'stress')} />
                      )}
                      {selectedMaterial.ultimateStrength && (
                        <PropertyRow label="Ultimate Strength" value={formatValue(selectedMaterial.ultimateStrength, 'stress')} />
                      )}
                      {selectedMaterial.thermalExpansion && (
                        <PropertyRow 
                          label="Thermal Expansion" 
                          value={`${(selectedMaterial.thermalExpansion * 1e6).toFixed(1)} μm/m·K`} 
                        />
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-cad-border flex gap-2">
                      {selectedMaterial.id !== defaultMaterialId && (
                        <button
                          onClick={() => setDefaultMaterial(selectedMaterial.id)}
                          className="flex-1 py-2 bg-yellow-50 text-yellow-700 text-sm font-sans hover:bg-yellow-100 transition-colors"
                        >
                          Set as Default
                        </button>
                      )}
                      {selectedMaterial.isCustom && (
                        <button
                          onClick={() => startEditing(selectedMaterial)}
                          className="flex-1 py-2 bg-cad-accent/10 text-cad-accent text-sm font-sans hover:bg-cad-accent/20 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!selectedMaterial && !showAddForm && !editingMaterial && (
                <div className="bg-white border border-cad-border p-6">
                  <h3 className="font-serif text-base text-cad-text mb-3">Getting Started</h3>
                  <div className="space-y-2 text-sm text-cad-text-dim font-sans">
                    <p>• Select a material from the library to view its properties</p>
                    <p>• Click "Add Material" to define custom materials</p>
                    <p>• Set a default material for your geometry</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-cad-text-dim font-sans">{label}:</span>
      <span className="text-cad-text font-sans font-medium">{value}</span>
    </div>
  );
}
