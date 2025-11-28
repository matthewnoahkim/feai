// feai Shared Types and Interfaces
// Core data structures for the CAD system

export * from './geometry';
export * from './sketch';
export * from './features';
export * from './assembly';
export * from './drawing';
export * from './document';
export * from './api';

// FEA types - export explicitly to avoid naming conflicts
export type {
  // Analysis Types
  AnalysisType,
  AnalysisStatus,
  
  // Element Types (renamed to avoid conflict with document.ElementType)
  FEAElementType,
  FEAElementTypeInfo,
  
  // Material Types (renamed to avoid conflict with geometry.Material)
  FEAMaterial,
  FEAMaterialProperty,
  FEAMaterialProperties,
  FEAMaterialAssignment,
  MaterialCategory,
  FEAMaterialCategory,
  
  // Mesh Types
  FEMesh,
  FEAMesh,
  FENode,
  FEANode,
  FEElement,
  FEAElement,
  NodeSet,
  FEANodeSet,
  ElementSet,
  FEAElementSet,
  FEASurface,  // Note: This is different from geometry.Surface
  MeshQuality,
  MeshSettings,
  RefinementRegion,
  MeshRefinementRegion,
  
  // Boundary Conditions
  BoundaryCondition,
  BoundaryConditionType,
  BaseBoundaryCondition,
  FixedConstraint,
  DisplacementConstraint,
  ForceLoad,
  PressureLoad,
  GravityLoad,
  TemperatureConstraint,
  ConstraintType,
  LoadType,
  
  // Simulation
  Simulation,
  SimulationSetup,
  SimulationSettings,
  StaticAnalysisSettings,
  ModalAnalysisSettings,
  OutputRequest,
  
  // Results
  FEAResults,
  SimulationResults,
  StaticResults,
  ModalResults,
  ModalMode,
  ResultField,
  NodalField,
  NodeResult,
  ElementField,
  ElementResult,
  NodeValue,
  DisplacementResult,
  StressResult,
  StressTensor,
  Vector3D,
  ResultSummary,
  ResultsSummary,
  ResultsViewSettings,
  
  // CalculiX I/O
  CalculiXInput,
  CalculiXOutput,
  CalculiXLog,
  
  // Visualization
  ColorMap,
  ColormapStop,
  ColormapType,
  DeformationVisualization,
  
  // API types
  RunSimulationRequest,
  RunSimulationResponse,
  SimulationStatusResponse,
  GenerateMeshRequest,
  GenerateMeshResponse,
} from './fea';

export { 
  FEA_ELEMENT_TYPES, 
  FEA_MATERIAL_LIBRARY, 
  COLORMAPS,
  interpolateColor,
  getFEAMaterialById,
  formatStress,
  formatDisplacement,
} from './fea';
