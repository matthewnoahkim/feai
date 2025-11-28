// ============================================================================
// STL File Import/Export
// ============================================================================

import { SolidData, MeshData, Vector3 } from '@feai/shared';
import { Vec3 } from '../math/vector';
import { BRepTessellator, BRepTessellator as Tessellator, MeshUtils } from '../geometry/tessellation';
import { BRepBuilder, generateId } from '../geometry/brep';

export interface STLExportOptions {
  binary?: boolean;
  name?: string;
}

export interface STLImportOptions {
  units?: 'mm' | 'inch';
  mergeVertices?: boolean;
  tolerance?: number;
}

/**
 * STL (Stereolithography) file format handler
 */
export class STLHandler {
  /**
   * Export solid to ASCII STL format
   */
  static exportASCII(solid: SolidData, name: string = 'solid'): string {
    const mesh = BRepTessellator.tessellate(solid);
    const lines: string[] = [];
    
    lines.push(`solid ${name}`);
    
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];
      
      // Get vertices
      const v0 = new Vec3(
        mesh.positions[i0 * 3],
        mesh.positions[i0 * 3 + 1],
        mesh.positions[i0 * 3 + 2]
      );
      const v1 = new Vec3(
        mesh.positions[i1 * 3],
        mesh.positions[i1 * 3 + 1],
        mesh.positions[i1 * 3 + 2]
      );
      const v2 = new Vec3(
        mesh.positions[i2 * 3],
        mesh.positions[i2 * 3 + 1],
        mesh.positions[i2 * 3 + 2]
      );
      
      // Calculate face normal
      const edge1 = v1.sub(v0);
      const edge2 = v2.sub(v0);
      const normal = edge1.cross(edge2).normalize();
      
      lines.push(`  facet normal ${normal.x} ${normal.y} ${normal.z}`);
      lines.push('    outer loop');
      lines.push(`      vertex ${v0.x} ${v0.y} ${v0.z}`);
      lines.push(`      vertex ${v1.x} ${v1.y} ${v1.z}`);
      lines.push(`      vertex ${v2.x} ${v2.y} ${v2.z}`);
      lines.push('    endloop');
      lines.push('  endfacet');
    }
    
    lines.push(`endsolid ${name}`);
    
    return lines.join('\n');
  }

  /**
   * Export solid to Binary STL format
   */
  static exportBinary(solid: SolidData, name: string = 'solid'): ArrayBuffer {
    const mesh = BRepTessellator.tessellate(solid);
    const triangleCount = mesh.indices.length / 3;
    
    // Binary STL format:
    // 80 bytes header
    // 4 bytes triangle count (uint32)
    // For each triangle:
    //   12 bytes normal (3 x float32)
    //   36 bytes vertices (9 x float32)
    //   2 bytes attribute byte count (uint16)
    
    const bufferSize = 80 + 4 + triangleCount * 50;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);
    
    // Header (80 bytes)
    const header = `feai STL Export - ${name}`;
    for (let i = 0; i < 80; i++) {
      view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
    }
    
    // Triangle count
    view.setUint32(80, triangleCount, true);
    
    // Triangles
    let offset = 84;
    
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];
      
      // Get vertices
      const v0 = new Vec3(
        mesh.positions[i0 * 3],
        mesh.positions[i0 * 3 + 1],
        mesh.positions[i0 * 3 + 2]
      );
      const v1 = new Vec3(
        mesh.positions[i1 * 3],
        mesh.positions[i1 * 3 + 1],
        mesh.positions[i1 * 3 + 2]
      );
      const v2 = new Vec3(
        mesh.positions[i2 * 3],
        mesh.positions[i2 * 3 + 1],
        mesh.positions[i2 * 3 + 2]
      );
      
      // Calculate normal
      const edge1 = v1.sub(v0);
      const edge2 = v2.sub(v0);
      const normal = edge1.cross(edge2).normalize();
      
      // Write normal
      view.setFloat32(offset, normal.x, true); offset += 4;
      view.setFloat32(offset, normal.y, true); offset += 4;
      view.setFloat32(offset, normal.z, true); offset += 4;
      
      // Write vertices
      view.setFloat32(offset, v0.x, true); offset += 4;
      view.setFloat32(offset, v0.y, true); offset += 4;
      view.setFloat32(offset, v0.z, true); offset += 4;
      
      view.setFloat32(offset, v1.x, true); offset += 4;
      view.setFloat32(offset, v1.y, true); offset += 4;
      view.setFloat32(offset, v1.z, true); offset += 4;
      
      view.setFloat32(offset, v2.x, true); offset += 4;
      view.setFloat32(offset, v2.y, true); offset += 4;
      view.setFloat32(offset, v2.z, true); offset += 4;
      
      // Attribute byte count (0)
      view.setUint16(offset, 0, true); offset += 2;
    }
    
    return buffer;
  }

  /**
   * Import ASCII STL file
   */
  static importASCII(content: string, options?: STLImportOptions): MeshData {
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    
    const lines = content.split('\n');
    let vertexIndex = 0;
    let currentNormal: Vec3 | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('facet normal')) {
        const parts = trimmed.split(/\s+/);
        currentNormal = new Vec3(
          parseFloat(parts[2]),
          parseFloat(parts[3]),
          parseFloat(parts[4])
        );
      } else if (trimmed.startsWith('vertex')) {
        const parts = trimmed.split(/\s+/);
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        
        // Apply unit conversion
        const scale = options?.units === 'inch' ? 25.4 : 1;
        
        positions.push(x * scale, y * scale, z * scale);
        
        if (currentNormal) {
          normals.push(currentNormal.x, currentNormal.y, currentNormal.z);
        } else {
          normals.push(0, 0, 1);
        }
        
        indices.push(vertexIndex++);
      }
    }
    
    const mesh: MeshData = { positions, normals, indices };
    
    // Optionally merge duplicate vertices
    if (options?.mergeVertices) {
      return this.mergeVertices(mesh, options.tolerance || 1e-6);
    }
    
    return mesh;
  }

  /**
   * Import Binary STL file
   */
  static importBinary(buffer: ArrayBuffer, options?: STLImportOptions): MeshData {
    const view = new DataView(buffer);
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    
    // Skip header (80 bytes)
    // Read triangle count
    const triangleCount = view.getUint32(80, true);
    
    let offset = 84;
    let vertexIndex = 0;
    const scale = options?.units === 'inch' ? 25.4 : 1;
    
    for (let t = 0; t < triangleCount; t++) {
      // Read normal
      const nx = view.getFloat32(offset, true); offset += 4;
      const ny = view.getFloat32(offset, true); offset += 4;
      const nz = view.getFloat32(offset, true); offset += 4;
      
      // Read vertices
      for (let v = 0; v < 3; v++) {
        const x = view.getFloat32(offset, true) * scale; offset += 4;
        const y = view.getFloat32(offset, true) * scale; offset += 4;
        const z = view.getFloat32(offset, true) * scale; offset += 4;
        
        positions.push(x, y, z);
        normals.push(nx, ny, nz);
        indices.push(vertexIndex++);
      }
      
      // Skip attribute byte count
      offset += 2;
    }
    
    const mesh: MeshData = { positions, normals, indices };
    
    if (options?.mergeVertices) {
      return this.mergeVertices(mesh, options.tolerance || 1e-6);
    }
    
    return mesh;
  }

  /**
   * Detect if STL content is binary or ASCII
   */
  static isBinary(buffer: ArrayBuffer): boolean {
    // Check if it starts with "solid" (ASCII STL)
    const view = new Uint8Array(buffer);
    const header = String.fromCharCode(...view.slice(0, 5));
    
    if (header !== 'solid') {
      return true;
    }
    
    // Could still be binary with "solid" in header
    // Check if file size matches expected binary size
    const dataView = new DataView(buffer);
    const triangleCount = dataView.getUint32(80, true);
    const expectedSize = 84 + triangleCount * 50;
    
    return buffer.byteLength === expectedSize;
  }

  /**
   * Import STL file (auto-detect format)
   */
  static import(data: ArrayBuffer | string, options?: STLImportOptions): MeshData {
    if (typeof data === 'string') {
      return this.importASCII(data, options);
    }
    
    if (this.isBinary(data)) {
      return this.importBinary(data, options);
    }
    
    // Convert buffer to string for ASCII parsing
    const decoder = new TextDecoder();
    return this.importASCII(decoder.decode(data), options);
  }

  /**
   * Merge duplicate vertices
   */
  private static mergeVertices(mesh: MeshData, tolerance: number): MeshData {
    const uniqueVertices: number[] = [];
    const uniqueNormals: number[] = [];
    const vertexMap = new Map<string, number>();
    const newIndices: number[] = [];
    
    for (let i = 0; i < mesh.positions.length; i += 3) {
      const x = mesh.positions[i];
      const y = mesh.positions[i + 1];
      const z = mesh.positions[i + 2];
      
      // Create key with tolerance
      const key = `${Math.round(x / tolerance)},${Math.round(y / tolerance)},${Math.round(z / tolerance)}`;
      
      let index = vertexMap.get(key);
      
      if (index === undefined) {
        index = uniqueVertices.length / 3;
        vertexMap.set(key, index);
        
        uniqueVertices.push(x, y, z);
        uniqueNormals.push(
          mesh.normals[i],
          mesh.normals[i + 1],
          mesh.normals[i + 2]
        );
      }
      
      newIndices.push(index);
    }
    
    // Recompute normals by averaging
    const normalCounts = new Array(uniqueVertices.length / 3).fill(0);
    const accumulatedNormals = new Array(uniqueVertices.length).fill(0);
    
    for (let i = 0; i < mesh.indices.length; i++) {
      const oldIndex = mesh.indices[i];
      const newIndex = newIndices[oldIndex];
      
      accumulatedNormals[newIndex * 3] += mesh.normals[oldIndex * 3];
      accumulatedNormals[newIndex * 3 + 1] += mesh.normals[oldIndex * 3 + 1];
      accumulatedNormals[newIndex * 3 + 2] += mesh.normals[oldIndex * 3 + 2];
      normalCounts[newIndex]++;
    }
    
    // Normalize
    for (let i = 0; i < normalCounts.length; i++) {
      const count = normalCounts[i];
      if (count > 0) {
        const len = Math.sqrt(
          accumulatedNormals[i * 3] ** 2 +
          accumulatedNormals[i * 3 + 1] ** 2 +
          accumulatedNormals[i * 3 + 2] ** 2
        );
        if (len > 0) {
          uniqueNormals[i * 3] = accumulatedNormals[i * 3] / len;
          uniqueNormals[i * 3 + 1] = accumulatedNormals[i * 3 + 1] / len;
          uniqueNormals[i * 3 + 2] = accumulatedNormals[i * 3 + 2] / len;
        }
      }
    }
    
    return {
      positions: uniqueVertices,
      normals: uniqueNormals,
      indices: newIndices
    };
  }
}

