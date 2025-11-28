// ============================================================================
// Sweep Operation
// ============================================================================

import { Sketch, SketchRegion, SolidData, Vector3, PlaneSurface } from '@feai/shared';
import { Vec3 } from '../math/vector';
import { Mat4 } from '../math/matrix';
import { Quat } from '../math/quaternion';
import { BRepBuilder, generateId } from '../geometry/brep';
import { PlaneUtils } from '../geometry/surface';
import { NurbsCurveEvaluator } from '../math/nurbs';

export interface SweepOptions {
  path: Vector3[] | NurbsCurveEvaluator;
  orientation?: 'keepNormal' | 'followPath' | 'keepParallel';
  twist?: number;  // Total twist in radians
  scale?: number | number[];  // End scale or scale at each point
  segments?: number;
}

export class SweepOperation {
  /**
   * Sweep a profile along a path
   */
  static sweep(
    sketch: Sketch,
    region: SketchRegion,
    options: SweepOptions
  ): SolidData {
    const { 
      path, 
      orientation = 'followPath', 
      twist = 0, 
      scale = 1,
      segments = 32 
    } = options;
    
    // Get path points
    let pathPoints: Vec3[];
    let pathTangents: Vec3[];
    
    if (Array.isArray(path)) {
      pathPoints = path.map(p => new Vec3(p.x, p.y, p.z));
      pathTangents = this.computeTangents(pathPoints);
    } else {
      // NURBS curve
      const result = this.samplePath(path, segments);
      pathPoints = result.points;
      pathTangents = result.tangents;
    }
    
    if (pathPoints.length < 2) {
      throw new Error('Path must have at least 2 points');
    }
    
    // Get profile points
    const profilePoints2D = this.getRegionPoints(sketch, region);
    if (profilePoints2D.length < 3) {
      throw new Error('Profile must have at least 3 points');
    }
    
    // Convert profile to 3D (relative to sketch plane)
    const profilePoints3D: Vec3[] = [];
    const profileCenter = this.getCenter(profilePoints2D);
    
    for (const p2d of profilePoints2D) {
      // Make profile relative to center
      const x = p2d.x - profileCenter.x;
      const y = p2d.y - profileCenter.y;
      profilePoints3D.push(new Vec3(x, y, 0));
    }
    
    // Build the swept solid
    const builder = new BRepBuilder();
    const profiles: string[][] = [];
    
    // Initial frame
    let lastTangent = pathTangents[0];
    let lastNormal = this.computeInitialNormal(lastTangent);
    
    // Generate profile at each path point
    for (let i = 0; i < pathPoints.length; i++) {
      const t = i / (pathPoints.length - 1);
      const pathPoint = pathPoints[i];
      const tangent = pathTangents[i];
      
      // Compute frame at this point
      let normal: Vec3;
      let binormal: Vec3;
      
      if (orientation === 'keepNormal') {
        // Keep initial normal direction
        normal = lastNormal;
        binormal = tangent.cross(normal).normalize();
        normal = binormal.cross(tangent).normalize();
      } else if (orientation === 'followPath') {
        // Use Frenet frame with correction for smooth rotation
        normal = this.computeRotationMinimizingFrame(lastTangent, tangent, lastNormal);
        binormal = tangent.cross(normal).normalize();
      } else {
        // Keep parallel to initial orientation
        normal = lastNormal;
        binormal = tangent.cross(normal).normalize();
      }
      
      lastTangent = tangent;
      lastNormal = normal;
      
      // Apply twist
      const twistAngle = twist * t;
      if (twistAngle !== 0) {
        const twistRot = Quat.fromAxisAngle(tangent, twistAngle);
        normal = twistRot.rotateVector(normal);
        binormal = twistRot.rotateVector(binormal);
      }
      
      // Apply scale
      const scaleValue = Array.isArray(scale) ? scale[i] || 1 : 1 + (scale - 1) * t;
      
      // Transform profile points to this location
      const segmentVertices: string[] = [];
      
      for (const profilePt of profilePoints3D) {
        const transformed = pathPoint
          .add(normal.mul(profilePt.x * scaleValue))
          .add(binormal.mul(profilePt.y * scaleValue));
        
        segmentVertices.push(builder.addVertex({
          x: transformed.x,
          y: transformed.y,
          z: transformed.z
        }));
      }
      
      profiles.push(segmentVertices);
    }
    
    // Create faces
    const faceIds: string[] = [];
    
    // Side faces
    for (let i = 0; i < profiles.length - 1; i++) {
      for (let j = 0; j < profilePoints3D.length; j++) {
        const nextJ = (j + 1) % profilePoints3D.length;
        
        const v00 = profiles[i][j];
        const v01 = profiles[i][nextJ];
        const v10 = profiles[i + 1][j];
        const v11 = profiles[i + 1][nextJ];
        
        const e1 = builder.addEdge(v00, v01);
        const e2 = builder.addEdge(v01, v11);
        const e3 = builder.addEdge(v11, v10);
        const e4 = builder.addEdge(v10, v00);
        
        const surface: PlaneSurface = {
          id: generateId('surf'),
          type: 'plane',
          origin: { x: 0, y: 0, z: 0 },
          normal: { x: 0, y: 0, z: 1 }
        };
        
        const loop = builder.createLoop([e1, e2, e3, e4], [true, true, true, true]);
        faceIds.push(builder.addFace(surface, [loop]));
      }
    }
    
    // End caps
    // Start cap
    const startEdges: string[] = [];
    for (let j = 0; j < profilePoints3D.length; j++) {
      const nextJ = (j + 1) % profilePoints3D.length;
      startEdges.push(builder.addEdge(profiles[0][j], profiles[0][nextJ]));
    }
    const startSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: pathPoints[0].x, y: pathPoints[0].y, z: pathPoints[0].z },
      normal: { x: -pathTangents[0].x, y: -pathTangents[0].y, z: -pathTangents[0].z }
    };
    const startLoop = builder.createLoop(startEdges, startEdges.map(() => false));
    faceIds.push(builder.addFace(startSurface, [startLoop]));
    
    // End cap
    const endEdges: string[] = [];
    const lastIdx = profiles.length - 1;
    for (let j = 0; j < profilePoints3D.length; j++) {
      const nextJ = (j + 1) % profilePoints3D.length;
      endEdges.push(builder.addEdge(profiles[lastIdx][j], profiles[lastIdx][nextJ]));
    }
    const lastTan = pathTangents[pathTangents.length - 1];
    const endSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: { x: pathPoints[lastIdx].x, y: pathPoints[lastIdx].y, z: pathPoints[lastIdx].z },
      normal: { x: lastTan.x, y: lastTan.y, z: lastTan.z }
    };
    const endLoop = builder.createLoop(endEdges, endEdges.map(() => true));
    faceIds.push(builder.addFace(endSurface, [endLoop]));
    
    builder.addShell(faceIds);
    
    return builder.toSolidData();
  }

  /**
   * Sample a NURBS path
   */
  private static samplePath(curve: NurbsCurveEvaluator, segments: number): {
    points: Vec3[];
    tangents: Vec3[];
  } {
    const points: Vec3[] = [];
    const tangents: Vec3[] = [];
    
    const uMin = curve.knots[curve.degree];
    const uMax = curve.knots[curve.knots.length - curve.degree - 1];
    
    for (let i = 0; i <= segments; i++) {
      const u = uMin + (uMax - uMin) * i / segments;
      points.push(curve.evaluate(u));
      tangents.push(curve.tangent(u));
    }
    
    return { points, tangents };
  }

  /**
   * Compute tangent vectors for a polyline path
   */
  private static computeTangents(points: Vec3[]): Vec3[] {
    const tangents: Vec3[] = [];
    
    for (let i = 0; i < points.length; i++) {
      let tangent: Vec3;
      
      if (i === 0) {
        tangent = points[1].sub(points[0]);
      } else if (i === points.length - 1) {
        tangent = points[i].sub(points[i - 1]);
      } else {
        // Average of forward and backward
        const forward = points[i + 1].sub(points[i]);
        const backward = points[i].sub(points[i - 1]);
        tangent = forward.add(backward).mul(0.5);
      }
      
      tangents.push(tangent.normalize());
    }
    
    return tangents;
  }

  /**
   * Compute initial normal perpendicular to tangent
   */
  private static computeInitialNormal(tangent: Vec3): Vec3 {
    // Find a vector not parallel to tangent
    let up = Vec3.unitY();
    if (Math.abs(tangent.dot(up)) > 0.9) {
      up = Vec3.unitZ();
    }
    
    // Cross product gives perpendicular
    return up.cross(tangent).normalize();
  }

  /**
   * Compute rotation minimizing frame normal
   */
  private static computeRotationMinimizingFrame(
    lastTangent: Vec3,
    currentTangent: Vec3,
    lastNormal: Vec3
  ): Vec3 {
    // Rodrigues' rotation formula
    const axis = lastTangent.cross(currentTangent);
    const axisLen = axis.length();
    
    if (axisLen < 1e-10) {
      return lastNormal;
    }
    
    const angle = Math.asin(Math.min(1, axisLen));
    const rotation = Quat.fromAxisAngle(axis.normalize(), angle);
    
    return rotation.rotateVector(lastNormal).normalize();
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
   * Get center of points
   */
  private static getCenter(points: { x: number; y: number }[]): { x: number; y: number } {
    let cx = 0, cy = 0;
    for (const p of points) {
      cx += p.x;
      cy += p.y;
    }
    return { x: cx / points.length, y: cy / points.length };
  }
}

