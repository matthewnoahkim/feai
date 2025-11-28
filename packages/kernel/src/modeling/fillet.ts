// ============================================================================
// Fillet and Chamfer Operations
// ============================================================================

import { SolidData, Vector3, Edge, Face, PlaneSurface } from '@feai/shared';
import { Vec3 } from '../math/vector';
import { BRepBuilder, BRepOperations, generateId } from '../geometry/brep';

export interface FilletOptions {
  edgeIds: string[];
  radius: number;
  variableRadius?: { parameter: number; radius: number }[];
  segments?: number;
}

export interface ChamferOptions {
  edgeIds: string[];
  type: 'equalDistance' | 'twoDistances' | 'distanceAngle';
  distance1: number;
  distance2?: number;
  angle?: number;
}

export class FilletOperation {
  /**
   * Apply fillet to edges of a solid
   * Note: This is a simplified implementation for demonstration
   */
  static fillet(solid: SolidData, options: FilletOptions): SolidData {
    const { edgeIds, radius, segments = 8 } = options;
    
    // Clone the solid
    const result = BRepOperations.clone(solid);
    
    for (const edgeId of edgeIds) {
      const edge = result.edges[edgeId];
      if (!edge) continue;
      
      // Get the two faces adjacent to this edge
      const faces = edge.faces.map(fid => result.faces[fid]).filter(Boolean);
      if (faces.length !== 2) continue;
      
      // Get edge endpoints
      const startVertex = result.vertices[edge.startVertex];
      const endVertex = result.vertices[edge.endVertex];
      if (!startVertex || !endVertex) continue;
      
      // Create fillet geometry
      // This is a simplified version - real implementation would be much more complex
      const filletGeometry = this.createFilletGeometry(
        startVertex.point,
        endVertex.point,
        faces[0],
        faces[1],
        radius,
        segments
      );
      
      // Merge fillet geometry into result
      // In a real implementation, we would modify the adjacent faces and add fillet faces
    }
    
    return result;
  }

  /**
   * Create fillet geometry between two faces along an edge
   */
  private static createFilletGeometry(
    edgeStart: Vector3,
    edgeEnd: Vector3,
    face1: Face,
    face2: Face,
    radius: number,
    segments: number
  ): { vertices: Vector3[]; faces: number[][] } {
    const vertices: Vector3[] = [];
    const faces: number[][] = [];
    
    const edgeDir = new Vec3(
      edgeEnd.x - edgeStart.x,
      edgeEnd.y - edgeStart.y,
      edgeEnd.z - edgeStart.z
    ).normalize();
    
    // Get face normals
    const n1 = new Vec3(face1.normal.x, face1.normal.y, face1.normal.z);
    const n2 = new Vec3(face2.normal.x, face2.normal.y, face2.normal.z);
    
    // Calculate the angle between faces
    const angle = Math.acos(Math.max(-1, Math.min(1, n1.dot(n2))));
    
    // Create fillet arc
    const arcAngle = Math.PI - angle;
    const angleStep = arcAngle / segments;
    
    // Generate vertices along the edge at each arc position
    const numEdgePoints = 10;
    
    for (let e = 0; e <= numEdgePoints; e++) {
      const t = e / numEdgePoints;
      const edgePoint = new Vec3(
        edgeStart.x + t * (edgeEnd.x - edgeStart.x),
        edgeStart.y + t * (edgeEnd.y - edgeStart.y),
        edgeStart.z + t * (edgeEnd.z - edgeStart.z)
      );
      
      // Calculate the bisector direction
      const bisector = n1.add(n2).normalize().negate();
      
      // Generate arc points
      for (let a = 0; a <= segments; a++) {
        const arcT = a / segments;
        const arcAngleT = -arcAngle / 2 + arcT * arcAngle;
        
        // Rotate bisector around edge direction
        const cos = Math.cos(arcAngleT);
        const sin = Math.sin(arcAngleT);
        
        // Rodrigues' rotation formula
        const k = edgeDir;
        const v = bisector;
        const rotated = v.mul(cos)
          .add(k.cross(v).mul(sin))
          .add(k.mul(k.dot(v) * (1 - cos)));
        
        const point = edgePoint.add(rotated.mul(radius));
        vertices.push({ x: point.x, y: point.y, z: point.z });
      }
    }
    
    // Create faces (quads)
    for (let e = 0; e < numEdgePoints; e++) {
      for (let a = 0; a < segments; a++) {
        const i0 = e * (segments + 1) + a;
        const i1 = i0 + 1;
        const i2 = (e + 1) * (segments + 1) + a;
        const i3 = i2 + 1;
        
        faces.push([i0, i1, i3, i2]);
      }
    }
    
    return { vertices, faces };
  }

  /**
   * Apply chamfer to edges of a solid
   */
  static chamfer(solid: SolidData, options: ChamferOptions): SolidData {
    const { edgeIds, type, distance1, distance2 = distance1, angle } = options;
    
    // Clone the solid
    const result = BRepOperations.clone(solid);
    
    // Calculate the two offset distances
    let d1 = distance1;
    let d2: number;
    
    switch (type) {
      case 'equalDistance':
        d2 = d1;
        break;
      case 'twoDistances':
        d2 = distance2;
        break;
      case 'distanceAngle':
        d2 = d1 * Math.tan(angle || Math.PI / 4);
        break;
      default:
        d2 = d1;
    }
    
    for (const edgeId of edgeIds) {
      const edge = result.edges[edgeId];
      if (!edge) continue;
      
      // Get the two faces adjacent to this edge
      const faces = edge.faces.map(fid => result.faces[fid]).filter(Boolean);
      if (faces.length !== 2) continue;
      
      // Create chamfer geometry
      // Similar to fillet but with a single flat face instead of curved
      const chamferGeometry = this.createChamferGeometry(
        result.vertices[edge.startVertex]?.point,
        result.vertices[edge.endVertex]?.point,
        faces[0],
        faces[1],
        d1,
        d2
      );
      
      // Merge chamfer geometry into result
      // In a real implementation, we would modify the adjacent faces and add chamfer face
    }
    
    return result;
  }

  /**
   * Create chamfer geometry (single flat face)
   */
  private static createChamferGeometry(
    edgeStart: Vector3 | undefined,
    edgeEnd: Vector3 | undefined,
    face1: Face,
    face2: Face,
    d1: number,
    d2: number
  ): { vertices: Vector3[]; face: number[] } | null {
    if (!edgeStart || !edgeEnd) return null;
    
    const n1 = new Vec3(face1.normal.x, face1.normal.y, face1.normal.z);
    const n2 = new Vec3(face2.normal.x, face2.normal.y, face2.normal.z);
    
    const start = new Vec3(edgeStart.x, edgeStart.y, edgeStart.z);
    const end = new Vec3(edgeEnd.x, edgeEnd.y, edgeEnd.z);
    
    // Calculate chamfer corner points
    const v1Start = start.add(n1.mul(-d1));
    const v2Start = start.add(n2.mul(-d2));
    const v1End = end.add(n1.mul(-d1));
    const v2End = end.add(n2.mul(-d2));
    
    return {
      vertices: [
        { x: v1Start.x, y: v1Start.y, z: v1Start.z },
        { x: v2Start.x, y: v2Start.y, z: v2Start.z },
        { x: v2End.x, y: v2End.y, z: v2End.z },
        { x: v1End.x, y: v1End.y, z: v1End.z }
      ],
      face: [0, 1, 2, 3]
    };
  }
}

