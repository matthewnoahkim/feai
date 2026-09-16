/**
 * Material Library Store — account-wide materials (built-in presets + user-created
 * custom materials), backed by /api/materials. Shared across all of a user's projects,
 * unlike workflowStore's per-project state.
 *
 * Deliberately NOT persisted to localStorage: materials are server-owned now, so
 * caching a stale copy in the browser would reintroduce the exact per-browser staleness
 * problem this store replaces (see workflowStore.ts's old CustomMaterial/DEFAULT_MATERIALS).
 */

import { create } from 'zustand';

export interface Material {
  id: string;
  name: string;
  category: string;
  youngsModulus: number;       // Pa
  poissonsRatio: number;
  density: number;             // kg/m^3
  yieldStrength?: number | null;
  ultimateStrength?: number | null;
  thermalExpansion?: number | null;
  thermalConductivity?: number | null;
  specificHeat?: number | null;
  color?: string | null;
  image?: string | null;       // data:image/jpeg;base64,... — user-uploaded only
  isPreset: boolean;
  presetKey?: string | null;
}

export type CreateMaterialInput = Omit<Material, 'id' | 'isPreset' | 'presetKey'>;

interface MaterialLibraryState {
  materials: Material[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;

  fetchMaterials: (force?: boolean) => Promise<void>;
  createMaterial: (input: CreateMaterialInput) => Promise<Material>;
  updateMaterial: (id: string, updates: Partial<Material>) => Promise<Material>;
  deleteMaterial: (id: string) => Promise<void>;
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.error?.message || fallback;
}

export const useMaterialLibraryStore = create<MaterialLibraryState>((set, get) => ({
  materials: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchMaterials: async (force = false) => {
    if (get().isLoaded && !force) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/materials');
      if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to load materials'));
      const materials: Material[] = await res.json();
      set({ materials, isLoading: false, isLoaded: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load materials', isLoading: false });
    }
  },

  createMaterial: async (input) => {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to create material'));
    const material: Material = await res.json();
    set((s) => ({ materials: [...s.materials, material] }));
    return material;
  },

  updateMaterial: async (id, updates) => {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to update material'));
    const material: Material = await res.json();
    set((s) => ({ materials: s.materials.map((m) => (m.id === id ? material : m)) }));
    return material;
  },

  deleteMaterial: async (id) => {
    const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to delete material'));
    set((s) => ({ materials: s.materials.filter((m) => m.id !== id) }));
  },
}));
