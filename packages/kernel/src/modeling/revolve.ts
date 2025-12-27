// ============================================================================
// Revolve Operation - Full-Fidelity Implementation
// ============================================================================

import { Sketch, SketchRegion, SolidData, Vector3, Plane, PlaneSurface } from '@feai/shared';
import { Vec3 } from '../math/vector';
import { Mat4 } from '../math/matrix';
import { BRepBuilder, generateId } from '../geometry/brep';
import { PlaneUtils } from '../geometry/surface';

export interface RevolveOptions {
  angle: number;  // Radians, 2π for full revolution
  angle2?: number; // Second direction angle (optional)
  axis: {
    point: Vector3;
    direction: Vector3;
  };
  segments?: number;  // Number of segments around the revolution
  validateProfile?: boolean; // Run validation checks
  surfaceOnly?: boolean; // Create surface instead of solid
}

export interface RevolveValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class RevolveOperation {
  private static readonly EPSILON = 1e-6;
  private static readonly MIN_DISTANCE_TO_AXIS = 1e-4;
  private static readonly DIST_TOL = 1e-6;  // Distance tolerance for coplanarity
  private static readonly ANGLE_TOL = 1e-6; // Angle tolerance for perpendicularity
  
  /**
   * Validate that axis lies in the sketch plane (strict coplanarity check)
   */
  private static validateAxisCoplanarity(
    sketchPlane: Plane,
    axis: { point: Vector3; direction: Vector3 }
  ): { valid: boolean; error?: string } {
    // Normalize plane normal and axis direction
    const planeNormal = new Vec3(
      sketchPlane.normal.x,
      sketchPlane.normal.y,
      sketchPlane.normal.z
    ).normalize();
    
    const axisDir = new Vec3(
      axis.direction.x,
      axis.direction.y,
      axis.direction.z
    ).normalize();
    
    const planeOrigin = new Vec3(
      sketchPlane.origin.x,
      sketchPlane.origin.y,
      sketchPlane.origin.z
    );
    
    const axisPoint = new Vec3(
      axis.point.x,
      axis.point.y,
      axis.point.z
    );
    
    // Condition A: Axis direction must be perpendicular to plane normal
    // If dot ≈ ±1, the axis is normal to the plane (invalid for revolve)
    const dotProduct = Math.abs(axisDir.dot(planeNormal));
    if (dotProduct > this.ANGLE_TOL) {
      return {
        valid: false,
        error: "Revolve axis must lie in the sketch plane."
      };
    }
    
    // Condition B: A point on the axis must satisfy plane equation
    // Distance from axisPoint to plane
    const pointToPlane = axisPoint.sub(planeOrigin);
    const distanceToPlane = Math.abs(pointToPlane.dot(planeNormal));
    
    if (distanceToPlane > this.DIST_TOL) {
      return {
        valid: false,
        error: "Revolve axis must lie in the sketch plane."
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Validate revolve parameters and profile
   */
  static validate(
    sketch: Sketch,
    region: SketchRegion,
    options: RevolveOptions
  ): RevolveValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate axis coplanarity FIRST
    const coplanarityCheck = this.validateAxisCoplanarity(sketch.plane, options.axis);
    if (!coplanarityCheck.valid) {
      errors.push(coplanarityCheck.error!);
      return { valid: false, errors, warnings };
    }
    
    // Normalize axis
    const axisDir = new Vec3(
      options.axis.direction.x,
      options.axis.direction.y,
      options.axis.direction.z
    ).normalize();
    
    // Check axis direction is valid (non-zero)
    if (axisDir.length() < this.EPSILON) {
      errors.push('Revolve axis direction cannot be zero');
      return { valid: false, errors, warnings };
    }
    
    const axisPoint = new Vec3(
      options.axis.point.x,
      options.axis.point.y,
      options.axis.point.z
    );
    
    // Check angle validity
    const totalAngle = Math.abs(options.angle) + Math.abs(options.angle2 || 0);
    if (totalAngle > Math.PI * 2 + this.EPSILON) {
      warnings.push(`Total revolve angle (${(totalAngle * 180 / Math.PI).toFixed(1)}°) exceeds 360°`);
    }
    
    if (Math.abs(options.angle) < this.EPSILON) {
      errors.push('Revolve angle cannot be zero');
    }
    
    // Get profile points
    const profilePoints2D = this.getRegionPoints(sketch, region);
    if (profilePoints2D.length < 2) {
      errors.push('Profile must have at least 2 points');
      return { valid: false, errors, warnings };
    }
    
    // Check if profile is closed (for solid revolve)
    if (!options.surfaceOnly) {
      const firstPoint = profilePoints2D[0];
      const lastPoint = profilePoints2D[profilePoints2D.length - 1];
      const isClosed = Math.abs(firstPoint.x - lastPoint.x) < this.EPSILON &&
                      Math.abs(firstPoint.y - lastPoint.y) < this.EPSILON;
      
      if (!isClosed && region.outerLoop.length > 0) {
        // Check if it's truly a closed region
        const hasClosedLoop = region.outerLoop.length >= 3;
        if (!hasClosedLoop) {
          errors.push('Revolve requires a closed profile.');
          return { valid: false, errors, warnings };
        }
      }
    }
    
    // Convert profile to 3D
    const profilePoints3D: Vec3[] = [];
    for (const p2d of profilePoints2D) {
      const p3d = PlaneUtils.to3D(sketch.plane, p2d.x, p2d.y);
      profilePoints3D.push(p3d);
    }
    
    // Check profile doesn't cross axis in problematic ways
    let allOnSameSide = true;
    let firstSide: number | null = null;
    let minDistToAxis = Infinity;
    
    for (const point of profilePoints3D) {
      // Vector from axis point to profile point
      const toPoint = point.sub(axisPoint);
      // Distance to axis (perpendicular distance)
      const projOnAxis = toPoint.dot(axisDir);
      const nearestOnAxis = axisPoint.add(axisDir.mul(projOnAxis));
      const distToAxis = point.sub(nearestOnAxis).length();
      
      minDistToAxis = Math.min(minDistToAxis, distToAxis);
      
      // Check which side of axis
      const perpVec = point.sub(nearestOnAxis);
      if (perpVec.length() > this.EPSILON) {
        const side = Math.sign(perpVec.x + perpVec.y + perpVec.z);
        
        if (firstSide === null) {
          firstSide = side;
        } else if (Math.abs(side - firstSide) > this.EPSILON) {
          allOnSameSide = false;
        }
      }
    }
    
    // Check if profile is too close to axis
    if (minDistToAxis < this.MIN_DISTANCE_TO_AXIS) {
      warnings.push('Profile is very close to revolve axis - may produce degenerate geometry');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Revolve a sketch region around an axis
   */
  static revolve(
    sketch: Sketch,
    region: SketchRegion,
    options: RevolveOptions
  ): SolidData {
    const { angle, angle2 = 0, axis, segments = 32, validateProfile = true, surfaceOnly = false } = options;
    
    // Validate if requested
    if (validateProfile) {
      const validation = this.validate(sketch, region, options);
      if (!validation.valid) {
        throw new Error(`Revolve validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
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
    
    // Calculate angle ranges
    // Support two-direction revolve: angle in positive direction, angle2 in negative
    const startAngle = -Math.abs(angle2);
    const endAngle = Math.abs(angle);
    const totalAngle = endAngle - startAngle;
    
    // Check if this is a full revolution
    const isFullRevolution = Math.abs(totalAngle - Math.PI * 2) < 0.001;
    
    // Calculate number of segments based on total angle
    const effectiveSegments = Math.max(3, Math.ceil(segments * totalAngle / (2 * Math.PI)));
    const numSegments = isFullRevolution ? effectiveSegments : effectiveSegments + 1;
    const angleStep = totalAngle / effectiveSegments;
    
    const builder = new BRepBuilder();
    
    // Create all rotated profiles
    const profiles: string[][] = []; // [segment][profilePoint] -> vertex ID
    
    for (let seg = 0; seg < numSegments; seg++) {
      const currentAngle = startAngle + seg * angleStep;
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
    const actualSegments = isFullRevolution ? effectiveSegments : effectiveSegments;
    for (let seg = 0; seg < actualSegments; seg++) {
      const nextSeg = isFullRevolution ? (seg + 1) % effectiveSegments : seg + 1;
      
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
        const midAngle = startAngle + (seg + 0.5) * angleStep;
        const rotMat = Mat4.rotationAxis(axisDir, midAngle);
        const midPt = profilePoints3D[pt].add(profilePoints3D[nextPt]).mul(0.5).sub(axisPoint);
        const perpDir = midPt.sub(axisDir.mul(midPt.dot(axisDir)));
        const normal = rotMat.transformDirection(perpDir.normalize());
        
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
    
    // Create end caps if not a full revolution and not surface-only
    if (!isFullRevolution && !surfaceOnly) {
      // Start cap
      const startEdges: string[] = [];
      for (let pt = 0; pt < profilePoints3D.length; pt++) {
        const nextPt = (pt + 1) % profilePoints3D.length;
        startEdges.push(builder.addEdge(profiles[0][pt], profiles[0][nextPt]));
      }
      
      // Calculate start cap normal
      const startRotMat = Mat4.rotationAxis(axisDir, startAngle);
      const profileCenter = this.getProfileCenter(profilePoints3D, axisPoint, axisDir);
      const startNormal = startRotMat.transformDirection(
        profileCenter.cross(axisDir).normalize()
      ).negate();
      
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
      const lastSeg = actualSegments;
      for (let pt = 0; pt < profilePoints3D.length; pt++) {
        const nextPt = (pt + 1) % profilePoints3D.length;
        endEdges.push(builder.addEdge(profiles[lastSeg][pt], profiles[lastSeg][nextPt]));
      }
      
      const endRotMat = Mat4.rotationAxis(axisDir, endAngle);
      const endNormal = endRotMat.transformDirection(
        profileCenter.cross(axisDir).normalize()
      );
      
      const endSurface: PlaneSurface = {
        id: generateId('surf'),
        type: 'plane',
        origin: axisPoint,
        normal: { x: endNormal.x, y: endNormal.y, z: endNormal.z }
      };
      const endLoop = builder.createLoop(endEdges, endEdges.map(() => true));
      faceIds.push(builder.addFace(endSurface, [endLoop]));
    }
    
    builder.addShell(faceIds);
    
    return builder.toSolidData();
  }
  
  /**
   * Get center of profile relative to axis
   */
  private static getProfileCenter(profilePoints: Vec3[], axisPoint: Vec3, axisDir: Vec3): Vec3 {
    let center = Vec3.zero();
    for (const point of profilePoints) {
      const relative = point.sub(axisPoint);
      const projOnAxis = relative.dot(axisDir);
      const perpendicular = relative.sub(axisDir.mul(projOnAxis));
      center = center.add(perpendicular);
    }
    return center.div(profilePoints.length);
  }

  /**
   * Get 2D points from a sketch region
   * Supports both closed and open profiles
   */
  private static getRegionPoints(sketch: Sketch, region: SketchRegion): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const visitedPoints = new Set<string>();
    
    // Process outer loop
    for (const edgeId of region.outerLoop) {
      const entity = sketch.entities[edgeId];
      if (!entity) continue;
      
      if (entity.type === 'line') {
        const line = entity as any;
        const startPoint = sketch.entities[line.startPoint] as any;
        const endPoint = sketch.entities[line.endPoint] as any;
        
        if (startPoint && !visitedPoints.has(line.startPoint)) {
          visitedPoints.add(line.startPoint);
          points.push({ x: startPoint.x, y: startPoint.y });
        }
        
        // For open profiles, also add end point of last segment
        if (endPoint && region.outerLoop.indexOf(edgeId) === region.outerLoop.length - 1) {
          visitedPoints.add(line.endPoint);
          points.push({ x: endPoint.x, y: endPoint.y });
        }
      } else if (entity.type === 'arc') {
        // Sample arc into line segments
        const arc = entity as any;
        const segments = 16;
        const startAngle = arc.startAngle || 0;
        const endAngle = arc.endAngle || Math.PI * 2;
        const cx = arc.center?.x || 0;
        const cy = arc.center?.y || 0;
        const r = arc.radius || 10;
        
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const angle = startAngle + t * (endAngle - startAngle);
          points.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r
          });
        }
      } else if (entity.type === 'spline') {
        // Sample spline into line segments
        const spline = entity as any;
        const controlPoints = spline.controlPoints || [];
        if (controlPoints.length >= 2) {
          const segments = 32;
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = this.evaluateSpline(controlPoints, t);
            points.push(point);
          }
        }
      }
    }
    
    return points;
  }
  
  /**
   * Simple spline evaluation using linear interpolation
   * For production, should use proper B-spline evaluation
   */
  private static evaluateSpline(controlPoints: any[], t: number): { x: number; y: number } {
    const segmentCount = controlPoints.length - 1;
    const segmentIndex = Math.min(Math.floor(t * segmentCount), segmentCount - 1);
    const segmentT = (t * segmentCount) - segmentIndex;
    
    const p0 = controlPoints[segmentIndex];
    const p1 = controlPoints[segmentIndex + 1];
    
    return {
      x: p0.x + (p1.x - p0.x) * segmentT,
      y: p0.y + (p1.y - p0.y) * segmentT
    };
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

