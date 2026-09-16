/**
 * Workflow Store - Manages FEA project workflow state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkflowStep = 'engineering-data' | 'geometry' | 'mesh' | 'setup' | 'results';

export interface BoundaryConditionDef {
  id: string;
  type: 'fixed' | 'displacement' | 'symmetry' | 'elastic_support';
  name: string;
  target: {
    type: 'point' | 'box' | 'sphere' | 'face' | 'edge';
    location?: [number, number, number];
    min?: [number, number, number];
    max?: [number, number, number];
    center?: [number, number, number];
    radius?: number;
    faceId?: string;
    edgeId?: string;
  };
  values?: [number | null, number | null, number | null];
  planeNormal?: [number, number, number];
  stiffnessPerArea?: [number, number, number];
  enabled: boolean;
}

export interface LoadDef {
  id: string;
  type: 'gravity' | 'pressure' | 'surface_force' | 'point_force' | 'thermal' | 'centrifugal';
  name: string;
  target?: {
    type: 'point' | 'box' | 'sphere' | 'face' | 'edge';
    location?: [number, number, number];
    min?: [number, number, number];
    max?: [number, number, number];
    center?: [number, number, number];
    radius?: number;
    faceId?: string;
    edgeId?: string;
  };
  // Type-specific values
  acceleration?: [number, number, number];        // gravity
  value?: number;                                  // pressure
  forcePerArea?: [number, number, number];        // surface_force
  force?: [number, number, number];               // point_force
  location?: [number, number, number];            // point_force location
  referenceTemperature?: number;                  // thermal
  appliedTemperature?: number;                    // thermal
  axisPoint?: [number, number, number];           // centrifugal
  axisDirection?: [number, number, number];       // centrifugal
  angularVelocity?: number;                       // centrifugal
  enabled: boolean;
}

export interface MeshSettings {
  globalSize: number;
  minSize?: number;
  maxSize?: number;
  elementType: 'C3D4' | 'C3D10' | 'C3D8' | 'C3D20';
  growthRate: number;
  curvatureSensitivity: number;
}

/** Axis-aligned bounds in model units (mm) from mesh generation */
export interface MeshBoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

export interface MeshNodeRecord {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface MeshElementRecord {
  id: number;
  type: string;
  nodeIds: number[];
}

export interface MeshData {
  nodeCount: number;
  elementCount: number;
  elementType: string;
  quality?: {
    avgAspectRatio: number;
    minAspectRatio: number;
    maxAspectRatio: number;
    warningCount: number;
  };
  nodes?: MeshNodeRecord[];
  elements?: MeshElementRecord[];
  boundingBox?: MeshBoundingBox;
}

export interface AnalysisResultData {
  jobId: string;
  status: 'completed' | 'failed';
  displacements: {
    max: { x: number; y: number; z: number; magnitude: number };
    min: { x: number; y: number; z: number };
  };
  stress: {
    vonMises: { max: number; min: number; avg: number };
    principal?: {
      sigma1: { max: number; min: number };
      sigma2: { max: number; min: number };
      sigma3: { max: number; min: number };
    };
  };
  reactions?: {
    totalForce: [number, number, number];
    totalMoment?: [number, number, number];
  };
  safetyFactors?: {
    min: number;
    avg: number;
  };
  computationTime?: number;
  outputFiles?: {
    vtk?: string;
    csv?: string;
  };
}

interface WorkflowState {
  // Current project
  projectId: string | null;
  currentStep: WorkflowStep;
  
  // Step completion status
  stepStatus: Record<WorkflowStep, 'pending' | 'in-progress' | 'complete'>;

  // Engineering Data — which material (from the account-wide materialLibraryStore) is
  // active for this project. The materials themselves live there now, not here.
  defaultMaterialId: string | null;

  // Geometry
  geometryReady: boolean;
  
  // Mesh
  meshSettings: MeshSettings;
  meshData: MeshData | null;
  isMeshing: boolean;
  meshError: string | null;
  
  // Setup
  boundaryConditions: BoundaryConditionDef[];
  loads: LoadDef[];
  
  // Results
  analysisResults: AnalysisResultData | null;
  isRunning: boolean;
  runProgress: number;
  runError: string | null;
  
  // Actions
  setProject: (projectId: string | null) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  updateStepStatus: (step: WorkflowStep, status: 'pending' | 'in-progress' | 'complete') => void;
  
  // Material actions
  setDefaultMaterial: (id: string | null) => void;
  
  // Geometry actions
  setGeometryReady: (ready: boolean) => void;
  
  // Mesh actions
  setMeshSettings: (settings: Partial<MeshSettings>) => void;
  setMeshData: (data: MeshData | null) => void;
  setMeshing: (isMeshing: boolean) => void;
  setMeshError: (error: string | null) => void;
  
  // Setup actions
  addBoundaryCondition: (bc: Omit<BoundaryConditionDef, 'id'>) => void;
  updateBoundaryCondition: (id: string, updates: Partial<BoundaryConditionDef>) => void;
  removeBoundaryCondition: (id: string) => void;
  toggleBoundaryCondition: (id: string) => void;
  
  addLoad: (load: Omit<LoadDef, 'id'>) => void;
  updateLoad: (id: string, updates: Partial<LoadDef>) => void;
  removeLoad: (id: string) => void;
  toggleLoad: (id: string) => void;
  
  // Results actions
  setAnalysisResults: (results: AnalysisResultData | null) => void;
  setRunning: (isRunning: boolean) => void;
  setRunProgress: (progress: number) => void;
  setRunError: (error: string | null) => void;
  
  // Reset
  resetWorkflow: () => void;
}

const DEFAULT_MESH_SETTINGS: MeshSettings = {
  globalSize: 10,
  minSize: 2,
  maxSize: 50,
  elementType: 'C3D4',
  growthRate: 1.5,
  curvatureSensitivity: 0.5,
};

const INITIAL_STEP_STATUS: Record<WorkflowStep, 'pending' | 'in-progress' | 'complete'> = {
  'engineering-data': 'pending',
  'geometry': 'pending',
  'mesh': 'pending',
  'setup': 'pending',
  'results': 'pending',
};

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      // Initial state
      projectId: null,
      currentStep: 'engineering-data',
      stepStatus: { ...INITIAL_STEP_STATUS },

      defaultMaterialId: null,

      geometryReady: false,
      
      meshSettings: { ...DEFAULT_MESH_SETTINGS },
      meshData: null,
      isMeshing: false,
      meshError: null,
      
      boundaryConditions: [],
      loads: [],
      
      analysisResults: null,
      isRunning: false,
      runProgress: 0,
      runError: null,

      // Actions
      setProject: (projectId) => {
        const current = get().projectId;
        if (current !== projectId) {
          // Reset workflow when switching projects
          set({
            projectId,
            currentStep: 'engineering-data',
            stepStatus: { ...INITIAL_STEP_STATUS },
            geometryReady: false,
            meshData: null,
            meshError: null,
            boundaryConditions: [],
            loads: [],
            analysisResults: null,
            runError: null,
          });
        }
      },
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      updateStepStatus: (step, status) => set((state) => ({
        stepStatus: { ...state.stepStatus, [step]: status },
      })),

      // Material actions
      setDefaultMaterial: (id) => set({ defaultMaterialId: id }),

      // Geometry actions
      setGeometryReady: (ready) => set({ geometryReady: ready }),

      // Mesh actions
      setMeshSettings: (settings) => set((state) => ({
        meshSettings: { ...state.meshSettings, ...settings },
      })),
      
      setMeshData: (data) => set({ meshData: data }),
      setMeshing: (isMeshing) => set({ isMeshing }),
      setMeshError: (error) => set({ meshError: error }),

      // Setup actions
      addBoundaryCondition: (bc) => {
        const id = `bc-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        set((state) => ({
          boundaryConditions: [...state.boundaryConditions, { ...bc, id, enabled: true }],
        }));
      },
      
      updateBoundaryCondition: (id, updates) => set((state) => ({
        boundaryConditions: state.boundaryConditions.map((bc) =>
          bc.id === id ? { ...bc, ...updates } : bc
        ),
      })),
      
      removeBoundaryCondition: (id) => set((state) => ({
        boundaryConditions: state.boundaryConditions.filter((bc) => bc.id !== id),
      })),
      
      toggleBoundaryCondition: (id) => set((state) => ({
        boundaryConditions: state.boundaryConditions.map((bc) =>
          bc.id === id ? { ...bc, enabled: !bc.enabled } : bc
        ),
      })),

      addLoad: (load) => {
        const id = `load-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        set((state) => ({
          loads: [...state.loads, { ...load, id, enabled: true }],
        }));
      },
      
      updateLoad: (id, updates) => set((state) => ({
        loads: state.loads.map((load) =>
          load.id === id ? { ...load, ...updates } : load
        ),
      })),
      
      removeLoad: (id) => set((state) => ({
        loads: state.loads.filter((load) => load.id !== id),
      })),
      
      toggleLoad: (id) => set((state) => ({
        loads: state.loads.map((load) =>
          load.id === id ? { ...load, enabled: !load.enabled } : load
        ),
      })),

      // Results actions
      setAnalysisResults: (results) => set({ analysisResults: results }),
      setRunning: (isRunning) => set({ isRunning }),
      setRunProgress: (progress) => set({ runProgress: progress }),
      setRunError: (error) => set({ runError: error }),

      // Reset
      resetWorkflow: () => set({
        currentStep: 'engineering-data',
        stepStatus: { ...INITIAL_STEP_STATUS },
        geometryReady: false,
        meshData: null,
        meshError: null,
        boundaryConditions: [],
        loads: [],
        analysisResults: null,
        isRunning: false,
        runProgress: 0,
        runError: null,
      }),
    }),
    {
      name: 'feai-workflow-storage',
      partialize: (state) => ({
        projectId: state.projectId,
        defaultMaterialId: state.defaultMaterialId,
        meshSettings: state.meshSettings,
        meshData: state.meshData,
        geometryReady: state.geometryReady,
        stepStatus: state.stepStatus,
        boundaryConditions: state.boundaryConditions,
        loads: state.loads,
        analysisResults: state.analysisResults,
      }),
    }
  )
);
