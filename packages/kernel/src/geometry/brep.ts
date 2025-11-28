// ============================================================================
// B-Rep (Boundary Representation) Solid Modeling
// ============================================================================

import { 
  Vector3, Vertex, Edge, Face, Loop, Shell, Solid, SolidData,
  Surface, PlaneSurface, CylinderSurface, BoundingBox3D
} from '@feai/shared';
import { Vec3 } from '../math/vector';
import { PlaneUtils } from './surface';

// Re-export types from shared for other kernel modules (excluding Vector3 which is exported from vector.ts)
export type { Vertex, Edge, Face, Loop, Shell, Solid, SolidData, Surface, PlaneSurface, CylinderSurface, BoundingBox3D };

// ============================================================================
// ID Generation
// ============================================================================

let idCounter = 0;

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${++idCounter}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// ============================================================================
// B-Rep Builder
// ============================================================================

export class BRepBuilder {
  private vertices: Map<string, Vertex> = new Map();
  private edges: Map<string, Edge> = new Map();
  private faces: Map<string, Face> = new Map();
  private shells: Shell[] = [];

  /**
   * Add a vertex to the B-Rep
   */
  addVertex(point: Vector3, id?: string): string {
    const vertexId = id || generateId('v');
    this.vertices.set(vertexId, {
      id: vertexId,
      point: { x: point.x, y: point.y, z: point.z },
      edges: []
    });
    return vertexId;
  }

  /**
   * Add an edge between two vertices
   */
  addEdge(startVertexId: string, endVertexId: string, id?: string): string {
    const edgeId = id || generateId('e');
    const startVertex = this.vertices.get(startVertexId);
    const endVertex = this.vertices.get(endVertexId);
    
    if (!startVertex || !endVertex) {
      throw new Error('Vertices not found');
    }
    
    // Create line curve for the edge
    const curve = {
      id: generateId('curve'),
      type: 'line' as const,
      start: startVertex.point,
      end: endVertex.point
    };
    
    const edge: Edge = {
      id: edgeId,
      curve,
      startVertex: startVertexId,
      endVertex: endVertexId,
      faces: []
    };
    
    this.edges.set(edgeId, edge);
    
    // Update vertex references
    startVertex.edges.push(edgeId);
    endVertex.edges.push(edgeId);
    
    return edgeId;
  }

  /**
   * Add a face with a surface and loops
   */
  addFace(surface: Surface, loops: Loop[], id?: string): string {
    const faceId = id || generateId('f');
    
    // Compute face normal from surface
    let normal: Vector3;
    if (surface.type === 'plane') {
      normal = (surface as PlaneSurface).normal;
    } else {
      // For other surfaces, use a default or compute from surface
      normal = { x: 0, y: 0, z: 1 };
    }
    
    const face: Face = {
      id: faceId,
      surface,
      loops,
      normal
    };
    
    this.faces.set(faceId, face);
    
    // Update edge references
    for (const loop of loops) {
      for (const edgeId of loop.edges) {
        const edge = this.edges.get(edgeId);
        if (edge) {
          edge.faces.push(faceId);
        }
      }
    }
    
    return faceId;
  }

  /**
   * Create a loop from edge IDs
   */
  createLoop(edgeIds: string[], orientations: boolean[], isOuter: boolean = true): Loop {
    return {
      id: generateId('loop'),
      edges: edgeIds,
      orientations,
      isOuter
    };
  }

  /**
   * Add a shell from face IDs
   */
  addShell(faceIds: string[], isOuter: boolean = true): void {
    this.shells.push({
      id: generateId('shell'),
      faces: faceIds,
      isOuter
    });
  }

  /**
   * Build the final solid
   */
  build(): Solid {
    return {
      id: generateId('solid'),
      shells: this.shells,
      vertices: this.vertices,
      edges: this.edges,
      faces: this.faces
    };
  }

  /**
   * Convert solid to serializable data
   */
  toSolidData(): SolidData {
    const solid = this.build();
    return {
      id: solid.id,
      shells: solid.shells,
      vertices: Object.fromEntries(solid.vertices),
      edges: Object.fromEntries(solid.edges),
      faces: Object.fromEntries(solid.faces)
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.vertices.clear();
    this.edges.clear();
    this.faces.clear();
    this.shells = [];
  }
}

// ============================================================================
// Primitive Solid Creation
// ============================================================================

export class SolidPrimitives {
  /**
   * Create a box (cuboid) solid
   */
  static createBox(width: number, height: number, depth: number, center?: Vector3): SolidData {
    const cx = center?.x || 0;
    const cy = center?.y || 0;
    const cz = center?.z || 0;
    
    const hw = width / 2;
    const hh = height / 2;
    const hd = depth / 2;
    
    const builder = new BRepBuilder();
    
    // Create 8 vertices
    const v0 = builder.addVertex({ x: cx - hw, y: cy - hh, z: cz - hd });
    const v1 = builder.addVertex({ x: cx + hw, y: cy - hh, z: cz - hd });
    const v2 = builder.addVertex({ x: cx + hw, y: cy + hh, z: cz - hd });
    const v3 = builder.addVertex({ x: cx - hw, y: cy + hh, z: cz - hd });
    const v4 = builder.addVertex({ x: cx - hw, y: cy - hh, z: cz + hd });
    const v5 = builder.addVertex({ x: cx + hw, y: cy - hh, z: cz + hd });
    const v6 = builder.addVertex({ x: cx + hw, y: cy + hh, z: cz + hd });
    const v7 = builder.addVertex({ x: cx - hw, y: cy + hh, z: cz + hd });
    
    // Create 12 edges
    // Bottom face edges
    const e0 = builder.addEdge(v0, v1);
    const e1 = builder.addEdge(v1, v2);
    const e2 = builder.addEdge(v2, v3);
    const e3 = builder.addEdge(v3, v0);
    
    // Top face edges
    const e4 = builder.addEdge(v4, v5);
    const e5 = builder.addEdge(v5, v6);
    const e6 = builder.addEdge(v6, v7);
    const e7 = builder.addEdge(v7, v4);
    
    // Vertical edges
    const e8 = builder.addEdge(v0, v4);
    const e9 = builder.addEdge(v1, v5);
    const e10 = builder.addEdge(v2, v6);
    const e11 = builder.addEdge(v3, v7);
    
    // Create 6 faces
    // Bottom (Z-)
    const bottomSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: cx, y: cy, z: cz - hd },
      normal: { x: 0, y: 0, z: -1 }
    };
    const bottomLoop = builder.createLoop([e0, e1, e2, e3], [false, false, false, false]);
    builder.addFace(bottomSurface, [bottomLoop]);
    
    // Top (Z+)
    const topSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: cx, y: cy, z: cz + hd },
      normal: { x: 0, y: 0, z: 1 }
    };
    const topLoop = builder.createLoop([e4, e5, e6, e7], [true, true, true, true]);
    builder.addFace(topSurface, [topLoop]);
    
    // Front (Y-)
    const frontSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: cx, y: cy - hh, z: cz },
      normal: { x: 0, y: -1, z: 0 }
    };
    const frontLoop = builder.createLoop([e0, e9, e4, e8], [true, true, false, false]);
    builder.addFace(frontSurface, [frontLoop]);
    
    // Back (Y+)
    const backSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: cx, y: cy + hh, z: cz },
      normal: { x: 0, y: 1, z: 0 }
    };
    const backLoop = builder.createLoop([e2, e11, e6, e10], [true, true, false, false]);
    builder.addFace(backSurface, [backLoop]);
    
    // Left (X-)
    const leftSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: cx - hw, y: cy, z: cz },
      normal: { x: -1, y: 0, z: 0 }
    };
    const leftLoop = builder.createLoop([e3, e8, e7, e11], [true, true, false, false]);
    builder.addFace(leftSurface, [leftLoop]);
    
    // Right (X+)
    const rightSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: cx + hw, y: cy, z: cz },
      normal: { x: 1, y: 0, z: 0 }
    };
    const rightLoop = builder.createLoop([e1, e10, e5, e9], [true, true, false, false]);
    builder.addFace(rightSurface, [rightLoop]);
    
    // Create shell from all faces
    builder.addShell([...builder['faces'].keys()]);
    
    return builder.toSolidData();
  }

  /**
   * Create a cylinder solid
   */
  static createCylinder(radius: number, height: number, center?: Vector3, segments: number = 32): SolidData {
    const cx = center?.x || 0;
    const cy = center?.y || 0;
    const cz = center?.z || 0;
    
    const builder = new BRepBuilder();
    const bottomVertices: string[] = [];
    const topVertices: string[] = [];
    const bottomEdges: string[] = [];
    const topEdges: string[] = [];
    const sideEdges: string[] = [];
    
    // Create vertices around circles
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      bottomVertices.push(builder.addVertex({ x, y, z: cz }));
      topVertices.push(builder.addVertex({ x, y, z: cz + height }));
    }
    
    // Create edges
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      bottomEdges.push(builder.addEdge(bottomVertices[i], bottomVertices[next]));
      topEdges.push(builder.addEdge(topVertices[i], topVertices[next]));
      sideEdges.push(builder.addEdge(bottomVertices[i], topVertices[i]));
    }
    
    // Create bottom face
    const bottomSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: cx, y: cy, z: cz },
      normal: { x: 0, y: 0, z: -1 }
    };
    const bottomLoop = builder.createLoop(bottomEdges, bottomEdges.map(() => false));
    builder.addFace(bottomSurface, [bottomLoop]);
    
    // Create top face
    const topSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: cx, y: cy, z: cz + height },
      normal: { x: 0, y: 0, z: 1 }
    };
    const topLoop = builder.createLoop(topEdges, topEdges.map(() => true));
    builder.addFace(topSurface, [topLoop]);
    
    // Create side faces (one per segment as planar approximation)
    // For true cylinder, would use CylinderSurface
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const angle = ((i + 0.5) / segments) * Math.PI * 2;
      
      const sideSurface: PlaneSurface = {
        id: generateId('surf'),
        type: 'plane',
        origin: { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), z: cz + height / 2 },
        normal: { x: Math.cos(angle), y: Math.sin(angle), z: 0 }
      };
      
      const sideLoop = builder.createLoop(
        [bottomEdges[i], sideEdges[next], topEdges[i], sideEdges[i]],
        [true, true, false, false]
      );
      builder.addFace(sideSurface, [sideLoop]);
    }
    
    builder.addShell([...builder['faces'].keys()]);
    
    return builder.toSolidData();
  }

  /**
   * Create a sphere solid (approximated with triangular faces)
   */
  static createSphere(radius: number, center?: Vector3, segments: number = 16): SolidData {
    const cx = center?.x || 0;
    const cy = center?.y || 0;
    const cz = center?.z || 0;
    
    const builder = new BRepBuilder();
    const vertexGrid: string[][] = [];
    
    // Create vertices
    for (let lat = 0; lat <= segments; lat++) {
      vertexGrid[lat] = [];
      const theta = (lat / segments) * Math.PI;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let lon = 0; lon < segments; lon++) {
        const phi = (lon / segments) * Math.PI * 2;
        const x = cx + radius * sinTheta * Math.cos(phi);
        const y = cy + radius * sinTheta * Math.sin(phi);
        const z = cz + radius * cosTheta;
        
        if (lat === 0 || lat === segments) {
          // Pole vertex (same for all longitudes)
          if (lon === 0) {
            vertexGrid[lat][lon] = builder.addVertex({ x, y, z });
          } else {
            vertexGrid[lat][lon] = vertexGrid[lat][0];
          }
        } else {
          vertexGrid[lat][lon] = builder.addVertex({ x, y, z });
        }
      }
    }
    
    // Create edges and faces
    // This is a simplified version - a proper implementation would track all edges
    const faceIds: string[] = [];
    
    for (let lat = 0; lat < segments; lat++) {
      for (let lon = 0; lon < segments; lon++) {
        const nextLon = (lon + 1) % segments;
        
        // Get vertices for this quad
        const v00 = vertexGrid[lat][lon];
        const v01 = vertexGrid[lat][nextLon];
        const v10 = vertexGrid[lat + 1][lon];
        const v11 = vertexGrid[lat + 1][nextLon];
        
        // Create triangular faces
        if (lat === 0) {
          // Top cap - single triangle
          const e1 = builder.addEdge(v00, v10);
          const e2 = builder.addEdge(v10, v11);
          const e3 = builder.addEdge(v11, v00);
          
          const normal = new Vec3(
            (vertexGrid[lat + 1][lon] as any).x - cx,
            (vertexGrid[lat + 1][lon] as any).y - cy,
            (vertexGrid[lat + 1][lon] as any).z - cz
          ).normalize();
          
          const surf: PlaneSurface = {
            id: generateId('surf'),
            type: 'plane',
            origin: { x: cx, y: cy, z: cz + radius },
            normal: { x: normal.x, y: normal.y, z: normal.z }
          };
          
          const loop = builder.createLoop([e1, e2, e3], [true, true, true]);
          faceIds.push(builder.addFace(surf, [loop]));
        } else if (lat === segments - 1) {
          // Bottom cap - single triangle
          const e1 = builder.addEdge(v00, v01);
          const e2 = builder.addEdge(v01, v10);
          const e3 = builder.addEdge(v10, v00);
          
          const surf: PlaneSurface = {
            id: generateId('surf'),
            type: 'plane',
            origin: { x: cx, y: cy, z: cz - radius },
            normal: { x: 0, y: 0, z: -1 }
          };
          
          const loop = builder.createLoop([e1, e2, e3], [true, true, true]);
          faceIds.push(builder.addFace(surf, [loop]));
        } else {
          // Middle - two triangles
          const e1 = builder.addEdge(v00, v01);
          const e2 = builder.addEdge(v01, v10);
          const e3 = builder.addEdge(v10, v00);
          const e4 = builder.addEdge(v01, v11);
          const e5 = builder.addEdge(v11, v10);
          
          const surf1: PlaneSurface = {
            id: generateId('surf'),
            type: 'plane',
            origin: { x: cx, y: cy, z: cz },
            normal: { x: 0, y: 0, z: 1 }
          };
          
          const surf2: PlaneSurface = {
            id: generateId('surf'),
            type: 'plane',
            origin: { x: cx, y: cy, z: cz },
            normal: { x: 0, y: 0, z: 1 }
          };
          
          const loop1 = builder.createLoop([e1, e2, e3], [true, true, true]);
          const loop2 = builder.createLoop([e4, e5, e2], [true, true, false]);
          
          faceIds.push(builder.addFace(surf1, [loop1]));
          faceIds.push(builder.addFace(surf2, [loop2]));
        }
      }
    }
    
    builder.addShell(faceIds);
    
    return builder.toSolidData();
  }
}

// ============================================================================
// B-Rep Operations
// ============================================================================

export class BRepOperations {
  /**
   * Compute bounding box of a solid
   */
  static boundingBox(solid: SolidData): BoundingBox3D {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (const vertex of Object.values(solid.vertices)) {
      const p = vertex.point;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      minZ = Math.min(minZ, p.z);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
      maxZ = Math.max(maxZ, p.z);
    }
    
    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
  }

  /**
   * Transform a solid by a matrix
   */
  static transform(solid: SolidData, matrix: number[]): SolidData {
    // Apply transformation to all vertices
    const newVertices: Record<string, Vertex> = {};
    
    for (const [id, vertex] of Object.entries(solid.vertices)) {
      const p = vertex.point;
      // Apply 4x4 matrix transformation
      const x = matrix[0] * p.x + matrix[4] * p.y + matrix[8] * p.z + matrix[12];
      const y = matrix[1] * p.x + matrix[5] * p.y + matrix[9] * p.z + matrix[13];
      const z = matrix[2] * p.x + matrix[6] * p.y + matrix[10] * p.z + matrix[14];
      
      newVertices[id] = {
        ...vertex,
        point: { x, y, z }
      };
    }
    
    // TODO: Update edge curves and face surfaces/normals
    
    return {
      ...solid,
      vertices: newVertices
    };
  }

  /**
   * Clone a solid
   */
  static clone(solid: SolidData): SolidData {
    return JSON.parse(JSON.stringify(solid));
  }

  /**
   * Check if a point is inside a solid (ray casting algorithm)
   */
  static containsPoint(solid: SolidData, point: Vector3): boolean {
    // Simple ray casting - count intersections with faces
    let intersections = 0;
    
    // Cast ray in +X direction
    for (const face of Object.values(solid.faces)) {
      if (face.surface.type === 'plane') {
        const plane = face.surface as PlaneSurface;
        const intersection = PlaneUtils.intersectLine(
          PlaneUtils.fromOriginNormal(plane.origin, plane.normal),
          point,
          { x: point.x + 1000, y: point.y, z: point.z }
        );
        
        if (intersection && intersection.t > 0 && intersection.t < 1) {
          // TODO: Check if intersection point is inside face boundary
          intersections++;
        }
      }
    }
    
    return intersections % 2 === 1;
  }
}

