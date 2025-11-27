// ============================================================================
// Revolve Operation
// ============================================================================

import { Sketch, SketchRegion, SolidData, Vector3, Plane, PlaneSurface } from '@webcad/shared';
import { Vec3 } from '../math/vector';
import { Mat4 } from '../math/matrix';
import { BRepBuilder, generateId } from '../geometry/brep';
import { PlaneUtils } from '../geometry/surface';

export interface RevolveOptions {
  angle: number;  // Radians, 2π for full revolution
  axis: {
    point: Vector3;
    direction: Vector3;
  };
  segments?: number;  // Number of segments around the revolution
}

export class RevolveOperation {
  /**
   * Revolve a sketch region around an axis
   */
  static revolve(
    sketch: Sketch,
    region: SketchRegion,
    options: RevolveOptions
  ): SolidData {
    const { angle, axis, segments = 32 } = options;
    
    // Normalize axis direction
    const axisDir = new Vec3(axis.direction.x, axis.direction.y, axis.direction.z).normalize();
    const axisPoint = new Vec3(axis.point.x, axis.point.y, axis.point.z);
    
    // Get profile points from the region (2D)
    const profilePoints2D = this.getRegionPoints(sketch, region);
    if (profilePoints2D.length < 2) {
      throw new Error('Region must have at least 2 points');
    }
    
    // Convert to 3D points
    const profilePoints3D: Vec3[] = [];
    for (const p2d of profilePoints2D) {
      const p3d = PlaneUtils.to3D(sketch.plane, p2d.x, p2d.y);
      profilePoints3D.push(p3d);
    }
    
    // Check if this is a full revolution
    const isFullRevolution = Math.abs(angle - Math.PI * 2) < 0.001;
    const numSegments = isFullRevolution ? segments : segments + 1;
    const angleStep = angle / segments;
    
    const builder = new BRepBuilder();
    
    // Create all rotated profiles
    const profiles: string[][] = []; // [segment][profilePoint] -> vertex ID
    
    for (let seg = 0; seg < numSegments; seg++) {
      const currentAngle = seg * angleStep;
      const rotationMatrix = Mat4.rotationAxis(axisDir, currentAngle);
      
      const segmentVertices: string[] = [];
      
      for (const point of profilePoints3D) {
        // Translate point relative to axis
        const relative = point.sub(axisPoint);
        // Rotate
        const rotated = rotationMatrix.transformPoint(relative);
        // Translate back
        const final = rotated.add(axisPoint);
        
        segmentVertices.push(builder.addVertex({ x: final.x, y: final.y, z: final.z }));
      }
      
      profiles.push(segmentVertices);
    }
    
    // Create edges and faces
    const faceIds: string[] = [];
    
    // Create side faces (between profile segments)
    for (let seg = 0; seg < segments; seg++) {
      const nextSeg = (seg + 1) % numSegments;
      
      for (let pt = 0; pt < profilePoints3D.length; pt++) {
        const nextPt = (pt + 1) % profilePoints3D.length;
        
        // Get four corner vertices
        const v00 = profiles[seg][pt];
        const v01 = profiles[seg][nextPt];
        const v10 = profiles[nextSeg][pt];
        const v11 = profiles[nextSeg][nextPt];
        
        // Create edges for this quad
        const e1 = builder.addEdge(v00, v01);  // Along profile
        const e2 = builder.addEdge(v01, v11);  // Around revolution
        const e3 = builder.addEdge(v11, v10);  // Along profile (reversed)
        const e4 = builder.addEdge(v10, v00);  // Around revolution (reversed)
        
        // Calculate face normal (approximate)
        const midAngle = (seg + 0.5) * angleStep;
        const rotMat = Mat4.rotationAxis(axisDir, midAngle);
        const midPt = profilePoints3D[pt].add(profilePoints3D[nextPt]).mul(0.5).sub(axisPoint);
        const normal = rotMat.transformDirection(midPt.cross(axisDir).normalize());
        
        const surface: PlaneSurface = {
          id: generateId('surf'),
          type: 'plane',
          origin: { x: 0, y: 0, z: 0 },
          normal: { x: normal.x, y: normal.y, z: normal.z }
        };
        
        const loop = builder.createLoop([e1, e2, e3, e4], [true, true, true, true]);
        faceIds.push(builder.addFace(surface, [loop]));
      }
    }
    
    // Create end caps if not a full revolution
    if (!isFullRevolution) {
      // Start cap
      const startEdges: string[] = [];
      for (let pt = 0; pt < profilePoints3D.length; pt++) {
        const nextPt = (pt + 1) % profilePoints3D.length;
        startEdges.push(builder.addEdge(profiles[0][pt], profiles[0][nextPt]));
      }
      
      const startNormal = axisDir.negate();
      const startSurface: PlaneSurface = {
        id: generateId('surf'),
        type: 'plane',
        origin: axisPoint,
        normal: { x: startNormal.x, y: startNormal.y, z: startNormal.z }
      };
      const startLoop = builder.createLoop(startEdges, startEdges.map(() => false));
      faceIds.push(builder.addFace(startSurface, [startLoop]));
      
      // End cap
      const endEdges: string[] = [];
      const lastSeg = segments;
      for (let pt = 0; pt < profilePoints3D.length; pt++) {
        const nextPt = (pt + 1) % profilePoints3D.length;
        endEdges.push(builder.addEdge(profiles[lastSeg][pt], profiles[lastSeg][nextPt]));
      }
      
      const endSurface: PlaneSurface = {
        id: generateId('surf'),
        type: 'plane',
        origin: axisPoint,
        normal: { x: axisDir.x, y: axisDir.y, z: axisDir.z }
      };
      const endLoop = builder.createLoop(endEdges, endEdges.map(() => true));
      faceIds.push(builder.addFace(endSurface, [endLoop]));
    }
    
    builder.addShell(faceIds);
    
    return builder.toSolidData();
  }

  /**
   * Get 2D points from a sketch region
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
   * Create a revolved sphere (convenience method)
   */
  static createSphere(radius: number, center?: Vector3, segments: number = 16): SolidData {
    // Create a semicircle profile and revolve it
    // For simplicity, use the primitive
    const { SolidPrimitives } = require('../geometry/brep');
    return SolidPrimitives.createSphere(radius, center, segments);
  }

  /**
   * Create a torus by revolving a circle
   */
  static createTorus(
    majorRadius: number,
    minorRadius: number,
    center?: Vector3,
    segments: number = 32,
    ringSegments: number = 16
  ): SolidData {
    const builder = new BRepBuilder();
    const cx = center?.x || 0;
    const cy = center?.y || 0;
    const cz = center?.z || 0;
    
    // Create vertex grid
    const vertices: string[][] = [];
    
    for (let i = 0; i < segments; i++) {
      vertices[i] = [];
      const theta = (i / segments) * Math.PI * 2;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      
      for (let j = 0; j < ringSegments; j++) {
        const phi = (j / ringSegments) * Math.PI * 2;
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        
        const x = cx + (majorRadius + minorRadius * cosPhi) * cosTheta;
        const y = cy + (majorRadius + minorRadius * cosPhi) * sinTheta;
        const z = cz + minorRadius * sinPhi;
        
        vertices[i][j] = builder.addVertex({ x, y, z });
      }
    }
    
    // Create faces
    const faceIds: string[] = [];
    
    for (let i = 0; i < segments; i++) {
      const nextI = (i + 1) % segments;
      
      for (let j = 0; j < ringSegments; j++) {
        const nextJ = (j + 1) % ringSegments;
        
        const v00 = vertices[i][j];
        const v01 = vertices[i][nextJ];
        const v10 = vertices[nextI][j];
        const v11 = vertices[nextI][nextJ];
        
        const e1 = builder.addEdge(v00, v01);
        const e2 = builder.addEdge(v01, v11);
        const e3 = builder.addEdge(v11, v10);
        const e4 = builder.addEdge(v10, v00);
        
        const surface: PlaneSurface = {
          id: generateId('surf'),
          type: 'plane',
          origin: { x: cx, y: cy, z: cz },
          normal: { x: 0, y: 0, z: 1 }
        };
        
        const loop = builder.createLoop([e1, e2, e3, e4], [true, true, true, true]);
        faceIds.push(builder.addFace(surface, [loop]));
      }
    }
    
    builder.addShell(faceIds);
    
    return builder.toSolidData();
  }
}

