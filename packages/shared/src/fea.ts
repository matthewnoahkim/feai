// ============================================================================
// FEA TYPES - Finite Element Analysis types for CalculiX integration
// ============================================================================

import { Vector3 } from './geometry';

// === Analysis Types ===

export type AnalysisType = 
  | 'static'           // Linear static analysis
  | 'modal'            // Modal/eigenfrequency analysis
  | 'buckling'         // Linear buckling analysis
  | 'thermal'          // Steady-state thermal analysis
  | 'nonlinearStatic'; // Nonlinear static (future)

export type AnalysisStatus = 
  | 'idle'
  | 'meshing'
  | 'preparing'
  | 'solving'
  | 'postProcessing'
  | 'completed'
  | 'error'
  | 'cancelled';

// === Element Types ===

export type FEAElementType = 
  | 'C3D4'    // 4-node linear tetrahedron
  | 'C3D10'   // 10-node quadratic tetrahedron
  | 'C3D8'    // 8-node linear hexahedron
  | 'C3D20'   // 20-node quadratic hexahedron
  | 'C3D6'    // 6-node linear pentahedron (wedge)
  | 'C3D15';  // 15-node quadratic pentahedron

export interface FEAElementTypeInfo {
  type: FEAElementType;
  name: string;
  nodes: number;
  description: string;
  isQuadratic: boolean;
}

export const FEA_ELEMENT_TYPES: Record<FEAElementType, FEAElementTypeInfo> = {
  'C3D4': { type: 'C3D4', name: 'Linear Tetrahedron', nodes: 4, description: '4-node tet', isQuadratic: false },
  'C3D10': { type: 'C3D10', name: 'Quadratic Tetrahedron', nodes: 10, description: '10-node tet', isQuadratic: true },
  'C3D8': { type: 'C3D8', name: 'Linear Hexahedron', nodes: 8, description: '8-node hex/brick', isQuadratic: false },
  'C3D20': { type: 'C3D20', name: 'Quadratic Hexahedron', nodes: 20, description: '20-node hex', isQuadratic: true },
  'C3D6': { type: 'C3D6', name: 'Linear Wedge', nodes: 6, description: '6-node wedge', isQuadratic: false },
  'C3D15': { type: 'C3D15', name: 'Quadratic Wedge', nodes: 15, description: '15-node wedge', isQuadratic: true },
};

// === Mesh Types ===

export interface FEANode {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface FEAElement {
  id: number;
  type: FEAElementType;
  nodeIds: number[];
}

export interface FEANodeSet {
  name: string;
  nodeIds: number[];
}

export interface FEAElementSet {
  name: string;
  elementIds: number[];
}

export interface FEASurface {
  name: string;
  elements: { elementId: number; faceNumber: number }[];
}

export interface FEAMesh {
  nodes: FEANode[];
  elements: FEAElement[];
  nodeSets: FEANodeSet[];
  elementSets: FEAElementSet[];
  surfaces: FEASurface[];
  
  // Statistics
  nodeCount: number;
  elementCount: number;
  elementType: FEAElementType;
  
  // Bounding box
  boundingBox: {
    min: Vector3;
    max: Vector3;
  };
  
  // Quality metrics (optional)
  quality?: MeshQuality;
}

export interface MeshQuality {
  minAspectRatio: number;
  maxAspectRatio: number;
  avgAspectRatio: number;
  minJacobian: number;
  warningCount: number;
  errorCount: number;
}

export interface MeshSettings {
  globalSize: number;           // Target element edge length (mm)
  minSize?: number;             // Minimum element size (mm)
  maxSize?: number;             // Maximum element size (mm)
  elementType: FEAElementType;  // Element type to use
  refinementRegions: MeshRefinementRegion[];
  curvatureSensitivity?: number; // 0-1, how much to refine near curves
  proximityDetection?: boolean;  // Refine near thin features
  growthRate?: number;          // Element size growth rate (1.1-2.0)
}

export interface MeshRefinementRegion {
  id: string;
  type: 'face' | 'edge' | 'vertex' | 'body';
  geometryId: string;
  size: number;               // Target size in this region (mm)
}

// Export aliases for backward compatibility
export type FENode = FEANode;
export type FEElement = FEAElement;
export type NodeSet = FEANodeSet;
export type ElementSet = FEAElementSet;
export type Surface = FEASurface;
export type FEMesh = FEAMesh;
export type RefinementRegion = MeshRefinementRegion;

// === Material Types ===

export interface FEAMaterial {
  id: string;
  name: string;
  category: FEAMaterialCategory;
  properties: FEAMaterialProperties;
  isPreset: boolean;
  color?: string;
}

export type FEAMaterialCategory = 
  | 'metal'
  | 'plastic'
  | 'composite'
  | 'ceramic'
  | 'rubber'
  | 'custom';

// Export alias for backward compatibility
export type MaterialCategory = FEAMaterialCategory;

export interface FEAMaterialProperties {
  // Elastic properties (required for structural)
  youngsModulus: number;      // Pa (N/m²) - E
  poissonsRatio: number;      // dimensionless - ν
  
  // Density (optional for static, required for gravity/dynamic)
  density?: number;           // kg/m³
  
  // Thermal properties (optional)
  thermalConductivity?: number;    // W/(m·K)
  specificHeat?: number;           // J/(kg·K)
  thermalExpansion?: number;       // 1/K
  
  // Yield/Ultimate (for reference/nonlinear)
  yieldStrength?: number;     // Pa
  ultimateStrength?: number;  // Pa
}

// Export alias for backward compatibility
export type FEAMaterialProperty = FEAMaterialProperties;

// Predefined material library
export const FEA_MATERIAL_LIBRARY: FEAMaterial[] = [
  {
    id: 'steel-1018',
    name: 'Steel 1018 (Mild Steel)',
    category: 'metal',
    isPreset: true,
    color: '#6B7280',
    properties: {
      youngsModulus: 205e9,      // 205 GPa
      poissonsRatio: 0.29,
      density: 7870,             // 7870 kg/m³
      thermalConductivity: 51.9,
      specificHeat: 486,
      thermalExpansion: 11.7e-6,
      yieldStrength: 370e6,      // 370 MPa
      ultimateStrength: 440e6,   // 440 MPa
    }
  },
  {
    id: 'steel-304',
    name: 'Stainless Steel 304',
    category: 'metal',
    isPreset: true,
    color: '#9CA3AF',
    properties: {
      youngsModulus: 193e9,
      poissonsRatio: 0.29,
      density: 8000,
      thermalConductivity: 16.2,
      specificHeat: 500,
      thermalExpansion: 17.3e-6,
      yieldStrength: 215e6,
      ultimateStrength: 505e6,
    }
  },
  {
    id: 'aluminum-6061',
    name: 'Aluminum 6061-T6',
    category: 'metal',
    isPreset: true,
    color: '#D1D5DB',
    properties: {
      youngsModulus: 68.9e9,     // 68.9 GPa
      poissonsRatio: 0.33,
      density: 2700,
      thermalConductivity: 167,
      specificHeat: 896,
      thermalExpansion: 23.6e-6,
      yieldStrength: 276e6,
      ultimateStrength: 310e6,
    }
  },
  {
    id: 'titanium-ti64',
    name: 'Titanium Ti-6Al-4V',
    category: 'metal',
    isPreset: true,
    color: '#4B5563',
    properties: {
      youngsModulus: 113.8e9,
      poissonsRatio: 0.342,
      density: 4430,
      thermalConductivity: 6.7,
      specificHeat: 526.3,
      thermalExpansion: 8.6e-6,
      yieldStrength: 880e6,
      ultimateStrength: 950e6,
    }
  },
  {
    id: 'copper-c11000',
    name: 'Copper C11000',
    category: 'metal',
    isPreset: true,
    color: '#B87333',
    properties: {
      youngsModulus: 117e9,
      poissonsRatio: 0.34,
      density: 8940,
      thermalConductivity: 388,
      specificHeat: 385,
      thermalExpansion: 16.5e-6,
      yieldStrength: 69e6,
      ultimateStrength: 220e6,
    }
  },
  {
    id: 'abs-plastic',
    name: 'ABS Plastic',
    category: 'plastic',
    isPreset: true,
    color: '#1F2937',
    properties: {
      youngsModulus: 2.3e9,
      poissonsRatio: 0.35,
      density: 1050,
      thermalConductivity: 0.17,
      specificHeat: 1470,
      thermalExpansion: 90e-6,
      yieldStrength: 45e6,
      ultimateStrength: 40e6,
    }
  },
  {
    id: 'nylon-66',
    name: 'Nylon 6/6',
    category: 'plastic',
    isPreset: true,
    color: '#F3F4F6',
    properties: {
      youngsModulus: 3e9,
      poissonsRatio: 0.4,
      density: 1140,
      thermalConductivity: 0.25,
      specificHeat: 1670,
      thermalExpansion: 80e-6,
      yieldStrength: 77e6,
      ultimateStrength: 85e6,
    }
  },
  {
    id: 'rubber-natural',
    name: 'Natural Rubber',
    category: 'rubber',
    isPreset: true,
    color: '#292524',
    properties: {
      youngsModulus: 0.01e9,     // 10 MPa (very soft)
      poissonsRatio: 0.49,       // Nearly incompressible
      density: 920,
      thermalConductivity: 0.13,
      specificHeat: 1880,
      thermalExpansion: 220e-6,
    }
  },
];

// === Material Assignment ===

export interface FEAMaterialAssignment {
  partId: string;
  partName: string;
  materialId: string;
  materialName: string;
}

// === Boundary Condition Types ===

export type BoundaryConditionType = 
  | 'fixed'           // Fixed support (all DOFs constrained)
  | 'displacement'    // Prescribed displacement
  | 'force'           // Concentrated force
  | 'pressure'        // Surface pressure
  | 'gravity'         // Gravitational load
  | 'temperature'     // Fixed temperature (thermal)
  | 'convection'      // Convection BC (thermal)
  | 'heatFlux';       // Heat flux (thermal)

export interface BaseBoundaryCondition {
  id: string;
  type: BoundaryConditionType;
  name: string;
  enabled: boolean;
}

// Fixed support - all translations constrained to zero
export interface FixedConstraint extends BaseBoundaryCondition {
  type: 'fixed';
  geometry: {
    type: 'face' | 'edge' | 'vertex';
    id: string;
    name?: string;
  };
}

// Prescribed displacement
export interface DisplacementConstraint extends BaseBoundaryCondition {
  type: 'displacement';
  geometry: {
    type: 'face' | 'edge' | 'vertex';
    id: string;
    name?: string;
  };
  displacement: {
    x?: number;     // undefined = free, number = constrained to that value
    y?: number;
    z?: number;
  };
}

// Concentrated force
export interface ForceLoad extends BaseBoundaryCondition {
  type: 'force';
  geometry: {
    type: 'face' | 'edge' | 'vertex';
    id: string;
    name?: string;
  };
  force: {
    magnitude: number;   // N
    direction: Vector3;  // Unit vector
  };
  // If applied to face, distribute evenly over nodes
  distributed: boolean;
}

// Surface pressure
export interface PressureLoad extends BaseBoundaryCondition {
  type: 'pressure';
  geometry: {
    type: 'face';
    id: string;
    name?: string;
  };
  pressure: number;       // Pa (positive = into surface)
  reverseNormal?: boolean;
}

// Gravity load (global)
export interface GravityLoad extends BaseBoundaryCondition {
  type: 'gravity';
  acceleration: number;   // m/s² (typically 9.81)
  direction: Vector3;     // Unit vector (typically [0, 0, -1] for -Z down)
}

// Temperature (thermal analysis)
export interface TemperatureConstraint extends BaseBoundaryCondition {
  type: 'temperature';
  geometry: {
    type: 'face' | 'edge' | 'vertex';
    id: string;
    name?: string;
  };
  temperature: number;    // K or °C
}

export type BoundaryCondition = 
  | FixedConstraint
  | DisplacementConstraint
  | ForceLoad
  | PressureLoad
  | GravityLoad
  | TemperatureConstraint;

// === Simulation Setup ===

export interface SimulationSetup {
  id: string;
  name: string;
  analysisType: AnalysisType;
  
  // Mesh settings
  meshSettings: MeshSettings;
  mesh?: FEAMesh;
  
  // Materials
  materials: FEAMaterial[];
  materialAssignments: FEAMaterialAssignment[];
  
  // Boundary conditions
  boundaryConditions: BoundaryCondition[];
  
  // Analysis-specific settings
  staticSettings?: StaticAnalysisSettings;
  modalSettings?: ModalAnalysisSettings;
  
  // Output requests
  outputRequests: OutputRequest[];
  
  // Status
  status: AnalysisStatus;
  progress?: number;       // 0-100
  errorMessage?: string;
}

export interface StaticAnalysisSettings {
  // For nonlinear (future)
  nonlinear?: boolean;
  largeDeformation?: boolean;
  maxIterations?: number;
}

export interface ModalAnalysisSettings {
  numModes: number;
  frequencyRange?: {
    min: number;
    max: number;
  };
}

export interface OutputRequest {
  type: 'displacement' | 'stress' | 'strain' | 'reactionForce' | 'temperature';
  location: 'node' | 'element' | 'both';
  components?: string[];  // e.g., ['U1', 'U2', 'U3'] or ['S11', 'MISES']
}

// === Results Types ===

export interface SimulationResults {
  simulationId: string;
  analysisType: AnalysisType;
  solveTime: number;       // seconds
  timestamp: string;
  
  // General results
  staticResults?: StaticResults;
  modalResults?: ModalResults;
  
  // Mesh reference (for visualization)
  meshNodeCount: number;
  meshElementCount: number;
}

export interface StaticResults {
  // Displacement field
  displacements: NodalField;
  
  // Stress field (von Mises + components)
  stresses: ElementField;
  vonMisesStress: NodalField;  // Averaged to nodes
  
  // Strain field
  strains?: ElementField;
  
  // Reaction forces at constrained nodes
  reactionForces?: { nodeId: number; fx: number; fy: number; fz: number }[];
  
  // Summary statistics
  summary: ResultsSummary;
}

export interface ModalResults {
  modes: ModalMode[];
}

export interface ModalMode {
  modeNumber: number;
  frequency: number;        // Hz
  angularFrequency: number; // rad/s
  participationFactor?: Vector3;
  effectiveMass?: Vector3;
  modeShape: NodalField;    // Displacement mode shape
}

export interface NodalField {
  name: string;
  unit: string;
  nodeValues: Map<number, number[]> | { nodeId: number; values: number[] }[];
  componentNames: string[];   // e.g., ['Ux', 'Uy', 'Uz'] or ['Mises']
  min: number;
  max: number;
  avg?: number;
}

export interface ElementField {
  name: string;
  unit: string;
  elementValues: Map<number, number[]> | { elementId: number; values: number[] }[];
  componentNames: string[];
  min: number;
  max: number;
}

export interface ResultsSummary {
  maxDisplacement: {
    magnitude: number;
    nodeId: number;
    location: Vector3;
  };
  maxVonMisesStress: {
    value: number;
    nodeId: number;
    location: Vector3;
  };
  minVonMisesStress: {
    value: number;
    nodeId: number;
  };
  totalReactionForce?: Vector3;
}

// === Visualization Settings ===

export type ResultField = 'vonMises' | 'displacement' | 'ux' | 'uy' | 'uz' | 'sxx' | 'syy' | 'szz' | 'sxy' | 'syz' | 'sxz';

export interface ResultsViewSettings {
  activeField: ResultField;
  showDeformed: boolean;
  deformationScale: number;      // 1.0 = true scale
  autoScale: boolean;            // Auto-adjust deformation scale
  
  // Color mapping
  colormap: ColormapType;
  minValue?: number;             // Custom range min
  maxValue?: number;             // Custom range max
  autoRange: boolean;
  
  // Display options
  showMesh: boolean;
  showEdges: boolean;
  showLegend: boolean;
  showMinMaxMarkers: boolean;
  
  // Animation (for modal)
  animating: boolean;
  animationSpeed: number;
}

export type ColormapType = 
  | 'rainbow'         // Classic rainbow (blue -> red)
  | 'jet'             // MATLAB jet
  | 'viridis'         // Perceptually uniform
  | 'coolwarm'        // Diverging blue-red
  | 'plasma'
  | 'turbo';

// Colormap definitions (RGB values 0-255)
export interface ColormapStop {
  position: number;   // 0-1
  color: [number, number, number];
}

export const COLORMAPS: Record<ColormapType, ColormapStop[]> = {
  rainbow: [
    { position: 0.0, color: [0, 0, 255] },
    { position: 0.25, color: [0, 255, 255] },
    { position: 0.5, color: [0, 255, 0] },
    { position: 0.75, color: [255, 255, 0] },
    { position: 1.0, color: [255, 0, 0] },
  ],
  jet: [
    { position: 0.0, color: [0, 0, 127] },
    { position: 0.1, color: [0, 0, 255] },
    { position: 0.35, color: [0, 255, 255] },
    { position: 0.5, color: [0, 255, 0] },
    { position: 0.65, color: [255, 255, 0] },
    { position: 0.9, color: [255, 0, 0] },
    { position: 1.0, color: [127, 0, 0] },
  ],
  viridis: [
    { position: 0.0, color: [68, 1, 84] },
    { position: 0.25, color: [59, 82, 139] },
    { position: 0.5, color: [33, 145, 140] },
    { position: 0.75, color: [94, 201, 98] },
    { position: 1.0, color: [253, 231, 37] },
  ],
  coolwarm: [
    { position: 0.0, color: [59, 76, 192] },
    { position: 0.5, color: [221, 221, 221] },
    { position: 1.0, color: [180, 4, 38] },
  ],
  plasma: [
    { position: 0.0, color: [13, 8, 135] },
    { position: 0.25, color: [126, 3, 168] },
    { position: 0.5, color: [204, 71, 120] },
    { position: 0.75, color: [248, 149, 64] },
    { position: 1.0, color: [240, 249, 33] },
  ],
  turbo: [
    { position: 0.0, color: [48, 18, 59] },
    { position: 0.17, color: [70, 107, 227] },
    { position: 0.33, color: [46, 195, 212] },
    { position: 0.5, color: [112, 242, 122] },
    { position: 0.67, color: [220, 231, 72] },
    { position: 0.83, color: [254, 145, 47] },
    { position: 1.0, color: [122, 4, 3] },
  ],
};

// === API Types ===

export interface RunSimulationRequest {
  setup: SimulationSetup;
  partStudioId: string;
}

export interface RunSimulationResponse {
  jobId: string;
  status: AnalysisStatus;
  message?: string;
}

export interface SimulationStatusResponse {
  jobId: string;
  status: AnalysisStatus;
  progress: number;
  message?: string;
  results?: SimulationResults;
  error?: string;
}

export interface GenerateMeshRequest {
  partStudioId: string;
  settings: MeshSettings;
}

export interface GenerateMeshResponse {
  mesh: FEAMesh;
  statistics: {
    nodeCount: number;
    elementCount: number;
    elementType: FEAElementType;
    quality: MeshQuality;
    generationTime: number;
  };
}

// === Additional type aliases for consistency ===

export type ConstraintType = 'fixed' | 'displacement';
export type LoadType = 'force' | 'pressure' | 'gravity' | 'temperature';
export type Simulation = SimulationSetup;
export type SimulationSettings = StaticAnalysisSettings | ModalAnalysisSettings;
export type FEAResults = SimulationResults;
export type NodeResult = NodalField;
export type ElementResult = ElementField;
export type StressTensor = { sxx: number; syy: number; szz: number; sxy: number; syz: number; sxz: number };
export type Vector3D = { x: number; y: number; z: number };
export type ColorMap = ColormapStop[];
export type DisplacementResult = NodalField;
export type StressResult = ElementField;
export type CalculiXInput = string;  // .inp file content
export type CalculiXOutput = string;  // .frd or .dat file content
export type CalculiXLog = string;  // .dat log file content
export type DeformationVisualization = ResultsViewSettings;
export type NodeValue = { nodeId: number; values: number[] };
export type ResultSummary = ResultsSummary;

// === Utility functions ===

export function interpolateColor(colormap: ColormapStop[], value: number): [number, number, number] {
  // Clamp value to 0-1
  const t = Math.max(0, Math.min(1, value));
  
  // Find the two stops to interpolate between
  let lowerStop = colormap[0];
  let upperStop = colormap[colormap.length - 1];
  
  for (let i = 0; i < colormap.length - 1; i++) {
    if (t >= colormap[i].position && t <= colormap[i + 1].position) {
      lowerStop = colormap[i];
      upperStop = colormap[i + 1];
      break;
    }
  }
  
  // Interpolate
  const range = upperStop.position - lowerStop.position;
  const localT = range > 0 ? (t - lowerStop.position) / range : 0;
  
  return [
    Math.round(lowerStop.color[0] + (upperStop.color[0] - lowerStop.color[0]) * localT),
    Math.round(lowerStop.color[1] + (upperStop.color[1] - lowerStop.color[1]) * localT),
    Math.round(lowerStop.color[2] + (upperStop.color[2] - lowerStop.color[2]) * localT),
  ];
}

export function getFEAMaterialById(id: string): FEAMaterial | undefined {
  return FEA_MATERIAL_LIBRARY.find(m => m.id === id);
}

export function formatStress(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} GPa`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)} MPa`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)} kPa`;
  return `${value.toFixed(2)} Pa`;
}

export function formatDisplacement(value: number): string {
  if (Math.abs(value) >= 1) return `${value.toFixed(3)} mm`;
  if (Math.abs(value) >= 0.001) return `${(value * 1000).toFixed(3)} μm`;
  return `${(value * 1e6).toFixed(3)} nm`;
}

