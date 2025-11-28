// ============================================================================
// Quaternion Mathematics
// ============================================================================

import { Quaternion as IQuaternion, Vector3 } from '@feai/shared';
import { Vec3 } from './vector';
import { Mat4 } from './matrix';

export class Quat implements IQuaternion {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
    public w: number = 1
  ) {}

  static identity(): Quat {
    return new Quat(0, 0, 0, 1);
  }

  clone(): Quat {
    return new Quat(this.x, this.y, this.z, this.w);
  }

  toArray(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  normalize(): Quat {
    const len = this.length();
    if (len === 0) return new Quat(0, 0, 0, 1);
    const invLen = 1 / len;
    return new Quat(this.x * invLen, this.y * invLen, this.z * invLen, this.w * invLen);
  }

  conjugate(): Quat {
    return new Quat(-this.x, -this.y, -this.z, this.w);
  }

  inverse(): Quat {
    const lenSq = this.lengthSquared();
    if (lenSq === 0) return new Quat(0, 0, 0, 1);
    const invLen = 1 / lenSq;
    return new Quat(-this.x * invLen, -this.y * invLen, -this.z * invLen, this.w * invLen);
  }

  multiply(q: Quat): Quat {
    return new Quat(
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
    );
  }

  premultiply(q: Quat): Quat {
    return q.multiply(this);
  }

  dot(q: Quat): number {
    return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
  }

  // Rotate a vector by this quaternion
  rotateVector(v: Vector3): Vec3 {
    // q * v * q^-1
    const qv = new Quat(v.x, v.y, v.z, 0);
    const result = this.multiply(qv).multiply(this.conjugate());
    return new Vec3(result.x, result.y, result.z);
  }

  // Spherical linear interpolation
  slerp(q: Quat, t: number): Quat {
    let dot = this.dot(q);
    
    // If the dot product is negative, negate one quaternion
    // to take the shorter arc
    let q2 = q;
    if (dot < 0) {
      dot = -dot;
      q2 = new Quat(-q.x, -q.y, -q.z, -q.w);
    }

    if (dot > 0.9995) {
      // Linear interpolation for nearly identical quaternions
      return new Quat(
        this.x + t * (q2.x - this.x),
        this.y + t * (q2.y - this.y),
        this.z + t * (q2.z - this.z),
        this.w + t * (q2.w - this.w)
      ).normalize();
    }

    const theta0 = Math.acos(dot);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);
    const sinTheta0 = Math.sin(theta0);

    const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
    const s1 = sinTheta / sinTheta0;

    return new Quat(
      s0 * this.x + s1 * q2.x,
      s0 * this.y + s1 * q2.y,
      s0 * this.z + s1 * q2.z,
      s0 * this.w + s1 * q2.w
    );
  }

  // Convert to Euler angles (XYZ order)
  toEuler(): Vec3 {
    const sinrCosp = 2 * (this.w * this.x + this.y * this.z);
    const cosrCosp = 1 - 2 * (this.x * this.x + this.y * this.y);
    const roll = Math.atan2(sinrCosp, cosrCosp);

    let pitch: number;
    const sinp = 2 * (this.w * this.y - this.z * this.x);
    if (Math.abs(sinp) >= 1) {
      pitch = Math.sign(sinp) * Math.PI / 2;
    } else {
      pitch = Math.asin(sinp);
    }

    const sinyCosp = 2 * (this.w * this.z + this.x * this.y);
    const cosyCosp = 1 - 2 * (this.y * this.y + this.z * this.z);
    const yaw = Math.atan2(sinyCosp, cosyCosp);

    return new Vec3(roll, pitch, yaw);
  }

  // Factory methods
  static fromAxisAngle(axis: Vector3, angle: number): Quat {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    const n = new Vec3(axis.x, axis.y, axis.z).normalize();
    return new Quat(n.x * s, n.y * s, n.z * s, Math.cos(halfAngle));
  }

  static fromEuler(x: number, y: number, z: number, order: string = 'XYZ'): Quat {
    const c1 = Math.cos(x / 2);
    const c2 = Math.cos(y / 2);
    const c3 = Math.cos(z / 2);
    const s1 = Math.sin(x / 2);
    const s2 = Math.sin(y / 2);
    const s3 = Math.sin(z / 2);

    switch (order) {
      case 'XYZ':
        return new Quat(
          s1 * c2 * c3 + c1 * s2 * s3,
          c1 * s2 * c3 - s1 * c2 * s3,
          c1 * c2 * s3 + s1 * s2 * c3,
          c1 * c2 * c3 - s1 * s2 * s3
        );
      case 'YXZ':
        return new Quat(
          s1 * c2 * c3 + c1 * s2 * s3,
          c1 * s2 * c3 - s1 * c2 * s3,
          c1 * c2 * s3 - s1 * s2 * c3,
          c1 * c2 * c3 + s1 * s2 * s3
        );
      case 'ZXY':
        return new Quat(
          s1 * c2 * c3 - c1 * s2 * s3,
          c1 * s2 * c3 + s1 * c2 * s3,
          c1 * c2 * s3 + s1 * s2 * c3,
          c1 * c2 * c3 - s1 * s2 * s3
        );
      case 'ZYX':
        return new Quat(
          s1 * c2 * c3 - c1 * s2 * s3,
          c1 * s2 * c3 + s1 * c2 * s3,
          c1 * c2 * s3 - s1 * s2 * c3,
          c1 * c2 * c3 + s1 * s2 * s3
        );
      case 'YZX':
        return new Quat(
          s1 * c2 * c3 + c1 * s2 * s3,
          c1 * s2 * c3 + s1 * c2 * s3,
          c1 * c2 * s3 - s1 * s2 * c3,
          c1 * c2 * c3 - s1 * s2 * s3
        );
      case 'XZY':
        return new Quat(
          s1 * c2 * c3 - c1 * s2 * s3,
          c1 * s2 * c3 - s1 * c2 * s3,
          c1 * c2 * s3 + s1 * s2 * c3,
          c1 * c2 * c3 + s1 * s2 * s3
        );
      default:
        return Quat.identity();
    }
  }

  static fromMatrix(m: Mat4): Quat {
    const e = m.elements;
    const m11 = e[0], m12 = e[4], m13 = e[8];
    const m21 = e[1], m22 = e[5], m23 = e[9];
    const m31 = e[2], m32 = e[6], m33 = e[10];

    const trace = m11 + m22 + m33;

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1.0);
      return new Quat(
        (m32 - m23) * s,
        (m13 - m31) * s,
        (m21 - m12) * s,
        0.25 / s
      );
    } else if (m11 > m22 && m11 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
      return new Quat(
        0.25 * s,
        (m12 + m21) / s,
        (m13 + m31) / s,
        (m32 - m23) / s
      );
    } else if (m22 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
      return new Quat(
        (m12 + m21) / s,
        0.25 * s,
        (m23 + m32) / s,
        (m13 - m31) / s
      );
    } else {
      const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
      return new Quat(
        (m13 + m31) / s,
        (m23 + m32) / s,
        0.25 * s,
        (m21 - m12) / s
      );
    }
  }

  // Rotation between two vectors
  static fromVectors(from: Vector3, to: Vector3): Quat {
    const v1 = new Vec3(from.x, from.y, from.z).normalize();
    const v2 = new Vec3(to.x, to.y, to.z).normalize();

    const dot = v1.dot(v2);

    if (dot > 0.999999) {
      return Quat.identity();
    }

    if (dot < -0.999999) {
      // 180 degree rotation - find orthogonal axis
      let axis = new Vec3(1, 0, 0).cross(v1);
      if (axis.length() < 0.000001) {
        axis = new Vec3(0, 1, 0).cross(v1);
      }
      return Quat.fromAxisAngle(axis.normalize(), Math.PI);
    }

    const axis = v1.cross(v2);
    const angle = Math.acos(dot);
    return Quat.fromAxisAngle(axis.normalize(), angle);
  }

  equals(q: Quat, epsilon: number = 1e-10): boolean {
    return (
      Math.abs(this.x - q.x) < epsilon &&
      Math.abs(this.y - q.y) < epsilon &&
      Math.abs(this.z - q.z) < epsilon &&
      Math.abs(this.w - q.w) < epsilon
    );
  }
}

// Export Quat as Quaternion for code that uses Quaternion as a constructor
export { Quat as Quaternion };

