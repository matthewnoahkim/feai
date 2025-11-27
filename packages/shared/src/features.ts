// ============================================================================
// FEATURE TYPES - Parametric modeling operations
// ============================================================================

import { Vector3, Plane, Transform, SolidData, NurbsSurface } from './geometry';
import { Sketch } from './sketch';

// === Feature Base Types ===

export type FeatureType =
  // Sketch-based features
  | 'sketch'
  | 'extrude'
  | 'revolve'
  | 'sweep'
  | 'loft'
  // Modification features
  | 'fillet'
  | 'chamfer'
  | 'shell'
  | 'draft'
  | 'rib'
  // Pattern features
  | 'linearPattern'
  | 'circularPattern'
  | 'mirror'
  // Boolean features
  | 'union'
  | 'subtract'
  | 'intersect'
  // Surface features
  | 'surfaceExtrude'
  | 'surfaceRevolve'
  | 'surfaceLoft'
  | 'surfaceSweep'
  | 'surfaceFill'
  | 'surfaceOffset'
  | 'trim'
  | 'extend'
  | 'thicken'
  | 'knit'
  // Direct editing features
  | 'moveFace'
  | 'offsetFace'
  | 'deleteFace'
  | 'replaceFace'
  // Reference features
  | 'plane'
  | 'axis'
  | 'point'
  // Import
  | 'import';

export type FeatureStatus = 
  | 'valid'
  | 'warning'
  | 'error'
  | 'suppressed';

export interface BaseFeature {
  id: string;
  type: FeatureType;
  name: string;
  status: FeatureStatus;
  errorMessage?: string;
  suppressed: boolean;
  parameters: Record<string, any>;
  references: FeatureReference[];  // References to other features/geometry
  created: string;
  modified: string;
}

export interface FeatureReference {
  type: 'face' | 'edge' | 'vertex' | 'sketch' | 'feature' | 'plane' | 'axis' | 'body';
  id: string;
  featureId?: string;  // Which feature this belongs to
}

// === Sketch Feature ===

export interface SketchFeature extends BaseFeature {
  type: 'sketch';
  parameters: {
    plane: FeatureReference | Plane;
    offset?: number;
  };
  sketch: Sketch;
}

// === Extrude Feature ===

export type ExtrudeEndCondition = 
  | 'blind'           // Fixed distance
  | 'symmetric'       // Equal distance both sides
  | 'throughAll'      // Through entire part
  | 'toNext'          // To next face
  | 'toFace'          // To selected face
  | 'toBody'          // To selected body
  | 'midPlane';       // Centered on sketch

export type BooleanOperation = 'new' | 'add' | 'remove' | 'intersect';

export interface ExtrudeFeature extends BaseFeature {
  type: 'extrude';
  parameters: {
    sketch: FeatureReference;
    regions?: string[];         // Specific regions, or all if empty
    depth: number;
    depthExpression?: string;
    endCondition: ExtrudeEndCondition;
    endFace?: FeatureReference;
    draftAngle?: number;        // radians
    draftInward?: boolean;
    operation: BooleanOperation;
    targetBody?: FeatureReference;
    
    // Second direction (optional)
    secondDirection?: boolean;
    depth2?: number;
    endCondition2?: ExtrudeEndCondition;
    endFace2?: FeatureReference;
  };
}

// === Revolve Feature ===

export interface RevolveFeature extends BaseFeature {
  type: 'revolve';
  parameters: {
    sketch: FeatureReference;
    regions?: string[];
    axis: FeatureReference | { point: Vector3; direction: Vector3 };
    angle: number;              // radians, 2π for full
    angleExpression?: string;
    operation: BooleanOperation;
    targetBody?: FeatureReference;
    
    // Second direction
    secondDirection?: boolean;
    angle2?: number;
  };
}

// === Sweep Feature ===

export type SweepOrientation = 
  | 'keepNormal'      // Maintain profile orientation
  | 'followPath'      // Rotate to follow path curvature
  | 'keepParallel';   // Keep parallel to original

export interface SweepFeature extends BaseFeature {
  type: 'sweep';
  parameters: {
    profile: FeatureReference;  // Sketch or face
    path: FeatureReference;     // Edge or sketch curve
    orientation: SweepOrientation;
    twist?: number;             // radians per unit length
    scale?: number;             // End scale factor
    operation: BooleanOperation;
    targetBody?: FeatureReference;
  };
}

// === Loft Feature ===

export interface LoftFeature extends BaseFeature {
  type: 'loft';
  parameters: {
    profiles: FeatureReference[];    // Sketches or faces in order
    guides?: FeatureReference[];     // Guide curves
    startCondition?: 'none' | 'tangent' | 'curvature';
    endCondition?: 'none' | 'tangent' | 'curvature';
    startTangentFace?: FeatureReference;
    endTangentFace?: FeatureReference;
    closed?: boolean;               // Connect last to first
    operation: BooleanOperation;
    targetBody?: FeatureReference;
  };
}

// === Fillet Feature ===

export interface FilletFeature extends BaseFeature {
  type: 'fillet';
  parameters: {
    edges: FeatureReference[];
    radius: number;
    radiusExpression?: string;
    variableRadius?: {
      parameter: number;  // 0-1 along edge
      radius: number;
    }[];
    tangentPropagation?: boolean;  // Auto-select tangent edges
    preserveFeatures?: boolean;    // Try to preserve adjacent features
  };
}

// === Chamfer Feature ===

export type ChamferType = 'equalDistance' | 'twoDistances' | 'distanceAngle';

export interface ChamferFeature extends BaseFeature {
  type: 'chamfer';
  parameters: {
    edges: FeatureReference[];
    chamferType: ChamferType;
    distance1: number;
    distance2?: number;           // For twoDistances
    angle?: number;               // For distanceAngle (radians)
    tangentPropagation?: boolean;
  };
}

// === Shell Feature ===

export interface ShellFeature extends BaseFeature {
  type: 'shell';
  parameters: {
    body: FeatureReference;
    facesToRemove: FeatureReference[];
    thickness: number;
    thicknessInward?: boolean;   // Shell inward vs outward
  };
}

// === Draft Feature ===

export interface DraftFeature extends BaseFeature {
  type: 'draft';
  parameters: {
    faces: FeatureReference[];
    pullDirection: Vector3 | FeatureReference;  // Plane normal or direction
    neutralPlane?: FeatureReference;
    angle: number;                // radians
    tangentPropagation?: boolean;
  };
}

// === Rib Feature ===

export interface RibFeature extends BaseFeature {
  type: 'rib';
  parameters: {
    sketch: FeatureReference;     // Open profile sketch
    thickness: number;
    extrudeDirection: 'normal' | 'parallel';  // To sketch plane
    flipSide?: boolean;
    operation: BooleanOperation;
    targetBody?: FeatureReference;
  };
}

// === Pattern Features ===

export interface LinearPatternFeature extends BaseFeature {
  type: 'linearPattern';
  parameters: {
    features: FeatureReference[];  // Features to pattern
    direction1: Vector3 | FeatureReference;
    count1: number;
    spacing1: number;
    
    // Second direction (optional)
    direction2?: Vector3 | FeatureReference;
    count2?: number;
    spacing2?: number;
    
    skipInstances?: number[];     // Instance indices to skip
  };
}

export interface CircularPatternFeature extends BaseFeature {
  type: 'circularPattern';
  parameters: {
    features: FeatureReference[];
    axis: FeatureReference | { point: Vector3; direction: Vector3 };
    count: number;
    angle?: number;              // Total angle, or full circle if omitted
    equalSpacing?: boolean;
    skipInstances?: number[];
  };
}

export interface MirrorFeature extends BaseFeature {
  type: 'mirror';
  parameters: {
    features: FeatureReference[];
    mirrorPlane: FeatureReference | Plane;
    mergeResult?: boolean;
  };
}

// === Boolean Features ===

export interface UnionFeature extends BaseFeature {
  type: 'union';
  parameters: {
    bodies: FeatureReference[];
    keepTools?: boolean;
  };
}

export interface SubtractFeature extends BaseFeature {
  type: 'subtract';
  parameters: {
    targetBody: FeatureReference;
    toolBodies: FeatureReference[];
    keepTools?: boolean;
  };
}

export interface IntersectFeature extends BaseFeature {
  type: 'intersect';
  parameters: {
    bodies: FeatureReference[];
    keepOriginals?: boolean;
  };
}

// === Surface Features ===

export interface SurfaceExtrudeFeature extends BaseFeature {
  type: 'surfaceExtrude';
  parameters: {
    curves: FeatureReference[];   // Sketch curves
    depth: number;
    direction?: Vector3;
  };
}

export interface SurfaceLoftFeature extends BaseFeature {
  type: 'surfaceLoft';
  parameters: {
    profiles: FeatureReference[];  // Curves
    guides?: FeatureReference[];
    closed?: boolean;
  };
}

export interface SurfaceFillFeature extends BaseFeature {
  type: 'surfaceFill';
  parameters: {
    boundaryEdges: FeatureReference[];
    tangentFaces?: FeatureReference[];
    continuity?: 'contact' | 'tangent' | 'curvature';
  };
}

export interface ThickenFeature extends BaseFeature {
  type: 'thicken';
  parameters: {
    surface: FeatureReference;
    thickness: number;
    bothSides?: boolean;
    operation: BooleanOperation;
  };
}

export interface KnitFeature extends BaseFeature {
  type: 'knit';
  parameters: {
    surfaces: FeatureReference[];
    createSolid?: boolean;        // If closed, make solid
    tolerance?: number;
  };
}

// === Direct Editing Features ===

export interface MoveFaceFeature extends BaseFeature {
  type: 'moveFace';
  parameters: {
    faces: FeatureReference[];
    transform: Transform | { offset: Vector3 } | { angle: number; axis: Vector3; point: Vector3 };
  };
}

export interface OffsetFaceFeature extends BaseFeature {
  type: 'offsetFace';
  parameters: {
    faces: FeatureReference[];
    offset: number;               // Positive = outward
  };
}

export interface DeleteFaceFeature extends BaseFeature {
  type: 'deleteFace';
  parameters: {
    faces: FeatureReference[];
    heal?: boolean;               // Try to close resulting gap
  };
}

// === Reference Features ===

export interface PlaneFeature extends BaseFeature {
  type: 'plane';
  parameters: {
    method: 'offset' | 'angle' | 'threePoints' | 'lineAndPoint' | 'tangent';
    reference?: FeatureReference;
    offset?: number;
    angle?: number;
    points?: Vector3[];
    line?: FeatureReference;
  };
}

// === Feature Tree ===

export type Feature = 
  | SketchFeature
  | ExtrudeFeature
  | RevolveFeature
  | SweepFeature
  | LoftFeature
  | FilletFeature
  | ChamferFeature
  | ShellFeature
  | DraftFeature
  | RibFeature
  | LinearPatternFeature
  | CircularPatternFeature
  | MirrorFeature
  | UnionFeature
  | SubtractFeature
  | IntersectFeature
  | SurfaceExtrudeFeature
  | SurfaceLoftFeature
  | SurfaceFillFeature
  | ThickenFeature
  | KnitFeature
  | MoveFaceFeature
  | OffsetFaceFeature
  | DeleteFaceFeature
  | PlaneFeature;

export interface FeatureTree {
  features: Feature[];
  rollbackIndex?: number;   // Index to roll back to (for history navigation)
}

// === Part ===

export interface PartBody {
  id: string;
  name: string;
  solid?: SolidData;
  surfaces?: NurbsSurface[];
  material?: string;          // Material ID
  appearance?: {
    color: string;
    opacity: number;
  };
}

export interface Part {
  id: string;
  name: string;
  featureTree: FeatureTree;
  bodies: PartBody[];
  defaultPlanes: {
    top: Plane;
    front: Plane;
    right: Plane;
  };
  parameters: Record<string, number>;  // Global parameters
  created: string;
  modified: string;
}

