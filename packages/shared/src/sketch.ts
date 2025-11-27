// ============================================================================
// SKETCH TYPES - 2D parametric sketching system
// ============================================================================

import { Vector2, Plane, Curve2D, Line2D, Arc2D, Circle2D, Ellipse2D, Polyline2D } from './geometry';

// === Sketch Entity Types ===

export type SketchEntityType = 
  | 'point'
  | 'line'
  | 'arc'
  | 'circle'
  | 'ellipse'
  | 'spline'
  | 'polyline'
  | 'rectangle'
  | 'polygon'
  | 'text'
  | 'constructionLine'
  | 'centerline';

export interface BaseSketchEntity {
  id: string;
  type: SketchEntityType;
  isConstruction: boolean;  // Construction geometry (not used for profiles)
  isFixed: boolean;         // Locked in place
  layer?: string;
}

export interface SketchPoint extends BaseSketchEntity {
  type: 'point';
  x: number;
  y: number;
}

export interface SketchLine extends BaseSketchEntity {
  type: 'line';
  startPoint: string;  // SketchPoint ID
  endPoint: string;    // SketchPoint ID
}

export interface SketchArc extends BaseSketchEntity {
  type: 'arc';
  centerPoint: string;  // SketchPoint ID
  startPoint: string;   // SketchPoint ID
  endPoint: string;     // SketchPoint ID
  radius: number;
  startAngle: number;
  endAngle: number;
  clockwise: boolean;
}

export interface SketchCircle extends BaseSketchEntity {
  type: 'circle';
  centerPoint: string;  // SketchPoint ID
  radius: number;
}

export interface SketchEllipse extends BaseSketchEntity {
  type: 'ellipse';
  centerPoint: string;  // SketchPoint ID
  majorRadius: number;
  minorRadius: number;
  rotation: number;
}

export interface SketchSpline extends BaseSketchEntity {
  type: 'spline';
  controlPoints: string[];  // SketchPoint IDs
  degree: number;
  weights?: number[];
  knots?: number[];
}

export interface SketchRectangle extends BaseSketchEntity {
  type: 'rectangle';
  corner1: string;  // SketchPoint ID
  corner2: string;  // SketchPoint ID
  lines: string[];  // 4 SketchLine IDs
}

export interface SketchPolygon extends BaseSketchEntity {
  type: 'polygon';
  centerPoint: string;  // SketchPoint ID
  vertices: string[];   // SketchPoint IDs
  sides: number;
  inscribed: boolean;   // true = inscribed, false = circumscribed
}

export type SketchEntity = 
  | SketchPoint
  | SketchLine
  | SketchArc
  | SketchCircle
  | SketchEllipse
  | SketchSpline
  | SketchRectangle
  | SketchPolygon;

// === Constraint Types ===

export type ConstraintType =
  | 'coincident'
  | 'horizontal'
  | 'vertical'
  | 'parallel'
  | 'perpendicular'
  | 'tangent'
  | 'concentric'
  | 'equal'
  | 'symmetric'
  | 'midpoint'
  | 'collinear'
  | 'coradial'
  | 'distance'
  | 'angle'
  | 'radius'
  | 'diameter'
  | 'fixedPoint'
  | 'fixedAngle'
  | 'horizontalDistance'
  | 'verticalDistance';

export interface BaseConstraint {
  id: string;
  type: ConstraintType;
  entities: string[];     // Entity or point IDs involved
  isReference: boolean;   // Driven (reference) vs Driving constraint
  priority: number;       // For solver order
}

// Geometric Constraints (no value)
export interface CoincidentConstraint extends BaseConstraint {
  type: 'coincident';
  entities: [string, string];  // Two points or point-on-curve
}

export interface HorizontalConstraint extends BaseConstraint {
  type: 'horizontal';
  entities: [string] | [string, string];  // Line ID or two point IDs
}

export interface VerticalConstraint extends BaseConstraint {
  type: 'vertical';
  entities: [string] | [string, string];  // Line ID or two point IDs
}

export interface ParallelConstraint extends BaseConstraint {
  type: 'parallel';
  entities: [string, string];  // Two line IDs
}

export interface PerpendicularConstraint extends BaseConstraint {
  type: 'perpendicular';
  entities: [string, string];  // Two line IDs
}

export interface TangentConstraint extends BaseConstraint {
  type: 'tangent';
  entities: [string, string];  // Two curve IDs
}

export interface ConcentricConstraint extends BaseConstraint {
  type: 'concentric';
  entities: [string, string];  // Two circle/arc IDs
}

export interface EqualConstraint extends BaseConstraint {
  type: 'equal';
  entities: [string, string];  // Two entities (lines for length, circles for radius)
}

export interface SymmetricConstraint extends BaseConstraint {
  type: 'symmetric';
  entities: [string, string, string];  // Two points and a symmetry line
}

export interface MidpointConstraint extends BaseConstraint {
  type: 'midpoint';
  entities: [string, string];  // Point and line
}

export interface CollinearConstraint extends BaseConstraint {
  type: 'collinear';
  entities: string[];  // Multiple lines
}

// Dimensional Constraints (with value)
export interface DimensionConstraint extends BaseConstraint {
  value: number;
  expression?: string;  // Formula like "width/2"
  displayPosition?: Vector2;  // Where to show the dimension
}

export interface DistanceConstraint extends DimensionConstraint {
  type: 'distance';
  entities: [string, string];  // Two points, point-line, or line-line
}

export interface AngleConstraint extends DimensionConstraint {
  type: 'angle';
  entities: [string, string];  // Two lines
  value: number;  // radians
}

export interface RadiusConstraint extends DimensionConstraint {
  type: 'radius';
  entities: [string];  // Circle or arc ID
}

export interface DiameterConstraint extends DimensionConstraint {
  type: 'diameter';
  entities: [string];  // Circle or arc ID
}

export interface HorizontalDistanceConstraint extends DimensionConstraint {
  type: 'horizontalDistance';
  entities: [string, string];  // Two points
}

export interface VerticalDistanceConstraint extends DimensionConstraint {
  type: 'verticalDistance';
  entities: [string, string];  // Two points
}

export interface FixedPointConstraint extends DimensionConstraint {
  type: 'fixedPoint';
  entities: [string];  // Point ID
  x: number;
  y: number;
}

export type Constraint =
  | CoincidentConstraint
  | HorizontalConstraint
  | VerticalConstraint
  | ParallelConstraint
  | PerpendicularConstraint
  | TangentConstraint
  | ConcentricConstraint
  | EqualConstraint
  | SymmetricConstraint
  | MidpointConstraint
  | CollinearConstraint
  | DistanceConstraint
  | AngleConstraint
  | RadiusConstraint
  | DiameterConstraint
  | HorizontalDistanceConstraint
  | VerticalDistanceConstraint
  | FixedPointConstraint;

// === Sketch State ===

export type SketchStatus = 
  | 'under-constrained'
  | 'fully-constrained'
  | 'over-constrained';

export interface SketchRegion {
  id: string;
  outerLoop: string[];    // Entity IDs forming outer boundary
  innerLoops: string[][]; // Entity IDs forming holes
  area: number;
}

export interface Sketch {
  id: string;
  name: string;
  plane: Plane;
  entities: Record<string, SketchEntity>;
  constraints: Record<string, Constraint>;
  regions: SketchRegion[];
  status: SketchStatus;
  degreesOfFreedom: number;
  parameters: Record<string, number>;  // Named parameters for expressions
  created: string;  // ISO date
  modified: string; // ISO date
}

// === Sketch Solver Types ===

export interface SolverResult {
  success: boolean;
  status: SketchStatus;
  degreesOfFreedom: number;
  positions: Record<string, Vector2>;  // Updated positions for points
  errors: SolverError[];
  iterations: number;
  time: number;  // ms
}

export interface SolverError {
  constraintId: string;
  message: string;
  residual: number;
}

export interface ConstraintConflict {
  constraints: string[];  // Conflicting constraint IDs
  message: string;
}

