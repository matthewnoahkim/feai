// ============================================================================
// Interference Detection
// ============================================================================

import { SolidData, Vector3, BoundingBox3D } from '@webcad/shared';
import { Vec3 } from '../math/vector';
import { BRepOperations } from '../geometry/brep';
import { BRepTessellator, MeshUtils } from '../geometry/tessellation';

export interface InterferenceResult {
  hasInterference: boolean;
  volume: number;
  regions: InterferenceRegion[];
}

export interface InterferenceRegion {
  boundingBox: BoundingBox3D;
  volume: number;
  centroid: Vector3;
}

export interface ClearanceResult {
  minDistance: number;
  point1: Vector3;
  point2: Vector3;
  adequate: boolean;
}

/**
 * Interference and clearance detection between solids
 */
export class InterferenceDetector {
  /**
   * Check for interference between two solids
   */
  static checkInterference(solidA: SolidData, solidB: SolidData): InterferenceResult {
    // Quick bounding box check
    const boxA = BRepOperations.boundingBox(solidA);
    const boxB = BRepOperations.boundingBox(solidB);
    
    if (!this.boxesIntersect(boxA, boxB)) {
      return {
        hasInterference: false,
        volume: 0,
        regions: []
      };
    }
    
    // Tessellate both solids
    const meshA = BRepTessellator.tessellate(solidA);
    const meshB = BRepTessellator.tessellate(solidB);
    
    // Find intersecting triangles
    const intersections = this.findMeshIntersections(meshA, meshB);
    
    if (intersections.length === 0) {
      // No triangle intersections, but we should still check point-in-solid
      // Check if any vertex of B is inside A or vice versa
      if (this.checkVertexContainment(solidA, solidB, meshA, meshB)) {
        // One solid is inside the other
        return {
          hasInterference: true,
          volume: this.estimateInterferenceVolume(boxA, boxB),
          regions: [{
            boundingBox: this.intersectBoxes(boxA, boxB),
            volume: this.estimateInterferenceVolume(boxA, boxB),
            centroid: this.boxCenter(this.intersectBoxes(boxA, boxB))
          }]
        };
      }
      
      return {
        hasInterference: false,
        volume: 0,
        regions: []
      };
    }
    
    // Estimate interference volume from intersection region
    const interferenceBox = this.computeIntersectionBoundingBox(intersections);
    const volume = this.estimateInterferenceVolume(boxA, boxB);
    
    return {
      hasInterference: true,
      volume,
      regions: [{
        boundingBox: interferenceBox,
        volume,
        centroid: this.boxCenter(interferenceBox)
      }]
    };
  }

  /**
   * Find minimum clearance between two solids
   */
  static findMinimumClearance(
    solidA: SolidData,
    solidB: SolidData,
    requiredClearance?: number
  ): ClearanceResult {
    const meshA = BRepTessellator.tessellate(solidA);
    const meshB = BRepTessellator.tessellate(solidB);
    
    let minDist = Infinity;
    let closestA: Vector3 = { x: 0, y: 0, z: 0 };
    let closestB: Vector3 = { x: 0, y: 0, z: 0 };
    
    // Brute force: check all vertex pairs
    // A more efficient implementation would use spatial data structures
    for (let i = 0; i < meshA.positions.length; i += 3) {
      const pA = new Vec3(
        meshA.positions[i],
        meshA.positions[i + 1],
        meshA.positions[i + 2]
      );
      
      for (let j = 0; j < meshB.positions.length; j += 3) {
        const pB = new Vec3(
          meshB.positions[j],
          meshB.positions[j + 1],
          meshB.positions[j + 2]
        );
        
        const dist = pA.distanceTo(pB);
        
        if (dist < minDist) {
          minDist = dist;
          closestA = { x: pA.x, y: pA.y, z: pA.z };
          closestB = { x: pB.x, y: pB.y, z: pB.z };
        }
      }
    }
    
    return {
      minDistance: minDist,
      point1: closestA,
      point2: closestB,
      adequate: requiredClearance !== undefined ? minDist >= requiredClearance : true
    };
  }

  /**
   * Check if bounding boxes intersect
   */
  private static boxesIntersect(boxA: BoundingBox3D, boxB: BoundingBox3D): boolean {
    return !(
      boxA.max.x < boxB.min.x || boxA.min.x > boxB.max.x ||
      boxA.max.y < boxB.min.y || boxA.min.y > boxB.max.y ||
      boxA.max.z < boxB.min.z || boxA.min.z > boxB.max.z
    );
  }

  /**
   * Get intersection of two bounding boxes
   */
  private static intersectBoxes(boxA: BoundingBox3D, boxB: BoundingBox3D): BoundingBox3D {
    return {
      min: {
        x: Math.max(boxA.min.x, boxB.min.x),
        y: Math.max(boxA.min.y, boxB.min.y),
        z: Math.max(boxA.min.z, boxB.min.z)
      },
      max: {
        x: Math.min(boxA.max.x, boxB.max.x),
        y: Math.min(boxA.max.y, boxB.max.y),
        z: Math.min(boxA.max.z, boxB.max.z)
      }
    };
  }

  /**
   * Calculate center of a bounding box
   */
  private static boxCenter(box: BoundingBox3D): Vector3 {
    return {
      x: (box.min.x + box.max.x) / 2,
      y: (box.min.y + box.max.y) / 2,
      z: (box.min.z + box.max.z) / 2
    };
  }

  /**
   * Find intersecting triangles between two meshes
   */
  private static findMeshIntersections(
    meshA: { positions: number[]; indices: number[] },
    meshB: { positions: number[]; indices: number[] }
  ): Vector3[] {
    const intersections: Vector3[] = [];
    
    // Check each triangle pair
    for (let i = 0; i < meshA.indices.length; i += 3) {
      const triA = this.getTriangle(meshA, i);
      
      for (let j = 0; j < meshB.indices.length; j += 3) {
        const triB = this.getTriangle(meshB, j);
        
        const intersection = this.triangleTriangleIntersection(triA, triB);
        if (intersection) {
          intersections.push(intersection);
        }
      }
    }
    
    return intersections;
  }

  /**
   * Get triangle vertices from mesh
   */
  private static getTriangle(
    mesh: { positions: number[]; indices: number[] },
    startIndex: number
  ): [Vec3, Vec3, Vec3] {
    const i0 = mesh.indices[startIndex];
    const i1 = mesh.indices[startIndex + 1];
    const i2 = mesh.indices[startIndex + 2];
    
    return [
      new Vec3(mesh.positions[i0 * 3], mesh.positions[i0 * 3 + 1], mesh.positions[i0 * 3 + 2]),
      new Vec3(mesh.positions[i1 * 3], mesh.positions[i1 * 3 + 1], mesh.positions[i1 * 3 + 2]),
      new Vec3(mesh.positions[i2 * 3], mesh.positions[i2 * 3 + 1], mesh.positions[i2 * 3 + 2])
    ];
  }

  /**
   * Check if two triangles intersect
   * Returns intersection point or null
   */
  private static triangleTriangleIntersection(
    triA: [Vec3, Vec3, Vec3],
    triB: [Vec3, Vec3, Vec3]
  ): Vector3 | null {
    // Simplified check using bounding box overlap
    const boxA = this.triangleBoundingBox(triA);
    const boxB = this.triangleBoundingBox(triB);
    
    if (!this.boxesIntersect(boxA, boxB)) {
      return null;
    }
    
    // More accurate intersection test would use Möller–Trumbore algorithm
    // For now, return centroid of overlapping region if boxes overlap
    const intersection = this.intersectBoxes(boxA, boxB);
    
    // Check if intersection is valid (non-empty)
    if (intersection.max.x <= intersection.min.x ||
        intersection.max.y <= intersection.min.y ||
        intersection.max.z <= intersection.min.z) {
      return null;
    }
    
    return this.boxCenter(intersection);
  }

  /**
   * Get bounding box of a triangle
   */
  private static triangleBoundingBox(tri: [Vec3, Vec3, Vec3]): BoundingBox3D {
    return {
      min: {
        x: Math.min(tri[0].x, tri[1].x, tri[2].x),
        y: Math.min(tri[0].y, tri[1].y, tri[2].y),
        z: Math.min(tri[0].z, tri[1].z, tri[2].z)
      },
      max: {
        x: Math.max(tri[0].x, tri[1].x, tri[2].x),
        y: Math.max(tri[0].y, tri[1].y, tri[2].y),
        z: Math.max(tri[0].z, tri[1].z, tri[2].z)
      }
    };
  }

  /**
   * Check if vertices of one mesh are inside the other solid
   */
  private static checkVertexContainment(
    solidA: SolidData,
    solidB: SolidData,
    meshA: { positions: number[] },
    meshB: { positions: number[] }
  ): boolean {
    // Check if any vertex of B is inside A
    for (let i = 0; i < meshB.positions.length; i += 3) {
      const point: Vector3 = {
        x: meshB.positions[i],
        y: meshB.positions[i + 1],
        z: meshB.positions[i + 2]
      };
      
      if (BRepOperations.containsPoint(solidA, point)) {
        return true;
      }
    }
    
    // Check if any vertex of A is inside B
    for (let i = 0; i < meshA.positions.length; i += 3) {
      const point: Vector3 = {
        x: meshA.positions[i],
        y: meshA.positions[i + 1],
        z: meshA.positions[i + 2]
      };
      
      if (BRepOperations.containsPoint(solidB, point)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Compute bounding box of intersection points
   */
  private static computeIntersectionBoundingBox(points: Vector3[]): BoundingBox3D {
    if (points.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }
    
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (const p of points) {
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
   * Estimate interference volume from bounding box intersection
   */
  private static estimateInterferenceVolume(boxA: BoundingBox3D, boxB: BoundingBox3D): number {
    const intersection = this.intersectBoxes(boxA, boxB);
    
    const dx = Math.max(0, intersection.max.x - intersection.min.x);
    const dy = Math.max(0, intersection.max.y - intersection.min.y);
    const dz = Math.max(0, intersection.max.z - intersection.min.z);
    
    return dx * dy * dz;
  }
}

