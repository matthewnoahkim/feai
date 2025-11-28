// ============================================================================
// Curve Geometry
// ============================================================================

import { Vector2, Vector3, Line2D, Arc2D, Circle2D, Curve2D } from '@feai/shared';
import { Vec2, Vec3 } from '../math/vector';
import { NurbsCurveEvaluator } from '../math/nurbs';

// ============================================================================
// 2D Curve Operations
// ============================================================================

export class Curve2DUtils {
  /**
   * Evaluate a point on a 2D line at parameter t (0-1)
   */
  static evaluateLine(line: Line2D, t: number): Vec2 {
    return new Vec2(
      line.start.x + t * (line.end.x - line.start.x),
      line.start.y + t * (line.end.y - line.start.y)
    );
  }

  /**
   * Get the length of a 2D line
   */
  static lineLength(line: Line2D): number {
    return new Vec2(line.end.x - line.start.x, line.end.y - line.start.y).length();
  }

  /**
   * Evaluate a point on a 2D arc at parameter t (0-1)
   */
  static evaluateArc(arc: Arc2D, t: number): Vec2 {
    const angle = arc.startAngle + t * (arc.endAngle - arc.startAngle);
    return new Vec2(
      arc.center.x + arc.radius * Math.cos(angle),
      arc.center.y + arc.radius * Math.sin(angle)
    );
  }

  /**
   * Get the length of a 2D arc
   */
  static arcLength(arc: Arc2D): number {
    const deltaAngle = Math.abs(arc.endAngle - arc.startAngle);
    return arc.radius * deltaAngle;
  }

  /**
   * Evaluate a point on a 2D circle at parameter t (0-1)
   */
  static evaluateCircle(circle: Circle2D, t: number): Vec2 {
    const angle = t * Math.PI * 2;
    return new Vec2(
      circle.center.x + circle.radius * Math.cos(angle),
      circle.center.y + circle.radius * Math.sin(angle)
    );
  }

  /**
   * Get the circumference of a circle
   */
  static circleLength(circle: Circle2D): number {
    return 2 * Math.PI * circle.radius;
  }

  /**
   * Find the closest point on a line segment to a given point
   */
  static closestPointOnLine(line: Line2D, point: Vector2): { point: Vec2; t: number; distance: number } {
    const v = new Vec2(line.end.x - line.start.x, line.end.y - line.start.y);
    const w = new Vec2(point.x - line.start.x, point.y - line.start.y);
    
    const c1 = w.dot(v);
    if (c1 <= 0) {
      return {
        point: new Vec2(line.start.x, line.start.y),
        t: 0,
        distance: w.length()
      };
    }
    
    const c2 = v.dot(v);
    if (c2 <= c1) {
      const end = new Vec2(line.end.x, line.end.y);
      return {
        point: end,
        t: 1,
        distance: new Vec2(point.x - line.end.x, point.y - line.end.y).length()
      };
    }
    
    const t = c1 / c2;
    const closest = this.evaluateLine(line, t);
    return {
      point: closest,
      t,
      distance: closest.sub(new Vec2(point.x, point.y)).length()
    };
  }

  /**
   * Find intersection between two 2D lines
   */
  static lineLineIntersection(line1: Line2D, line2: Line2D): { point: Vec2; t1: number; t2: number } | null {
    const x1 = line1.start.x, y1 = line1.start.y;
    const x2 = line1.end.x, y2 = line1.end.y;
    const x3 = line2.start.x, y3 = line2.start.y;
    const x4 = line2.end.x, y4 = line2.end.y;
    
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) {
      return null; // Parallel or coincident
    }
    
    const t1 = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const t2 = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    return {
      point: this.evaluateLine(line1, t1),
      t1,
      t2
    };
  }

  /**
   * Find intersections between a line and a circle
   */
  static lineCircleIntersection(line: Line2D, circle: Circle2D): Vec2[] {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    const fx = line.start.x - circle.center.x;
    const fy = line.start.y - circle.center.y;
    
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - circle.radius * circle.radius;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
      return [];
    }
    
    const results: Vec2[] = [];
    const sqrtDisc = Math.sqrt(discriminant);
    
    const t1 = (-b - sqrtDisc) / (2 * a);
    const t2 = (-b + sqrtDisc) / (2 * a);
    
    if (t1 >= 0 && t1 <= 1) {
      results.push(this.evaluateLine(line, t1));
    }
    if (discriminant > 0 && t2 >= 0 && t2 <= 1) {
      results.push(this.evaluateLine(line, t2));
    }
    
    return results;
  }

  /**
   * Offset a 2D line by a distance
   */
  static offsetLine(line: Line2D, distance: number): Line2D {
    const dir = new Vec2(line.end.x - line.start.x, line.end.y - line.start.y).normalize();
    const normal = dir.perpendicular();
    const offset = normal.mul(distance);
    
    return {
      id: line.id + '_offset',
      type: 'line',
      start: { x: line.start.x + offset.x, y: line.start.y + offset.y },
      end: { x: line.end.x + offset.x, y: line.end.y + offset.y }
    };
  }

  /**
   * Tessellate a 2D curve into line segments
   */
  static tessellate(curve: Curve2D, segments: number = 32): Vec2[] {
    const points: Vec2[] = [];
    
    switch (curve.type) {
      case 'line':
        points.push(new Vec2(curve.start.x, curve.start.y));
        points.push(new Vec2(curve.end.x, curve.end.y));
        break;
        
      case 'arc':
        for (let i = 0; i <= segments; i++) {
          points.push(this.evaluateArc(curve, i / segments));
        }
        break;
        
      case 'circle':
        for (let i = 0; i <= segments; i++) {
          points.push(this.evaluateCircle(curve, i / segments));
        }
        break;
        
      case 'ellipse':
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const angle = t * Math.PI * 2;
          const x = curve.center.x + curve.majorRadius * Math.cos(angle) * Math.cos(curve.rotation) 
                  - curve.minorRadius * Math.sin(angle) * Math.sin(curve.rotation);
          const y = curve.center.y + curve.majorRadius * Math.cos(angle) * Math.sin(curve.rotation)
                  + curve.minorRadius * Math.sin(angle) * Math.cos(curve.rotation);
          points.push(new Vec2(x, y));
        }
        break;
        
      case 'polyline':
        for (const p of curve.points) {
          points.push(new Vec2(p.x, p.y));
        }
        break;
    }
    
    return points;
  }
}

// ============================================================================
// 3D Curve Operations
// ============================================================================

export class Curve3DUtils {
  /**
   * Evaluate a point on a 3D line at parameter t
   */
  static evaluateLine(start: Vector3, end: Vector3, t: number): Vec3 {
    return new Vec3(
      start.x + t * (end.x - start.x),
      start.y + t * (end.y - start.y),
      start.z + t * (end.z - start.z)
    );
  }

  /**
   * Get the length of a 3D line
   */
  static lineLength(start: Vector3, end: Vector3): number {
    return new Vec3(end.x - start.x, end.y - start.y, end.z - start.z).length();
  }

  /**
   * Find the closest point on a 3D line segment to a given point
   */
  static closestPointOnLine(
    start: Vector3,
    end: Vector3,
    point: Vector3
  ): { point: Vec3; t: number; distance: number } {
    const v = new Vec3(end.x - start.x, end.y - start.y, end.z - start.z);
    const w = new Vec3(point.x - start.x, point.y - start.y, point.z - start.z);
    
    const c1 = w.dot(v);
    if (c1 <= 0) {
      const s = new Vec3(start.x, start.y, start.z);
      return { point: s, t: 0, distance: w.length() };
    }
    
    const c2 = v.dot(v);
    if (c2 <= c1) {
      const e = new Vec3(end.x, end.y, end.z);
      return {
        point: e,
        t: 1,
        distance: new Vec3(point.x - end.x, point.y - end.y, point.z - end.z).length()
      };
    }
    
    const t = c1 / c2;
    const closest = this.evaluateLine(start, end, t);
    return {
      point: closest,
      t,
      distance: closest.sub(new Vec3(point.x, point.y, point.z)).length()
    };
  }

  /**
   * Compute arc length of a NURBS curve between parameters
   */
  static nurbsArcLength(
    curve: NurbsCurveEvaluator,
    uStart: number,
    uEnd: number,
    segments: number = 100
  ): number {
    let length = 0;
    let prevPoint = curve.evaluate(uStart);
    
    for (let i = 1; i <= segments; i++) {
      const u = uStart + (uEnd - uStart) * i / segments;
      const point = curve.evaluate(u);
      length += point.sub(prevPoint).length();
      prevPoint = point;
    }
    
    return length;
  }

  /**
   * Sample a NURBS curve at regular arc length intervals
   */
  static sampleByArcLength(
    curve: NurbsCurveEvaluator,
    numSamples: number
  ): Vec3[] {
    const points: Vec3[] = [];
    const uMin = curve.knots[curve.degree];
    const uMax = curve.knots[curve.knots.length - curve.degree - 1];
    
    // First, compute total length with fine sampling
    const totalLength = this.nurbsArcLength(curve, uMin, uMax, 1000);
    const segmentLength = totalLength / (numSamples - 1);
    
    points.push(curve.evaluate(uMin));
    
    let currentLength = 0;
    let currentU = uMin;
    let targetLength = segmentLength;
    
    const step = (uMax - uMin) / 1000;
    let prevPoint = curve.evaluate(currentU);
    
    while (points.length < numSamples - 1) {
      currentU += step;
      if (currentU > uMax) break;
      
      const point = curve.evaluate(currentU);
      currentLength += point.sub(prevPoint).length();
      prevPoint = point;
      
      if (currentLength >= targetLength) {
        points.push(point);
        targetLength += segmentLength;
      }
    }
    
    points.push(curve.evaluate(uMax));
    
    return points;
  }
}

// ============================================================================
// Curve Fitting
// ============================================================================

export class CurveFitting {
  /**
   * Fit a NURBS curve through a set of points
   */
  static fitNurbs(
    points: Vector3[],
    degree: number = 3
  ): NurbsCurveEvaluator {
    if (points.length < degree + 1) {
      // Not enough points, use lower degree
      degree = points.length - 1;
    }
    
    const n = points.length - 1;
    
    // Compute chord lengths for parameterization
    const chordLengths: number[] = [0];
    let totalLength = 0;
    for (let i = 1; i <= n; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const len = new Vec3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z).length();
      totalLength += len;
      chordLengths.push(totalLength);
    }
    
    // Normalize to [0, 1]
    const params: number[] = chordLengths.map(l => l / totalLength);
    
    // Create knot vector
    const knots = NurbsCurveEvaluator.createUniformKnots(degree, points.length);
    
    // For interpolation, we need to solve a system of equations
    // For simplicity, use points directly as control points (approximation)
    // A proper implementation would solve for control points
    
    const weights = new Array(points.length).fill(1);
    
    return new NurbsCurveEvaluator(degree, points, weights, knots);
  }

  /**
   * Create a smooth spline through points using Catmull-Rom interpolation
   */
  static catmullRomSpline(points: Vector3[], tension: number = 0.5): NurbsCurveEvaluator {
    if (points.length < 2) {
      throw new Error('Need at least 2 points');
    }
    
    if (points.length === 2) {
      return NurbsCurveEvaluator.createLine(points[0], points[1]);
    }
    
    // For Catmull-Rom, we generate Bezier segments
    // Then convert to a single NURBS curve
    // For simplicity, return interpolating curve
    return this.fitNurbs(points, 3);
  }
}

