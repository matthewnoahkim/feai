// ============================================================================
// ASSEMBLY TYPES - Multi-part assemblies with mates and constraints
// ============================================================================

import { Vector3, Transform, Quaternion, Matrix4, BoundingBox3D } from './geometry';

// === Mate Connector (attachment point) ===

export interface MateConnector {
  id: string;
  name: string;
  origin: Vector3;
  xAxis: Vector3;
  yAxis: Vector3;
  zAxis: Vector3;       // Primary axis (for revolute, slider, etc.)
  implicit?: boolean;   // Auto-generated vs user-defined
  entityRef?: {
    type: 'face' | 'edge' | 'vertex';
    id: string;
  };
}

// === Mate Types ===

export type MateType =
  | 'fastened'      // Fixed, no DOF
  | 'revolute'      // Rotation about one axis (hinge)
  | 'slider'        // Translation along one axis
  | 'cylindrical'   // Rotation + translation along same axis
  | 'planar'        // Movement in a plane (2 DOF translation + 1 rotation)
  | 'ball'          // Spherical joint (3 DOF rotation)
  | 'parallel'      // Keep axes parallel
  | 'tangent';      // Surfaces remain tangent

export interface BaseMate {
  id: string;
  type: MateType;
  name: string;
  suppressed: boolean;
  
  // The two instances being mated
  instance1: string;  // Instance ID
  instance2: string;  // Instance ID
  
  // Mate connectors on each instance
  connector1: string | MateConnector;  // Connector ID or inline definition
  connector2: string | MateConnector;
  
  // Common options
  flip?: boolean;     // Reverse connector alignment
  reorient?: boolean; // Swap primary/secondary axes
}

// === Specific Mate Types ===

export interface FastenedMate extends BaseMate {
  type: 'fastened';
  // No additional parameters - fully constrained
}

export interface RevoluteMate extends BaseMate {
  type: 'revolute';
  limits?: {
    enabled: boolean;
    min: number;       // radians
    max: number;       // radians
  };
  currentAngle?: number;  // Current rotation value
}

export interface SliderMate extends BaseMate {
  type: 'slider';
  limits?: {
    enabled: boolean;
    min: number;       // mm
    max: number;       // mm
  };
  currentOffset?: number;  // Current slide value
}

export interface CylindricalMate extends BaseMate {
  type: 'cylindrical';
  rotationLimits?: {
    enabled: boolean;
    min: number;
    max: number;
  };
  translationLimits?: {
    enabled: boolean;
    min: number;
    max: number;
  };
  currentAngle?: number;
  currentOffset?: number;
}

export interface PlanarMate extends BaseMate {
  type: 'planar';
  // Allows X, Y translation and Z rotation in the plane
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minRotation?: number;
    maxRotation?: number;
  };
}

export interface BallMate extends BaseMate {
  type: 'ball';
  // Spherical joint - 3 rotational DOF
  // Could add cone limits for range of motion
  coneAngle?: number;  // Max angle from reference (radians)
}

export interface ParallelMate extends BaseMate {
  type: 'parallel';
  offset?: number;     // Distance between parallel elements
}

export interface TangentMate extends BaseMate {
  type: 'tangent';
  insideTangent?: boolean;  // For cylinders: inside vs outside tangent
}

export type Mate = 
  | FastenedMate
  | RevoluteMate
  | SliderMate
  | CylindricalMate
  | PlanarMate
  | BallMate
  | ParallelMate
  | TangentMate;

// === Relations (gear, rack-pinion, screw) ===

export type RelationType = 'gear' | 'rackAndPinion' | 'screw' | 'linear';

export interface BaseRelation {
  id: string;
  type: RelationType;
  name: string;
  suppressed: boolean;
}

export interface GearRelation extends BaseRelation {
  type: 'gear';
  mate1: string;       // Revolute mate ID
  mate2: string;       // Revolute mate ID
  ratio: number;       // gear1 teeth / gear2 teeth
  reverse?: boolean;   // Opposite rotation direction
}

export interface RackAndPinionRelation extends BaseRelation {
  type: 'rackAndPinion';
  revoluteMate: string;   // Revolute mate ID (pinion)
  sliderMate: string;     // Slider mate ID (rack)
  pitchRadius: number;    // Radius of pinion
  reverse?: boolean;
}

export interface ScrewRelation extends BaseRelation {
  type: 'screw';
  cylindricalMate: string;  // Cylindrical mate ID
  pitch: number;            // Translation per revolution (mm)
  reverse?: boolean;
}

export interface LinearRelation extends BaseRelation {
  type: 'linear';
  mate1: string;       // Any mate with DOF
  mate2: string;       // Any mate with DOF
  ratio: number;       // Linear scaling factor
}

export type Relation = GearRelation | RackAndPinionRelation | ScrewRelation | LinearRelation;

// === Assembly Instance ===

export interface AssemblyInstance {
  id: string;
  name: string;
  
  // What this instance refers to
  sourceType: 'part' | 'assembly';
  sourceId: string;    // Part ID or sub-assembly ID
  
  // Transform in assembly space
  transform: Transform;
  
  // Mate connectors defined on this instance
  mateConnectors: MateConnector[];
  
  // Display options
  visible: boolean;
  transparent?: boolean;
  color?: string;      // Override color
  
  // State
  fixed: boolean;      // Grounded - doesn't move
  suppressed: boolean;
}

// === Assembly ===

export interface Assembly {
  id: string;
  name: string;
  
  // Instances in this assembly
  instances: Record<string, AssemblyInstance>;
  
  // Mates between instances
  mates: Record<string, Mate>;
  
  // Relations (gear ratios, etc.)
  relations: Record<string, Relation>;
  
  // Assembly configurations (named states)
  configurations?: AssemblyConfiguration[];
  currentConfiguration?: string;
  
  // Exploded views
  explodedViews?: ExplodedView[];
  
  // Metadata
  created: string;
  modified: string;
}

// === Assembly Configuration ===

export interface AssemblyConfiguration {
  id: string;
  name: string;
  description?: string;
  
  // Overrides for this configuration
  instanceOverrides: {
    instanceId: string;
    suppressed?: boolean;
    transform?: Transform;
  }[];
  
  mateOverrides: {
    mateId: string;
    suppressed?: boolean;
    value?: number;  // For mates with DOF
  }[];
}

// === Exploded View ===

export interface ExplosionStep {
  instanceId: string;
  offset: Vector3;
  order: number;
}

export interface ExplodedView {
  id: string;
  name: string;
  steps: ExplosionStep[];
  trailLines?: boolean;  // Show connection lines
}

// === Interference Detection ===

export interface InterferenceResult {
  instance1: string;
  instance2: string;
  volume: number;          // Interference volume in mm³
  boundingBox: BoundingBox3D;
  type: 'hard' | 'soft';   // Hard = solid overlap, soft = clearance violation
}

export interface ClearanceResult {
  instance1: string;
  instance2: string;
  minDistance: number;     // mm
  point1: Vector3;         // Closest point on instance1
  point2: Vector3;         // Closest point on instance2
  adequate: boolean;       // Meets required clearance
}

// === Assembly Analysis ===

export interface AssemblyMassProperties {
  totalMass: number;
  centerOfMass: Vector3;
  momentOfInertia: Matrix4;
  boundingBox: BoundingBox3D;
  componentMasses: {
    instanceId: string;
    mass: number;
  }[];
}

// === Motion Analysis ===

export interface MotionState {
  instanceId: string;
  transform: Transform;
  velocity?: Vector3;
  angularVelocity?: Vector3;
}

export interface MotionSnapshot {
  time: number;
  states: MotionState[];
  mateValues: {
    mateId: string;
    value: number;
  }[];
}

