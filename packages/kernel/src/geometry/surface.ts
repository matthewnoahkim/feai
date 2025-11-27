// ============================================================================
// Surface Geometry
// ============================================================================

import { Vector3, Plane, Surface, PlaneSurface, CylinderSurface, SphereSurface } from '@webcad/shared';
import { Vec3 } from '../math/vector';
import { NurbsSurfaceEvaluator } from '../math/nurbs';

// ============================================================================
// Plane Operations
// ============================================================================

export class PlaneUtils {
  /**
   * Create a plane from origin and normal
   */
  static fromOriginNormal(origin: Vector3, normal: Vector3): Plane {
    const n = new Vec3(normal.x, normal.y, normal.z).normalize();
    
    // Find x and y axes orthogonal to normal
    let xAxis: Vec3;
    if (Math.abs(n.x) < 0.9) {
      xAxis = new Vec3(1, 0, 0).cross(n).normalize();
    } else {
      xAxis = new Vec3(0, 1, 0).cross(n).normalize();
    }
    const yAxis = n.cross(xAxis);
    
    return {
      origin: { x: origin.x, y: origin.y, z: origin.z },
      normal: { x: n.x, y: n.y, z: n.z },
      xAxis: { x: xAxis.x, y: xAxis.y, z: xAxis.z },
      yAxis: { x: yAxis.x, y: yAxis.y, z: yAxis.z }
    };
  }

  /**
   * Create a plane from three points
   */
  static fromThreePoints(p1: Vector3, p2: Vector3, p3: Vector3): Plane {
    const v1 = new Vec3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    const v2 = new Vec3(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);
    const normal = v1.cross(v2).normalize();
    
    return this.fromOriginNormal(p1, normal);
  }

  /**
   * Project a 3D point onto a plane
   */
  static projectPoint(plane: Plane, point: Vector3): Vec3 {
    const n = new Vec3(plane.normal.x, plane.normal.y, plane.normal.z);
    const p = new Vec3(point.x, point.y, point.z);
    const o = new Vec3(plane.origin.x, plane.origin.y, plane.origin.z);
    
    const d = p.sub(o).dot(n);
    return p.sub(n.mul(d));
  }

  /**
   * Get the signed distance from a point to a plane
   */
  static signedDistance(plane: Plane, point: Vector3): number {
    const n = new Vec3(plane.normal.x, plane.normal.y, plane.normal.z);
    const p = new Vec3(point.x, point.y, point.z);
    const o = new Vec3(plane.origin.x, plane.origin.y, plane.origin.z);
    
    return p.sub(o).dot(n);
  }

  /**
   * Convert 3D point to 2D coordinates on the plane
   */
  static to2D(plane: Plane, point: Vector3): { x: number; y: number } {
    const p = this.projectPoint(plane, point);
    const o = new Vec3(plane.origin.x, plane.origin.y, plane.origin.z);
    const local = p.sub(o);
    
    const xAxis = new Vec3(plane.xAxis.x, plane.xAxis.y, plane.xAxis.z);
    const yAxis = new Vec3(plane.yAxis.x, plane.yAxis.y, plane.yAxis.z);
    
    return {
      x: local.dot(xAxis),
      y: local.dot(yAxis)
    };
  }

  /**
   * Convert 2D coordinates on the plane to 3D point
   */
  static to3D(plane: Plane, x: number, y: number): Vec3 {
    const o = new Vec3(plane.origin.x, plane.origin.y, plane.origin.z);
    const xAxis = new Vec3(plane.xAxis.x, plane.xAxis.y, plane.xAxis.z);
    const yAxis = new Vec3(plane.yAxis.x, plane.yAxis.y, plane.yAxis.z);
    
    return o.add(xAxis.mul(x)).add(yAxis.mul(y));
  }

  /**
   * Intersect a line with a plane
   */
  static intersectLine(
    plane: Plane,
    lineStart: Vector3,
    lineEnd: Vector3
  ): { point: Vec3; t: number } | null {
    const n = new Vec3(plane.normal.x, plane.normal.y, plane.normal.z);
    const o = new Vec3(plane.origin.x, plane.origin.y, plane.origin.z);
    const p0 = new Vec3(lineStart.x, lineStart.y, lineStart.z);
    const p1 = new Vec3(lineEnd.x, lineEnd.y, lineEnd.z);
    
    const dir = p1.sub(p0);
    const denom = n.dot(dir);
    
    if (Math.abs(denom) < 1e-10) {
      return null; // Line parallel to plane
    }
    
    const t = n.dot(o.sub(p0)) / denom;
    
    return {
      point: p0.add(dir.mul(t)),
      t
    };
  }

  /**
   * Intersect two planes
   */
  static intersectPlane(plane1: Plane, plane2: Plane): { point: Vec3; direction: Vec3 } | null {
    const n1 = new Vec3(plane1.normal.x, plane1.normal.y, plane1.normal.z);
    const n2 = new Vec3(plane2.normal.x, plane2.normal.y, plane2.normal.z);
    
    const dir = n1.cross(n2);
    if (dir.length() < 1e-10) {
      return null; // Planes are parallel
    }
    
    // Find a point on the intersection line
    const o1 = new Vec3(plane1.origin.x, plane1.origin.y, plane1.origin.z);
    const o2 = new Vec3(plane2.origin.x, plane2.origin.y, plane2.origin.z);
    
    const d1 = n1.dot(o1);
    const d2 = n2.dot(o2);
    
    const n12 = n1.dot(n1);
    const n22 = n2.dot(n2);
    const n1n2 = n1.dot(n2);
    
    const det = n12 * n22 - n1n2 * n1n2;
    if (Math.abs(det) < 1e-10) {
      return null;
    }
    
    const c1 = (d1 * n22 - d2 * n1n2) / det;
    const c2 = (d2 * n12 - d1 * n1n2) / det;
    
    const point = n1.mul(c1).add(n2.mul(c2));
    
    return {
      point,
      direction: dir.normalize()
    };
  }

  /**
   * Offset a plane by a distance
   */
  static offset(plane: Plane, distance: number): Plane {
    const n = new Vec3(plane.normal.x, plane.normal.y, plane.normal.z);
    const o = new Vec3(plane.origin.x, plane.origin.y, plane.origin.z);
    const newOrigin = o.add(n.mul(distance));
    
    return {
      ...plane,
      origin: { x: newOrigin.x, y: newOrigin.y, z: newOrigin.z }
    };
  }

  /**
   * Standard XY plane (Z = 0)
   */
  static XY(): Plane {
    return {
      origin: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 0, z: 1 },
      xAxis: { x: 1, y: 0, z: 0 },
      yAxis: { x: 0, y: 1, z: 0 }
    };
  }

  /**
   * Standard XZ plane (Y = 0)
   */
  static XZ(): Plane {
    return {
      origin: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 1, z: 0 },
      xAxis: { x: 1, y: 0, z: 0 },
      yAxis: { x: 0, y: 0, z: 1 }
    };
  }

  /**
   * Standard YZ plane (X = 0)
   */
  static YZ(): Plane {
    return {
      origin: { x: 0, y: 0, z: 0 },
      normal: { x: 1, y: 0, z: 0 },
      xAxis: { x: 0, y: 1, z: 0 },
      yAxis: { x: 0, y: 0, z: 1 }
    };
  }
}

// ============================================================================
// Surface Evaluation
// ============================================================================

export class SurfaceEvaluator {
  /**
   * Evaluate a point on an analytic surface
   */
  static evaluateSurface(surface: Surface, u: number, v: number): Vec3 {
    switch (surface.type) {
      case 'plane':
        return this.evaluatePlane(surface as PlaneSurface, u, v);
      case 'cylinder':
        return this.evaluateCylinder(surface as CylinderSurface, u, v);
      case 'sphere':
        return this.evaluateSphere(surface as SphereSurface, u, v);
      case 'nurbs':
        // Would use NurbsSurfaceEvaluator
        throw new Error('Use NurbsSurfaceEvaluator for NURBS surfaces');
      default:
        throw new Error(`Unsupported surface type: ${surface.type}`);
    }
  }

  /**
   * Evaluate a point on a plane surface
   */
  static evaluatePlane(surface: PlaneSurface, u: number, v: number): Vec3 {
    // For plane, u and v are coordinates in the plane
    const o = new Vec3(surface.origin.x, surface.origin.y, surface.origin.z);
    const n = new Vec3(surface.normal.x, surface.normal.y, surface.normal.z).normalize();
    
    // Generate x and y axes
    let xAxis: Vec3;
    if (Math.abs(n.x) < 0.9) {
      xAxis = new Vec3(1, 0, 0).cross(n).normalize();
    } else {
      xAxis = new Vec3(0, 1, 0).cross(n).normalize();
    }
    const yAxis = n.cross(xAxis);
    
    return o.add(xAxis.mul(u)).add(yAxis.mul(v));
  }

  /**
   * Evaluate a point on a cylinder surface
   */
  static evaluateCylinder(surface: CylinderSurface, u: number, v: number): Vec3 {
    // u: angle around axis (0 to 2π)
    // v: position along axis
    const o = new Vec3(surface.origin.x, surface.origin.y, surface.origin.z);
    const axis = new Vec3(surface.axis.x, surface.axis.y, surface.axis.z).normalize();
    
    // Generate perpendicular axes
    let xAxis: Vec3;
    if (Math.abs(axis.x) < 0.9) {
      xAxis = new Vec3(1, 0, 0).cross(axis).normalize();
    } else {
      xAxis = new Vec3(0, 1, 0).cross(axis).normalize();
    }
    const yAxis = axis.cross(xAxis);
    
    const r = surface.radius;
    return o
      .add(axis.mul(v))
      .add(xAxis.mul(r * Math.cos(u)))
      .add(yAxis.mul(r * Math.sin(u)));
  }

  /**
   * Evaluate a point on a sphere surface
   */
  static evaluateSphere(surface: SphereSurface, u: number, v: number): Vec3 {
    // u: azimuth angle (0 to 2π)
    // v: polar angle (0 to π)
    const c = new Vec3(surface.center.x, surface.center.y, surface.center.z);
    const r = surface.radius;
    
    const sinV = Math.sin(v);
    return new Vec3(
      c.x + r * sinV * Math.cos(u),
      c.y + r * sinV * Math.sin(u),
      c.z + r * Math.cos(v)
    );
  }

  /**
   * Compute the normal at a point on a surface
   */
  static normalAt(surface: Surface, u: number, v: number): Vec3 {
    switch (surface.type) {
      case 'plane':
        return new Vec3(surface.normal.x, surface.normal.y, surface.normal.z).normalize();
        
      case 'cylinder': {
        // Normal is radial, perpendicular to axis
        const p = this.evaluateCylinder(surface as CylinderSurface, u, v);
        const cyl = surface as CylinderSurface;
        const o = new Vec3(cyl.origin.x, cyl.origin.y, cyl.origin.z);
        const axis = new Vec3(cyl.axis.x, cyl.axis.y, cyl.axis.z).normalize();
        
        // Project point onto axis to get closest axial point
        const toP = p.sub(o);
        const axialDist = toP.dot(axis);
        const axialPoint = o.add(axis.mul(axialDist));
        
        return p.sub(axialPoint).normalize();
      }
        
      case 'sphere': {
        const p = this.evaluateSphere(surface as SphereSurface, u, v);
        const sph = surface as SphereSurface;
        const c = new Vec3(sph.center.x, sph.center.y, sph.center.z);
        return p.sub(c).normalize();
      }
        
      default:
        throw new Error(`Cannot compute normal for surface type: ${surface.type}`);
    }
  }

  /**
   * Tessellate a surface into triangles
   */
  static tessellate(
    surface: Surface,
    uRange: [number, number],
    vRange: [number, number],
    uSegments: number,
    vSegments: number
  ): { positions: number[]; normals: number[]; indices: number[] } {
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    
    const uStep = (uRange[1] - uRange[0]) / uSegments;
    const vStep = (vRange[1] - vRange[0]) / vSegments;
    
    // Generate vertices
    for (let i = 0; i <= uSegments; i++) {
      const u = uRange[0] + i * uStep;
      for (let j = 0; j <= vSegments; j++) {
        const v = vRange[0] + j * vStep;
        
        const p = this.evaluateSurface(surface, u, v);
        const n = this.normalAt(surface, u, v);
        
        positions.push(p.x, p.y, p.z);
        normals.push(n.x, n.y, n.z);
      }
    }
    
    // Generate indices
    for (let i = 0; i < uSegments; i++) {
      for (let j = 0; j < vSegments; j++) {
        const a = i * (vSegments + 1) + j;
        const b = a + 1;
        const c = a + (vSegments + 1);
        const d = c + 1;
        
        // Two triangles per quad
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    return { positions, normals, indices };
  }
}

