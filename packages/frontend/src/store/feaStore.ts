/**
 * FEA Store - State management for Finite Element Analysis
 */

import { create } from 'zustand';
import {
  SimulationSetup,
  FEAMesh,
  FEAMaterial,
  FEAMaterialAssignment,
  BoundaryCondition,
  MeshSettings,
  SimulationResults,
  AnalysisStatus,
  ResultsViewSettings,
  ResultField,
  ColormapType,
} from '@feai/shared';
import { apiClient } from '../api/client';

interface FEAState {
  // Mode
  isSimulationMode: boolean;
  
  // Current simulation setup
  setup: SimulationSetup | null;
  
  // Mesh state
  meshSettings: MeshSettings;
  mesh: FEAMesh | null;
  isMeshing: boolean;
  meshError: string | null;
  
  // Materials
  availableMaterials: FEAMaterial[];
  materialAssignments: FEAMaterialAssignment[];
  
  // Boundary conditions
  boundaryConditions: BoundaryCondition[];
  selectedBCId: string | null;
  
  // Solver state
  solverStatus: AnalysisStatus;
  solverProgress: number;
  solverMessage: string | null;
  jobId: string | null;
  
  // Results
  results: SimulationResults | null;
  resultsViewSettings: ResultsViewSettings;
  
  // UI state
  activeFEAPanel: 'mesh' | 'material' | 'bc' | 'results' | null;
  showMeshPreview: boolean;
  showBCIcons: boolean;
  probeLocation: { x: number; y: number; z: number } | null;
  probeValue: { displacement: number; stress: number } | null;
  
  // Actions
  enterSimulationMode: () => void;
  exitSimulationMode: () => void;
  loadMaterials: () => Promise<void>;
  setActiveFEAPanel: (panel: 'mesh' | 'material' | 'bc' | 'results' | null) => void;
  
  // Mesh actions
  setMeshSettings: (settings: Partial<MeshSettings>) => void;
  generateMesh: (partStudioId: string) => Promise<void>;
  clearMesh: () => void;
  
  // Material actions
  addMaterial: (material: FEAMaterial) => void;
  removeMaterial: (materialId: string) => void;
  assignMaterial: (partId: string, partName: string, materialId: string) => void;
  unassignMaterial: (partId: string) => void;
  
  // Boundary condition actions
  addBoundaryCondition: (bc: Omit<BoundaryCondition, 'id'>) => void;
  updateBoundaryCondition: (id: string, updates: Partial<BoundaryCondition>) => void;
  removeBoundaryCondition: (id: string) => void;
  toggleBoundaryCondition: (id: string) => void;
  selectBoundaryCondition: (id: string | null) => void;
  
  // Solver actions
  runSimulation: (partStudioId: string) => Promise<void>;
  cancelSimulation: () => Promise<void>;
  pollJobStatus: () => Promise<void>;
  
  // Results actions
  setResultsViewSettings: (settings: Partial<ResultsViewSettings>) => void;
  setActiveResultField: (field: ResultField) => void;
  setDeformationScale: (scale: number) => void;
  setColormap: (colormap: ColormapType) => void;
  setResultRange: (min: number | undefined, max: number | undefined) => void;
  toggleDeformed: () => void;
  toggleMeshOverlay: () => void;
  toggleLegend: () => void;
  setProbeLocation: (location: { x: number; y: number; z: number } | null) => void;
  clearResults: () => void;
  
  // Reset
  resetFEA: () => void;
}

const DEFAULT_MESH_SETTINGS: MeshSettings = {
  globalSize: 10, // Increased from 5 to 10 for safety
  minSize: 2,     // Increased from 1 to 2
  maxSize: 50,    // Increased from 20 to 50
  elementType: 'C3D4',
  refinementRegions: [],
  curvatureSensitivity: 0.5,
  proximityDetection: true,
  growthRate: 1.5,
};

const DEFAULT_RESULTS_VIEW: ResultsViewSettings = {
  activeField: 'vonMises',
  showDeformed: true,
  deformationScale: 10,
  autoScale: true,
  colormap: 'jet',
  autoRange: true,
  showMesh: true,
  showEdges: true,
  showLegend: true,
  showMinMaxMarkers: true,
  animating: false,
  animationSpeed: 1,
};

export const useFEAStore = create<FEAState>((set, get) => ({
  // Initial state
  isSimulationMode: false,
  setup: null,
  
  meshSettings: DEFAULT_MESH_SETTINGS,
  mesh: null,
  isMeshing: false,
  meshError: null,
  
  availableMaterials: [], // Will be loaded from API
  materialAssignments: [],
  
  boundaryConditions: [],
  selectedBCId: null,
  
  solverStatus: 'idle',
  solverProgress: 0,
  solverMessage: null,
  jobId: null,
  
  results: null,
  resultsViewSettings: DEFAULT_RESULTS_VIEW,
  
  activeFEAPanel: null,
  showMeshPreview: false, // Changed from true - mesh preview causes crashes with large meshes
  showBCIcons: true,
  probeLocation: null,
  probeValue: null,

  // Mode actions
  enterSimulationMode: () => {
    const store = get();
    set({
      isSimulationMode: true,
      activeFEAPanel: 'mesh',
    });
    
    // Load materials if not already loaded
    if (store.availableMaterials.length === 0) {
      store.loadMaterials();
    }
  },

  exitSimulationMode: () => {
    set({
      isSimulationMode: false,
      activeFEAPanel: null,
    });
  },

  // Load materials from API
  loadMaterials: async () => {
    try {
      const response = await apiClient.getMaterials();
      set({ availableMaterials: response.materials });
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  },

  setActiveFEAPanel: (panel) => {
    set({ activeFEAPanel: panel });
  },

  // Mesh actions
  setMeshSettings: (settings) => {
    set((state) => ({
      meshSettings: { ...state.meshSettings, ...settings },
    }));
  },

  generateMesh: async (partStudioId: string) => {
    const state = get();
    set({ isMeshing: true, meshError: null });

    try {
      // Get the current document to access part geometry
      const documentStore = (window as any).__documentStore;
      const document = documentStore?.getState?.()?.document;
      
      if (!document) {
        throw new Error('No active document found');
      }

      // Find the active part studio
      const partStudio = document.partStudios.find((ps: any) => ps.id === partStudioId);
      
      if (!partStudio) {
        throw new Error('Part studio not found');
      }

      if (!partStudio.parts || partStudio.parts.length === 0) {
        throw new Error('No parts found in part studio. Please create geometry first.');
      }

      // Validate mesh settings
      if (state.meshSettings.globalSize < 2) {
        throw new Error('Element size too small! Minimum is 2mm.');
      }

      // Check mesh data size BEFORE sending to prevent crash
      let totalVertices = 0;
      for (const part of partStudio.parts) {
        if (part.mesh?.vertices) {
          totalVertices += part.mesh.vertices.length;
        }
      }
      
      console.log('[FEA] Total vertices in parts:', totalVertices);
      
      // CRITICAL: Don't send huge mesh data that will crash browser
      if (totalVertices > 30000) {
        throw new Error(
          `Geometry too complex (${(totalVertices/3).toLocaleString()} vertices)! ` +
          `Simplify the model or the mesh generation will crash your browser.`
        );
      }

      // Send mesh data along with the request
      const partsWithMesh = partStudio.parts.map((part: any) => ({
        id: part.id,
        name: part.name,
        meshData: part.mesh // Frontend stores as 'mesh', backend expects 'meshData'
      }));

      console.log('[FEA] Generating mesh with settings:', state.meshSettings);
      console.log('[FEA] Parts:', partsWithMesh.length);

      // Add timeout to prevent infinite wait
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Mesh generation timeout - took too long')), 30000)
      );

      const meshPromise = apiClient.generateMesh(partStudioId, {
        ...state.meshSettings,
        parts: partsWithMesh
      });

      const response = await Promise.race([meshPromise, timeoutPromise]) as any;

      set({
        mesh: response.mesh,
        isMeshing: false,
      });
      
      console.log('[FEA] Mesh generated successfully:', {
        nodes: response.mesh.nodeCount,
        elements: response.mesh.elementCount
      });
    } catch (error: any) {
      console.error('[FEA] Mesh generation failed:', error);
      set({
        isMeshing: false,
        meshError: error.message || 'Mesh generation failed',
      });
    }
  },

  clearMesh: () => {
    set({ mesh: null, meshError: null });
  },

  // Material actions
  addMaterial: (material) => {
    set((state) => ({
      availableMaterials: [...state.availableMaterials, material],
    }));
  },

  removeMaterial: (materialId) => {
    set((state) => ({
      availableMaterials: state.availableMaterials.filter((m) => m.id !== materialId),
      materialAssignments: state.materialAssignments.filter((a) => a.materialId !== materialId),
    }));
  },

  assignMaterial: (partId, partName, materialId) => {
    const material = get().availableMaterials.find((m) => m.id === materialId);
    if (!material) return;

    set((state) => {
      const existing = state.materialAssignments.findIndex((a) => a.partId === partId);
      const newAssignment: FEAMaterialAssignment = {
        partId,
        partName,
        materialId,
        materialName: material.name,
      };

      if (existing >= 0) {
        const updated = [...state.materialAssignments];
        updated[existing] = newAssignment;
        return { materialAssignments: updated };
      } else {
        return { materialAssignments: [...state.materialAssignments, newAssignment] };
      }
    });
  },

  unassignMaterial: (partId) => {
    set((state) => ({
      materialAssignments: state.materialAssignments.filter((a) => a.partId !== partId),
    }));
  },

  // Boundary condition actions
  addBoundaryCondition: (bc) => {
    const id = `bc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newBC = { ...bc, id, enabled: true } as BoundaryCondition;
    
    set((state) => ({
      boundaryConditions: [...state.boundaryConditions, newBC],
      selectedBCId: id,
    }));
  },

  updateBoundaryCondition: (id, updates) => {
    set((state) => ({
      boundaryConditions: state.boundaryConditions.map((bc) =>
        bc.id === id ? ({ ...bc, ...updates } as BoundaryCondition) : bc
      ),
    }));
  },

  removeBoundaryCondition: (id) => {
    set((state) => ({
      boundaryConditions: state.boundaryConditions.filter((bc) => bc.id !== id),
      selectedBCId: state.selectedBCId === id ? null : state.selectedBCId,
    }));
  },

  toggleBoundaryCondition: (id) => {
    set((state) => ({
      boundaryConditions: state.boundaryConditions.map((bc) =>
        bc.id === id ? { ...bc, enabled: !bc.enabled } : bc
      ),
    }));
  },

  selectBoundaryCondition: (id) => {
    set({ selectedBCId: id });
  },

  // Solver actions
  runSimulation: async (partStudioId: string) => {
    const state = get();
    
    if (!state.mesh) {
      throw new Error('No mesh generated');
    }

    set({
      solverStatus: 'preparing',
      solverProgress: 0,
      solverMessage: 'Preparing simulation...',
      results: null,
    });

    try {
      // Build setup
      const setup: any = {
        id: `sim-${Date.now()}`,
        name: 'FEA Simulation',
        analysisType: 'static',
        mesh: state.mesh,
        materials: state.materialAssignments.map((a) => 
          state.availableMaterials.find((m) => m.id === a.materialId)
        ).filter(Boolean),
        materialAssignments: state.materialAssignments,
        boundaryConditions: state.boundaryConditions,
        meshSettings: state.meshSettings,
      };

      // Submit job
      const response = await apiClient.runSimulation(setup, partStudioId);

      set({
        jobId: response.jobId,
        solverStatus: 'solving',
        solverMessage: 'Running solver...',
      });

      // Start polling
      get().pollJobStatus();
    } catch (error: any) {
      set({
        solverStatus: 'error',
        solverMessage: error.message,
      });
    }
  },

  cancelSimulation: async () => {
    const { jobId } = get();
    if (!jobId) return;

    try {
      await apiClient.cancelSimulation(jobId);
      set({
        solverStatus: 'cancelled',
        solverMessage: 'Simulation cancelled',
        jobId: null,
      });
    } catch (error: any) {
      console.error('Failed to cancel simulation:', error);
    }
  },

  pollJobStatus: async () => {
    const { jobId } = get();
    if (!jobId) return;

    const poll = async () => {
      const currentJobId = get().jobId;
      if (!currentJobId) return;

      try {
        const response = await apiClient.getSimulationStatus(currentJobId);
        
        set({
          solverStatus: response.status,
          solverProgress: response.progress || 0,
          solverMessage: response.message,
        });

        if (response.status === 'completed' && response.results) {
          set({
            results: response.results,
            activeFEAPanel: 'results',
            jobId: null,
          });
        } else if (response.status === 'error') {
          set({
            solverMessage: response.error || 'Simulation failed',
            jobId: null,
          });
        } else if (response.status !== 'cancelled') {
          // Continue polling
          setTimeout(poll, 500);
        }
      } catch (error) {
        console.error('Poll error:', error);
        setTimeout(poll, 1000);
      }
    };

    poll();
  },

  // Results actions
  setResultsViewSettings: (settings) => {
    set((state) => ({
      resultsViewSettings: { ...state.resultsViewSettings, ...settings },
    }));
  },

  setActiveResultField: (field) => {
    set((state) => ({
      resultsViewSettings: { ...state.resultsViewSettings, activeField: field },
    }));
  },

  setDeformationScale: (scale) => {
    set((state) => ({
      resultsViewSettings: { ...state.resultsViewSettings, deformationScale: scale },
    }));
  },

  setColormap: (colormap) => {
    set((state) => ({
      resultsViewSettings: { ...state.resultsViewSettings, colormap },
    }));
  },

  setResultRange: (min, max) => {
    set((state) => ({
      resultsViewSettings: {
        ...state.resultsViewSettings,
        minValue: min,
        maxValue: max,
        autoRange: min === undefined && max === undefined,
      },
    }));
  },

  toggleDeformed: () => {
    set((state) => ({
      resultsViewSettings: {
        ...state.resultsViewSettings,
        showDeformed: !state.resultsViewSettings.showDeformed,
      },
    }));
  },

  toggleMeshOverlay: () => {
    set((state) => ({
      resultsViewSettings: {
        ...state.resultsViewSettings,
        showMesh: !state.resultsViewSettings.showMesh,
      },
    }));
  },

  toggleLegend: () => {
    set((state) => ({
      resultsViewSettings: {
        ...state.resultsViewSettings,
        showLegend: !state.resultsViewSettings.showLegend,
      },
    }));
  },

  setProbeLocation: (location) => {
    const state = get();
    let probeValue = null;

    if (location && state.results?.staticResults) {
      // Find nearest node and get values
      // This is simplified - production would use proper interpolation
      probeValue = {
        displacement: state.results.staticResults.displacements.max,
        stress: state.results.staticResults.vonMisesStress.max,
      };
    }

    set({ probeLocation: location, probeValue });
  },

  clearResults: () => {
    set({
      results: null,
      solverStatus: 'idle',
      solverProgress: 0,
      solverMessage: null,
    });
  },

  // Reset
  resetFEA: () => {
    set({
      setup: null,
      mesh: null,
      meshError: null,
      materialAssignments: [],
      boundaryConditions: [],
      selectedBCId: null,
      solverStatus: 'idle',
      solverProgress: 0,
      solverMessage: null,
      jobId: null,
      results: null,
      resultsViewSettings: DEFAULT_RESULTS_VIEW,
      probeLocation: null,
      probeValue: null,
    });
  },
}));

