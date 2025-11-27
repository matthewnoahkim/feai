// ============================================================================
// Direct Modeling Operations (Push-Pull, Move Face, etc.)
// ============================================================================

import { SolidData, Vector3, Face, Edge, Transform } from '@webcad/shared';
import { Vec3 } from '../math/vector';
import { Mat4 } from '../math/matrix';
import { Quat } from '../math/quaternion';
import { BRepOperations, generateId } from '../geometry/brep';

export interface MoveFaceOptions {
  faceIds: string[];
  offset?: Vector3;       // Translation offset
  rotation?: { axis: Vector3; angle: number; center?: Vector3 };  // Rotation
}

export interface OffsetFaceOptions {
  faceIds: string[];
  distance: number;       // Positive = outward, negative = inward
}

export interface DeleteFaceOptions {
  faceIds: string[];
  heal?: boolean;         // Try to close the resulting gap
}

/**
 * Direct modeling operations for push-pull style editing
 */
export class DirectModeling {
  /**
   * Move/rotate selected faces
   */
  static moveFace(solid: SolidData, options: MoveFaceOptions): SolidData {
    const { faceIds, offset, rotation } = options;
    
    // Clone the solid
    const result = BRepOperations.clone(solid);
    
    // Build transformation matrix
    let matrix = Mat4.identity();
    
    if (rotation) {
      const axis = new Vec3(rotation.axis.x, rotation.axis.y, rotation.axis.z).normalize();
      const center = rotation.center || { x: 0, y: 0, z: 0 };
      
      // Translate to origin, rotate, translate back
      matrix = Mat4.translation(-center.x, -center.y, -center.z)
        .multiply(Mat4.rotationAxis(axis, rotation.angle))
        .multiply(Mat4.translation(center.x, center.y, center.z));
    }
    
    if (offset) {
      matrix = matrix.multiply(Mat4.translation(offset.x, offset.y, offset.z));
    }
    
    // Find all vertices that belong to the selected faces
    const verticesToMove = new Set<string>();
    
    for (const faceId of faceIds) {
      const face = result.faces[faceId];
      if (!face) continue;
      
      for (const loop of face.loops) {
        for (const edgeId of loop.edges) {
          const edge = result.edges[edgeId];
          if (edge) {
            verticesToMove.add(edge.startVertex);
            verticesToMove.add(edge.endVertex);
          }
        }
      }
    }
    
    // Transform the vertices
    for (const vertexId of verticesToMove) {
      const vertex = result.vertices[vertexId];
      if (!vertex) continue;
      
      const transformed = matrix.transformPoint(vertex.point);
      vertex.point = { x: transformed.x, y: transformed.y, z: transformed.z };
    }
    
    // Update face normals
    for (const faceId of faceIds) {
      const face = result.faces[faceId];
      if (!face) continue;
      
      // Transform normal
      const normal = matrix.transformDirection(face.normal);
      face.normal = { x: normal.x, y: normal.y, z: normal.z };
    }
    
    return result;
  }

  /**
   * Offset faces along their normals (push-pull)
   */
  static offsetFace(solid: SolidData, options: OffsetFaceOptions): SolidData {
    const { faceIds, distance } = options;
    
    // Clone the solid
    const result = BRepOperations.clone(solid);
    
    // For each face, move its vertices along the face normal
    for (const faceId of faceIds) {
      const face = result.faces[faceId];
      if (!face) continue;
      
      const normal = new Vec3(face.normal.x, face.normal.y, face.normal.z);
      const offset = normal.mul(distance);
      
      // Find all vertices of this face
      const faceVertices = new Set<string>();
      
      for (const loop of face.loops) {
        for (const edgeId of loop.edges) {
          const edge = result.edges[edgeId];
          if (edge) {
            faceVertices.add(edge.startVertex);
            faceVertices.add(edge.endVertex);
          }
        }
      }
      
      // Move vertices
      for (const vertexId of faceVertices) {
        const vertex = result.vertices[vertexId];
        if (!vertex) continue;
        
        vertex.point = {
          x: vertex.point.x + offset.x,
          y: vertex.point.y + offset.y,
          z: vertex.point.z + offset.z
        };
      }
    }
    
    return result;
  }

  /**
   * Delete faces (with optional healing)
   */
  static deleteFace(solid: SolidData, options: DeleteFaceOptions): SolidData {
    const { faceIds, heal = false } = options;
    
    // Clone the solid
    const result = BRepOperations.clone(solid);
    
    // Collect edges that will become boundary edges
    const boundaryEdges = new Set<string>();
    
    for (const faceId of faceIds) {
      const face = result.faces[faceId];
      if (!face) continue;
      
      for (const loop of face.loops) {
        for (const edgeId of loop.edges) {
          const edge = result.edges[edgeId];
          if (!edge) continue;
          
          // Check if this edge is shared with non-deleted faces
          const nonDeletedFaces = edge.faces.filter(fid => !faceIds.includes(fid));
          
          if (nonDeletedFaces.length > 0) {
            boundaryEdges.add(edgeId);
          }
        }
      }
      
      // Remove the face
      delete result.faces[faceId];
    }
    
    // Update edge face references
    for (const edgeId of boundaryEdges) {
      const edge = result.edges[edgeId];
      if (!edge) continue;
      
      edge.faces = edge.faces.filter(fid => !faceIds.includes(fid));
    }
    
    // Remove orphan edges (edges with no faces)
    for (const [edgeId, edge] of Object.entries(result.edges)) {
      if (edge.faces.length === 0 && !boundaryEdges.has(edgeId)) {
        delete result.edges[edgeId];
      }
    }
    
    // If healing is requested, try to close the gap
    if (heal) {
      // This is a complex operation that would require:
      // 1. Finding the boundary loop of the hole
      // 2. Creating a new surface to fill it
      // 3. This is not implemented in this simplified version
    }
    
    // Update shells
    for (const shell of result.shells) {
      shell.faces = shell.faces.filter(fid => !faceIds.includes(fid));
    }
    
    return result;
  }

  /**
   * Scale a face (resize)
   */
  static scaleFace(
    solid: SolidData, 
    faceId: string, 
    scale: number, 
    center?: Vector3
  ): SolidData {
    const result = BRepOperations.clone(solid);
    
    const face = result.faces[faceId];
    if (!face) return result;
    
    // Find face center if not provided
    let cx = 0, cy = 0, cz = 0;
    const faceVertices: string[] = [];
    
    for (const loop of face.loops) {
      for (const edgeId of loop.edges) {
        const edge = result.edges[edgeId];
        if (edge) {
          faceVertices.push(edge.startVertex);
          faceVertices.push(edge.endVertex);
        }
      }
    }
    
    const uniqueVertices = [...new Set(faceVertices)];
    
    if (!center) {
      for (const vid of uniqueVertices) {
        const vertex = result.vertices[vid];
        if (vertex) {
          cx += vertex.point.x;
          cy += vertex.point.y;
          cz += vertex.point.z;
        }
      }
      cx /= uniqueVertices.length;
      cy /= uniqueVertices.length;
      cz /= uniqueVertices.length;
    } else {
      cx = center.x;
      cy = center.y;
      cz = center.z;
    }
    
    // Scale vertices relative to center
    for (const vid of uniqueVertices) {
      const vertex = result.vertices[vid];
      if (!vertex) continue;
      
      vertex.point = {
        x: cx + (vertex.point.x - cx) * scale,
        y: cy + (vertex.point.y - cy) * scale,
        z: cz + (vertex.point.z - cz) * scale
      };
    }
    
    return result;
  }

  /**
   * Twist a face (rotate around its normal)
   */
  static twistFace(
    solid: SolidData,
    faceId: string,
    angle: number
  ): SolidData {
    const result = BRepOperations.clone(solid);
    
    const face = result.faces[faceId];
    if (!face) return result;
    
    // Find face center
    const faceVertices: string[] = [];
    let cx = 0, cy = 0, cz = 0;
    
    for (const loop of face.loops) {
      for (const edgeId of loop.edges) {
        const edge = result.edges[edgeId];
        if (edge) {
          faceVertices.push(edge.startVertex);
        }
      }
    }
    
    const uniqueVertices = [...new Set(faceVertices)];
    
    for (const vid of uniqueVertices) {
      const vertex = result.vertices[vid];
      if (vertex) {
        cx += vertex.point.x;
        cy += vertex.point.y;
        cz += vertex.point.z;
      }
    }
    cx /= uniqueVertices.length;
    cy /= uniqueVertices.length;
    cz /= uniqueVertices.length;
    
    const center = new Vec3(cx, cy, cz);
    const axis = new Vec3(face.normal.x, face.normal.y, face.normal.z);
    const rotation = Quat.fromAxisAngle(axis, angle);
    
    // Rotate vertices around face center
    for (const vid of uniqueVertices) {
      const vertex = result.vertices[vid];
      if (!vertex) continue;
      
      const p = new Vec3(vertex.point.x, vertex.point.y, vertex.point.z);
      const relative = p.sub(center);
      const rotated = rotation.rotateVector(relative);
      const final = rotated.add(center);
      
      vertex.point = { x: final.x, y: final.y, z: final.z };
    }
    
    return result;
  }

  /**
   * Taper a face (apply draft angle)
   */
  static taperFace(
    solid: SolidData,
    faceId: string,
    angle: number,
    neutralPlane?: { origin: Vector3; normal: Vector3 }
  ): SolidData {
    const result = BRepOperations.clone(solid);
    
    const face = result.faces[faceId];
    if (!face) return result;
    
    // Calculate taper based on distance from neutral plane
    const pullDir = new Vec3(face.normal.x, face.normal.y, face.normal.z);
    const tanAngle = Math.tan(angle);
    
    // Find face center for neutral plane if not provided
    let neutralOrigin: Vec3;
    if (neutralPlane) {
      neutralOrigin = new Vec3(neutralPlane.origin.x, neutralPlane.origin.y, neutralPlane.origin.z);
    } else {
      // Use face center as neutral
      let cx = 0, cy = 0, cz = 0, count = 0;
      for (const loop of face.loops) {
        for (const edgeId of loop.edges) {
          const edge = result.edges[edgeId];
          if (edge) {
            const v = result.vertices[edge.startVertex];
            if (v) {
              cx += v.point.x;
              cy += v.point.y;
              cz += v.point.z;
              count++;
            }
          }
        }
      }
      neutralOrigin = new Vec3(cx / count, cy / count, cz / count);
    }
    
    // Apply taper to face vertices
    const faceVertices = new Set<string>();
    for (const loop of face.loops) {
      for (const edgeId of loop.edges) {
        const edge = result.edges[edgeId];
        if (edge) {
          faceVertices.add(edge.startVertex);
          faceVertices.add(edge.endVertex);
        }
      }
    }
    
    for (const vid of faceVertices) {
      const vertex = result.vertices[vid];
      if (!vertex) continue;
      
      const p = new Vec3(vertex.point.x, vertex.point.y, vertex.point.z);
      const toVertex = p.sub(neutralOrigin);
      
      // Distance along pull direction
      const distAlongPull = toVertex.dot(pullDir);
      
      // Perpendicular component
      const perpComponent = toVertex.sub(pullDir.mul(distAlongPull));
      
      // Scale perpendicular component based on distance
      const taperOffset = perpComponent.normalize().mul(distAlongPull * tanAngle);
      
      vertex.point = {
        x: vertex.point.x + taperOffset.x,
        y: vertex.point.y + taperOffset.y,
        z: vertex.point.z + taperOffset.z
      };
    }
    
    return result;
  }
}

