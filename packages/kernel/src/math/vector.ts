// ============================================================================
// Vector Mathematics
// ============================================================================

import { Vector2, Vector3, Vector4 } from '@webcad/shared';

export class Vec2 implements Vector2 {
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

  add(v: Vector2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  mul(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s);
  }

  div(s: number): Vec2 {
    return new Vec2(this.x / s, this.y / s);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2): number {
    // 2D cross product returns scalar (z component of 3D cross)
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
    return new Vec2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  distanceTo(v: Vector2): number {
    return this.sub(v).length();
  }

  angleTo(v: Vector2): number {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  lerp(v: Vector2, t: number): Vec2 {
    return new Vec2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t
    );
  }

  equals(v: Vector2, epsilon: number = 1e-10): boolean {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
  }

  negate(): Vec2 {
    return new Vec2(-this.x, -this.y);
  }

  abs(): Vec2 {
    return new Vec2(Math.abs(this.x), Math.abs(this.y));
  }

  min(v: Vector2): Vec2 {
    return new Vec2(Math.min(this.x, v.x), Math.min(this.y, v.y));
  }

  max(v: Vector2): Vec2 {
    return new Vec2(Math.max(this.x, v.x), Math.max(this.y, v.y));
  }
}

export class Vec3 implements Vector3 {
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

  add(v: Vector3): Vec3 {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v: Vector3): Vec3 {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  mul(s: number): Vec3 {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  }

  div(s: number): Vec3 {
    return new Vec3(this.x / s, this.y / s, this.z / s);
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vec3 {
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

  distanceTo(v: Vector3): number {
    return this.sub(v).length();
  }

  lerp(v: Vector3, t: number): Vec3 {
    return new Vec3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }

  equals(v: Vector3, epsilon: number = 1e-10): boolean {
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

  min(v: Vector3): Vec3 {
    return new Vec3(
      Math.min(this.x, v.x),
      Math.min(this.y, v.y),
      Math.min(this.z, v.z)
    );
  }

  max(v: Vector3): Vec3 {
    return new Vec3(
      Math.max(this.x, v.x),
      Math.max(this.y, v.y),
      Math.max(this.z, v.z)
    );
  }

  project(v: Vector3): Vec3 {
    const denom = v.dot(v);
    if (denom === 0) return Vec3.zero();
    return new Vec3(v.x, v.y, v.z).mul(this.dot(v) / denom);
  }

  reflect(normal: Vector3): Vec3 {
    const n = new Vec3(normal.x, normal.y, normal.z).normalize();
    return this.sub(n.mul(2 * this.dot(n)));
  }

  angle(v: Vector3): number {
    const denom = Math.sqrt(this.lengthSquared() * new Vec3(v.x, v.y, v.z).lengthSquared());
    if (denom === 0) return 0;
    const theta = this.dot(v) / denom;
    return Math.acos(Math.max(-1, Math.min(1, theta)));
  }

  static tripleProduct(a: Vec3, b: Vec3, c: Vec3): number {
    return a.dot(b.cross(c));
  }
}

export class Vec4 implements Vector4 {
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

  add(v: Vector4): Vec4 {
    return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
  }

  sub(v: Vector4): Vec4 {
    return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
  }

  mul(s: number): Vec4 {
    return new Vec4(this.x * s, this.y * s, this.z * s, this.w * s);
  }

  dot(v: Vector4): number {
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

