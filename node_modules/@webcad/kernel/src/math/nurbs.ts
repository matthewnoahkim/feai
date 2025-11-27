// ============================================================================
// NURBS (Non-Uniform Rational B-Spline) Implementation
// ============================================================================

import { Vector3, Vector2, NurbsCurve, NurbsSurface } from '@webcad/shared';
import { Vec2, Vec3 } from './vector';

// ============================================================================
// Basis Functions
// ============================================================================

/**
 * Find the knot span index for parameter u
 */
export function findKnotSpan(degree: number, u: number, knots: number[]): number {
  const n = knots.length - degree - 2;
  
  // Special cases
  if (u >= knots[n + 1]) return n;
  if (u <= knots[degree]) return degree;
  
  // Binary search
  let low = degree;
  let high = n + 1;
  let mid = Math.floor((low + high) / 2);
  
  while (u < knots[mid] || u >= knots[mid + 1]) {
    if (u < knots[mid]) {
      high = mid;
    } else {
      low = mid;
    }
    mid = Math.floor((low + high) / 2);
  }
  
  return mid;
}

/**
 * Compute non-zero B-spline basis functions at parameter u
 * Returns array of (degree + 1) values
 */
export function basisFunctions(span: number, u: number, degree: number, knots: number[]): number[] {
  const N = new Array(degree + 1).fill(0);
  const left = new Array(degree + 1).fill(0);
  const right = new Array(degree + 1).fill(0);
  
  N[0] = 1.0;
  
  for (let j = 1; j <= degree; j++) {
    left[j] = u - knots[span + 1 - j];
    right[j] = knots[span + j] - u;
    let saved = 0.0;
    
    for (let r = 0; r < j; r++) {
      const temp = N[r] / (right[r + 1] + left[j - r]);
      N[r] = saved + right[r + 1] * temp;
      saved = left[j - r] * temp;
    }
    N[j] = saved;
  }
  
  return N;
}

/**
 * Compute basis functions and their derivatives
 * Returns array of derivatives, each containing (degree + 1) basis function values
 */
export function basisFunctionsDerivatives(
  span: number,
  u: number,
  degree: number,
  numDerivatives: number,
  knots: number[]
): number[][] {
  const ndu = new Array(degree + 1).fill(null).map(() => new Array(degree + 1).fill(0));
  const left = new Array(degree + 1).fill(0);
  const right = new Array(degree + 1).fill(0);
  
  ndu[0][0] = 1.0;
  
  for (let j = 1; j <= degree; j++) {
    left[j] = u - knots[span + 1 - j];
    right[j] = knots[span + j] - u;
    let saved = 0.0;
    
    for (let r = 0; r < j; r++) {
      // Lower triangle
      ndu[j][r] = right[r + 1] + left[j - r];
      const temp = ndu[r][j - 1] / ndu[j][r];
      // Upper triangle
      ndu[r][j] = saved + right[r + 1] * temp;
      saved = left[j - r] * temp;
    }
    ndu[j][j] = saved;
  }
  
  // Load basis functions
  const ders = new Array(numDerivatives + 1).fill(null).map(() => new Array(degree + 1).fill(0));
  for (let j = 0; j <= degree; j++) {
    ders[0][j] = ndu[j][degree];
  }
  
  // Compute derivatives
  const a = new Array(2).fill(null).map(() => new Array(degree + 1).fill(0));
  
  for (let r = 0; r <= degree; r++) {
    let s1 = 0, s2 = 1;
    a[0][0] = 1.0;
    
    for (let k = 1; k <= numDerivatives; k++) {
      let d = 0.0;
      const rk = r - k;
      const pk = degree - k;
      
      if (r >= k) {
        a[s2][0] = a[s1][0] / ndu[pk + 1][rk];
        d = a[s2][0] * ndu[rk][pk];
      }
      
      const j1 = rk >= -1 ? 1 : -rk;
      const j2 = r - 1 <= pk ? k - 1 : degree - r;
      
      for (let j = j1; j <= j2; j++) {
        a[s2][j] = (a[s1][j] - a[s1][j - 1]) / ndu[pk + 1][rk + j];
        d += a[s2][j] * ndu[rk + j][pk];
      }
      
      if (r <= pk) {
        a[s2][k] = -a[s1][k - 1] / ndu[pk + 1][r];
        d += a[s2][k] * ndu[r][pk];
      }
      
      ders[k][r] = d;
      [s1, s2] = [s2, s1];
    }
  }
  
  // Multiply by correct factors
  let r = degree;
  for (let k = 1; k <= numDerivatives; k++) {
    for (let j = 0; j <= degree; j++) {
      ders[k][j] *= r;
    }
    r *= degree - k;
  }
  
  return ders;
}

// ============================================================================
// NURBS Curve Evaluation
// ============================================================================

export class NurbsCurveEvaluator {
  constructor(
    public degree: number,
    public controlPoints: Vector3[],
    public weights: number[],
    public knots: number[]
  ) {}

  /**
   * Evaluate curve at parameter u
   */
  evaluate(u: number): Vec3 {
    const span = findKnotSpan(this.degree, u, this.knots);
    const N = basisFunctions(span, u, this.degree, this.knots);
    
    let x = 0, y = 0, z = 0, w = 0;
    
    for (let i = 0; i <= this.degree; i++) {
      const cp = this.controlPoints[span - this.degree + i];
      const weight = this.weights[span - this.degree + i];
      const basis = N[i] * weight;
      
      x += basis * cp.x;
      y += basis * cp.y;
      z += basis * cp.z;
      w += basis;
    }
    
    if (w !== 0) {
      x /= w;
      y /= w;
      z /= w;
    }
    
    return new Vec3(x, y, z);
  }

  /**
   * Evaluate curve and its derivatives at parameter u
   */
  derivatives(u: number, numDerivatives: number): Vec3[] {
    const span = findKnotSpan(this.degree, u, this.knots);
    const ders = basisFunctionsDerivatives(span, u, this.degree, numDerivatives, this.knots);
    
    // Compute Aw (weighted point) derivatives
    const Aw: { x: number; y: number; z: number; w: number }[] = [];
    for (let k = 0; k <= numDerivatives; k++) {
      let x = 0, y = 0, z = 0, w = 0;
      for (let j = 0; j <= this.degree; j++) {
        const cp = this.controlPoints[span - this.degree + j];
        const weight = this.weights[span - this.degree + j];
        const basis = ders[k][j] * weight;
        
        x += basis * cp.x;
        y += basis * cp.y;
        z += basis * cp.z;
        w += basis;
      }
      Aw.push({ x, y, z, w });
    }
    
    // Apply quotient rule to get actual derivatives
    const result: Vec3[] = [];
    
    for (let k = 0; k <= numDerivatives; k++) {
      let v = new Vec3(Aw[k].x, Aw[k].y, Aw[k].z);
      
      for (let i = 1; i <= k; i++) {
        const binomial = this.binomial(k, i);
        const prev = result[k - i];
        v = v.sub(prev.mul(binomial * Aw[i].w));
      }
      
      result.push(v.div(Aw[0].w));
    }
    
    return result;
  }

  /**
   * Get tangent vector at parameter u
   */
  tangent(u: number): Vec3 {
    const d = this.derivatives(u, 1);
    return d[1].normalize();
  }

  /**
   * Get curvature at parameter u
   */
  curvature(u: number): number {
    const d = this.derivatives(u, 2);
    const cross = d[1].cross(d[2]);
    const len1Cubed = Math.pow(d[1].length(), 3);
    if (len1Cubed === 0) return 0;
    return cross.length() / len1Cubed;
  }

  /**
   * Tessellate curve into line segments
   */
  tessellate(tolerance: number = 0.01): Vec3[] {
    const points: Vec3[] = [];
    this.tessellateRecursive(this.knots[this.degree], this.knots[this.knots.length - this.degree - 1], tolerance, points);
    return points;
  }

  private tessellateRecursive(u0: number, u1: number, tolerance: number, points: Vec3[]): void {
    const p0 = this.evaluate(u0);
    const p1 = this.evaluate(u1);
    const mid = (u0 + u1) / 2;
    const pMid = this.evaluate(mid);
    
    // Check if midpoint is close enough to the line
    const line = p1.sub(p0);
    const toMid = pMid.sub(p0);
    const projected = p0.add(line.mul(toMid.dot(line) / line.lengthSquared()));
    const deviation = pMid.sub(projected).length();
    
    if (deviation > tolerance && (u1 - u0) > 1e-10) {
      this.tessellateRecursive(u0, mid, tolerance, points);
      this.tessellateRecursive(mid, u1, tolerance, points);
    } else {
      if (points.length === 0) {
        points.push(p0);
      }
      points.push(p1);
    }
  }

  private binomial(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    return result;
  }

  /**
   * Create standard knot vector for given degree and control point count
   */
  static createUniformKnots(degree: number, controlPointCount: number): number[] {
    const n = controlPointCount - 1;
    const m = n + degree + 1;
    const knots: number[] = [];
    
    for (let i = 0; i <= m; i++) {
      if (i <= degree) {
        knots.push(0);
      } else if (i >= m - degree) {
        knots.push(1);
      } else {
        knots.push((i - degree) / (m - 2 * degree));
      }
    }
    
    return knots;
  }

  /**
   * Create a line as NURBS curve
   */
  static createLine(start: Vector3, end: Vector3): NurbsCurveEvaluator {
    return new NurbsCurveEvaluator(
      1,
      [start, end],
      [1, 1],
      [0, 0, 1, 1]
    );
  }

  /**
   * Create a circle as NURBS curve
   */
  static createCircle(center: Vector3, radius: number, normal: Vector3 = { x: 0, y: 0, z: 1 }): NurbsCurveEvaluator {
    const n = new Vec3(normal.x, normal.y, normal.z).normalize();
    let xAxis = new Vec3(1, 0, 0);
    if (Math.abs(n.dot(xAxis)) > 0.9) {
      xAxis = new Vec3(0, 1, 0);
    }
    const yAxis = n.cross(xAxis).normalize();
    xAxis = yAxis.cross(n);
    
    const cx = center.x, cy = center.y, cz = center.z;
    const sqrt2over2 = Math.SQRT2 / 2;
    
    // 9 control points for a full circle
    const controlPoints: Vector3[] = [
      { x: cx + radius * xAxis.x, y: cy + radius * xAxis.y, z: cz + radius * xAxis.z },
      { x: cx + radius * (xAxis.x + yAxis.x), y: cy + radius * (xAxis.y + yAxis.y), z: cz + radius * (xAxis.z + yAxis.z) },
      { x: cx + radius * yAxis.x, y: cy + radius * yAxis.y, z: cz + radius * yAxis.z },
      { x: cx + radius * (-xAxis.x + yAxis.x), y: cy + radius * (-xAxis.y + yAxis.y), z: cz + radius * (-xAxis.z + yAxis.z) },
      { x: cx - radius * xAxis.x, y: cy - radius * xAxis.y, z: cz - radius * xAxis.z },
      { x: cx + radius * (-xAxis.x - yAxis.x), y: cy + radius * (-xAxis.y - yAxis.y), z: cz + radius * (-xAxis.z - yAxis.z) },
      { x: cx - radius * yAxis.x, y: cy - radius * yAxis.y, z: cz - radius * yAxis.z },
      { x: cx + radius * (xAxis.x - yAxis.x), y: cy + radius * (xAxis.y - yAxis.y), z: cz + radius * (xAxis.z - yAxis.z) },
      { x: cx + radius * xAxis.x, y: cy + radius * xAxis.y, z: cz + radius * xAxis.z },
    ];
    
    const weights = [1, sqrt2over2, 1, sqrt2over2, 1, sqrt2over2, 1, sqrt2over2, 1];
    const knots = [0, 0, 0, 0.25, 0.25, 0.5, 0.5, 0.75, 0.75, 1, 1, 1];
    
    return new NurbsCurveEvaluator(2, controlPoints, weights, knots);
  }

  /**
   * Create an arc as NURBS curve
   */
  static createArc(
    center: Vector3,
    radius: number,
    startAngle: number,
    endAngle: number,
    normal: Vector3 = { x: 0, y: 0, z: 1 }
  ): NurbsCurveEvaluator {
    // For simplicity, create full circle and return. A proper implementation
    // would create an arc with fewer control points.
    // This is a placeholder - real implementation would handle arbitrary arcs
    return this.createCircle(center, radius, normal);
  }
}

// ============================================================================
// NURBS Surface Evaluation
// ============================================================================

export class NurbsSurfaceEvaluator {
  constructor(
    public degreeU: number,
    public degreeV: number,
    public controlPoints: Vector3[][],  // [u][v]
    public weights: number[][],
    public knotsU: number[],
    public knotsV: number[]
  ) {}

  /**
   * Evaluate surface at parameters (u, v)
   */
  evaluate(u: number, v: number): Vec3 {
    const spanU = findKnotSpan(this.degreeU, u, this.knotsU);
    const spanV = findKnotSpan(this.degreeV, v, this.knotsV);
    const Nu = basisFunctions(spanU, u, this.degreeU, this.knotsU);
    const Nv = basisFunctions(spanV, v, this.degreeV, this.knotsV);
    
    let x = 0, y = 0, z = 0, w = 0;
    
    for (let i = 0; i <= this.degreeU; i++) {
      for (let j = 0; j <= this.degreeV; j++) {
        const cp = this.controlPoints[spanU - this.degreeU + i][spanV - this.degreeV + j];
        const weight = this.weights[spanU - this.degreeU + i][spanV - this.degreeV + j];
        const basis = Nu[i] * Nv[j] * weight;
        
        x += basis * cp.x;
        y += basis * cp.y;
        z += basis * cp.z;
        w += basis;
      }
    }
    
    if (w !== 0) {
      x /= w;
      y /= w;
      z /= w;
    }
    
    return new Vec3(x, y, z);
  }

  /**
   * Evaluate surface normal at parameters (u, v)
   */
  normal(u: number, v: number): Vec3 {
    const d = this.derivatives(u, v, 1);
    const du = d[1][0];
    const dv = d[0][1];
    return du.cross(dv).normalize();
  }

  /**
   * Evaluate partial derivatives
   * Returns 2D array where result[i][j] is d^(i+j)/du^i dv^j
   */
  derivatives(u: number, v: number, numDerivatives: number): Vec3[][] {
    const spanU = findKnotSpan(this.degreeU, u, this.knotsU);
    const spanV = findKnotSpan(this.degreeV, v, this.knotsV);
    const dersU = basisFunctionsDerivatives(spanU, u, this.degreeU, numDerivatives, this.knotsU);
    const dersV = basisFunctionsDerivatives(spanV, v, this.degreeV, numDerivatives, this.knotsV);
    
    // Compute Aw derivatives
    const Aw: { x: number; y: number; z: number; w: number }[][] = [];
    for (let k = 0; k <= numDerivatives; k++) {
      Aw[k] = [];
      for (let l = 0; l <= numDerivatives - k; l++) {
        let x = 0, y = 0, z = 0, w = 0;
        for (let i = 0; i <= this.degreeU; i++) {
          for (let j = 0; j <= this.degreeV; j++) {
            const cp = this.controlPoints[spanU - this.degreeU + i][spanV - this.degreeV + j];
            const weight = this.weights[spanU - this.degreeU + i][spanV - this.degreeV + j];
            const basis = dersU[k][i] * dersV[l][j] * weight;
            
            x += basis * cp.x;
            y += basis * cp.y;
            z += basis * cp.z;
            w += basis;
          }
        }
        Aw[k][l] = { x, y, z, w };
      }
    }
    
    // Apply quotient rule
    const result: Vec3[][] = [];
    for (let k = 0; k <= numDerivatives; k++) {
      result[k] = [];
      for (let l = 0; l <= numDerivatives - k; l++) {
        let v = new Vec3(Aw[k][l].x, Aw[k][l].y, Aw[k][l].z);
        
        for (let i = 1; i <= k; i++) {
          v = v.sub(result[k - i][l].mul(this.binomial(k, i) * Aw[i][0].w));
        }
        
        for (let j = 1; j <= l; j++) {
          v = v.sub(result[k][l - j].mul(this.binomial(l, j) * Aw[0][j].w));
        }
        
        for (let i = 1; i <= k; i++) {
          for (let j = 1; j <= l; j++) {
            v = v.sub(result[k - i][l - j].mul(this.binomial(k, i) * this.binomial(l, j) * Aw[i][j].w));
          }
        }
        
        result[k][l] = v.div(Aw[0][0].w);
      }
    }
    
    return result;
  }

  /**
   * Tessellate surface into triangles
   */
  tessellate(toleranceU: number = 0.01, toleranceV: number = 0.01): {
    positions: number[];
    normals: number[];
    uvs: number[];
    indices: number[];
  } {
    const uMin = this.knotsU[this.degreeU];
    const uMax = this.knotsU[this.knotsU.length - this.degreeU - 1];
    const vMin = this.knotsV[this.degreeV];
    const vMax = this.knotsV[this.knotsV.length - this.degreeV - 1];
    
    // Adaptive subdivision would be better, but for now use fixed sampling
    const numU = Math.max(4, Math.ceil(1 / toleranceU));
    const numV = Math.max(4, Math.ceil(1 / toleranceV));
    
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Generate grid of points
    for (let i = 0; i <= numU; i++) {
      const u = uMin + (uMax - uMin) * i / numU;
      for (let j = 0; j <= numV; j++) {
        const v = vMin + (vMax - vMin) * j / numV;
        
        const p = this.evaluate(u, v);
        const n = this.normal(u, v);
        
        positions.push(p.x, p.y, p.z);
        normals.push(n.x, n.y, n.z);
        uvs.push(i / numU, j / numV);
      }
    }
    
    // Generate triangle indices
    for (let i = 0; i < numU; i++) {
      for (let j = 0; j < numV; j++) {
        const a = i * (numV + 1) + j;
        const b = a + 1;
        const c = a + (numV + 1);
        const d = c + 1;
        
        // Two triangles per quad
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    return { positions, normals, uvs, indices };
  }

  private binomial(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    return result;
  }

  /**
   * Create a planar NURBS surface
   */
  static createPlane(
    origin: Vector3,
    uDir: Vector3,
    vDir: Vector3,
    width: number,
    height: number
  ): NurbsSurfaceEvaluator {
    const u = new Vec3(uDir.x, uDir.y, uDir.z).normalize();
    const v = new Vec3(vDir.x, vDir.y, vDir.z).normalize();
    const o = new Vec3(origin.x, origin.y, origin.z);
    
    const p00 = o;
    const p10 = o.add(u.mul(width));
    const p01 = o.add(v.mul(height));
    const p11 = o.add(u.mul(width)).add(v.mul(height));
    
    return new NurbsSurfaceEvaluator(
      1, 1,
      [[p00, p01], [p10, p11]],
      [[1, 1], [1, 1]],
      [0, 0, 1, 1],
      [0, 0, 1, 1]
    );
  }

  /**
   * Create a cylinder NURBS surface
   */
  static createCylinder(
    origin: Vector3,
    axis: Vector3,
    radius: number,
    height: number
  ): NurbsSurfaceEvaluator {
    // Create cylinder by extruding a circle
    const circle = NurbsCurveEvaluator.createCircle(origin, radius, axis);
    
    const a = new Vec3(axis.x, axis.y, axis.z).normalize();
    const topOffset = a.mul(height);
    
    // Extrude control points
    const controlPoints: Vector3[][] = [];
    const weights: number[][] = [];
    
    for (let i = 0; i < circle.controlPoints.length; i++) {
      const cp = circle.controlPoints[i];
      controlPoints[i] = [
        cp,
        { x: cp.x + topOffset.x, y: cp.y + topOffset.y, z: cp.z + topOffset.z }
      ];
      weights[i] = [circle.weights[i], circle.weights[i]];
    }
    
    return new NurbsSurfaceEvaluator(
      2, 1,
      controlPoints,
      weights,
      circle.knots,
      [0, 0, 1, 1]
    );
  }
}

