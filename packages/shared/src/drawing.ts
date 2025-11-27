// ============================================================================
// DRAWING TYPES - 2D technical drawings from 3D models
// ============================================================================

import { Vector2, Vector3, BoundingBox2D } from './geometry';

// === Drawing Sheet ===

export type PaperSize = 
  | 'A4' | 'A3' | 'A2' | 'A1' | 'A0'
  | 'Letter' | 'Legal' | 'Tabloid'
  | 'ANSI_A' | 'ANSI_B' | 'ANSI_C' | 'ANSI_D' | 'ANSI_E'
  | 'Custom';

export type ProjectionType = 'firstAngle' | 'thirdAngle';

export interface SheetFormat {
  size: PaperSize;
  width: number;          // mm
  height: number;         // mm
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  titleBlock?: TitleBlock;
  borderStyle?: {
    width: number;
    zones?: boolean;      // Zone markers (A-H, 1-8)
  };
}

export interface TitleBlock {
  template: string;       // Template ID or name
  position: Vector2;      // Bottom-left corner
  width: number;
  height: number;
  fields: Record<string, string>;  // Field name -> value
}

// === Drawing View Types ===

export type ViewType =
  | 'standard'       // Orthographic projection
  | 'section'        // Section view
  | 'detail'         // Enlarged detail
  | 'auxiliary'      // Auxiliary projection
  | 'isometric'      // Isometric view
  | 'broken'         // Broken view (shortened)
  | 'exploded';      // Exploded assembly view

export type StandardView = 
  | 'front' | 'back' 
  | 'top' | 'bottom' 
  | 'left' | 'right'
  | 'isometric' | 'trimetric' | 'dimetric';

export interface BaseDrawingView {
  id: string;
  type: ViewType;
  name: string;
  
  // Position on sheet
  position: Vector2;      // Center of view
  scale: number;          // e.g., 1.0 = 1:1, 0.5 = 1:2
  rotation: number;       // radians
  
  // Source model
  sourceType: 'part' | 'assembly';
  sourceId: string;
  configuration?: string;
  
  // Display options
  displayStyle: ViewDisplayStyle;
  showHiddenLines: boolean;
  showTangentEdges: boolean;
  showThreads: boolean;
  
  // Bounds
  boundingBox: BoundingBox2D;
  
  // Clipping (for broken views)
  clipBoundary?: Vector2[];
}

export interface ViewDisplayStyle {
  mode: 'hiddenLineRemoved' | 'hiddenLineVisible' | 'shaded' | 'shadedWithEdges';
  lineWeight: number;
  hiddenLineStyle: 'dashed' | 'phantom' | 'none';
  color?: string;
}

// === Specific View Types ===

export interface StandardDrawingView extends BaseDrawingView {
  type: 'standard';
  viewDirection: StandardView | Vector3;  // Named view or custom direction
  parentView?: string;    // For projected views
}

export interface SectionView extends BaseDrawingView {
  type: 'section';
  parentView: string;     // View the section is taken from
  sectionLine: SectionLine;
  hatchPattern: HatchPattern;
  depth?: 'full' | 'half' | 'offset' | 'aligned';
  showCutFaces: boolean;
}

export interface SectionLine {
  points: Vector2[];      // Section cut line points
  direction: Vector2;     // Arrow direction
  label: string;          // e.g., "A-A"
  offset?: number[];      // For offset sections
}

export interface HatchPattern {
  pattern: string;        // Pattern name or 'solid'
  angle: number;          // radians
  scale: number;
  color?: string;
}

export interface DetailView extends BaseDrawingView {
  type: 'detail';
  parentView: string;
  detailBoundary: {
    type: 'circle' | 'rectangle' | 'spline';
    center: Vector2;
    radius?: number;      // For circle
    size?: Vector2;       // For rectangle
    points?: Vector2[];   // For spline
  };
  label: string;          // e.g., "DETAIL A"
  showBoundary: boolean;
  scaleFactor: number;    // Enlargement factor
}

export interface AuxiliaryView extends BaseDrawingView {
  type: 'auxiliary';
  parentView: string;
  projectionEdge: string; // Edge ID to project from
  foldLine?: boolean;     // Show fold line
}

export type DrawingView = 
  | StandardDrawingView
  | SectionView
  | DetailView
  | AuxiliaryView;

// === Dimensions ===

export type DimensionType =
  | 'linear'
  | 'aligned'
  | 'angular'
  | 'radial'
  | 'diameter'
  | 'arc'
  | 'ordinate'
  | 'chamfer'
  | 'hole';

export interface BaseDimension {
  id: string;
  type: DimensionType;
  viewId: string;         // Which view this dimension is on
  
  // References
  references: DimensionReference[];
  
  // Value
  value: number;
  displayValue?: string;  // Override display text
  tolerance?: DimensionTolerance;
  
  // Position
  textPosition: Vector2;
  
  // Style
  style: DimensionStyle;
}

export interface DimensionReference {
  type: 'edge' | 'vertex' | 'face' | 'center' | 'midpoint' | 'intersection';
  entityId: string;
  point?: Vector2;        // Specific point on entity
}

export interface DimensionTolerance {
  type: 'symmetric' | 'deviation' | 'limits' | 'basic' | 'reference';
  upper?: number;
  lower?: number;
  fit?: string;           // e.g., "H7", "g6"
}

export interface DimensionStyle {
  font: string;
  fontSize: number;
  arrowStyle: 'filled' | 'open' | 'dot' | 'slash' | 'none';
  arrowSize: number;
  lineWeight: number;
  extensionLineGap: number;
  extensionLineOvershoot: number;
  textOrientation: 'horizontal' | 'aligned' | 'iso';
  units: string;
  precision: number;
  prefix?: string;
  suffix?: string;
}

export interface LinearDimension extends BaseDimension {
  type: 'linear';
  direction: 'horizontal' | 'vertical' | 'aligned';
  baseline?: string;      // For baseline/chain dimensioning
}

export interface AngularDimension extends BaseDimension {
  type: 'angular';
  displayUnit: 'degrees' | 'radians' | 'dms';
}

export interface RadialDimension extends BaseDimension {
  type: 'radial';
  showCenter: boolean;
  joggedLeader?: boolean;
}

export interface DiameterDimension extends BaseDimension {
  type: 'diameter';
  showCenter: boolean;
}

export interface HoleCallout extends BaseDimension {
  type: 'hole';
  holeType: 'simple' | 'counterbore' | 'countersink' | 'tapped';
  depth?: number | 'through';
  counterboreDiameter?: number;
  counterboreDepth?: number;
  countersinkAngle?: number;
  threadSpec?: string;    // e.g., "M6x1"
}

export type Dimension = 
  | LinearDimension
  | AngularDimension
  | RadialDimension
  | DiameterDimension
  | HoleCallout;

// === GD&T (Geometric Dimensioning & Tolerancing) ===

export type GDTSymbol =
  | 'straightness'
  | 'flatness'
  | 'circularity'
  | 'cylindricity'
  | 'lineProfile'
  | 'surfaceProfile'
  | 'angularity'
  | 'perpendicularity'
  | 'parallelism'
  | 'position'
  | 'concentricity'
  | 'symmetry'
  | 'circularRunout'
  | 'totalRunout';

export interface FeatureControlFrame {
  id: string;
  viewId: string;
  position: Vector2;
  leaderPoints?: Vector2[];
  
  symbol: GDTSymbol;
  tolerance: number;
  modifier?: 'MMC' | 'LMC' | 'RFS';  // Material condition
  
  datums?: {
    letter: string;
    modifier?: 'MMC' | 'LMC';
  }[];
  
  reference: DimensionReference;
}

export interface DatumFeature {
  id: string;
  viewId: string;
  letter: string;
  position: Vector2;
  reference: DimensionReference;
  trianglePosition: 'left' | 'right' | 'top' | 'bottom';
}

// === Annotations ===

export type AnnotationType =
  | 'note'
  | 'leader'
  | 'balloon'
  | 'surfaceFinish'
  | 'weldSymbol'
  | 'centerMark'
  | 'centerLine';

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  viewId?: string;        // On a view, or sheet-level if omitted
  position: Vector2;
}

export interface NoteAnnotation extends BaseAnnotation {
  type: 'note';
  text: string;
  font: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  border?: boolean;
}

export interface LeaderAnnotation extends BaseAnnotation {
  type: 'leader';
  text: string;
  leaderPoints: Vector2[];
  arrowStyle: 'filled' | 'open' | 'dot' | 'none';
  reference?: DimensionReference;
}

export interface BalloonAnnotation extends BaseAnnotation {
  type: 'balloon';
  itemNumber: string | number;
  leaderPoints: Vector2[];
  shape: 'circle' | 'triangle' | 'hexagon' | 'square';
  size: number;
  reference?: DimensionReference;
}

export interface SurfaceFinishAnnotation extends BaseAnnotation {
  type: 'surfaceFinish';
  symbol: 'basic' | 'machined' | 'prohibited';
  roughness?: number;     // Ra value
  method?: string;        // Machining method
  direction?: string;     // Lay direction
  leaderPoints?: Vector2[];
  reference?: DimensionReference;
}

export interface CenterMarkAnnotation extends BaseAnnotation {
  type: 'centerMark';
  reference: DimensionReference;
  size: number;
  showLines: boolean;
  extension: number;
}

export interface CenterLineAnnotation extends BaseAnnotation {
  type: 'centerLine';
  startPoint: Vector2;
  endPoint: Vector2;
  extension: number;
}

export type Annotation =
  | NoteAnnotation
  | LeaderAnnotation
  | BalloonAnnotation
  | SurfaceFinishAnnotation
  | CenterMarkAnnotation
  | CenterLineAnnotation
  | FeatureControlFrame
  | DatumFeature;

// === Bill of Materials ===

export interface BOMColumn {
  id: string;
  header: string;
  property: string;       // Property name to display
  width: number;
  alignment: 'left' | 'center' | 'right';
}

export interface BOMRow {
  itemNumber: number;
  instanceId: string;
  partNumber?: string;
  description?: string;
  quantity: number;
  material?: string;
  weight?: number;
  customProperties?: Record<string, string>;
}

export interface BillOfMaterials {
  id: string;
  position: Vector2;
  columns: BOMColumn[];
  rows: BOMRow[];
  style: {
    font: string;
    fontSize: number;
    headerFontSize: number;
    rowHeight: number;
    borderWidth: number;
  };
  sortBy?: string;
  groupBy?: string;
  showSubAssemblies: boolean;
}

// === Drawing Sheet ===

export interface DrawingSheet {
  id: string;
  name: string;
  number: number;         // Sheet number
  
  format: SheetFormat;
  projectionType: ProjectionType;
  
  views: Record<string, DrawingView>;
  dimensions: Record<string, Dimension>;
  annotations: Record<string, Annotation>;
  tables: {
    bom?: BillOfMaterials;
    revisionTable?: RevisionTable;
  };
}

export interface RevisionRow {
  revision: string;
  description: string;
  date: string;
  approvedBy?: string;
}

export interface RevisionTable {
  id: string;
  position: Vector2;
  rows: RevisionRow[];
}

// === Drawing Document ===

export interface Drawing {
  id: string;
  name: string;
  
  sheets: DrawingSheet[];
  
  // Global settings
  units: 'mm' | 'inch';
  defaultScale: number;
  defaultProjection: ProjectionType;
  defaultDimensionStyle: DimensionStyle;
  
  created: string;
  modified: string;
}

