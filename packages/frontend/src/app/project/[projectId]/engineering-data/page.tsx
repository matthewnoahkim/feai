'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Star,
  Edit2,
  X,
  Database,
  ImageIcon,
  Upload,
  Copy,
  Loader2,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useWorkflowStore } from '@/store/workflowStore';
import { useMaterialLibraryStore, Material, CreateMaterialInput } from '@/store/materialLibraryStore';
import { useProjectStore } from '@/store/projectStore';
import { useSchematicStore } from '@/store/schematicStore';
import { MATERIAL_CATEGORIES } from '@/schemas/materials';
import { compressImageToDataUrl } from '@/lib/image/compressImage';

const CATEGORY_FALLBACK_COLORS: Record<string, string> = {
  steel: '#71797E',
  aluminum: '#A8A9AD',
  titanium: '#878681',
  stainless: '#C0C0C0',
  plastic: '#2C2C2C',
  nylon: '#F5F5DC',
  composite: '#8B7355',
  ceramic: '#E8DCC8',
  other: '#3b82f6',
};

const CATEGORY_LABELS: Record<string, string> = {
  steel: 'Steel',
  aluminum: 'Aluminum',
  titanium: 'Titanium',
  stainless: 'Stainless',
  plastic: 'Plastic',
  nylon: 'Nylon',
  composite: 'Composite',
  ceramic: 'Ceramic',
  other: 'Other',
};

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
  category: string;
  youngsModulus: number;      // GPa in the form, Pa in storage
  poissonsRatio: number;
  density: number;            // kg/m^3
  yieldStrength: number;      // MPa in the form, Pa in storage
  ultimateStrength: number;   // MPa in the form, Pa in storage
  thermalExpansion: number;   // μm/m·K in the form, 1/K in storage
  thermalConductivity: number; // W/(m·K)
  specificHeat: number;        // J/(kg·K)
  color: string;
}

const DEFAULT_FORM_DATA: MaterialFormData = {
  name: '',
  category: 'other',
  youngsModulus: 200,
  poissonsRatio: 0.3,
  density: 7800,
  yieldStrength: 250,
  ultimateStrength: 400,
  thermalExpansion: 12,
  thermalConductivity: 50,
  specificHeat: 470,
  color: '#3b82f6',
};

function formDataToCreateInput(form: MaterialFormData, image?: string | null): CreateMaterialInput {
  return {
    name: form.name,
    category: form.category,
    youngsModulus: form.youngsModulus * 1e9,
    poissonsRatio: form.poissonsRatio,
    density: form.density,
    yieldStrength: form.yieldStrength * 1e6,
    ultimateStrength: form.ultimateStrength * 1e6,
    thermalExpansion: form.thermalExpansion * 1e-6,
    thermalConductivity: form.thermalConductivity,
    specificHeat: form.specificHeat,
    color: form.color,
    image: image ?? null,
  };
}

export default function EngineeringDataPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { defaultMaterialId, setDefaultMaterial, updateStepStatus, setCurrentStep } = useWorkflowStore();
  const { materials, isLoading, error, fetchMaterials, createMaterial, updateMaterial, deleteMaterial } =
    useMaterialLibraryStore();

  const { fetchProject, currentProject } = useProjectStore();
  const { getNodesByType, markNodeComplete } = useSchematicStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(DEFAULT_FORM_DATA);
  // The form's own pending image — separate from MaterialFormData since it's a data URL,
  // not a plain input value. Seeded from the material being edited (so saving an edit
  // doesn't silently wipe its existing photo) or left null for a fresh/duplicated material.
  const [formImage, setFormImage] = useState<string | null>(null);
  const [isCompressingFormImage, setIsCompressingFormImage] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep('engineering-data');
    updateStepStatus('engineering-data', 'in-progress');
    fetchProject(projectId);
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Engineering Data is complete when a material is selected (schematic checkmark)
  useEffect(() => {
    if (defaultMaterialId) {
      updateStepStatus('engineering-data', 'complete');
      getNodesByType('engineering-data').forEach((n) => markNodeComplete(n.id));
    } else {
      updateStepStatus('engineering-data', 'pending');
    }
  }, [defaultMaterialId, updateStepStatus, getNodesByType, markNodeComplete]);

  const closeForm = () => {
    setShowAddForm(false);
    setEditingMaterial(null);
    setFormData(DEFAULT_FORM_DATA);
    setFormImage(null);
  };

  const handleAddMaterial = async () => {
    if (!formData.name.trim()) return;
    try {
      await createMaterial(formDataToCreateInput(formData, formImage));
      closeForm();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to create material');
    }
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial || !formData.name.trim()) return;
    try {
      await updateMaterial(editingMaterial, formDataToCreateInput(formData, formImage));
      closeForm();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to update material');
    }
  };

  const handleFormImageSelected = async (file: File) => {
    setUploadError(null);
    setIsCompressingFormImage(true);
    try {
      setFormImage(await compressImageToDataUrl(file));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsCompressingFormImage(false);
    }
  };

  // Only ever called for a custom material — presets can't be opened in the edit form
  // (the API would 400 on anything but their image), so their cards only ever offer
  // "Upload Photo" and "Duplicate as Custom" instead of "Edit".
  const startEditing = (material: Material) => {
    setEditingMaterial(material.id);
    setFormData({
      name: material.name,
      category: material.category,
      youngsModulus: material.youngsModulus / 1e9,
      poissonsRatio: material.poissonsRatio,
      density: material.density,
      yieldStrength: (material.yieldStrength || 0) / 1e6,
      ultimateStrength: (material.ultimateStrength || 0) / 1e6,
      thermalExpansion: (material.thermalExpansion || 0) * 1e6,
      thermalConductivity: material.thermalConductivity || 0,
      specificHeat: material.specificHeat || 0,
      color: material.color || '#3b82f6',
    });
    // Seed from the existing photo — handleUpdateMaterial always sends the full form,
    // so leaving this null would silently wipe out an already-uploaded image on save.
    setFormImage(material.image ?? null);
    setShowAddForm(false);
  };

  // Pre-fills the create form from a preset's values — pure client-side convenience, no
  // new endpoint. Deliberately leaves the image blank: every material gets its own
  // uploaded photo, so a duplicate doesn't inherit the preset's.
  const duplicateAsCustom = (preset: Material) => {
    setEditingMaterial(null);
    setFormData({
      name: `${preset.name} (Copy)`,
      category: preset.category,
      youngsModulus: preset.youngsModulus / 1e9,
      poissonsRatio: preset.poissonsRatio,
      density: preset.density,
      yieldStrength: (preset.yieldStrength || 0) / 1e6,
      ultimateStrength: (preset.ultimateStrength || 0) / 1e6,
      thermalExpansion: (preset.thermalExpansion || 0) * 1e6,
      thermalConductivity: preset.thermalConductivity || 0,
      specificHeat: preset.specificHeat || 0,
      color: preset.color || '#3b82f6',
    });
    setFormImage(null);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial(id);
      if (defaultMaterialId === id) setDefaultMaterial(null);
      if (selectedMaterialId === id) setSelectedMaterialId(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to delete material');
    }
  };

  const handleUploadImage = async (material: Material, file: File) => {
    setUploadError(null);
    setUploadingId(material.id);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      await updateMaterial(material.id, { image: dataUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingId(null);
    }
  };

  const selectedMaterial = selectedMaterialId ? materials.find((m) => m.id === selectedMaterialId) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-cad-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="logo-link flex items-center gap-2 no-underline">
            <Logo size="md" />
          </Link>
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
          {uploadError && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-sans flex items-center justify-between">
              <span>{uploadError}</span>
              <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {error && !uploadError && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-sans">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Material Library — image-forward card grid */}
            <div className="lg:col-span-2 bg-white border border-cad-border">
              <div className="p-4 border-b border-cad-border flex items-center justify-between">
                <h2 className="font-serif text-lg text-cad-text">Material Library</h2>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingMaterial(null);
                    setFormData(DEFAULT_FORM_DATA);
                    setFormImage(null);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cad-accent/10 text-cad-accent text-sm font-sans hover:bg-cad-accent/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Material
                </button>
              </div>

              {isLoading && materials.length === 0 ? (
                <div className="p-10 flex items-center justify-center text-cad-text-dim">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm font-sans">Loading materials…</span>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[640px] overflow-y-auto">
                  {materials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      isDefault={material.id === defaultMaterialId}
                      isSelected={material.id === selectedMaterialId}
                      isUploading={uploadingId === material.id}
                      onSelect={() => setSelectedMaterialId(material.id)}
                      onSetDefault={() => setDefaultMaterial(material.id)}
                      onEdit={() => startEditing(material)}
                      onDelete={() => handleDelete(material.id)}
                      onDuplicate={() => duplicateAsCustom(material)}
                      onUploadImage={(file) => handleUploadImage(material, file)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details Panel */}
            <div className="space-y-6">
              {/* Material Form (Add/Edit — custom materials only) */}
              {(showAddForm || editingMaterial) && (
                <div className="bg-white border border-cad-border">
                  <div className="p-4 border-b border-cad-border flex items-center justify-between">
                    <h3 className="font-serif text-base text-cad-text">
                      {editingMaterial ? 'Edit Material' : 'Create Material'}
                    </h3>
                    <button onClick={closeForm} className="p-1 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-xs text-cad-text-dim font-sans mb-1">Photo</label>
                      <FormImagePicker
                        image={formImage}
                        isProcessing={isCompressingFormImage}
                        fallbackColor={formData.color}
                        onSelect={handleFormImageSelected}
                        onClear={() => setFormImage(null)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-cad-text-dim font-sans mb-1">Material Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Custom Steel Alloy"
                        className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-cad-text-dim font-sans mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent bg-white"
                      >
                        {MATERIAL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        label="Young's Modulus (GPa)"
                        value={formData.youngsModulus}
                        step={0.1}
                        onChange={(v) => setFormData({ ...formData, youngsModulus: v })}
                      />
                      <FormField
                        label="Poisson's Ratio"
                        value={formData.poissonsRatio}
                        step={0.01}
                        min={0}
                        max={0.5}
                        onChange={(v) => setFormData({ ...formData, poissonsRatio: v })}
                      />
                    </div>

                    <FormField
                      label="Density (kg/m³)"
                      value={formData.density}
                      step={1}
                      onChange={(v) => setFormData({ ...formData, density: v })}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        label="Yield Strength (MPa)"
                        value={formData.yieldStrength}
                        step={1}
                        onChange={(v) => setFormData({ ...formData, yieldStrength: v })}
                      />
                      <FormField
                        label="Ultimate Strength (MPa)"
                        value={formData.ultimateStrength}
                        step={1}
                        onChange={(v) => setFormData({ ...formData, ultimateStrength: v })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        label="Thermal Expansion (μm/m·K)"
                        value={formData.thermalExpansion}
                        step={0.1}
                        onChange={(v) => setFormData({ ...formData, thermalExpansion: v })}
                      />
                      <FormField
                        label="Thermal Conductivity (W/m·K)"
                        value={formData.thermalConductivity}
                        step={0.1}
                        onChange={(v) => setFormData({ ...formData, thermalConductivity: v })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        label="Specific Heat (J/kg·K)"
                        value={formData.specificHeat}
                        step={1}
                        onChange={(v) => setFormData({ ...formData, specificHeat: v })}
                      />
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">Display Color</label>
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
                      {editingMaterial ? 'Update Material' : 'Create Material'}
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
                      <MaterialThumbnail material={selectedMaterial} size={40} />
                      <div>
                        <h4 className="font-sans font-medium text-cad-text">{selectedMaterial.name}</h4>
                        <p className="text-xs text-cad-text-dim font-sans">
                          {selectedMaterial.isPreset ? 'Library Material' : 'Custom Material'} ·{' '}
                          {CATEGORY_LABELS[selectedMaterial.category] || selectedMaterial.category}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <PropertyRow label="Young's Modulus" value={formatValue(selectedMaterial.youngsModulus, 'modulus')} />
                      <PropertyRow label="Poisson's Ratio" value={selectedMaterial.poissonsRatio.toFixed(3)} />
                      <PropertyRow label="Density" value={formatValue(selectedMaterial.density, 'density')} />
                      {!!selectedMaterial.yieldStrength && (
                        <PropertyRow label="Yield Strength" value={formatValue(selectedMaterial.yieldStrength, 'stress')} />
                      )}
                      {!!selectedMaterial.ultimateStrength && (
                        <PropertyRow label="Ultimate Strength" value={formatValue(selectedMaterial.ultimateStrength, 'stress')} />
                      )}
                      {!!selectedMaterial.thermalExpansion && (
                        <PropertyRow
                          label="Thermal Expansion"
                          value={`${(selectedMaterial.thermalExpansion * 1e6).toFixed(1)} μm/m·K`}
                        />
                      )}
                      {!!selectedMaterial.thermalConductivity && (
                        <PropertyRow label="Thermal Conductivity" value={`${selectedMaterial.thermalConductivity.toFixed(1)} W/m·K`} />
                      )}
                      {!!selectedMaterial.specificHeat && (
                        <PropertyRow label="Specific Heat" value={`${selectedMaterial.specificHeat.toFixed(0)} J/kg·K`} />
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
                      {!selectedMaterial.isPreset ? (
                        <button
                          onClick={() => startEditing(selectedMaterial)}
                          className="flex-1 py-2 bg-cad-accent/10 text-cad-accent text-sm font-sans hover:bg-cad-accent/20 transition-colors"
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => duplicateAsCustom(selectedMaterial)}
                          className="flex-1 py-2 bg-cad-accent/10 text-cad-accent text-sm font-sans hover:bg-cad-accent/20 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Duplicate as Custom
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
                    <p>• Upload your own photo for any material, presets included</p>
                    <p>• Click "Add Material" to define your own custom materials</p>
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

function FormField({
  label, value, step, min, max, onChange,
}: {
  label: string; value: number; step: number; min?: number; max?: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-cad-text-dim font-sans mb-1">{label}</label>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
      />
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

/** Image picker used inside the create/edit form — previews the pending data URL (or the
 * material's existing photo when editing), lets the user pick a new file or clear it. */
function FormImagePicker({
  image, isProcessing, fallbackColor, onSelect, onClear,
}: {
  image: string | null;
  isProcessing: boolean;
  fallbackColor: string;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-16 h-16 rounded flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ backgroundColor: image ? undefined : `${fallbackColor}22` }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon style={{ color: fallbackColor }} className="w-1/2 h-1/2" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onSelect(file);
        }}
      />
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-2.5 py-1 border border-cad-border text-xs font-sans text-cad-text-dim hover:text-cad-accent hover:border-cad-accent transition-colors"
        >
          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {image ? 'Replace photo' : 'Upload photo'}
        </button>
        {image && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-sans text-cad-text-dim hover:text-red-500 text-left"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

/** The image if the user has uploaded one for this material, else a plain tinted
 * placeholder tile — never a stock/fetched photo, including for presets. */
function MaterialThumbnail({ material, size }: { material: Material; size: number }) {
  const color = material.color || CATEGORY_FALLBACK_COLORS[material.category] || '#3b82f6';
  if (material.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={material.image}
        alt={material.name}
        style={{ width: size, height: size }}
        className="rounded object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, backgroundColor: `${color}22` }}
      className="rounded flex items-center justify-center flex-shrink-0"
    >
      <ImageIcon style={{ color }} className="w-1/2 h-1/2" />
    </div>
  );
}

function MaterialCard({
  material, isDefault, isSelected, isUploading,
  onSelect, onSetDefault, onEdit, onDelete, onDuplicate, onUploadImage,
}: {
  material: Material;
  isDefault: boolean;
  isSelected: boolean;
  isUploading: boolean;
  onSelect: () => void;
  onSetDefault: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUploadImage: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const color = material.color || CATEGORY_FALLBACK_COLORS[material.category] || '#3b82f6';

  return (
    <div
      onClick={onSelect}
      className={`
        border cursor-pointer transition-colors overflow-hidden
        ${isSelected ? 'border-cad-accent ring-1 ring-cad-accent' : 'border-cad-border hover:border-gray-400'}
      `}
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gray-50">
        {material.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={material.image} alt={material.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <ImageIcon style={{ color }} className="w-1/3 h-1/3" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onUploadImage(file);
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
          title="Upload photo"
          className="absolute bottom-1.5 right-1.5 p-1.5 bg-white/90 hover:bg-white text-cad-text-dim hover:text-cad-accent shadow-sm transition-colors"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        </button>

        {isDefault && (
          <div className="absolute top-1.5 left-1.5 p-1 bg-yellow-400 text-white rounded-full shadow-sm">
            <Star className="w-3 h-3 fill-current" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="px-1.5 py-0.5 bg-gray-100 text-cad-text-dim text-[10px] font-sans uppercase tracking-wide">
            {CATEGORY_LABELS[material.category] || material.category}
          </span>
          {!material.isPreset && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-sans rounded">Custom</span>
          )}
        </div>
        <div className="font-sans font-medium text-sm text-cad-text truncate" title={material.name}>
          {material.name}
        </div>
        <div className="text-[11px] text-cad-text-dim font-sans mt-1 leading-snug">
          E = {formatValue(material.youngsModulus, 'modulus')}<br />
          ν = {material.poissonsRatio.toFixed(2)} · ρ = {formatValue(material.density, 'density')}
        </div>

        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-cad-border">
          {!isDefault && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
              title="Set as default"
              className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
          )}
          {material.isPreset ? (
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              title="Duplicate as custom"
              className="p-1.5 text-gray-400 hover:text-cad-accent transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                title="Edit"
                className="p-1.5 text-gray-400 hover:text-cad-accent transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Delete"
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
