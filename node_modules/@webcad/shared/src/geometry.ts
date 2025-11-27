// ============================================================================
// GEOMETRY TYPES - Core mathematical representations for CAD
// ============================================================================

// === Vector and Matrix Types ===

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

// Row-major 4x4 transformation matrix
export type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

// === Geometric Primitives ===

export interface Point2D extends Vector2 {
  id: string;
}

export interface Point3D extends Vector3 {
  id: string;
}

export interface Plane {
  origin: Vector3;
  normal: Vector3;
  xAxis: Vector3;
  yAxis: Vector3;
}

export interface BoundingBox2D {
  min: Vector2;
  max: Vector2;
}

export interface BoundingBox3D {
  min: Vector3;
  max: Vector3;
}

// === Curve Types ===

export type CurveType = 
  | 'line'
  | 'arc'
  | 'circle'
  | 'ellipse'
  | 'spline'
  | 'polyline'
  | 'bezier';

export interface BaseCurve {
  id: string;
  type: CurveType;
}

export interface Line2D extends BaseCurve {
  type: 'line';
  start: Vector2;
  end: Vector2;
}

export interface Line3D {
  id: string;
  type: 'line';
  start: Vector3;
  end: Vector3;
}

export interface Arc2D extends BaseCurve {
  type: 'arc';
  center: Vector2;
  radius: number;
  startAngle: number; // radians
  endAngle: number;   // radians
  clockwise: boolean;
}

export interface Circle2D extends BaseCurve {
  type: 'circle';
  center: Vector2;
  radius: number;
}

export interface Ellipse2D extends BaseCurve {
  type: 'ellipse';
  center: Vector2;
  majorRadius: number;
  minorRadius: number;
  rotation: number; // radians
}

export interface Polyline2D extends BaseCurve {
  type: 'polyline';
  points: Vector2[];
  closed: boolean;
}

// NURBS Curve
export interface NurbsCurve extends BaseCurve {
  type: 'spline';
  degree: number;
  controlPoints: Vector3[];
  weights: number[];
  knots: number[];
}

export interface BezierCurve extends BaseCurve {
  type: 'bezier';
  controlPoints: Vector3[];
}

export type Curve2D = Line2D | Arc2D | Circle2D | Ellipse2D | Polyline2D;

// === Surface Types ===

export type SurfaceType = 
  | 'plane'
  | 'cylinder'
  | 'cone'
  | 'sphere'
  | 'torus'
  | 'nurbs'
  | 'bezier';

export interface BaseSurface {
  id: string;
  type: SurfaceType;
}

export interface PlaneSurface extends BaseSurface {
  type: 'plane';
  origin: Vector3;
  normal: Vector3;
}

export interface CylinderSurface extends BaseSurface {
  type: 'cylinder';
  origin: Vector3;
  axis: Vector3;
  radius: number;
}

export interface ConeSurface extends BaseSurface {
  type: 'cone';
  apex: Vector3;
  axis: Vector3;
  halfAngle: number; // radians
}

export interface SphereSurface extends BaseSurface {
  type: 'sphere';
  center: Vector3;
  radius: number;
}

export interface TorusSurface extends BaseSurface {
  type: 'torus';
  center: Vector3;
  axis: Vector3;
  majorRadius: number;
  minorRadius: number;
}

// NURBS Surface
export interface NurbsSurface extends BaseSurface {
  type: 'nurbs';
  degreeU: number;
  degreeV: number;
  controlPointsU: number;
  controlPointsV: number;
  controlPoints: Vector3[][]; // 2D array [u][v]
  weights: number[][];
  knotsU: number[];
  knotsV: number[];
}

export type Surface = 
  | PlaneSurface 
  | CylinderSurface 
  | ConeSurface 
  | SphereSurface 
  | TorusSurface 
  | NurbsSurface;

// === B-Rep (Boundary Representation) Types ===

export interface Vertex {
  id: string;
  point: Vector3;
  edges: string[]; // Edge IDs
}

export interface Edge {
  id: string;
  curve: NurbsCurve | Line3D;
  startVertex: string; // Vertex ID
  endVertex: string;   // Vertex ID
  faces: string[];     // Face IDs (usually 2, or 1 for boundary)
}

export interface Loop {
  id: string;
  edges: string[];    // Edge IDs in order
  orientations: boolean[]; // true if edge direction matches loop direction
  isOuter: boolean;   // true for outer boundary, false for holes
}

export interface Face {
  id: string;
  surface: Surface;
  loops: Loop[];      // First is outer, rest are holes
  normal: Vector3;    // Outward facing normal
}

export interface Shell {
  id: string;
  faces: string[];    // Face IDs
  isOuter: boolean;   // true for outer shell, false for void
}

export interface Solid {
  id: string;
  shells: Shell[];    // First is outer, rest are voids
  vertices: Map<string, Vertex>;
  edges: Map<string, Edge>;
  faces: Map<string, Face>;
}

// Simplified solid for serialization
export interface SolidData {
  id: string;
  shells: Shell[];
  vertices: Record<string, Vertex>;
  edges: Record<string, Edge>;
  faces: Record<string, Face>;
}

// === Mesh Types (for visualization and STL export) ===

export interface TriangleMesh {
  vertices: Float32Array;  // x,y,z triplets
  normals: Float32Array;   // x,y,z triplets
  indices: Uint32Array;    // triangle indices
  uvs?: Float32Array;      // u,v pairs (optional)
}

export interface MeshData {
  positions: number[];
  normals: number[];
  indices: number[];
  uvs?: number[];
}

// === Mass Properties ===

export interface MassProperties {
  volume: number;
  surfaceArea: number;
  mass: number;
  centerOfMass: Vector3;
  momentOfInertia: Matrix4;
  principalAxes: Vector3[];
  principalMoments: Vector3;
}

// === Material ===

export interface Material {
  id: string;
  name: string;
  density: number;          // kg/m³
  color: string;            // hex color
  roughness: number;        // 0-1
  metalness: number;        // 0-1
  opacity: number;          // 0-1
  emissive?: string;        // hex color
  emissiveIntensity?: number;
}

// === Tolerances ===

export interface Tolerance {
  linear: number;    // mm
  angular: number;   // radians
}

export const DEFAULT_TOLERANCE: Tolerance = {
  linear: 1e-6,
  angular: 1e-9
};

