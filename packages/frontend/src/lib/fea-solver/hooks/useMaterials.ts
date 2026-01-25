/**
 * useMaterials Hook
 * Fetches and manages materials from external FEA Solver
 */

import { useState, useEffect, useCallback } from 'react';
import { getMaterials } from '../client';
import type { MaterialProperties } from '../types';

// Default materials in case API is unavailable
const DEFAULT_MATERIALS: MaterialProperties[] = [
  {
    id: 'steel_structural',
    name: 'Structural Steel',
    youngs_modulus: 200e9,
    poissons_ratio: 0.30,
    density: 7850,
    yield_strength: 250e6,
    ultimate_strength: 400e6
  },
  {
    id: 'aluminum_6061_t6',
    name: 'Aluminum 6061-T6',
    youngs_modulus: 68.9e9,
    poissons_ratio: 0.33,
    density: 2700,
    yield_strength: 276e6,
    ultimate_strength: 310e6
  },
  {
    id: 'titanium_ti6al4v',
    name: 'Titanium Ti-6Al-4V',
    youngs_modulus: 113.8e9,
    poissons_ratio: 0.342,
    density: 4430,
    yield_strength: 880e6,
    ultimate_strength: 950e6
  },
  {
    id: 'stainless_304',
    name: 'Stainless Steel 304',
    youngs_modulus: 193e9,
    poissons_ratio: 0.29,
    density: 8000,
    yield_strength: 215e6,
    ultimate_strength: 505e6
  },
  {
    id: 'copper_c11000',
    name: 'Copper C11000',
    youngs_modulus: 117e9,
    poissons_ratio: 0.34,
    density: 8940,
    yield_strength: 69e6,
    ultimate_strength: 220e6
  },
  {
    id: 'abs_plastic',
    name: 'ABS Plastic',
    youngs_modulus: 2.3e9,
    poissons_ratio: 0.35,
    density: 1050,
    yield_strength: 45e6,
    ultimate_strength: 40e6
  },
  {
    id: 'nylon_66',
    name: 'Nylon 6/6',
    youngs_modulus: 3e9,
    poissons_ratio: 0.4,
    density: 1140,
    yield_strength: 77e6,
    ultimate_strength: 85e6
  }
];

export function useMaterials() {
  const [materials, setMaterials] = useState<MaterialProperties[]>(DEFAULT_MATERIALS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMaterials();
      if (response.materials && response.materials.length > 0) {
        setMaterials(response.materials);
      }
      setError(null);
    } catch (err) {
      console.warn('Failed to fetch materials, using defaults:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch materials');
      // Keep using default materials
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const getMaterialById = useCallback((id: string) => {
    return materials.find(m => m.id === id);
  }, [materials]);

  const formatPropertyValue = useCallback((value: number, unit: string) => {
    if (Math.abs(value) >= 1e9) {
      return `${(value / 1e9).toFixed(1)} G${unit}`;
    }
    if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(1)} M${unit}`;
    }
    if (Math.abs(value) >= 1e3) {
      return `${(value / 1e3).toFixed(1)} k${unit}`;
    }
    return `${value.toFixed(1)} ${unit}`;
  }, []);

  return {
    materials,
    isLoading,
    error,
    getMaterialById,
    formatPropertyValue,
    refetch: fetchMaterials
  };
}
