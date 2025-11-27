// ============================================================================
// Tessellation - Converting geometry to triangle meshes
// ============================================================================

import { SolidData, MeshData, Vector3, Face, PlaneSurface } from '@webcad/shared';
import { Vec3 } from '../math/vector';

// ============================================================================
// Triangle Mesh Builder
// ============================================================================

export class MeshBuilder {
  private positions: number[] = [];
  private normals: number[] = [];
  private uvs: number[] = [];
  private indices: number[] = [];
  private vertexCount = 0;

  /**
   * Add a vertex and return its index
   */
  addVertex(position: Vector3, normal: Vector3, uv?: { u: number; v: number }): number {
    this.positions.push(position.x, position.y, position.z);
    this.normals.push(normal.x, normal.y, normal.z);
    if (uv) {
      this.uvs.push(uv.u, uv.v);
    }
    return this.vertexCount++;
  }

  /**
   * Add a triangle by vertex indices
   */
  addTriangle(i0: number, i1: number, i2: number): void {
    this.indices.push(i0, i1, i2);
  }

  /**
   * Add a quad (two triangles)
   */
  addQuad(i0: number, i1: number, i2: number, i3: number): void {
    this.indices.push(i0, i1, i2);
    this.indices.push(i0, i2, i3);
  }

  /**
   * Merge another mesh into this one
   */
  merge(other: MeshData): void {
    const offset = this.vertexCount;
    
    for (let i = 0; i < other.positions.length; i += 3) {
      this.positions.push(other.positions[i], other.positions[i + 1], other.positions[i + 2]);
      this.normals.push(other.normals[i], other.normals[i + 1], other.normals[i + 2]);
      this.vertexCount++;
    }
    
    if (other.uvs) {
      for (let i = 0; i < other.uvs.length; i += 2) {
        this.uvs.push(other.uvs[i], other.uvs[i + 1]);
      }
    }
    
    for (const index of other.indices) {
      this.indices.push(index + offset);
    }
  }

  /**
   * Build the final mesh data
   */
  build(): MeshData {
    return {
      positions: this.positions,
      normals: this.normals,
      indices: this.indices,
      uvs: this.uvs.length > 0 ? this.uvs : undefined
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.positions = [];
    this.normals = [];
    this.uvs = [];
    this.indices = [];
    this.vertexCount = 0;
  }
}

// ============================================================================
// Polygon Triangulation
// ============================================================================

export class Triangulator {
  /**
   * Triangulate a simple polygon (no holes) using ear clipping
   * Points should be in counter-clockwise order
   */
  static triangulatePolygon(points: Vector3[], normal: Vector3): number[] {
    if (points.length < 3) return [];
    if (points.length === 3) return [0, 1, 2];
    
    const n = new Vec3(normal.x, normal.y, normal.z).normalize();
    const indices: number[] = [];
    
    // Create a working list of vertex indices
    const remaining = points.map((_, i) => i);
    
    // Ear clipping algorithm
    while (remaining.length > 3) {
      let earFound = false;
      
      for (let i = 0; i < remaining.length; i++) {
        const prev = remaining[(i - 1 + remaining.length) % remaining.length];
        const curr = remaining[i];
        const next = remaining[(i + 1) % remaining.length];
        
        // Check if this is an ear (convex and no other points inside)
        if (this.isEar(points, remaining, prev, curr, next, n)) {
          indices.push(prev, curr, next);
          remaining.splice(i, 1);
          earFound = true;
          break;
        }
      }
      
      if (!earFound) {
        // Fallback - just triangulate remaining polygon
        console.warn('Ear clipping failed, using fallback triangulation');
        for (let i = 1; i < remaining.length - 1; i++) {
          indices.push(remaining[0], remaining[i], remaining[i + 1]);
        }
        break;
      }
    }
    
    // Add the last triangle
    if (remaining.length === 3) {
      indices.push(remaining[0], remaining[1], remaining[2]);
    }
    
    return indices;
  }

  /**
   * Check if vertex at index 'curr' forms an ear
   */
  private static isEar(
    points: Vector3[],
    remaining: number[],
    prev: number,
    curr: number,
    next: number,
    normal: Vec3
  ): boolean {
    const p0 = points[prev];
    const p1 = points[curr];
    const p2 = points[next];
    
    // Check if the angle is convex
    const v1 = new Vec3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
    const v2 = new Vec3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    const cross = v1.cross(v2);
    
    if (cross.dot(normal) <= 0) {
      return false; // Reflex vertex
    }
    
    // Check if any other point is inside the triangle
    for (const idx of remaining) {
      if (idx === prev || idx === curr || idx === next) continue;
      
      if (this.pointInTriangle(points[idx], p0, p1, p2)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if a point is inside a triangle
   */
  private static pointInTriangle(
    p: Vector3,
    a: Vector3,
    b: Vector3,
    c: Vector3
  ): boolean {
    const v0 = new Vec3(c.x - a.x, c.y - a.y, c.z - a.z);
    const v1 = new Vec3(b.x - a.x, b.y - a.y, b.z - a.z);
    const v2 = new Vec3(p.x - a.x, p.y - a.y, p.z - a.z);
    
    const dot00 = v0.dot(v0);
    const dot01 = v0.dot(v1);
    const dot02 = v0.dot(v2);
    const dot11 = v1.dot(v1);
    const dot12 = v1.dot(v2);
    
    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    
    return u >= 0 && v >= 0 && u + v < 1;
  }

  /**
   * Triangulate a polygon with holes
   */
  static triangulateWithHoles(
    outer: Vector3[],
    holes: Vector3[][],
    normal: Vector3
  ): number[] {
    // For simplicity, this implementation doesn't handle holes properly
    // A proper implementation would use constrained Delaunay triangulation
    // or connect holes to the outer boundary
    
    // For now, just triangulate the outer polygon
    return this.triangulatePolygon(outer, normal);
  }
}

// ============================================================================
// B-Rep to Mesh Conversion
// ============================================================================

export class BRepTessellator {
  /**
   * Convert a B-Rep solid to a triangle mesh
   */
  static tessellate(solid: SolidData, options: TessellationOptions = {}): MeshData {
    const {
      angularTolerance = 0.1,
      chordTolerance = 0.01,
      minEdgeLength = 0.001
    } = options;
    
    const builder = new MeshBuilder();
    
    for (const face of Object.values(solid.faces)) {
      this.tessellateFace(solid, face, builder, options);
    }
    
    return builder.build();
  }

  /**
   * Tessellate a single face
   */
  private static tessellateFace(
    solid: SolidData,
    face: Face,
    builder: MeshBuilder,
    options: TessellationOptions
  ): void {
    // Get the face boundary vertices
    const boundaryPoints: Vector3[] = [];
    
    for (const loop of face.loops) {
      if (loop.isOuter) {
        for (let i = 0; i < loop.edges.length; i++) {
          const edge = solid.edges[loop.edges[i]];
          if (!edge) continue;
          
          const vertex = loop.orientations[i]
            ? solid.vertices[edge.startVertex]
            : solid.vertices[edge.endVertex];
          
          if (vertex) {
            boundaryPoints.push(vertex.point);
          }
        }
      }
    }
    
    if (boundaryPoints.length < 3) return;
    
    // Triangulate the face
    const triangleIndices = Triangulator.triangulatePolygon(boundaryPoints, face.normal);
    
    // Add vertices and triangles to mesh
    const vertexIndices: number[] = [];
    for (const point of boundaryPoints) {
      const idx = builder.addVertex(point, face.normal);
      vertexIndices.push(idx);
    }
    
    for (let i = 0; i < triangleIndices.length; i += 3) {
      builder.addTriangle(
        vertexIndices[triangleIndices[i]],
        vertexIndices[triangleIndices[i + 1]],
        vertexIndices[triangleIndices[i + 2]]
      );
    }
  }

  /**
   * Compute face normals from vertices (for imported meshes)
   */
  static computeNormals(mesh: MeshData): MeshData {
    const normals = new Array(mesh.positions.length).fill(0);
    
    // Compute face normals and accumulate to vertices
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];
      
      const p0 = new Vec3(
        mesh.positions[i0 * 3],
        mesh.positions[i0 * 3 + 1],
        mesh.positions[i0 * 3 + 2]
      );
      const p1 = new Vec3(
        mesh.positions[i1 * 3],
        mesh.positions[i1 * 3 + 1],
        mesh.positions[i1 * 3 + 2]
      );
      const p2 = new Vec3(
        mesh.positions[i2 * 3],
        mesh.positions[i2 * 3 + 1],
        mesh.positions[i2 * 3 + 2]
      );
      
      const v1 = p1.sub(p0);
      const v2 = p2.sub(p0);
      const normal = v1.cross(v2);
      
      // Add to each vertex
      for (const idx of [i0, i1, i2]) {
        normals[idx * 3] += normal.x;
        normals[idx * 3 + 1] += normal.y;
        normals[idx * 3 + 2] += normal.z;
      }
    }
    
    // Normalize
    for (let i = 0; i < normals.length; i += 3) {
      const n = new Vec3(normals[i], normals[i + 1], normals[i + 2]).normalize();
      normals[i] = n.x;
      normals[i + 1] = n.y;
      normals[i + 2] = n.z;
    }
    
    return {
      ...mesh,
      normals
    };
  }
}

export interface TessellationOptions {
  angularTolerance?: number;  // Maximum angle between adjacent triangles (radians)
  chordTolerance?: number;    // Maximum deviation from true surface (mm)
  minEdgeLength?: number;     // Minimum edge length in output mesh (mm)
}

// ============================================================================
// Mesh Utilities
// ============================================================================

export class MeshUtils {
  /**
   * Merge multiple meshes into one
   */
  static merge(meshes: MeshData[]): MeshData {
    const builder = new MeshBuilder();
    for (const mesh of meshes) {
      builder.merge(mesh);
    }
    return builder.build();
  }

  /**
   * Calculate mesh statistics
   */
  static stats(mesh: MeshData): {
    vertexCount: number;
    triangleCount: number;
    boundingBox: { min: Vector3; max: Vector3 };
  } {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < mesh.positions.length; i += 3) {
      const x = mesh.positions[i];
      const y = mesh.positions[i + 1];
      const z = mesh.positions[i + 2];
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }
    
    return {
      vertexCount: mesh.positions.length / 3,
      triangleCount: mesh.indices.length / 3,
      boundingBox: {
        min: { x: minX, y: minY, z: minZ },
        max: { x: maxX, y: maxY, z: maxZ }
      }
    };
  }

  /**
   * Flip mesh normals (reverse winding order)
   */
  static flipNormals(mesh: MeshData): MeshData {
    const newIndices = [...mesh.indices];
    
    // Swap triangle winding
    for (let i = 0; i < newIndices.length; i += 3) {
      const temp = newIndices[i + 1];
      newIndices[i + 1] = newIndices[i + 2];
      newIndices[i + 2] = temp;
    }
    
    // Negate normals
    const newNormals = mesh.normals.map(n => -n);
    
    return {
      ...mesh,
      indices: newIndices,
      normals: newNormals
    };
  }

  /**
   * Transform mesh vertices
   */
  static transform(mesh: MeshData, matrix: number[]): MeshData {
    const newPositions = [...mesh.positions];
    const newNormals = [...mesh.normals];
    
    for (let i = 0; i < newPositions.length; i += 3) {
      const x = newPositions[i];
      const y = newPositions[i + 1];
      const z = newPositions[i + 2];
      
      // Transform position
      newPositions[i] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
      newPositions[i + 1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
      newPositions[i + 2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
      
      // Transform normal (without translation)
      const nx = newNormals[i];
      const ny = newNormals[i + 1];
      const nz = newNormals[i + 2];
      
      newNormals[i] = matrix[0] * nx + matrix[4] * ny + matrix[8] * nz;
      newNormals[i + 1] = matrix[1] * nx + matrix[5] * ny + matrix[9] * nz;
      newNormals[i + 2] = matrix[2] * nx + matrix[6] * ny + matrix[10] * nz;
      
      // Renormalize
      const len = Math.sqrt(
        newNormals[i] * newNormals[i] +
        newNormals[i + 1] * newNormals[i + 1] +
        newNormals[i + 2] * newNormals[i + 2]
      );
      if (len > 0) {
        newNormals[i] /= len;
        newNormals[i + 1] /= len;
        newNormals[i + 2] /= len;
      }
    }
    
    return {
      ...mesh,
      positions: newPositions,
      normals: newNormals
    };
  }
}

