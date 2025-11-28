// ============================================================================
// Matrix Mathematics
// ============================================================================

import { Matrix4 as Matrix4Type, Vector3 } from '@feai/shared';
import { Vec3, Vec4 } from './vector';
import { Quat } from './quaternion';

export class Mat4 {
  // Column-major storage for WebGL compatibility
  public elements: Float64Array;

  constructor(elements?: number[] | Float64Array) {
    this.elements = new Float64Array(16);
    if (elements) {
      for (let i = 0; i < 16; i++) {
        this.elements[i] = elements[i] || 0;
      }
    } else {
      this.identity();
    }
  }

  static identity(): Mat4 {
    const m = new Mat4();
    m.elements[0] = 1;
    m.elements[5] = 1;
    m.elements[10] = 1;
    m.elements[15] = 1;
    return m;
  }

  static zero(): Mat4 {
    return new Mat4();
  }

  identity(): Mat4 {
    this.elements.fill(0);
    this.elements[0] = 1;
    this.elements[5] = 1;
    this.elements[10] = 1;
    this.elements[15] = 1;
    return this;
  }

  clone(): Mat4 {
    return new Mat4(Array.from(this.elements));
  }

  toArray(): Matrix4Type {
    return Array.from(this.elements) as Matrix4Type;
  }

  // Element access (row, col) - converts to column-major index
  get(row: number, col: number): number {
    return this.elements[col * 4 + row];
  }

  set(row: number, col: number, value: number): void {
    this.elements[col * 4 + row] = value;
  }

  // Matrix multiplication
  multiply(m: Mat4): Mat4 {
    const a = this.elements;
    const b = m.elements;
    const result = new Mat4();
    const r = result.elements;

    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[k * 4 + row] * b[col * 4 + k];
        }
        r[col * 4 + row] = sum;
      }
    }
    return result;
  }

  premultiply(m: Mat4): Mat4 {
    return m.multiply(this);
  }

  // Transform a point
  transformPoint(v: Vector3): Vec3 {
    const e = this.elements;
    const w = e[3] * v.x + e[7] * v.y + e[11] * v.z + e[15];
    const invW = w !== 0 ? 1 / w : 1;
    return new Vec3(
      (e[0] * v.x + e[4] * v.y + e[8] * v.z + e[12]) * invW,
      (e[1] * v.x + e[5] * v.y + e[9] * v.z + e[13]) * invW,
      (e[2] * v.x + e[6] * v.y + e[10] * v.z + e[14]) * invW
    );
  }

  // Transform a direction (no translation)
  transformDirection(v: Vector3): Vec3 {
    const e = this.elements;
    return new Vec3(
      e[0] * v.x + e[4] * v.y + e[8] * v.z,
      e[1] * v.x + e[5] * v.y + e[9] * v.z,
      e[2] * v.x + e[6] * v.y + e[10] * v.z
    ).normalize();
  }

  // Transform a normal (requires inverse transpose for non-uniform scale)
  transformNormal(v: Vector3): Vec3 {
    // For proper normal transformation, use inverse transpose
    const inv = this.inverse();
    if (!inv) return new Vec3(v.x, v.y, v.z);
    const e = inv.elements;
    return new Vec3(
      e[0] * v.x + e[1] * v.y + e[2] * v.z,
      e[4] * v.x + e[5] * v.y + e[6] * v.z,
      e[8] * v.x + e[9] * v.y + e[10] * v.z
    ).normalize();
  }

  // Determinant
  determinant(): number {
    const e = this.elements;
    const n11 = e[0], n12 = e[4], n13 = e[8], n14 = e[12];
    const n21 = e[1], n22 = e[5], n23 = e[9], n24 = e[13];
    const n31 = e[2], n32 = e[6], n33 = e[10], n34 = e[14];
    const n41 = e[3], n42 = e[7], n43 = e[11], n44 = e[15];

    return (
      n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
      n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
      n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
      n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)
    );
  }

  // Inverse
  inverse(): Mat4 | null {
    const e = this.elements;
    const n11 = e[0], n12 = e[4], n13 = e[8], n14 = e[12];
    const n21 = e[1], n22 = e[5], n23 = e[9], n24 = e[13];
    const n31 = e[2], n32 = e[6], n33 = e[10], n34 = e[14];
    const n41 = e[3], n42 = e[7], n43 = e[11], n44 = e[15];

    const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
    const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
    const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
    const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) return null;

    const detInv = 1 / det;
    const result = new Mat4();
    const r = result.elements;

    r[0] = t11 * detInv;
    r[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    r[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    r[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

    r[4] = t12 * detInv;
    r[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    r[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    r[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

    r[8] = t13 * detInv;
    r[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    r[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    r[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

    r[12] = t14 * detInv;
    r[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    r[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    r[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

    return result;
  }

  // Transpose
  transpose(): Mat4 {
    const result = new Mat4();
    const e = this.elements;
    const r = result.elements;
    
    r[0] = e[0]; r[1] = e[4]; r[2] = e[8]; r[3] = e[12];
    r[4] = e[1]; r[5] = e[5]; r[6] = e[9]; r[7] = e[13];
    r[8] = e[2]; r[9] = e[6]; r[10] = e[10]; r[11] = e[14];
    r[12] = e[3]; r[13] = e[7]; r[14] = e[11]; r[15] = e[15];
    
    return result;
  }

  // Factory methods
  static translation(x: number, y: number, z: number): Mat4 {
    const m = Mat4.identity();
    m.elements[12] = x;
    m.elements[13] = y;
    m.elements[14] = z;
    return m;
  }

  static translationV(v: Vector3): Mat4 {
    return Mat4.translation(v.x, v.y, v.z);
  }

  static scale(x: number, y: number, z: number): Mat4 {
    const m = new Mat4();
    m.elements[0] = x;
    m.elements[5] = y;
    m.elements[10] = z;
    m.elements[15] = 1;
    return m;
  }

  static scaleUniform(s: number): Mat4 {
    return Mat4.scale(s, s, s);
  }

  static rotationX(angle: number): Mat4 {
    const m = Mat4.identity();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    m.elements[5] = c;
    m.elements[6] = s;
    m.elements[9] = -s;
    m.elements[10] = c;
    return m;
  }

  static rotationY(angle: number): Mat4 {
    const m = Mat4.identity();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    m.elements[0] = c;
    m.elements[2] = -s;
    m.elements[8] = s;
    m.elements[10] = c;
    return m;
  }

  static rotationZ(angle: number): Mat4 {
    const m = Mat4.identity();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    m.elements[0] = c;
    m.elements[1] = s;
    m.elements[4] = -s;
    m.elements[5] = c;
    return m;
  }

  static rotationAxis(axis: Vector3, angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const n = new Vec3(axis.x, axis.y, axis.z).normalize();
    const x = n.x, y = n.y, z = n.z;

    const m = new Mat4();
    const e = m.elements;

    e[0] = t * x * x + c;
    e[1] = t * x * y + s * z;
    e[2] = t * x * z - s * y;
    e[3] = 0;

    e[4] = t * x * y - s * z;
    e[5] = t * y * y + c;
    e[6] = t * y * z + s * x;
    e[7] = 0;

    e[8] = t * x * z + s * y;
    e[9] = t * y * z - s * x;
    e[10] = t * z * z + c;
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;

    return m;
  }

  static fromQuaternion(q: Quat): Mat4 {
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    const m = new Mat4();
    const e = m.elements;

    e[0] = 1 - (yy + zz);
    e[1] = xy + wz;
    e[2] = xz - wy;
    e[3] = 0;

    e[4] = xy - wz;
    e[5] = 1 - (xx + zz);
    e[6] = yz + wx;
    e[7] = 0;

    e[8] = xz + wy;
    e[9] = yz - wx;
    e[10] = 1 - (xx + yy);
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;

    return m;
  }

  static compose(position: Vector3, quaternion: Quat, scale: Vector3): Mat4 {
    const m = Mat4.fromQuaternion(quaternion);
    const e = m.elements;

    // Apply scale
    e[0] *= scale.x; e[1] *= scale.x; e[2] *= scale.x;
    e[4] *= scale.y; e[5] *= scale.y; e[6] *= scale.y;
    e[8] *= scale.z; e[9] *= scale.z; e[10] *= scale.z;

    // Apply translation
    e[12] = position.x;
    e[13] = position.y;
    e[14] = position.z;

    return m;
  }

  decompose(): { position: Vec3; quaternion: Quat; scale: Vec3 } {
    const e = this.elements;
    
    // Extract scale
    const sx = new Vec3(e[0], e[1], e[2]).length();
    const sy = new Vec3(e[4], e[5], e[6]).length();
    const sz = new Vec3(e[8], e[9], e[10]).length();
    
    // Check for reflection
    const det = this.determinant();
    const scale = new Vec3(
      det < 0 ? -sx : sx,
      sy,
      sz
    );

    // Extract position
    const position = new Vec3(e[12], e[13], e[14]);

    // Extract rotation (remove scale)
    const rotMat = this.clone();
    const invSX = 1 / scale.x;
    const invSY = 1 / scale.y;
    const invSZ = 1 / scale.z;
    
    rotMat.elements[0] *= invSX;
    rotMat.elements[1] *= invSX;
    rotMat.elements[2] *= invSX;
    rotMat.elements[4] *= invSY;
    rotMat.elements[5] *= invSY;
    rotMat.elements[6] *= invSY;
    rotMat.elements[8] *= invSZ;
    rotMat.elements[9] *= invSZ;
    rotMat.elements[10] *= invSZ;

    const quaternion = Quat.fromMatrix(rotMat);

    return { position, quaternion, scale };
  }

  // Camera matrices
  static lookAt(eye: Vector3, target: Vector3, up: Vector3): Mat4 {
    const e = new Vec3(eye.x, eye.y, eye.z);
    const t = new Vec3(target.x, target.y, target.z);
    const u = new Vec3(up.x, up.y, up.z);

    const z = e.sub(t).normalize();
    const x = u.cross(z).normalize();
    const y = z.cross(x);

    const m = new Mat4();
    const el = m.elements;

    el[0] = x.x; el[4] = x.y; el[8] = x.z; el[12] = -x.dot(e);
    el[1] = y.x; el[5] = y.y; el[9] = y.z; el[13] = -y.dot(e);
    el[2] = z.x; el[6] = z.y; el[10] = z.z; el[14] = -z.dot(e);
    el[3] = 0; el[7] = 0; el[11] = 0; el[15] = 1;

    return m;
  }

  static perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);

    const m = new Mat4();
    const e = m.elements;

    e[0] = f / aspect;
    e[5] = f;
    e[10] = (far + near) * nf;
    e[11] = -1;
    e[14] = 2 * far * near * nf;

    return m;
  }

  static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
    const w = 1 / (right - left);
    const h = 1 / (top - bottom);
    const p = 1 / (far - near);

    const m = new Mat4();
    const e = m.elements;

    e[0] = 2 * w;
    e[5] = 2 * h;
    e[10] = -2 * p;
    e[12] = -(right + left) * w;
    e[13] = -(top + bottom) * h;
    e[14] = -(far + near) * p;
    e[15] = 1;

    return m;
  }
}

// Export Mat4 as Matrix4 for code that uses Matrix4 as a constructor
export { Mat4 as Matrix4 };

