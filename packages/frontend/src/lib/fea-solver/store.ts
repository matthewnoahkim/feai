/**
 * External FEA Solver Store
 * State management for the external FEA Solver integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Mesh,
  BoundaryCondition,
  Load,
  MaterialAssignment,
  SolverOptions,
  UnitSystem,
  AnalysisRequest,
  UnitSystemType
} from './types';

interface ExternalFEAState {
  // Model definition
  mesh: Mesh | null;
  materials: MaterialAssignment;
  boundaryConditions: BoundaryCondition[];
  loads: Load[];
  solverOptions: SolverOptions;
  units: UnitSystem;
  
  // Actions
  setMesh: (mesh: Mesh) => void;
  setMaterials: (materials: MaterialAssignment) => void;
  addBoundaryCondition: (bc: BoundaryCondition) => void;
  removeBoundaryCondition: (index: number) => void;
  updateBoundaryCondition: (index: number, bc: BoundaryCondition) => void;
  clearBoundaryConditions: () => void;
  addLoad: (load: Load) => void;
  removeLoad: (index: number) => void;
  updateLoad: (index: number, load: Load) => void;
  clearLoads: () => void;
  setSolverOptions: (options: Partial<SolverOptions>) => void;
  setUnits: (units: UnitSystem) => void;
  setUnitType: (type: UnitSystemType) => void;
  
  // Utilities
  reset: () => void;
  getAnalysisRequest: () => AnalysisRequest | null;
  isValid: () => { valid: boolean; errors: string[] };
}

const DEFAULT_STATE = {
  mesh: null as Mesh | null,
  materials: { default: 'steel_structural' } as MaterialAssignment,
  boundaryConditions: [] as BoundaryCondition[],
  loads: [] as Load[],
  solverOptions: {
    fe_degree: 1 as const,
    refinement_cycles: 2,
    compute_reactions: true,
    compute_safety_factors: true
  } as SolverOptions,
  units: { type: 'SI_MM' as UnitSystemType } as UnitSystem
};

export const useExternalFEAStore = create<ExternalFEAState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      
      setMesh: (mesh) => set({ mesh }),
      
      setMaterials: (materials) => set({ materials }),
      
      addBoundaryCondition: (bc) => set((state) => ({
        boundaryConditions: [...state.boundaryConditions, bc]
      })),
      
      removeBoundaryCondition: (index) => set((state) => ({
        boundaryConditions: state.boundaryConditions.filter((_, i) => i !== index)
      })),
      
      updateBoundaryCondition: (index, bc) => set((state) => ({
        boundaryConditions: state.boundaryConditions.map((item, i) => 
          i === index ? bc : item
        )
      })),
      
      clearBoundaryConditions: () => set({ boundaryConditions: [] }),
      
      addLoad: (load) => set((state) => ({
        loads: [...state.loads, load]
      })),
      
      removeLoad: (index) => set((state) => ({
        loads: state.loads.filter((_, i) => i !== index)
      })),
      
      updateLoad: (index, load) => set((state) => ({
        loads: state.loads.map((item, i) => i === index ? load : item)
      })),
      
      clearLoads: () => set({ loads: [] }),
      
      setSolverOptions: (options) => set((state) => ({
        solverOptions: { ...state.solverOptions, ...options }
      })),
      
      setUnits: (units) => set({ units }),
      
      setUnitType: (type) => set({ units: { type } }),
      
      reset: () => set(DEFAULT_STATE),
      
      getAnalysisRequest: () => {
        const state = get();
        if (!state.mesh || state.boundaryConditions.length === 0) {
          return null;
        }
        
        return {
          mesh: state.mesh,
          materials: state.materials,
          boundary_conditions: state.boundaryConditions,
          loads: state.loads.length > 0 ? state.loads : undefined,
          solver_options: state.solverOptions,
          units: state.units
        };
      },
      
      isValid: () => {
        const state = get();
        const errors: string[] = [];
        
        if (!state.mesh) {
          errors.push('Mesh is required');
        }
        
        if (state.boundaryConditions.length === 0) {
          errors.push('At least one boundary condition is required');
        }
        
        // Check for at least one constraint that prevents rigid body motion
        const hasFixedBC = state.boundaryConditions.some(
          bc => bc.type === 'fixed' || bc.type === 'displacement'
        );
        if (!hasFixedBC) {
          errors.push('At least one fixed or displacement BC is required');
        }
        
        return {
          valid: errors.length === 0,
          errors
        };
      }
    }),
    {
      name: 'external-fea-solver-store',
      partialize: (state) => ({
        mesh: state.mesh,
        materials: state.materials,
        boundaryConditions: state.boundaryConditions,
        loads: state.loads,
        solverOptions: state.solverOptions,
        units: state.units
      })
    }
  )
);
