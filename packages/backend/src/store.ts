/**
 * In-Memory Data Store
 * Provides document and model storage for the API
 */

import { v4 as uuidv4 } from 'uuid';

// Type definitions for stored entities
export interface StoredDocument {
  id: string;
  name: string;
  description?: string;
  created: string;
  modified: string;
  elements: {
    partStudios: string[];
    assemblies: string[];
    drawings: string[];
  };
}

export interface StoredPartStudio {
  id: string;
  documentId: string;
  name: string;
  features: StoredFeature[];
  parts: StoredPart[];
}

export interface StoredFeature {
  id: string;
  type: string;
  name: string;
  suppressed: boolean;
  parameters: Record<string, any>;
  created: string;
  modified: string;
}

export interface StoredPart {
  id: string;
  name: string;
  material?: string;
  color?: string;
  meshData?: {
    vertices: number[];
    normals: number[];
    indices: number[];
  };
}

export interface StoredSketch {
  id: string;
  partStudioId: string;
  name: string;
  plane: {
    origin: { x: number; y: number; z: number };
    normal: { x: number; y: number; z: number };
    xAxis: { x: number; y: number; z: number };
  };
  entities: StoredSketchEntity[];
  constraints: StoredConstraint[];
  dimensions: StoredDimension[];
}

export interface StoredSketchEntity {
  id: string;
  type: string;
  construction: boolean;
  parameters: Record<string, any>;
}

export interface StoredConstraint {
  id: string;
  type: string;
  entities: string[];
  parameters?: Record<string, any>;
}

export interface StoredDimension {
  id: string;
  type: string;
  value: number;
  driven: boolean;
  entities: string[];
}

export interface StoredAssembly {
  id: string;
  documentId: string;
  name: string;
  instances: StoredInstance[];
  mates: StoredMate[];
  relations: StoredRelation[];
}

export interface StoredInstance {
  id: string;
  name: string;
  sourceType: 'part' | 'assembly';
  sourceId: string;
  transform: number[]; // 16-element matrix
  suppressed: boolean;
  fixed: boolean;
}

export interface StoredMate {
  id: string;
  type: string;
  name: string;
  instance1: string;
  instance2: string;
  connector1: Record<string, any>;
  connector2: Record<string, any>;
  suppressed: boolean;
  parameters?: Record<string, any>;
}

export interface StoredRelation {
  id: string;
  type: string;
  name: string;
  parameters: Record<string, any>;
}

export interface StoredDrawing {
  id: string;
  documentId: string;
  name: string;
  sheets: StoredSheet[];
}

export interface StoredSheet {
  id: string;
  name: string;
  size: string;
  scale: number;
  views: StoredView[];
  annotations: StoredAnnotation[];
}

export interface StoredView {
  id: string;
  type: string;
  sourcePartStudioId?: string;
  sourceAssemblyId?: string;
  position: { x: number; y: number };
  scale: number;
  parameters: Record<string, any>;
}

export interface StoredAnnotation {
  id: string;
  type: string;
  parameters: Record<string, any>;
}

/**
 * In-Memory Store
 */
class Store {
  private documents: Map<string, StoredDocument> = new Map();
  private partStudios: Map<string, StoredPartStudio> = new Map();
  private sketches: Map<string, StoredSketch> = new Map();
  private assemblies: Map<string, StoredAssembly> = new Map();
  private drawings: Map<string, StoredDrawing> = new Map();

  constructor() {
    // Initialize with a sample document
    this.createSampleDocument();
  }

  private createSampleDocument(): void {
    const docId = 'sample-doc-1';
    const psId = 'sample-ps-1';
    const sketchId = 'sample-sketch-1';

    // Create document
    this.documents.set(docId, {
      id: docId,
      name: 'Sample Part',
      description: 'A sample part demonstrating feai features',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      elements: {
        partStudios: [psId],
        assemblies: [],
        drawings: []
      }
    });

    // Create part studio with sample features
    this.partStudios.set(psId, {
      id: psId,
      documentId: docId,
      name: 'Part Studio 1',
      features: [
        {
          id: sketchId,
          type: 'sketch',
          name: 'Sketch 1',
          suppressed: false,
          parameters: { planeId: 'top' },
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        },
        {
          id: 'extrude-1',
          type: 'extrude',
          name: 'Extrude 1',
          suppressed: false,
          parameters: {
            profiles: [sketchId],
            depth: 30,
            direction: 'one',
            operation: 'new'
          },
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        },
        {
          id: 'fillet-1',
          type: 'fillet',
          name: 'Fillet 1',
          suppressed: false,
          parameters: {
            edges: ['edge-1', 'edge-2'],
            radius: 5
          },
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        }
      ],
      parts: [
        {
          id: 'part-1',
          name: 'Part 1',
          material: 'Steel',
          color: '#6b7280'
        }
      ]
    });

    // Create sample sketch
    this.sketches.set(sketchId, {
      id: sketchId,
      partStudioId: psId,
      name: 'Sketch 1',
      plane: {
        origin: { x: 0, y: 0, z: 0 },
        normal: { x: 0, y: 0, z: 1 },
        xAxis: { x: 1, y: 0, z: 0 }
      },
      entities: [
        {
          id: 'rect-1',
          type: 'rectangle',
          construction: false,
          parameters: {
            corner1: { x: -15, y: -15 },
            corner2: { x: 15, y: 15 }
          }
        }
      ],
      constraints: [
        {
          id: 'constraint-1',
          type: 'coincident',
          entities: ['rect-1:center', 'origin']
        }
      ],
      dimensions: [
        {
          id: 'dim-1',
          type: 'linear',
          value: 30,
          driven: false,
          entities: ['rect-1:left', 'rect-1:right']
        }
      ]
    });
  }

  // Document operations
  getDocuments(): StoredDocument[] {
    return Array.from(this.documents.values());
  }

  getDocument(id: string): StoredDocument | undefined {
    return this.documents.get(id);
  }

  createDocument(data: { name: string; description?: string }): StoredDocument {
    const id = uuidv4();
    const now = new Date().toISOString();
    const psId = uuidv4();

    const doc: StoredDocument = {
      id,
      name: data.name,
      description: data.description,
      created: now,
      modified: now,
      elements: {
        partStudios: [psId],
        assemblies: [],
        drawings: []
      }
    };

    // Create default part studio
    this.partStudios.set(psId, {
      id: psId,
      documentId: id,
      name: 'Part Studio 1',
      features: [],
      parts: []
    });

    this.documents.set(id, doc);
    return doc;
  }

  updateDocument(id: string, data: Partial<StoredDocument>): StoredDocument | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;

    const updated = {
      ...doc,
      ...data,
      id, // Prevent ID change
      modified: new Date().toISOString()
    };

    this.documents.set(id, updated);
    return updated;
  }

  deleteDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    // Delete related entities
    doc.elements.partStudios.forEach(psId => this.partStudios.delete(psId));
    doc.elements.assemblies.forEach(asmId => this.assemblies.delete(asmId));
    doc.elements.drawings.forEach(dwgId => this.drawings.delete(dwgId));

    return this.documents.delete(id);
  }

  // Part Studio operations
  getPartStudio(id: string): StoredPartStudio | undefined {
    return this.partStudios.get(id);
  }

  getPartStudiosByDocument(documentId: string): StoredPartStudio[] {
    return Array.from(this.partStudios.values())
      .filter(ps => ps.documentId === documentId);
  }

  addFeature(partStudioId: string, feature: Omit<StoredFeature, 'id' | 'created' | 'modified'>): StoredFeature | undefined {
    const ps = this.partStudios.get(partStudioId);
    if (!ps) return undefined;

    const now = new Date().toISOString();
    const newFeature: StoredFeature = {
      ...feature,
      id: uuidv4(),
      created: now,
      modified: now
    };

    ps.features.push(newFeature);
    return newFeature;
  }

  updateFeature(partStudioId: string, featureId: string, data: Partial<StoredFeature>): StoredFeature | undefined {
    const ps = this.partStudios.get(partStudioId);
    if (!ps) return undefined;

    const index = ps.features.findIndex(f => f.id === featureId);
    if (index === -1) return undefined;

    ps.features[index] = {
      ...ps.features[index],
      ...data,
      id: featureId, // Prevent ID change
      modified: new Date().toISOString()
    };

    return ps.features[index];
  }

  deleteFeature(partStudioId: string, featureId: string): boolean {
    const ps = this.partStudios.get(partStudioId);
    if (!ps) return false;

    const index = ps.features.findIndex(f => f.id === featureId);
    if (index === -1) return false;

    ps.features.splice(index, 1);
    return true;
  }

  // Sketch operations
  getSketch(id: string): StoredSketch | undefined {
    return this.sketches.get(id);
  }

  createSketch(partStudioId: string, data: Omit<StoredSketch, 'id' | 'partStudioId'>): StoredSketch | undefined {
    const ps = this.partStudios.get(partStudioId);
    if (!ps) return undefined;

    const id = uuidv4();
    const sketch: StoredSketch = {
      ...data,
      id,
      partStudioId
    };

    this.sketches.set(id, sketch);

    // Add sketch as a feature
    this.addFeature(partStudioId, {
      type: 'sketch',
      name: data.name,
      suppressed: false,
      parameters: { sketchId: id }
    });

    return sketch;
  }

  addSketchEntity(sketchId: string, entity: Omit<StoredSketchEntity, 'id'>): StoredSketchEntity | undefined {
    const sketch = this.sketches.get(sketchId);
    if (!sketch) return undefined;

    const newEntity: StoredSketchEntity = {
      ...entity,
      id: uuidv4()
    };

    sketch.entities.push(newEntity);
    return newEntity;
  }

  addSketchConstraint(sketchId: string, constraint: Omit<StoredConstraint, 'id'>): StoredConstraint | undefined {
    const sketch = this.sketches.get(sketchId);
    if (!sketch) return undefined;

    const newConstraint: StoredConstraint = {
      ...constraint,
      id: uuidv4()
    };

    sketch.constraints.push(newConstraint);
    return newConstraint;
  }

  // Assembly operations
  getAssembly(id: string): StoredAssembly | undefined {
    return this.assemblies.get(id);
  }

  createAssembly(documentId: string, name: string): StoredAssembly | undefined {
    const doc = this.documents.get(documentId);
    if (!doc) return undefined;

    const id = uuidv4();
    const assembly: StoredAssembly = {
      id,
      documentId,
      name,
      instances: [],
      mates: [],
      relations: []
    };

    this.assemblies.set(id, assembly);
    doc.elements.assemblies.push(id);

    return assembly;
  }

  addInstance(assemblyId: string, instance: Omit<StoredInstance, 'id'>): StoredInstance | undefined {
    const assembly = this.assemblies.get(assemblyId);
    if (!assembly) return undefined;

    const newInstance: StoredInstance = {
      ...instance,
      id: uuidv4()
    };

    assembly.instances.push(newInstance);
    return newInstance;
  }

  addMate(assemblyId: string, mate: Omit<StoredMate, 'id'>): StoredMate | undefined {
    const assembly = this.assemblies.get(assemblyId);
    if (!assembly) return undefined;

    const newMate: StoredMate = {
      ...mate,
      id: uuidv4()
    };

    assembly.mates.push(newMate);
    return newMate;
  }

  // Drawing operations
  getDrawing(id: string): StoredDrawing | undefined {
    return this.drawings.get(id);
  }

  createDrawing(documentId: string, name: string): StoredDrawing | undefined {
    const doc = this.documents.get(documentId);
    if (!doc) return undefined;

    const id = uuidv4();
    const drawing: StoredDrawing = {
      id,
      documentId,
      name,
      sheets: [
        {
          id: uuidv4(),
          name: 'Sheet 1',
          size: 'A3',
          scale: 1,
          views: [],
          annotations: []
        }
      ]
    };

    this.drawings.set(id, drawing);
    doc.elements.drawings.push(id);

    return drawing;
  }

  addView(drawingId: string, sheetIndex: number, view: Omit<StoredView, 'id'>): StoredView | undefined {
    const drawing = this.drawings.get(drawingId);
    if (!drawing || !drawing.sheets[sheetIndex]) return undefined;

    const newView: StoredView = {
      ...view,
      id: uuidv4()
    };

    drawing.sheets[sheetIndex].views.push(newView);
    return newView;
  }
}

// Export singleton instance
export const store = new Store();
