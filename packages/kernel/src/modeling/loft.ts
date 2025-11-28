// ============================================================================
// Loft Operation
// ============================================================================

import { Sketch, SketchRegion, SolidData, Vector3, PlaneSurface } from '@feai/shared';
import { Vec3 } from '../math/vector';
import { BRepBuilder, generateId } from '../geometry/brep';
import { PlaneUtils } from '../geometry/surface';

export interface LoftOptions {
  profiles: { sketch: Sketch; region: SketchRegion }[];
  guides?: Vector3[][];  // Optional guide curves
  startCondition?: 'none' | 'tangent' | 'curvature';
  endCondition?: 'none' | 'tangent' | 'curvature';
  closed?: boolean;  // Connect last profile to first
  segments?: number;  // Interpolation segments between profiles
}

export class LoftOperation {
  /**
   * Create a lofted solid between multiple profiles
   */
  static loft(options: LoftOptions): SolidData {
    const { profiles, closed = false, segments = 10 } = options;
    
    if (profiles.length < 2) {
      throw new Error('Loft requires at least 2 profiles');
    }
    
    // Extract 3D points from each profile
    const profilePoints: Vec3[][] = [];
    
    for (const { sketch, region } of profiles) {
      const points2D = this.getRegionPoints(sketch, region);
      const points3D: Vec3[] = [];
      
      for (const p2d of points2D) {
        const p3d = PlaneUtils.to3D(sketch.plane, p2d.x, p2d.y);
        points3D.push(p3d);
      }
      
      profilePoints.push(points3D);
    }
    
    // Ensure all profiles have same number of points (resample if needed)
    const maxPoints = Math.max(...profilePoints.map(p => p.length));
    const normalizedProfiles = profilePoints.map(profile => 
      this.resampleProfile(profile, maxPoints)
    );
    
    // Generate interpolated profiles
    const allProfiles: Vec3[][] = [];
    const numProfiles = closed ? profiles.length : profiles.length - 1;
    
    for (let i = 0; i < numProfiles; i++) {
      const nextI = (i + 1) % profiles.length;
      const profile1 = normalizedProfiles[i];
      const profile2 = normalizedProfiles[nextI];
      
      // Add the first profile
      if (i === 0 || allProfiles.length === 0) {
        allProfiles.push(profile1);
      }
      
      // Add interpolated profiles
      for (let s = 1; s <= segments; s++) {
        const t = s / segments;
        const interpolated = this.interpolateProfiles(profile1, profile2, t);
        allProfiles.push(interpolated);
      }
    }
    
    // Build the B-rep
    const builder = new BRepBuilder();
    const vertexIds: string[][] = [];
    
    // Create vertices
    for (const profile of allProfiles) {
      const profileVertices: string[] = [];
      for (const point of profile) {
        profileVertices.push(builder.addVertex({ x: point.x, y: point.y, z: point.z }));
      }
      vertexIds.push(profileVertices);
    }
    
    // Create faces
    const faceIds: string[] = [];
    const numProfilePoints = maxPoints;
    
    // Side faces
    for (let i = 0; i < allProfiles.length - 1; i++) {
      for (let j = 0; j < numProfilePoints; j++) {
        const nextJ = (j + 1) % numProfilePoints;
        
        const v00 = vertexIds[i][j];
        const v01 = vertexIds[i][nextJ];
        const v10 = vertexIds[i + 1][j];
        const v11 = vertexIds[i + 1][nextJ];
        
        const e1 = builder.addEdge(v00, v01);
        const e2 = builder.addEdge(v01, v11);
        const e3 = builder.addEdge(v11, v10);
        const e4 = builder.addEdge(v10, v00);
        
        // Calculate approximate normal
        const p00 = allProfiles[i][j];
        const p01 = allProfiles[i][nextJ];
        const p10 = allProfiles[i + 1][j];
        
        const edge1 = p01.sub(p00);
        const edge2 = p10.sub(p00);
        const normal = edge1.cross(edge2).normalize();
        
        const surface: PlaneSurface = {
          id: generateId('surf'),
          type: 'plane',
          origin: { x: p00.x, y: p00.y, z: p00.z },
          normal: { x: normal.x, y: normal.y, z: normal.z }
        };
        
        const loop = builder.createLoop([e1, e2, e3, e4], [true, true, true, true]);
        faceIds.push(builder.addFace(surface, [loop]));
      }
    }
    
    // End caps (if not closed)
    if (!closed) {
      // Start cap
      const startEdges: string[] = [];
      for (let j = 0; j < numProfilePoints; j++) {
        const nextJ = (j + 1) % numProfilePoints;
        startEdges.push(builder.addEdge(vertexIds[0][j], vertexIds[0][nextJ]));
      }
      
      const startProfile = allProfiles[0];
      const startNormal = this.computeProfileNormal(startProfile).negate();
      const startSurface: PlaneSurface = {
        id: generateId('surf'),
        type: 'plane',
        origin: { x: startProfile[0].x, y: startProfile[0].y, z: startProfile[0].z },
        normal: { x: startNormal.x, y: startNormal.y, z: startNormal.z }
      };
      const startLoop = builder.createLoop(startEdges, startEdges.map(() => false));
      faceIds.push(builder.addFace(startSurface, [startLoop]));
      
      // End cap
      const endEdges: string[] = [];
      const lastIdx = allProfiles.length - 1;
      for (let j = 0; j < numProfilePoints; j++) {
        const nextJ = (j + 1) % numProfilePoints;
        endEdges.push(builder.addEdge(vertexIds[lastIdx][j], vertexIds[lastIdx][nextJ]));
      }
      
      const endProfile = allProfiles[lastIdx];
      const endNormal = this.computeProfileNormal(endProfile);
      const endSurface: PlaneSurface = {
        id: generateId('surf'),
        type: 'plane',
        origin: { x: endProfile[0].x, y: endProfile[0].y, z: endProfile[0].z },
        normal: { x: endNormal.x, y: endNormal.y, z: endNormal.z }
      };
      const endLoop = builder.createLoop(endEdges, endEdges.map(() => true));
      faceIds.push(builder.addFace(endSurface, [endLoop]));
    }
    
    builder.addShell(faceIds);
    
    return builder.toSolidData();
  }

  /**
   * Get 2D points from region
   */
  private static getRegionPoints(sketch: Sketch, region: SketchRegion): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const visitedPoints = new Set<string>();
    
    for (const edgeId of region.outerLoop) {
      const entity = sketch.entities[edgeId];
      if (!entity) continue;
      
      if (entity.type === 'line') {
        const line = entity as any;
        const startPoint = sketch.entities[line.startPoint] as any;
        
        if (startPoint && !visitedPoints.has(line.startPoint)) {
          visitedPoints.add(line.startPoint);
          points.push({ x: startPoint.x, y: startPoint.y });
        }
      }
    }
    
    return points;
  }

  /**
   * Resample a profile to have the specified number of points
   */
  private static resampleProfile(profile: Vec3[], targetCount: number): Vec3[] {
    if (profile.length === targetCount) {
      return profile;
    }
    
    // Calculate total perimeter
    let totalLength = 0;
    const segmentLengths: number[] = [];
    
    for (let i = 0; i < profile.length; i++) {
      const next = (i + 1) % profile.length;
      const length = profile[next].sub(profile[i]).length();
      segmentLengths.push(length);
      totalLength += length;
    }
    
    // Sample at equal arc lengths
    const result: Vec3[] = [];
    const stepLength = totalLength / targetCount;
    
    let currentLength = 0;
    let currentSegment = 0;
    let segmentProgress = 0;
    
    for (let i = 0; i < targetCount; i++) {
      const targetLength = i * stepLength;
      
      // Find the segment containing this target length
      while (currentLength + segmentLengths[currentSegment] < targetLength && 
             currentSegment < profile.length - 1) {
        currentLength += segmentLengths[currentSegment];
        currentSegment++;
      }
      
      // Interpolate within segment
      const remaining = targetLength - currentLength;
      segmentProgress = remaining / segmentLengths[currentSegment];
      
      const p1 = profile[currentSegment];
      const p2 = profile[(currentSegment + 1) % profile.length];
      
      result.push(p1.lerp(p2, segmentProgress));
    }
    
    return result;
  }

  /**
   * Interpolate between two profiles
   */
  private static interpolateProfiles(profile1: Vec3[], profile2: Vec3[], t: number): Vec3[] {
    const result: Vec3[] = [];
    
    for (let i = 0; i < profile1.length; i++) {
      result.push(profile1[i].lerp(profile2[i], t));
    }
    
    return result;
  }

  /**
   * Compute approximate normal for a profile (average of cross products)
   */
  private static computeProfileNormal(profile: Vec3[]): Vec3 {
    if (profile.length < 3) {
      return Vec3.unitZ();
    }
    
    const center = profile.reduce((acc, p) => acc.add(p), Vec3.zero()).div(profile.length);
    
    let normal = Vec3.zero();
    
    for (let i = 0; i < profile.length; i++) {
      const next = (i + 1) % profile.length;
      const v1 = profile[i].sub(center);
      const v2 = profile[next].sub(center);
      normal = normal.add(v1.cross(v2));
    }
    
    return normal.normalize();
  }
}

