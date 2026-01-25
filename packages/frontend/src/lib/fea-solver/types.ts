/**
 * API Types for External FEA Solver
 * https://fea-solver.vercel.app
 */

// ============================================================================
// Unit Systems
// ============================================================================

export type UnitSystemType = 'SI' | 'SI_MM' | 'US_CUSTOMARY';

export interface UnitSystem {
  type: UnitSystemType;
}

// ============================================================================
// Mesh Types
// ============================================================================

export interface BoxMesh {
  type: 'box';
  min: [number, number, number];
  max: [number, number, number];
  subdivisions?: [number, number, number];
}

export interface CylinderMesh {
  type: 'cylinder';
  center?: [number, number, number];
  radius: number;
  height: number;
  n_radial?: number;
  n_axial?: number;
}

export interface FileMesh {
  type: 'file';
  format: 'msh' | 'vtk' | 'inp';
  data: string; // Base64 encoded
}

export type Mesh = BoxMesh | CylinderMesh | FileMesh;

// ============================================================================
// Boundary Targets
// ============================================================================

export interface BoundaryIdTarget {
  type: 'boundary_id';
  id: number;
}

export interface PointTarget {
  type: 'point';
  location: [number, number, number];
  tolerance?: number;
}

export interface BoxTarget {
  type: 'box';
  min: [number, number, number];
  max: [number, number, number];
}

export interface SphereTarget {
  type: 'sphere';
  center: [number, number, number];
  radius: number;
}

export type BoundaryTarget = BoundaryIdTarget | PointTarget | BoxTarget | SphereTarget;

// ============================================================================
// Boundary Conditions
// ============================================================================

export interface FixedBC {
  type: 'fixed';
  target: BoundaryTarget;
  description?: string;
}

export interface DisplacementBC {
  type: 'displacement';
  target: BoundaryTarget;
  values: [number | null, number | null, number | null];
  description?: string;
}

export interface SymmetryBC {
  type: 'symmetry';
  target: BoundaryTarget;
  plane_normal: [number, number, number];
  description?: string;
}

export interface ElasticSupportBC {
  type: 'elastic_support';
  target: BoundaryTarget;
  stiffness_per_area: [number, number, number];
  description?: string;
}

export type BoundaryCondition = FixedBC | DisplacementBC | SymmetryBC | ElasticSupportBC;

// ============================================================================
// Loads
// ============================================================================

export interface GravityLoad {
  type: 'gravity';
  acceleration: [number, number, number];
  description?: string;
}

export interface PressureLoad {
  type: 'pressure';
  target: BoundaryTarget;
  value: number;
  is_follower?: boolean;
  description?: string;
}

export interface SurfaceForceLoad {
  type: 'surface_force';
  target: BoundaryTarget;
  force_per_area: [number, number, number];
  description?: string;
}

export interface PointForceLoad {
  type: 'point_force';
  location: [number, number, number];
  force: [number, number, number];
  distribution_radius?: number;
  description?: string;
}

export interface ThermalLoad {
  type: 'thermal';
  reference_temperature: number;
  applied_temperature: number;
  description?: string;
}

export interface CentrifugalLoad {
  type: 'centrifugal';
  axis_point: [number, number, number];
  axis_direction: [number, number, number];
  angular_velocity: number;
  description?: string;
}

export type Load = 
  | GravityLoad 
  | PressureLoad 
  | SurfaceForceLoad 
  | PointForceLoad 
  | ThermalLoad
  | CentrifugalLoad;

// ============================================================================
// Materials
// ============================================================================

export interface MaterialAssignment {
  default?: string;
  regions?: Array<{
    material_id: number;
    material: string;
  }>;
}

export interface MaterialProperties {
  id: string;
  name: string;
  youngs_modulus: number;
  poissons_ratio: number;
  density: number;
  yield_strength?: number;
  ultimate_strength?: number;
  thermal_expansion?: number;
}

// ============================================================================
// Solver Options
// ============================================================================

export interface SolverOptions {
  fe_degree?: 1 | 2;
  refinement_cycles?: number;
  adaptive_refinement?: boolean;
  max_iterations?: number;
  tolerance?: number;
  large_deformation?: boolean;
  compute_reactions?: boolean;
  compute_safety_factors?: boolean;
}

// ============================================================================
// Analysis Request
// ============================================================================

export interface AnalysisRequest {
  mesh: Mesh;
  materials?: MaterialAssignment;
  boundary_conditions: BoundaryCondition[];
  loads?: Load[];
  solver_options?: SolverOptions;
  units?: UnitSystem;
}

// ============================================================================
// Job Status
// ============================================================================

export type JobStatusType = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface JobSubmitResponse {
  job_id: string;
  status: JobStatusType;
  queue_position?: number;
  message?: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatusType;
  progress?: number;
  current_stage?: string;
  error?: string;
  created_at?: number;
  completed_at?: number;
}

// ============================================================================
// Results
// ============================================================================

export interface DisplacementResults {
  max: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  min: {
    x: number;
    y: number;
    z: number;
  };
  max_location?: [number, number, number];
}

export interface StressResults {
  von_mises: {
    max: number;
    min: number;
    avg: number;
    max_location?: [number, number, number];
  };
  principal?: {
    sigma_1: { max: number; min: number };
    sigma_2: { max: number; min: number };
    sigma_3: { max: number; min: number };
  };
  tresca?: { max: number };
}

export interface ReactionResults {
  boundaries?: Array<{
    boundary_id: number;
    force: [number, number, number];
    moment: [number, number, number];
  }>;
  total_force: [number, number, number];
  total_moment?: [number, number, number];
  equilibrium?: {
    force_error_percent: number;
    is_balanced: boolean;
  };
}

export interface SafetyFactorResults {
  min: number;
  avg: number;
  min_location?: [number, number, number];
  distribution?: {
    below_1_0: number;
    below_1_5: number;
    below_2_0: number;
  };
}

export interface AnalysisResults {
  job_id: string;
  status: 'completed';
  displacements: DisplacementResults;
  stress: StressResults;
  reactions?: ReactionResults;
  safety_factors?: SafetyFactorResults;
  strain_energy?: {
    total: number;
  };
  mesh_quality?: {
    num_elements: number;
    num_nodes: number;
  };
  computation_time?: number;
  output_files?: {
    vtk?: string;
    csv?: string;
  };
}

// ============================================================================
// Mesh Quality
// ============================================================================

export interface MeshQualityResponse {
  num_elements: number;
  num_nodes: number;
  metrics: {
    jacobian_ratio: { min: number; max: number; avg: number };
    aspect_ratio: { min: number; max: number; avg: number };
    skewness?: { max: number; avg: number };
  };
  poor_quality_elements?: number;
  quality_acceptable: boolean;
  warnings?: string[];
}

// ============================================================================
// Health Check
// ============================================================================

export interface HealthResponse {
  gateway: string;
  compute_server: {
    status: string;
    workers?: {
      total: number;
      busy: number;
      available: number;
    };
    queue?: {
      pending: number;
    };
  };
  timestamp: string;
}

// ============================================================================
// Error Response
// ============================================================================

export interface ApiError {
  error: string;
  details?: string[];
}
