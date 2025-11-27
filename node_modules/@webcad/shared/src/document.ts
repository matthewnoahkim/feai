// ============================================================================
// DOCUMENT TYPES - Top-level document structure
// ============================================================================

import { Part } from './features';
import { Assembly } from './assembly';
import { Drawing } from './drawing';
import { Material } from './geometry';

// === Document Types ===

export type ElementType = 'partStudio' | 'assembly' | 'drawing';

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  created: string;
  modified: string;
}

export interface PartStudioElement extends BaseElement {
  type: 'partStudio';
  parts: Part[];
}

export interface AssemblyElement extends BaseElement {
  type: 'assembly';
  assembly: Assembly;
}

export interface DrawingElement extends BaseElement {
  type: 'drawing';
  drawing: Drawing;
}

export type DocumentElement = PartStudioElement | AssemblyElement | DrawingElement;

// === Document ===

export interface Document {
  id: string;
  name: string;
  description?: string;
  
  // Elements (tabs)
  elements: DocumentElement[];
  
  // Shared resources
  materials: Material[];
  parameters: Record<string, number>;  // Global parameters
  
  // Metadata
  units: 'mm' | 'inch' | 'm';
  defaultMaterial?: string;
  
  created: string;
  modified: string;
  version: number;
}

// === Document Operations ===

export interface DocumentCreateRequest {
  name: string;
  description?: string;
  units?: 'mm' | 'inch' | 'm';
}

export interface DocumentUpdateRequest {
  name?: string;
  description?: string;
  units?: 'mm' | 'inch' | 'm';
  parameters?: Record<string, number>;
}

// === Version/History ===

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  timestamp: string;
  description?: string;
  snapshot: string;       // Serialized document state
}

// === Workspace State ===

export interface WorkspaceState {
  documentId?: string;
  activeElementId?: string;
  
  viewState: {
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
    cameraUp: [number, number, number];
    zoom: number;
  };
  
  selectionState: {
    selectedEntities: string[];
    highlightedEntity?: string;
  };
  
  displaySettings: {
    showOrigin: boolean;
    showPlanes: boolean;
    showGrid: boolean;
    gridSize: number;
    displayMode: 'shaded' | 'wireframe' | 'hidden' | 'shadedEdges';
    showSketches: boolean;
  };
  
  activeSketchId?: string;
  rollbackFeatureIndex?: number;
}

