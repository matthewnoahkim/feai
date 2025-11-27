// ============================================================================
// API TYPES - REST API request/response types
// ============================================================================

import { Document, DocumentCreateRequest, DocumentUpdateRequest, DocumentElement } from './document';
import { Part, Feature, FeatureReference } from './features';
import { Sketch, Constraint, SketchEntity } from './sketch';
import { Assembly, AssemblyInstance, Mate, Relation, InterferenceResult, ClearanceResult } from './assembly';
import { Drawing, DrawingView, Dimension, Annotation } from './drawing';
import { MassProperties, MeshData, Material, BoundingBox3D, Vector3 } from './geometry';

// === Generic API Response ===

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// === Document API ===

export interface ListDocumentsResponse {
  documents: {
    id: string;
    name: string;
    created: string;
    modified: string;
    elementCount: number;
  }[];
}

export interface GetDocumentResponse {
  document: Document;
}

export interface CreateDocumentResponse {
  document: Document;
}

// === Part Studio API ===

export interface CreatePartStudioRequest {
  name: string;
}

export interface GetPartStudioResponse {
  id: string;
  name: string;
  parts: Part[];
  featureCount: number;
}

// === Feature API ===

export interface GetFeaturesResponse {
  features: Feature[];
  rollbackIndex?: number;
}

export interface AddFeatureRequest {
  feature: Omit<Feature, 'id' | 'status' | 'created' | 'modified'>;
  insertIndex?: number;   // Where to insert, default = end
}

export interface AddFeatureResponse {
  feature: Feature;
  regenerationResult: RegenerationResult;
}

export interface UpdateFeatureRequest {
  parameters?: Record<string, any>;
  name?: string;
  suppressed?: boolean;
}

export interface UpdateFeatureResponse {
  feature: Feature;
  regenerationResult: RegenerationResult;
}

export interface RegenerationResult {
  success: boolean;
  featureStatuses: {
    featureId: string;
    status: 'valid' | 'warning' | 'error';
    message?: string;
  }[];
  time: number;
}

export interface ReorderFeaturesRequest {
  featureIds: string[];
  insertAfter: string | null;  // Feature ID or null for start
}

// === Sketch API ===

export interface CreateSketchRequest {
  plane: FeatureReference | { origin: Vector3; normal: Vector3; xAxis: Vector3 };
  name?: string;
}

export interface GetSketchResponse {
  sketch: Sketch;
}

export interface UpdateSketchRequest {
  addEntities?: Omit<SketchEntity, 'id'>[];
  removeEntities?: string[];
  updateEntities?: { id: string; updates: Partial<SketchEntity> }[];
  addConstraints?: Omit<Constraint, 'id'>[];
  removeConstraints?: string[];
  updateConstraints?: { id: string; updates: Partial<Constraint> }[];
}

export interface UpdateSketchResponse {
  sketch: Sketch;
  solverResult: {
    success: boolean;
    degreesOfFreedom: number;
    errors?: { constraintId: string; message: string }[];
  };
}

// === Assembly API ===

export interface CreateAssemblyRequest {
  name: string;
}

export interface GetAssemblyResponse {
  assembly: Assembly;
}

export interface InsertInstanceRequest {
  sourceType: 'part' | 'assembly';
  sourceId: string;
  transform?: {
    position: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number; w: number };
  };
  name?: string;
}

export interface InsertInstanceResponse {
  instance: AssemblyInstance;
}

export interface CreateMateRequest {
  mate: Omit<Mate, 'id' | 'suppressed'>;
}

export interface CreateMateResponse {
  mate: Mate;
  solveResult: {
    success: boolean;
    instanceTransforms: {
      instanceId: string;
      transform: { position: Vector3; rotation: { x: number; y: number; z: number; w: number } };
    }[];
  };
}

export interface UpdateMateRequest {
  currentAngle?: number;
  currentOffset?: number;
  limits?: {
    enabled: boolean;
    min: number;
    max: number;
  };
  suppressed?: boolean;
}

export interface GetInterferencesRequest {
  checkType: 'interference' | 'clearance' | 'both';
  minClearance?: number;
  instances?: string[];   // Specific instances, or all if empty
}

export interface GetInterferencesResponse {
  interferences: InterferenceResult[];
  clearances: ClearanceResult[];
}

export interface GetBOMRequest {
  includeSubAssemblies: boolean;
  groupIdentical: boolean;
}

export interface GetBOMResponse {
  items: {
    itemNumber: number;
    partId: string;
    partName: string;
    quantity: number;
    material?: string;
    mass?: number;
  }[];
  totalMass: number;
}

// === Drawing API ===

export interface CreateDrawingRequest {
  name: string;
  sourceType: 'part' | 'assembly';
  sourceId: string;
  paperSize?: string;
  scale?: number;
}

export interface GetDrawingResponse {
  drawing: Drawing;
}

export interface AddViewRequest {
  view: Omit<DrawingView, 'id' | 'boundingBox'>;
}

export interface AddViewResponse {
  view: DrawingView;
}

export interface AddDimensionRequest {
  dimension: Omit<Dimension, 'id'>;
}

export interface AddDimensionResponse {
  dimension: Dimension;
}

export interface AddAnnotationRequest {
  annotation: Omit<Annotation, 'id'>;
}

// === Export API ===

export type ExportFormat = 'step' | 'iges' | 'stl' | 'obj' | 'dxf' | 'pdf' | 'json';

export interface ExportRequest {
  format: ExportFormat;
  options?: ExportOptions;
}

export interface ExportOptions {
  // STL options
  angularTolerance?: number;
  chordTolerance?: number;
  binary?: boolean;
  
  // STEP options
  schema?: 'AP203' | 'AP214' | 'AP242';
  
  // PDF options (for drawings)
  sheets?: number[];
  
  // General
  units?: 'mm' | 'inch';
}

export interface ExportResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  format: ExportFormat;
}

// === Import API ===

export interface ImportRequest {
  format: 'step' | 'iges' | 'stl' | 'obj' | 'dxf';
  fileName: string;
  fileData: string;       // Base64 encoded
  options?: ImportOptions;
}

export interface ImportOptions {
  // Where to import
  targetType: 'newDocument' | 'partStudio' | 'assembly';
  targetId?: string;
  
  // STL/OBJ options
  units?: 'mm' | 'inch';
  
  // DXF options (for sketches)
  targetPlane?: FeatureReference;
}

export interface ImportResponse {
  documentId?: string;
  partStudioId?: string;
  importedBodies: number;
  warnings?: string[];
}

// === Analysis API ===

export interface GetMassPropertiesRequest {
  bodyIds?: string[];     // Specific bodies, or all if empty
  materialOverride?: string;
}

export interface GetMassPropertiesResponse extends MassProperties {
  // Inherits all mass properties
}

export interface GetTessellationRequest {
  bodyIds?: string[];
  quality: 'low' | 'medium' | 'high' | 'custom';
  customOptions?: {
    angularTolerance?: number;
    chordTolerance?: number;
  };
}

export interface GetTessellationResponse {
  meshes: {
    bodyId: string;
    mesh: MeshData;
  }[];
}

export interface GetBoundingBoxResponse {
  boundingBox: BoundingBox3D;
}

// === Rendering API ===

export interface RenderRequest {
  viewSettings: {
    position: Vector3;
    target: Vector3;
    up: Vector3;
    fov: number;
  };
  imageSettings: {
    width: number;
    height: number;
    format: 'png' | 'jpeg';
    quality?: number;     // 0-100 for jpeg
  };
  renderSettings: {
    mode: 'realtime' | 'raytraced';
    samples?: number;     // For ray tracing
    environment?: string; // HDRI name
    backgroundColor?: string;
    showEdges?: boolean;
    shadows?: boolean;
  };
}

export interface RenderResponse {
  imageUrl: string;
  renderTime: number;
}

// === WebSocket Events (for real-time updates) ===

export type WebSocketEventType =
  | 'document:updated'
  | 'feature:updated'
  | 'sketch:updated'
  | 'assembly:updated'
  | 'regeneration:started'
  | 'regeneration:completed'
  | 'selection:changed'
  | 'view:changed';

export interface WebSocketEvent {
  type: WebSocketEventType;
  documentId: string;
  elementId?: string;
  payload: any;
  timestamp: string;
}

