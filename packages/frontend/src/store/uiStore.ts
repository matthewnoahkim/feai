/**
 * UI Store - Manages UI state (tools, selection, view settings)
 */

import { create } from 'zustand'

export type ActiveMode = 'model' | 'sketch' | 'assembly' | 'drawing'
export type SelectionType = 'none' | 'face' | 'edge' | 'vertex' | 'body' | 'feature' | 'sketch-entity' | 'document'
export type DisplayMode = 'shaded' | 'shadedEdges' | 'wireframe' | 'hidden'

// Sketch tool types with variants
export type SketchToolType = 
  | 'select' 
  | 'line' 
  | 'rectangle-corner'   // Corner-to-Corner Rectangle
  | 'rectangle-center'   // Center-to-Corner Rectangle
  | 'polygon-inscribed'  // Inscribed polygon (vertices on circle)
  | 'polygon-circumscribed' // Circumscribed polygon (sides tangent to circle)
  | 'circle-center' 
  | 'circle-two-point' 
  | 'arc-3point'         // 3-Point Arc (start, end, bulge point)
  | 'arc-center'         // Center-Start-End Arc
  | 'arc-tangent'        // Tangent arc (from line tool)
  | 'spline' 
  | 'point' 
  | 'dimension' 
  | 'constraint'
  | 'constraint-coincident'    // Point on point/curve
  | 'constraint-horizontal'    // Line or points horizontal
  | 'constraint-vertical'      // Line or points vertical
  | 'constraint-parallel'      // Two lines parallel
  | 'constraint-perpendicular' // Two lines at 90°
  | 'constraint-tangent'       // Smooth curve connection
  | 'constraint-equal'         // Equal lengths/radii
  | 'constraint-concentric'    // Circles share center
  | 'constraint-midpoint'      // Point at line midpoint
  | 'constraint-fixed'         // Lock position
  | 'trim'
  | 'extend'             // Extend curves to boundaries
  | 'offset'             // Offset curves by distance
  | 'mirror'             // Mirror entities across a line

export type ModelTool = 'select' | 'extrude' | 'revolve' | 'sweep' | 'loft' | 'fillet' | 'chamfer' | 'shell' | 'pattern' | 'mirror' | 'boolean'

// Constraint types
export type ConstraintType = 
  | 'horizontal' 
  | 'vertical' 
  | 'coincident' 
  | 'concentric' 
  | 'parallel' 
  | 'perpendicular' 
  | 'tangent' 
  | 'equal'
  | 'fixed'
  | 'midpoint'

export interface Selection {
  type: SelectionType
  ids: string[]
  data?: any
}

export interface ViewSettings {
  showGrid: boolean
  showOrigin: boolean
  showPlanes: boolean
  displayMode: DisplayMode
  showEdges: boolean
  autoOrientSketch: boolean  // Auto-orient camera when entering sketch mode
  dimModelInSketch: boolean  // Dim 3D model when sketching for focus
}

export interface CameraState {
  position: [number, number, number]
  target: [number, number, number]
  up: [number, number, number]
  fov: number
}

export interface SketchModeState {
  sketchId: string | null
  partStudioId: string | null
  planeNormal: [number, number, number]
  planeOrigin: [number, number, number]
}

export interface Point2D {
  x: number
  y: number
  z: number
}

export interface SnapInfo {
  type: 'grid' | 'endpoint' | 'midpoint' | 'center' | 'origin' | 'horizontal' | 'vertical' | 'intersection'
  point: Point2D
  entityId?: string
}

export interface InferenceInfo {
  type: 'horizontal' | 'vertical' | 'perpendicular' | 'tangent' | 'coincident'
  from: Point2D
  to: Point2D
}

export interface DrawingState {
  isActive: boolean
  tool: SketchToolType | null
  points: Point2D[]
  previewPoint: Point2D | null
  snap: SnapInfo | null
  inferences: InferenceInfo[]
  constraints: ConstraintType[]
  // For line tool - continuous mode
  isContinuous: boolean
  // For arc-tangent mode switch
  isArcMode: boolean
  // For rectangle - square constraint mode
  isSquareMode: boolean
  // For polygon tool - number of sides
  polygonSides: number
  // For dimension input
  pendingDimension: {
    type: 'length' | 'radius' | 'diameter' | 'angle' | 'width' | 'height' | 'sides'
    value: number | null
    entityId?: string
    position: Point2D
  } | null
  // Sequential dimension input (for rectangles: width then height)
  pendingDimensionSequence: Array<{
    type: 'width' | 'height'
    value: number | null
    position: Point2D
  }>
  currentDimensionIndex: number
  // Modifier keys
  shiftHeld: boolean
  ctrlHeld: boolean
  altHeld: boolean
  // For offset tool
  offsetDistance: number
  offsetDirection: 1 | -1  // 1 = outward/positive, -1 = inward/negative
  selectedEntityIds: string[]
  // For mirror tool
  mirrorLineId: string | null  // ID of the line entity to mirror across
  mirrorMode: 'select-line' | 'select-entities' | 'preview' | null
}

// Constraint tool state
export interface ConstraintToolState {
  isActive: boolean
  constraintType: import('./documentStore').SketchConstraintType | null
  step: 'select-first' | 'select-second' | 'complete'
  firstEntityId: string | null
  hoverEntityId: string | null
  pendingConstraint: {
    type: import('./documentStore').SketchConstraintType
    entityIds: string[]
  } | null
}

// Dimension tool state
export interface DimensionToolState {
  isActive: boolean
  dimensionType: 'length' | 'distance' | 'angle' | 'radius' | 'diameter' | null
  step: 'select-entity' | 'select-second' | 'place-label' | 'edit-value'
  selectedEntityIds: string[]
  labelPosition: { x: number; y: number } | null
  currentValue: number | null
  isDriving: boolean  // true = drives geometry, false = reference only
  pendingDimension: {
    type: 'length' | 'distance' | 'angle' | 'radius' | 'diameter'
    entityIds: string[]
    value: number
    position: { x: number; y: number }
    isDriving: boolean
  } | null
}

export interface ToolPrompt {
  primary: string
  secondary?: string
  hint?: string
}

// Measurement types
export interface MeasurementEntity {
  type: 'vertex' | 'edge' | 'face' | 'point'
  id: string
  position?: [number, number, number]  // For vertices/points
  normal?: [number, number, number]    // For faces
  direction?: [number, number, number] // For edges
}

export interface Measurement {
  id: string
  type: 'distance' | 'angle' | 'length' | 'radius' | 'diameter' | 'area'
  entity1: MeasurementEntity
  entity2?: MeasurementEntity
  value: number
  delta?: {
    x: number
    y: number
    z: number
  }
  unit: string
  timestamp: Date
}

export interface MeasurementMode {
  isActive: boolean
  step: 'select-first' | 'select-second' | 'complete'
  firstEntity: MeasurementEntity | null
  hoverEntity: MeasurementEntity | null
  previewMeasurement: Measurement | null
}

// Transform/Move body state
export interface TransformState {
  isActive: boolean
  mode: 'move' | 'copy' | null
  bodyId: string | null
  translation: { x: number; y: number; z: number }
  rotation: { 
    axis: 'x' | 'y' | 'z' | 'custom'
    angle: number  // degrees
    customAxis?: { x: number; y: number; z: number }
  }
  createCopy: boolean
  showGizmo: boolean
  gizmoMode: 'translate' | 'rotate' | 'scale'
  coordinateSpace: 'world' | 'local'
  previewTransform: {
    position: [number, number, number]
    rotation: [number, number, number]  // Euler angles in radians
  } | null
}

interface UIState {
  // Mode and tools
  activeMode: ActiveMode
  activeTool: string | null
  
  // Selection
  selection: Selection
  hovered: string | null
  preselection: string | null
  
  // View settings
  viewSettings: ViewSettings
  camera: CameraState
  previousCamera: CameraState | null  // Store camera state before sketch mode
  
  // Sketch mode
  sketchMode: SketchModeState | null
  
  // Enhanced drawing state
  drawing: DrawingState
  
  // Constraint tool state
  constraintTool: ConstraintToolState
  
  // Dimension tool state
  dimensionTool: DimensionToolState
  
  // Legacy drawing state for backwards compatibility
  isDrawing: boolean
  drawingPoints: Array<{ x: number; y: number; z: number }>
  
  // Tool prompt
  toolPrompt: ToolPrompt | null
  
  // Cursor style
  cursorStyle: string
  
  // Measurement mode
  measurementMode: MeasurementMode
  measurements: Measurement[]
  showMeasurementsPanel: boolean
  
  // Transform/Move body mode
  transformState: TransformState
  
  // History rollback state (for Roll to Feature)
  rollbackState: {
    isActive: boolean
    partStudioId: string | null
    featureId: string | null  // Last active feature (roll to here)
    showGhostFeatures: boolean  // Show suppressed features as translucent
  }
  
  // Box selection state
  boxSelection: {
    isActive: boolean
    startX: number
    startY: number
    currentX: number
    currentY: number
    mode: 'window' | 'crossing' | null  // Left-to-right = window, right-to-left = crossing
    previewIds: string[]  // IDs being previewed as selected
  }
  
  // UI panels
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  bottomPanelOpen: boolean
  
  // Panel sizes
  leftPanelWidth: number
  rightPanelWidth: number
  bottomPanelHeight: number
  chatPanelWidth: number
  
  // Dialogs
  activeDialog: string | null
  dialogData: any
  
  // Notifications
  notifications: Array<{ id: string; type: 'info' | 'success' | 'warning' | 'error'; message: string }>
  
  // Actions
  setActiveMode: (mode: ActiveMode) => void
  setActiveTool: (tool: string | null) => void
  
  setSelection: (selection: Selection) => void
  clearSelection: () => void
  selectAll: () => void
  addToSelection: (type: SelectionType, id: string) => void
  removeFromSelection: (id: string) => void
  setHovered: (id: string | null) => void
  setPreselection: (id: string | null) => void
  
  setViewSetting: <K extends keyof ViewSettings>(key: K, value: ViewSettings[K]) => void
  toggleViewSetting: (key: 'showGrid' | 'showOrigin' | 'showPlanes' | 'showEdges') => void
  setDisplayMode: (mode: DisplayMode) => void
  setCamera: (camera: Partial<CameraState>) => void
  resetCamera: () => void
  
  enterSketchMode: (partStudioId: string, sketchId: string, plane: { normal: [number, number, number]; origin: [number, number, number] }) => void
  exitSketchMode: () => void
  
  // Enhanced drawing actions
  startDrawing: (tool?: SketchToolType) => void
  updatePreviewPoint: (point: Point2D, snap?: SnapInfo) => void
  addDrawingPoint: (point: Point2D, snap?: SnapInfo) => void
  finishDrawing: () => Array<Point2D>
  cancelDrawing: () => void
  setDrawingInferences: (inferences: InferenceInfo[]) => void
  setDrawingConstraints: (constraints: ConstraintType[]) => void
  toggleArcMode: () => void
  setModifierKeys: (shift: boolean, ctrl: boolean, alt?: boolean) => void
  showDimensionInput: (type: 'length' | 'radius' | 'diameter' | 'angle' | 'sides' | 'width' | 'height', position: Point2D, value?: number, entityId?: string) => void
  hideDimensionInput: () => void
  setDimensionValue: (value: number) => void
  setPolygonSides: (sides: number) => void
  
  // Offset tool actions
  setOffsetDistance: (distance: number) => void
  setOffsetDirection: (direction: 1 | -1) => void
  toggleOffsetDirection: () => void
  setSelectedEntityIds: (ids: string[]) => void
  addSelectedEntityId: (id: string) => void
  clearSelectedEntityIds: () => void
  
  // Mirror tool actions
  setMirrorLineId: (id: string | null) => void
  setMirrorMode: (mode: 'select-line' | 'select-entities' | 'preview' | null) => void
  clearMirrorState: () => void
  
  // Constraint tool actions
  enterConstraintTool: (constraintType: import('./documentStore').SketchConstraintType) => void
  exitConstraintTool: () => void
  setConstraintFirstEntity: (entityId: string) => void
  setConstraintHoverEntity: (entityId: string | null) => void
  applyConstraint: (sketchId: string) => Promise<void>
  
  // Dimension tool actions
  enterDimensionTool: () => void
  exitDimensionTool: () => void
  selectDimensionEntity: (entityId: string) => void
  placeDimensionLabel: (position: { x: number; y: number }) => void
  applyDimensionValue: (value: number, sketchId: string) => void
  toggleDimensionDriving: () => void
  
  // Tool prompt
  setToolPrompt: (prompt: ToolPrompt | null) => void
  setCursorStyle: (style: string) => void
  
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  toggleBottomPanel: () => void
  
  setLeftPanelWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
  setBottomPanelHeight: (height: number) => void
  setChatPanelWidth: (width: number) => void
  
  openDialog: (dialogId: string, data?: any) => void
  openFeatureForEdit: (featureId: string, partStudioId: string) => void
  closeDialog: () => void
  setDialogData: (data: any) => void
  
  // Measurement actions
  enterMeasurementMode: () => void
  exitMeasurementMode: () => void
  setMeasurementFirstEntity: (entity: MeasurementEntity) => void
  setMeasurementHoverEntity: (entity: MeasurementEntity | null) => void
  completeMeasurement: (measurement: Measurement) => void
  clearMeasurements: () => void
  removeMeasurement: (id: string) => void
  toggleMeasurementsPanel: () => void
  
  // Transform/Move body actions
  enterTransformMode: (bodyId: string, mode: 'move' | 'copy') => void
  exitTransformMode: () => void
  setTransformTranslation: (translation: { x: number; y: number; z: number }) => void
  setTransformRotation: (rotation: { axis: 'x' | 'y' | 'z' | 'custom'; angle: number; customAxis?: { x: number; y: number; z: number } }) => void
  toggleCreateCopy: () => void
  setGizmoMode: (mode: 'translate' | 'rotate' | 'scale') => void
  setCoordinateSpace: (space: 'world' | 'local') => void
  updatePreviewTransform: (position: [number, number, number], rotation: [number, number, number]) => void
  applyTransform: () => Promise<void>
  cancelTransform: () => void
  
  // History rollback actions
  rollToFeature: (partStudioId: string, featureId: string) => Promise<void>
  rollToEnd: (partStudioId: string) => Promise<void>
  toggleGhostFeatures: () => void
  
  // Box selection actions
  startBoxSelection: (x: number, y: number) => void
  updateBoxSelection: (x: number, y: number, previewIds: string[]) => void
  finishBoxSelection: (addToSelection: boolean) => void
  cancelBoxSelection: () => void
  
  addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void
  removeNotification: (id: string) => void
}

const DEFAULT_CAMERA: CameraState = {
  position: [100, 80, 100],
  target: [0, 0, 0],
  up: [0, 1, 0],
  fov: 45
}

const DEFAULT_DRAWING: DrawingState = {
  isActive: false,
  tool: null,
  points: [],
  previewPoint: null,
  snap: null,
  inferences: [],
  constraints: [],
  isContinuous: false,
  isArcMode: false,
  isSquareMode: false,
  polygonSides: 6, // Default hexagon
  pendingDimension: null,
  pendingDimensionSequence: [],
  currentDimensionIndex: 0,
  shiftHeld: false,
  ctrlHeld: false,
  altHeld: false,
  offsetDistance: 10, // Default offset distance
  offsetDirection: 1,
  selectedEntityIds: [],
  mirrorLineId: null,
  mirrorMode: null
}

const DEFAULT_MEASUREMENT: MeasurementMode = {
  isActive: false,
  step: 'select-first',
  firstEntity: null,
  hoverEntity: null,
  previewMeasurement: null
}

const DEFAULT_TRANSFORM: TransformState = {
  isActive: false,
  mode: null,
  bodyId: null,
  translation: { x: 0, y: 0, z: 0 },
  rotation: { axis: 'z', angle: 0 },
  createCopy: false,
  showGizmo: true,
  gizmoMode: 'translate',
  coordinateSpace: 'world',
  previewTransform: null
}

const DEFAULT_CONSTRAINT_TOOL: ConstraintToolState = {
  isActive: false,
  constraintType: null,
  step: 'select-first',
  firstEntityId: null,
  hoverEntityId: null,
  pendingConstraint: null,
}

const DEFAULT_DIMENSION_TOOL: DimensionToolState = {
  isActive: false,
  dimensionType: null,
  step: 'select-entity',
  selectedEntityIds: [],
  labelPosition: null,
  currentValue: null,
  isDriving: true,
  pendingDimension: null,
}

// Tool prompts
const TOOL_PROMPTS: Record<string, ToolPrompt> = {
  'line': { 
    primary: 'Click to place start point', 
    secondary: 'Hold Shift for horizontal/vertical constraint',
    hint: 'L'
  },
  'line-continue': { 
    primary: 'Click to place next point', 
    secondary: 'Double-click or press ESC to finish • Press A for tangent arc',
    hint: 'L'
  },
  'circle-center': { 
    primary: 'Click to place center', 
    hint: 'C'
  },
  'circle-center-radius': { 
    primary: 'Click or type to set radius/diameter', 
    hint: 'C'
  },
  'circle-two-point': { 
    primary: 'Click first diameter point',
    hint: 'C'
  },
  'circle-two-point-end': { 
    primary: 'Click second diameter point',
    hint: 'C'
  },
  // Corner-to-Corner Rectangle prompts
  'rectangle-corner': { 
    primary: 'Click to place first corner', 
    secondary: 'Hold Alt for square constraint',
    hint: 'R'
  },
  'rectangle-corner-end': { 
    primary: 'Click to place opposite corner', 
    secondary: 'Hold Alt for square • Type dimensions after placement',
    hint: 'R'
  },
  // Center-to-Corner Rectangle prompts
  'rectangle-center': { 
    primary: 'Click to place rectangle center', 
    secondary: 'Rectangle expands symmetrically from center',
    hint: 'Shift+R'
  },
  'rectangle-center-corner': { 
    primary: 'Click to place corner (defines size)', 
    secondary: 'Hold Alt for square • Shape is centered on first point',
    hint: 'Shift+R'
  },
  // 3-Point Arc prompts
  'arc-3point': { 
    primary: 'Click to place first arc endpoint', 
    secondary: 'Arc defined by two endpoints and a bulge point',
    hint: 'A'
  },
  'arc-3point-end': { 
    primary: 'Click to place second arc endpoint', 
    secondary: 'This will be the other end of the arc',
    hint: 'A'
  },
  'arc-3point-bulge': { 
    primary: 'Click to set arc curvature', 
    secondary: 'Move to adjust bulge • Snap to chord midpoint for semicircle',
    hint: 'A'
  },
  // Center-Start-End Arc prompts
  'arc-center': { 
    primary: 'Click to place arc center', 
    secondary: 'Arc defined by center, start, and end points',
    hint: 'Shift+A'
  },
  'arc-center-start': { 
    primary: 'Click to place start point on arc', 
    secondary: 'This sets the radius and starting angle',
    hint: 'Shift+A'
  },
  'arc-center-end': { 
    primary: 'Click to place end point on arc', 
    secondary: 'Sweep around to set arc span • Cross 180° for reflex arc',
    hint: 'Shift+A'
  },
  // Tangent arc (from line drawing)
  'arc-tangent': { 
    primary: 'Move to set arc endpoint • Click to place', 
    secondary: 'Arc will be tangent to previous line segment',
    hint: 'A (while drawing line)'
  },
  'select': { 
    primary: 'Click to select entities', 
    secondary: 'Hold Shift to add to selection' 
  },
  'trim': {
    primary: 'Click segment to trim to nearest intersection',
    secondary: 'Drag across multiple segments for power trim',
    hint: 'T'
  },
  'trim-active': {
    primary: 'Release to trim highlighted segments',
    secondary: 'Continue dragging to add more',
    hint: 'T'
  },
  'extend': {
    primary: 'Click curve endpoint to extend',
    secondary: 'Drag to extend • Double-click for auto-extend to boundary',
    hint: 'X'
  },
  'extend-dragging': {
    primary: 'Drag to extend curve',
    secondary: 'Release at boundary to snap • Release anywhere to set new endpoint',
    hint: 'X'
  },
  'offset': {
    primary: 'Click entity or loop to offset',
    secondary: 'Creates parallel copy at specified distance',
    hint: 'O'
  },
  'offset-selected': {
    primary: 'Drag arrow to set offset distance',
    secondary: 'Double-click dimension to type value • Click arrow to flip direction',
    hint: 'O'
  },
  'offset-distance': {
    primary: 'Enter offset distance and press Enter',
    secondary: 'Negative value offsets opposite direction',
    hint: 'O'
  },
  'mirror': {
    primary: 'Select mirror line or pre-select entities',
    secondary: 'Creates symmetric copy across selected line',
    hint: 'M'
  },
  'mirror-select-line': {
    primary: 'Click a line to use as mirror axis',
    secondary: 'Construction lines work well as centerlines',
    hint: 'M'
  },
  'mirror-select-entities': {
    primary: 'Click entities to mirror',
    secondary: 'ESC to finish • Shift+Click to add more',
    hint: 'M'
  },
  'mirror-preview': {
    primary: 'Preview shown • Press Enter to apply',
    secondary: 'ESC to cancel • Click more entities to add',
    hint: 'M'
  },
  'dimension': {
    primary: 'Click on entity to dimension',
    secondary: 'Click two points for distance, arc for radius',
    hint: 'D'
  },
  'constraint': {
    primary: 'Select entities to constrain',
    secondary: 'Select two entities for relational constraints',
    hint: 'K'
  },
  'constraint-coincident': {
    primary: 'Select point and another point or curve',
    secondary: 'Points will share the same location',
    hint: 'C'
  },
  'constraint-horizontal': {
    primary: 'Select a line or two points',
    secondary: 'Makes line horizontal or aligns points horizontally',
    hint: 'H'
  },
  'constraint-vertical': {
    primary: 'Select a line or two points',
    secondary: 'Makes line vertical or aligns points vertically',
    hint: 'V'
  },
  'constraint-parallel': {
    primary: 'Select two lines',
    secondary: 'Lines will become parallel to each other',
    hint: '/'
  },
  'constraint-perpendicular': {
    primary: 'Select two lines',
    secondary: 'Lines will be at 90° to each other',
    hint: '⊥'
  },
  'constraint-tangent': {
    primary: 'Select line and curve, or two curves',
    secondary: 'Creates smooth tangent connection',
    hint: 'T'
  },
  'constraint-equal': {
    primary: 'Select two lines or two circles',
    secondary: 'Lengths or radii will be equal',
    hint: '='
  },
  'constraint-concentric': {
    primary: 'Select two circles or arcs',
    secondary: 'Circles will share the same center',
    hint: 'O'
  },
  'constraint-midpoint': {
    primary: 'Select a point and a line',
    secondary: 'Point will be placed at line midpoint',
    hint: 'M'
  },
  'constraint-fixed': {
    primary: 'Select entity to fix',
    secondary: 'Entity position will be locked in place',
    hint: 'F'
  },
  'spline': {
    primary: 'Click to place first spline point',
    secondary: 'Curve will pass through all points you place',
    hint: 'S'
  },
  'spline-drawing': {
    primary: 'Click to add more points to spline',
    secondary: 'Double-click to finish • Click start point to close • ESC to cancel',
    hint: 'S'
  },
  'spline-closing': {
    primary: 'Click to close the spline loop',
    secondary: 'Or double-click elsewhere to finish open',
    hint: 'S'
  },
  'point': {
    primary: 'Click to place construction point',
    hint: 'P'
  },
  // Inscribed Polygon prompts (vertices on circle)
  'polygon-inscribed': {
    primary: 'Click to place polygon center',
    secondary: 'Vertices will lie on the construction circle',
    hint: 'G'
  },
  'polygon-inscribed-radius': {
    primary: 'Click to set radius and orientation',
    secondary: 'Type number (3-64) to change sides • Drag to rotate',
    hint: 'G'
  },
  // Circumscribed Polygon prompts (sides tangent to circle)
  'polygon-circumscribed': {
    primary: 'Click to place polygon center',
    secondary: 'Sides will be tangent to the construction circle',
    hint: 'Shift+G'
  },
  'polygon-circumscribed-radius': {
    primary: 'Click to set radius and orientation',
    secondary: 'Type number (3-64) to change sides • Drag to rotate',
    hint: 'Shift+G'
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  activeMode: 'model',
  activeTool: null,
  
  selection: { type: 'none', ids: [] },
  hovered: null,
  preselection: null,
  
  viewSettings: {
    showGrid: true,
    showOrigin: true,
    showPlanes: true,
    displayMode: 'shadedEdges',
    showEdges: true,
    autoOrientSketch: true,  // Default: enabled for better UX
    dimModelInSketch: true   // Default: enabled for focus
  },
  camera: DEFAULT_CAMERA,
  previousCamera: null,
  
  sketchMode: null,
  
  drawing: DEFAULT_DRAWING,
  
  constraintTool: DEFAULT_CONSTRAINT_TOOL,
  
  dimensionTool: DEFAULT_DIMENSION_TOOL,
  
  isDrawing: false,
  drawingPoints: [],
  
  toolPrompt: null,
  cursorStyle: 'default',
  
  measurementMode: DEFAULT_MEASUREMENT,
  measurements: [],
  showMeasurementsPanel: false,
  
  transformState: DEFAULT_TRANSFORM,
  
  rollbackState: {
    isActive: false,
    partStudioId: null,
    featureId: null,
    showGhostFeatures: false
  },
  
  boxSelection: {
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    mode: null,
    previewIds: []
  },
  
  leftPanelOpen: true,
  rightPanelOpen: false, // Closed by default
  bottomPanelOpen: false,
  
  // Panel sizes (in pixels)
  leftPanelWidth: 280,
  rightPanelWidth: 380,
  bottomPanelHeight: 250,
  chatPanelWidth: 380,
  
  activeDialog: null,
  dialogData: null,
  
  notifications: [],
  
  // Actions
  setActiveMode: (mode) => set({ activeMode: mode, activeTool: null }),
  
  setActiveTool: (tool) => {
    const prompt = tool ? TOOL_PROMPTS[tool] || null : null
    const cursor = tool && tool !== 'select' ? 'crosshair' : 'default'
    
    set({ 
      activeTool: tool, 
      toolPrompt: prompt,
      cursorStyle: cursor,
      drawing: { ...DEFAULT_DRAWING, tool: tool as SketchToolType }
    })
  },
  
  setSelection: (selection) => set({ selection }),
  
  clearSelection: () => set({ selection: { type: 'none', ids: [] } }),
  
  selectAll: () => {
    // Import documentStore dynamically to avoid circular dependency
    import('./documentStore').then(({ useDocumentStore }) => {
      const { document } = useDocumentStore.getState()
      if (!document) return
      
      const activePartStudio = document.partStudios.find(
        ps => ps.id === document.activeElementId
      )
      
      if (!activePartStudio) return
      
      // In model mode, select all bodies (parts)
      const bodyIds = activePartStudio.parts.map(p => p.id)
      
      if (bodyIds.length > 0) {
        set({ 
          selection: { 
            type: 'body', 
            ids: bodyIds 
          } 
        })
      }
    })
  },
  
  addToSelection: (type, id) => set((state) => ({
    selection: {
      type,
      ids: [...state.selection.ids, id]
    }
  })),
  
  removeFromSelection: (id) => set((state) => ({
    selection: {
      ...state.selection,
      ids: state.selection.ids.filter(i => i !== id)
    }
  })),
  
  setHovered: (id) => set({ hovered: id }),
  
  setPreselection: (id) => set({ preselection: id }),
  
  setViewSetting: (key, value) => set((state) => ({
    viewSettings: { ...state.viewSettings, [key]: value }
  })),
  
  toggleViewSetting: (key) => set((state) => ({
    viewSettings: { ...state.viewSettings, [key]: !state.viewSettings[key] }
  })),
  
  setDisplayMode: (mode) => set((state) => ({
    viewSettings: { ...state.viewSettings, displayMode: mode }
  })),
  
  setCamera: (camera) => set((state) => ({
    camera: { ...state.camera, ...camera }
  })),
  
  resetCamera: () => set({ camera: DEFAULT_CAMERA }),
  
  enterSketchMode: (partStudioId, sketchId, plane) => {
    const currentCamera = get().camera
    const { autoOrientSketch } = get().viewSettings
    
    set({
      activeMode: 'sketch',
      sketchMode: {
        partStudioId,
        sketchId,
        planeNormal: plane.normal,
        planeOrigin: plane.origin
      },
      activeTool: 'line',
      toolPrompt: TOOL_PROMPTS['line'],
      cursorStyle: 'crosshair',
      previousCamera: currentCamera  // Save current camera for restoration
    })
    
    // Dispatch event for camera animation if auto-orient is enabled
    if (autoOrientSketch) {
      window.dispatchEvent(new CustomEvent('orientToSketchPlane', {
        detail: { plane }
      }))
    }
  },
  
  exitSketchMode: () => {
    // Optionally restore previous camera (for now, leave as-is for user control)
    // const { previousCamera } = get()
    
    set({
      activeMode: 'model',
      sketchMode: null,
      activeTool: null,
      drawing: DEFAULT_DRAWING,
      isDrawing: false,
      drawingPoints: [],
      toolPrompt: null,
      cursorStyle: 'default',
      previousCamera: null  // Clear saved camera
    })
  },
  
  // Enhanced drawing actions
  startDrawing: (tool) => {
    const currentTool = tool || get().activeTool as SketchToolType
    set((state) => ({ 
      drawing: { 
        ...state.drawing, 
        isActive: true, 
        tool: currentTool,
        points: [],
        previewPoint: null
      },
      isDrawing: true,
      drawingPoints: []
    }))
  },
  
  updatePreviewPoint: (point, snap) => set((state) => ({
    drawing: {
      ...state.drawing,
      previewPoint: point,
      snap: snap || null
    }
  })),
  
  addDrawingPoint: (point, snap) => {
    const state = get()
    const newPoints = [...state.drawing.points, point]
    const newDrawingPoints = [...state.drawingPoints, point]
    
    // Update tool prompt based on context
    let newPrompt = state.toolPrompt
    const tool = state.activeTool
    
    if (tool === 'line' && newPoints.length >= 1) {
      newPrompt = TOOL_PROMPTS['line-continue']
    } else if (tool === 'circle-center' && newPoints.length === 1) {
      newPrompt = TOOL_PROMPTS['circle-center-radius']
    } else if (tool === 'circle-two-point' && newPoints.length === 1) {
      newPrompt = TOOL_PROMPTS['circle-two-point-end']
    } else if (tool === 'rectangle-corner' && newPoints.length === 1) {
      newPrompt = TOOL_PROMPTS['rectangle-corner-end']
    } else if (tool === 'rectangle-center' && newPoints.length === 1) {
      newPrompt = TOOL_PROMPTS['rectangle-center-corner']
    } else if (tool === 'arc-3point' && newPoints.length === 1) {
      newPrompt = TOOL_PROMPTS['arc-3point-end']
    } else if (tool === 'arc-3point' && newPoints.length === 2) {
      newPrompt = TOOL_PROMPTS['arc-3point-bulge']
    } else if (tool === 'arc-center' && newPoints.length === 1) {
      newPrompt = TOOL_PROMPTS['arc-center-start']
    } else if (tool === 'arc-center' && newPoints.length === 2) {
      newPrompt = TOOL_PROMPTS['arc-center-end']
    } else if (tool === 'polygon-inscribed' && newPoints.length === 1) {
      newPrompt = TOOL_PROMPTS['polygon-inscribed-radius']
    } else if (tool === 'polygon-circumscribed' && newPoints.length === 1) {
      newPrompt = TOOL_PROMPTS['polygon-circumscribed-radius']
    } else if (tool === 'spline' && newPoints.length >= 1) {
      newPrompt = TOOL_PROMPTS['spline-drawing']
    }
    
    set({
      drawing: {
        ...state.drawing,
        points: newPoints,
        snap: snap || null,
        isContinuous: tool === 'line' && newPoints.length >= 1
      },
      drawingPoints: newDrawingPoints,
      toolPrompt: newPrompt
    })
  },
  
  finishDrawing: () => {
    const points = get().drawing.points
    const tool = get().activeTool
    
    set((state) => ({ 
      drawing: { 
        ...DEFAULT_DRAWING,
        tool: null  // Clear tool to prevent auto-restarting
      },
      isDrawing: false, 
      drawingPoints: [],
      activeTool: 'select',  // Switch back to select tool
      toolPrompt: TOOL_PROMPTS['select'],  // Update prompt
      cursorStyle: 'default'  // Reset cursor
    }))
    
    return points
  },
  
  cancelDrawing: () => {
    const tool = get().activeTool
    set({ 
      drawing: { ...DEFAULT_DRAWING, tool: tool as SketchToolType },
      isDrawing: false, 
      drawingPoints: [],
      toolPrompt: tool ? TOOL_PROMPTS[tool] || null : null
    })
  },
  
  setDrawingInferences: (inferences) => set((state) => ({
    drawing: { ...state.drawing, inferences }
  })),
  
  setDrawingConstraints: (constraints) => set((state) => ({
    drawing: { ...state.drawing, constraints }
  })),
  
  toggleArcMode: () => set((state) => ({
    drawing: { ...state.drawing, isArcMode: !state.drawing.isArcMode },
    activeTool: state.drawing.isArcMode ? 'line' : 'arc-tangent',
    toolPrompt: state.drawing.isArcMode ? TOOL_PROMPTS['line-continue'] : TOOL_PROMPTS['arc-tangent']
  })),
  
  setModifierKeys: (shift, ctrl, alt) => set((state) => ({
    drawing: { 
      ...state.drawing, 
      shiftHeld: shift, 
      ctrlHeld: ctrl,
      altHeld: alt ?? state.drawing.altHeld,
      isSquareMode: alt ?? state.drawing.altHeld
    }
  })),
  
  showDimensionInput: (type, position, value, entityId) => set((state) => ({
    drawing: {
      ...state.drawing,
      pendingDimension: { type, position, value: value ?? null, entityId }
    }
  })),
  
  hideDimensionInput: () => set((state) => ({
    drawing: { ...state.drawing, pendingDimension: null }
  })),
  
  setDimensionValue: (value) => set((state) => ({
    drawing: {
      ...state.drawing,
      pendingDimension: state.drawing.pendingDimension 
        ? { ...state.drawing.pendingDimension, value }
        : null
    }
  })),
  
  setPolygonSides: (sides) => set((state) => ({
    drawing: {
      ...state.drawing,
      polygonSides: Math.max(3, Math.min(64, sides)) // Clamp between 3 and 64
    }
  })),
  
  setOffsetDistance: (distance) => set((state) => ({
    drawing: {
      ...state.drawing,
      offsetDistance: Math.max(0.1, distance) // Minimum 0.1mm
    }
  })),
  
  setOffsetDirection: (direction) => set((state) => ({
    drawing: {
      ...state.drawing,
      offsetDirection: direction
    }
  })),
  
  toggleOffsetDirection: () => set((state) => ({
    drawing: {
      ...state.drawing,
      offsetDirection: state.drawing.offsetDirection === 1 ? -1 : 1
    }
  })),
  
  setSelectedEntityIds: (ids) => set((state) => ({
    drawing: {
      ...state.drawing,
      selectedEntityIds: ids
    }
  })),
  
  addSelectedEntityId: (id) => set((state) => ({
    drawing: {
      ...state.drawing,
      selectedEntityIds: state.drawing.selectedEntityIds.includes(id) 
        ? state.drawing.selectedEntityIds 
        : [...state.drawing.selectedEntityIds, id]
    }
  })),
  
  clearSelectedEntityIds: () => set((state) => ({
    drawing: {
      ...state.drawing,
      selectedEntityIds: []
    }
  })),
  
  setMirrorLineId: (id) => set((state) => ({
    drawing: {
      ...state.drawing,
      mirrorLineId: id
    }
  })),
  
  setMirrorMode: (mode) => set((state) => ({
    drawing: {
      ...state.drawing,
      mirrorMode: mode
    }
  })),
  
  clearMirrorState: () => set((state) => ({
    drawing: {
      ...state.drawing,
      mirrorLineId: null,
      mirrorMode: null,
      selectedEntityIds: []
    }
  })),
  
  setToolPrompt: (prompt) => set({ toolPrompt: prompt }),
  
  setCursorStyle: (style) => set({ cursorStyle: style }),
  
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  
  toggleBottomPanel: () => set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  
  setLeftPanelWidth: (width) => set({ leftPanelWidth: width }),
  
  setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
  
  setBottomPanelHeight: (height) => set({ bottomPanelHeight: height }),
  
  setChatPanelWidth: (width) => set({ chatPanelWidth: width }),
  
  openDialog: (dialogId, data) => set({ activeDialog: dialogId, dialogData: data }),
  
  openFeatureForEdit: (featureId, partStudioId) => {
    // Get the feature from document store
    const { document } = require('./documentStore').useDocumentStore.getState()
    if (!document) return
    
    const partStudio = document.partStudios.find((ps: any) => ps.id === partStudioId)
    if (!partStudio) return
    
    const feature = partStudio.features.find((f: any) => f.id === featureId)
    if (!feature) return
    
    // Open the appropriate dialog based on feature type
    const dialogMap: Record<string, string> = {
      'extrude': 'extrude',
      'revolve': 'revolve',
      'sweep': 'sweep',
      'loft': 'loft',
      'fillet': 'fillet',
      'chamfer': 'chamfer',
      'shell': 'shell',
      'mirror': 'mirror-feature',
      'linear-pattern': 'linear-pattern',
      'circular-pattern': 'circular-pattern'
    }
    
    const dialogId = dialogMap[feature.type]
    if (!dialogId) {
      console.warn(`No dialog mapping for feature type: ${feature.type}`)
      return
    }
    
    // Open dialog with feature parameters pre-populated and editing flag
    set({ 
      activeDialog: dialogId, 
      dialogData: { 
        ...feature.parameters, 
        isEditing: true, 
        featureId: feature.id,
        partStudioId: partStudioId
      } 
    })
  },
  
  closeDialog: () => set({ activeDialog: null, dialogData: null }),
  
  setDialogData: (data) => set((state) => ({ dialogData: { ...state.dialogData, ...data } })),
  
  // Measurement actions
  enterMeasurementMode: () => set({ 
    measurementMode: {
      ...DEFAULT_MEASUREMENT,
      isActive: true
    },
    activeTool: 'measure',
    toolPrompt: {
      primary: 'Select first entity to measure',
      secondary: 'Click on a face, edge, or vertex'
    },
    cursorStyle: 'crosshair',
    showMeasurementsPanel: true
  }),
  
  exitMeasurementMode: () => set({ 
    measurementMode: DEFAULT_MEASUREMENT,
    activeTool: null,
    toolPrompt: null,
    cursorStyle: 'default'
  }),
  
  setMeasurementFirstEntity: (entity) => set((state) => ({
    measurementMode: {
      ...state.measurementMode,
      firstEntity: entity,
      step: 'select-second'
    },
    toolPrompt: {
      primary: 'Select second entity to measure',
      secondary: 'Hover to see live measurement preview'
    }
  })),
  
  setMeasurementHoverEntity: (entity) => set((state) => {
    if (!state.measurementMode.firstEntity || !entity) {
      return {
        measurementMode: {
          ...state.measurementMode,
          hoverEntity: entity,
          previewMeasurement: null
        }
      }
    }
    
    // Calculate preview measurement
    // This will be properly implemented in the measurement utility
    const previewMeasurement: Measurement = {
      id: 'preview',
      type: 'distance',
      entity1: state.measurementMode.firstEntity,
      entity2: entity,
      value: 0, // Will be calculated
      unit: 'mm',
      timestamp: new Date()
    }
    
    return {
      measurementMode: {
        ...state.measurementMode,
        hoverEntity: entity,
        previewMeasurement
      }
    }
  }),
  
  completeMeasurement: (measurement) => set((state) => ({
    measurements: [...state.measurements, measurement],
    measurementMode: {
      ...DEFAULT_MEASUREMENT,
      isActive: true, // Keep in measurement mode for multiple measurements
      step: 'select-first'
    },
    toolPrompt: {
      primary: 'Select first entity to measure',
      secondary: 'Click on a face, edge, or vertex • Press ESC to exit'
    }
  })),
  
  clearMeasurements: () => set({ measurements: [] }),
  
  removeMeasurement: (id) => set((state) => ({
    measurements: state.measurements.filter(m => m.id !== id)
  })),
  
  toggleMeasurementsPanel: () => set((state) => ({
    showMeasurementsPanel: !state.showMeasurementsPanel
  })),
  
  // Constraint tool actions
  enterConstraintTool: (constraintType) => set({
    constraintTool: {
      ...DEFAULT_CONSTRAINT_TOOL,
      isActive: true,
      constraintType
    },
    toolPrompt: {
      primary: `Apply ${constraintType} constraint`,
      secondary: 'Select first entity'
    },
    cursorStyle: 'crosshair'
  }),
  
  exitConstraintTool: () => set({
    constraintTool: DEFAULT_CONSTRAINT_TOOL,
    toolPrompt: null,
    cursorStyle: 'default'
  }),
  
  setConstraintFirstEntity: (entityId) => set((state) => ({
    constraintTool: {
      ...state.constraintTool,
      firstEntityId: entityId,
      step: 'select-second'
    },
    toolPrompt: {
      primary: `Apply ${state.constraintTool.constraintType} constraint`,
      secondary: 'Select second entity'
    }
  })),
  
  setConstraintHoverEntity: (entityId) => set((state) => ({
    constraintTool: {
      ...state.constraintTool,
      hoverEntityId: entityId
    }
  })),
  
  applyConstraint: async (sketchId) => {
    const { constraintTool } = get()
    if (!constraintTool.constraintType || !constraintTool.firstEntityId) return
    
    // Get the second entity from hover or pending
    const secondEntityId = constraintTool.hoverEntityId
    if (!secondEntityId) return
    
    // Call documentStore to add constraint
    const { addSketchConstraint } = await import('./documentStore').then(m => m.useDocumentStore.getState())
    addSketchConstraint(sketchId, {
      type: constraintTool.constraintType,
      entityIds: [constraintTool.firstEntityId, secondEntityId],
      status: 'satisfied'
    })
    
    // Reset to first entity selection for continuous constraint application
    set((state) => ({
      constraintTool: {
        ...state.constraintTool,
        firstEntityId: null,
        hoverEntityId: null,
        step: 'select-first'
      },
      toolPrompt: {
        primary: `Apply ${state.constraintTool.constraintType} constraint`,
        secondary: 'Select first entity (or ESC to exit)'
      }
    }))
    
    // Show notification
    const { addNotification } = get()
    addNotification('success', `${constraintTool.constraintType} constraint applied`)
  },
  
  // Dimension tool actions
  enterDimensionTool: () => set({
    dimensionTool: {
      ...DEFAULT_DIMENSION_TOOL,
      isActive: true,
      isDriving: true  // Default to driving
    },
    activeTool: 'dimension',
    toolPrompt: {
      primary: 'Add dimension',
      secondary: 'Select entity to dimension (line, arc, or two points for distance)'
    },
    cursorStyle: 'crosshair'
  }),
  
  exitDimensionTool: () => set({
    dimensionTool: DEFAULT_DIMENSION_TOOL,
    activeTool: null,
    toolPrompt: null,
    cursorStyle: 'default'
  }),
  
  selectDimensionEntity: (entityId) => set((state) => {
    const newSelectedIds = [...state.dimensionTool.selectedEntityIds, entityId]
    
    // Determine if we have enough entities
    let needsMore = true
    let dimensionType: 'length' | 'distance' | 'angle' | 'radius' | 'diameter' = 'length'
    
    if (newSelectedIds.length === 1) {
      // Single entity - could be length, radius, diameter
      dimensionType = 'length'  // Default, will determine from entity type
      needsMore = false  // Can dimension single entity
    } else if (newSelectedIds.length === 2) {
      // Two entities - distance or angle
      dimensionType = 'distance'
      needsMore = false
    }
    
    return {
      dimensionTool: {
        ...state.dimensionTool,
        selectedEntityIds: newSelectedIds,
        dimensionType,
        step: needsMore ? 'select-second' : 'place-label'
      },
      toolPrompt: needsMore 
        ? { primary: 'Add dimension', secondary: 'Select second entity' }
        : { primary: 'Place dimension', secondary: 'Click to place dimension label' }
    }
  }),
  
  placeDimensionLabel: (position) => set((state) => ({
    dimensionTool: {
      ...state.dimensionTool,
      labelPosition: position,
      step: 'edit-value'
    },
    toolPrompt: {
      primary: 'Enter dimension value',
      secondary: 'Type value and press Enter (or press Enter to keep current)'
    }
  })),
  
  applyDimensionValue: (value, sketchId) => {
    const { dimensionTool } = get()
    if (!dimensionTool.dimensionType || dimensionTool.selectedEntityIds.length === 0) return
    
    // Add dimension constraint to the sketch (async, but fire-and-forget)
    import('./documentStore').then(m => {
      const { addSketchConstraint } = m.useDocumentStore.getState()
      addSketchConstraint(sketchId, {
        type: 'horizontal',  // This would be replaced with proper dimension constraint type
        entityIds: dimensionTool.selectedEntityIds,
        value,
        status: 'satisfied',
        driven: !dimensionTool.isDriving
      })
    })
    
    // Reset for next dimension
    set({
      dimensionTool: {
        ...DEFAULT_DIMENSION_TOOL,
        isActive: true,
        isDriving: dimensionTool.isDriving  // Preserve driving mode
      },
      toolPrompt: {
        primary: 'Add dimension',
        secondary: 'Select entity to dimension'
      }
    })
    
    const { addNotification } = get()
    addNotification('success', `Dimension added: ${value}mm ${dimensionTool.isDriving ? '(driving)' : '(reference)'}`)
  },
  
  toggleDimensionDriving: () => set((state) => ({
    dimensionTool: {
      ...state.dimensionTool,
      isDriving: !state.dimensionTool.isDriving
    }
  })),
  
  // Transform/Move body actions
  enterTransformMode: (bodyId, mode) => set({
    transformState: {
      ...DEFAULT_TRANSFORM,
      isActive: true,
      mode,
      bodyId,
      createCopy: mode === 'copy'
    },
    activeDialog: 'move-copy-body',
    toolPrompt: {
      primary: mode === 'copy' ? 'Move and copy body' : 'Move body',
      secondary: 'Use gizmo to drag or enter values'
    }
  }),
  
  exitTransformMode: () => set({
    transformState: DEFAULT_TRANSFORM,
    activeDialog: null,
    toolPrompt: null
  }),
  
  setTransformTranslation: (translation) => set((state) => ({
    transformState: {
      ...state.transformState,
      translation
    }
  })),
  
  setTransformRotation: (rotation) => set((state) => ({
    transformState: {
      ...state.transformState,
      rotation
    }
  })),
  
  toggleCreateCopy: () => set((state) => ({
    transformState: {
      ...state.transformState,
      createCopy: !state.transformState.createCopy
    }
  })),
  
  setGizmoMode: (mode) => set((state) => ({
    transformState: {
      ...state.transformState,
      gizmoMode: mode
    }
  })),
  
  setCoordinateSpace: (space) => set((state) => ({
    transformState: {
      ...state.transformState,
      coordinateSpace: space
    }
  })),
  
  updatePreviewTransform: (position, rotation) => set((state) => ({
    transformState: {
      ...state.transformState,
      previewTransform: { position, rotation }
    }
  })),
  
  applyTransform: async () => {
    const { transformState } = get()
    if (!transformState.bodyId) return
    
    // Call documentStore to actually transform the body
    const { transformBody } = await import('./documentStore').then(m => m.useDocumentStore.getState())
    transformBody(
      transformState.bodyId,
      transformState.translation,
      transformState.rotation,
      transformState.createCopy
    )
    
    // Exit transform mode
    get().exitTransformMode()
    get().addNotification('success', transformState.createCopy ? 'Body copied and moved' : 'Body moved')
  },
  
  cancelTransform: () => {
    get().exitTransformMode()
    get().addNotification('info', 'Transform cancelled')
  },
  
  // History rollback implementation
  rollToFeature: async (partStudioId, featureId) => {
    const { documentStore } = await import('./documentStore').then(m => ({ documentStore: m.useDocumentStore.getState() }))
    const { document } = documentStore
    
    if (!document) return
    
    const partStudio = document.partStudios.find(ps => ps.id === partStudioId)
    if (!partStudio) return
    
    const featureIndex = partStudio.features.findIndex(f => f.id === featureId)
    if (featureIndex === -1) return
    
    // Enter rollback mode
    set({
      rollbackState: {
        isActive: true,
        partStudioId,
        featureId,
        showGhostFeatures: false
      }
    })
    
    // Temporarily suppress all features after the selected one
    // We'll mark them with a special flag so they're skipped during regeneration
    const featuresToSuppress = partStudio.features.slice(featureIndex + 1).map(f => f.id)
    
    // Store original suppression states to restore later
    const originalSuppressionStates = new Map(
      featuresToSuppress.map(id => {
        const feature = partStudio.features.find(f => f.id === id)
        return [id, feature?.suppressed || false]
      })
    )
    
    // Temporarily suppress features after the rollback point
    // Update documentStore directly
    const documentStoreModule = await import('./documentStore')
    const documentState = documentStoreModule.useDocumentStore.getState()
    
    if (!documentState.document) return
    
    const updatedPartStudios = documentState.document.partStudios.map(ps => {
      if (ps.id !== partStudioId) return ps
      
      return {
        ...ps,
        features: ps.features.map(f => {
          if (featuresToSuppress.includes(f.id)) {
            return { ...f, suppressed: true, rollbackSuppressed: true }
          }
          return f
        })
      }
    })
    
    documentStoreModule.useDocumentStore.setState({
      document: {
        ...documentState.document,
        partStudios: updatedPartStudios
      }
    })
    
    // Update UIStore rollback state
    set(state => ({
      rollbackState: {
        ...state.rollbackState,
        originalSuppressionStates
      }
    }))
    
    // Regenerate model up to rollback point
    await documentStore.regenerateModel(partStudioId)
    
    get().addNotification('info', `Rolled back to ${partStudio.features[featureIndex].name}`)
  },
  
  rollToEnd: async (partStudioId) => {
    const { documentStore } = await import('./documentStore').then(m => ({ documentStore: m.useDocumentStore.getState() }))
    const { document } = documentStore
    
    if (!document || !get().rollbackState.isActive) return
    
    const partStudio = document.partStudios.find(ps => ps.id === partStudioId)
    if (!partStudio) return
    
    const { originalSuppressionStates } = get().rollbackState as any
    
    // Restore original suppression states
    const documentStoreModule = await import('./documentStore')
    const documentState = documentStoreModule.useDocumentStore.getState()
    
    if (!documentState.document) return
    
    const updatedPartStudios = documentState.document.partStudios.map(ps => {
      if (ps.id !== partStudioId) return ps
      
      return {
        ...ps,
        features: ps.features.map(f => {
          if (f.rollbackSuppressed) {
            // Restore original state
            const originalSuppressed = originalSuppressionStates?.get(f.id) || false
            const { rollbackSuppressed, ...rest } = f
            return { ...rest, suppressed: originalSuppressed }
          }
          return f
        })
      }
    })
    
    documentStoreModule.useDocumentStore.setState({
      document: {
        ...documentState.document,
        partStudios: updatedPartStudios
      }
    })
    
    // Exit rollback mode
    set({
      rollbackState: {
        isActive: false,
        partStudioId: null,
        featureId: null,
        showGhostFeatures: false
      }
    })
    
    // Regenerate full model
    await documentStore.regenerateModel(partStudioId)
    
    get().addNotification('info', 'Rolled to end - all features active')
  },
  
  toggleGhostFeatures: () => set((state) => ({
    rollbackState: {
      ...state.rollbackState,
      showGhostFeatures: !state.rollbackState.showGhostFeatures
    }
  })),
  
  // Box selection implementation
  startBoxSelection: (x, y) => set({
    boxSelection: {
      isActive: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      mode: null,  // Determined on first movement
      previewIds: []
    }
  }),
  
  updateBoxSelection: (x, y, previewIds) => set((state) => {
    // Determine mode based on drag direction
    const mode = x >= state.boxSelection.startX ? 'window' : 'crossing'
    
    return {
      boxSelection: {
        ...state.boxSelection,
        currentX: x,
        currentY: y,
        mode,
        previewIds
      }
    }
  }),
  
  finishBoxSelection: (addToSelection) => {
    const { boxSelection, selection } = get()
    
    if (boxSelection.previewIds.length > 0) {
      if (addToSelection) {
        // Add to existing selection
        const newIds = [...new Set([...selection.ids, ...boxSelection.previewIds])]
        set({
          selection: { type: 'body', ids: newIds },
          boxSelection: {
            isActive: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            mode: null,
            previewIds: []
          }
        })
      } else {
        // Replace selection
        set({
          selection: { type: 'body', ids: boxSelection.previewIds },
          boxSelection: {
            isActive: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            mode: null,
            previewIds: []
          }
        })
      }
    } else {
      // No items selected, just clear box
      get().cancelBoxSelection()
    }
  },
  
  cancelBoxSelection: () => set({
    boxSelection: {
      isActive: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      mode: null,
      previewIds: []
    }
  }),
  
  addNotification: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }]
    }))
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id)
    }, 5000)
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}))
