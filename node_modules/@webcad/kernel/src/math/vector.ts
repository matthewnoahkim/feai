// ============================================================================
// Vector Mathematics
// ============================================================================

import { Vector2 as IVector2, Vector3 as IVector3, Vector4 as IVector4 } from '@webcad/shared';

// Re-export interface types from shared
export type { IVector2, IVector3, IVector4 };

export class Vec2 implements IVector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  static fromArray(arr: number[]): Vec2 {
    return new Vec2(arr[0] || 0, arr[1] || 0);
  }

  static zero(): Vec2 {
    return new Vec2(0, 0);
  }

  static one(): Vec2 {
    return new Vec2(1, 1);
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  add(v: IVector2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v: IVector2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  mul(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s);
  }

  div(s: number): Vec2 {
    return new Vec2(this.x / s, this.y / s);
  }

  dot(v: IVector2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: IVector2): number {
    return this.x * v.y - this.y * v.x;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vec2 {
    const len = this.length();
    if (len === 0) return new Vec2(0, 0);
    return new Vec2(this.x / len, this.y / len);
  }

  perpendicular(): Vec2 {
    return new Vec2(-this.y, this.x);
  }

  rotate(angle: number): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  distanceTo(v: IVector2): number {
    return this.sub(v).length();
  }

  angleTo(v: IVector2): number {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  lerp(v: IVector2, t: number): Vec2 {
    return new Vec2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t);
  }

  equals(v: IVector2, epsilon: number = 1e-10): boolean {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
  }

  negate(): Vec2 {
    return new Vec2(-this.x, -this.y);
  }

  abs(): Vec2 {
    return new Vec2(Math.abs(this.x), Math.abs(this.y));
  }

  min(v: IVector2): Vec2 {
    return new Vec2(Math.min(this.x, v.x), Math.min(this.y, v.y));
  }

  max(v: IVector2): Vec2 {
    return new Vec2(Math.max(this.x, v.x), Math.max(this.y, v.y));
  }

  scale(s: number): Vec2 {
    return this.mul(s);
  }

  subtract(v: IVector2): Vec2 {
    return this.sub(v);
  }
}

export class Vec3 implements IVector3 {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

  static fromArray(arr: number[]): Vec3 {
    return new Vec3(arr[0] || 0, arr[1] || 0, arr[2] || 0);
  }

  static zero(): Vec3 {
    return new Vec3(0, 0, 0);
  }

  static one(): Vec3 {
    return new Vec3(1, 1, 1);
  }

  static unitX(): Vec3 {
    return new Vec3(1, 0, 0);
  }

  static unitY(): Vec3 {
    return new Vec3(0, 1, 0);
  }

  static unitZ(): Vec3 {
    return new Vec3(0, 0, 1);
  }

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  add(v: IVector3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v: IVector3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  subtract(v: IVector3): Vec3 {
    return this.sub(v);
  }

  mul(s: number): Vec3 {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  }

  scale(s: number): Vec3 {
    return this.mul(s);
  }

  div(s: number): Vec3 {
    return new Vec3(this.x / s, this.y / s, this.z / s);
  }

  dot(v: IVector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: IVector3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize(): Vec3 {
    const len = this.length();
    if (len === 0) return new Vec3(0, 0, 0);
    return new Vec3(this.x / len, this.y / len, this.z / len);
  }

  distanceTo(v: IVector3): number {
    return this.sub(v).length();
  }

  lerp(v: IVector3, t: number): Vec3 {
    return new Vec3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }

  equals(v: IVector3, epsilon: number = 1e-10): boolean {
    return (
      Math.abs(this.x - v.x) < epsilon &&
      Math.abs(this.y - v.y) < epsilon &&
      Math.abs(this.z - v.z) < epsilon
    );
  }

  negate(): Vec3 {
    return new Vec3(-this.x, -this.y, -this.z);
  }

  abs(): Vec3 {
    return new Vec3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
  }

  min(v: IVector3): Vec3 {
    return new Vec3(Math.min(this.x, v.x), Math.min(this.y, v.y), Math.min(this.z, v.z));
  }

  max(v: IVector3): Vec3 {
    return new Vec3(Math.max(this.x, v.x), Math.max(this.y, v.y), Math.max(this.z, v.z));
  }

  project(v: IVector3): Vec3 {
    const vec = new Vec3(v.x, v.y, v.z);
    const denom = vec.dot(vec);
    if (denom === 0) return Vec3.zero();
    return vec.mul(this.dot(v) / denom);
  }

  reflect(normal: IVector3): Vec3 {
    const n = new Vec3(normal.x, normal.y, normal.z).normalize();
    return this.sub(n.mul(2 * this.dot(n)));
  }

  angle(v: IVector3): number {
    const denom = Math.sqrt(this.lengthSquared() * new Vec3(v.x, v.y, v.z).lengthSquared());
    if (denom === 0) return 0;
    const theta = this.dot(v) / denom;
    return Math.acos(Math.max(-1, Math.min(1, theta)));
  }

  static tripleProduct(a: Vec3, b: Vec3, c: Vec3): number {
    return a.dot(b.cross(c));
  }
}

export class Vec4 implements IVector4 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
    public w: number = 0
  ) {}

  static fromArray(arr: number[]): Vec4 {
    return new Vec4(arr[0] || 0, arr[1] || 0, arr[2] || 0, arr[3] || 0);
  }

  static zero(): Vec4 {
    return new Vec4(0, 0, 0, 0);
  }

  clone(): Vec4 {
    return new Vec4(this.x, this.y, this.z, this.w);
  }

  toArray(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }

  add(v: IVector4): Vec4 {
    return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
  }

  sub(v: IVector4): Vec4 {
    return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
  }

  mul(s: number): Vec4 {
    return new Vec4(this.x * s, this.y * s, this.z * s, this.w * s);
  }

  dot(v: IVector4): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  normalize(): Vec4 {
    const len = this.length();
    if (len === 0) return new Vec4(0, 0, 0, 0);
    return new Vec4(this.x / len, this.y / len, this.z / len, this.w / len);
  }

  toVec3(): Vec3 {
    if (this.w === 0) return new Vec3(this.x, this.y, this.z);
    return new Vec3(this.x / this.w, this.y / this.w, this.z / this.w);
  }
}

// Export Vec3 as Vector3 for compatibility with code that uses `new Vector3()`
export { Vec3 as Vector3, Vec2 as Vector2, Vec4 as Vector4 };
