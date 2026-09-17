/**
 * Closed-form face-to-face mate solving — the math behind the Assembly phase.
 *
 * There's no DOF/simultaneous constraint solver here (and no such concept in cad-server
 * either — see freecad_ops.py's note "no assembly concept yet"). A mate here is solved
 * in one shot, independent of any other mate on the same instance: given a moving
 * instance's own face (in its own part's local coordinates) and a required world-space
 * (centroid, normal) for that face to land on, this computes the single rigid transform
 * that puts it there, discarding whatever transform the instance had before. Multiple
 * mates on the same instance simply overwrite each other's result — the last one solved
 * wins — rather than being reconciled together, which is the real, stated scope boundary
 * a full assembly solver wouldn't have.
 */

export type Vec3 = [number, number, number]

/** Row-major flattened 4x4, matching this codebase's one other "matrix as flat array"
 * precedent (ShapeResult.massProperties.momentOfInertia — see cad-server's schemas.py). */
export type Mat4 = number[]

export function identityTransform(): Mat4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2])
  if (len < 1e-12) return [0, 0, 1]
  return [v[0] / len, v[1] / len, v[2] / len]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/** A vector perpendicular to `v` (v need not be normalized), for the 180°-rotation edge
 * case in rotationBetweenVectors where cross(a,b) is degenerate. */
function anyPerpendicular(v: Vec3): Vec3 {
  const ax = Math.abs(v[0]), ay = Math.abs(v[1]), az = Math.abs(v[2])
  // Cross with whichever world axis is least parallel to v, to avoid a near-zero result.
  const axis: Vec3 = ax <= ay && ax <= az ? [1, 0, 0] : ay <= az ? [0, 1, 0] : [0, 0, 1]
  return normalize(cross(v, axis))
}

/** The 3x3 rotation matrix (as a row-major 3x3, 9 numbers) that rotates unit vector `a`
 * onto unit vector `b`, via Rodrigues' rotation formula. */
function rotationBetweenVectors(a: Vec3, b: Vec3): number[] {
  const v = cross(a, b)
  const c = dot(a, b)
  const s2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2] // sin^2(angle)

  if (s2 < 1e-12) {
    if (c > 0) return [1, 0, 0, 0, 1, 0, 0, 0, 1] // already aligned
    // Anti-parallel: rotate 180° about any axis perpendicular to `a`.
    const axis = anyPerpendicular(a)
    const [x, y, z] = axis
    return [
      2 * x * x - 1, 2 * x * y, 2 * x * z,
      2 * x * y, 2 * y * y - 1, 2 * y * z,
      2 * x * z, 2 * y * z, 2 * z * z - 1,
    ]
  }

  const [vx, vy, vz] = v
  const k = (1 - c) / s2
  // R = I + [v]_x + [v]_x^2 * k, where [v]_x is v's skew-symmetric cross-product matrix.
  return [
    1 + (-vz * vz - vy * vy) * k, -vz + vx * vy * k, vy + vx * vz * k,
    vz + vx * vy * k, 1 + (-vz * vz - vx * vx) * k, -vx + vy * vz * k,
    -vy + vx * vz * k, vx + vy * vz * k, 1 + (-vy * vy - vx * vx) * k,
  ]
}

/** The single rigid transform (rotation + translation) that carries a part's own local
 * (faceCentroid, faceNormal) to the given required world-space (centroid, normal). */
export function solveFaceMateTransform(
  localFaceCentroid: Vec3,
  localFaceNormal: Vec3,
  requiredWorldCentroid: Vec3,
  requiredWorldNormal: Vec3
): Mat4 {
  const n = normalize(localFaceNormal)
  const targetN = normalize(requiredWorldNormal)
  const r = rotationBetweenVectors(n, targetN)

  // Where the rotation alone (about the origin) sends the local centroid.
  const rc: Vec3 = [
    r[0] * localFaceCentroid[0] + r[1] * localFaceCentroid[1] + r[2] * localFaceCentroid[2],
    r[3] * localFaceCentroid[0] + r[4] * localFaceCentroid[1] + r[5] * localFaceCentroid[2],
    r[6] * localFaceCentroid[0] + r[7] * localFaceCentroid[1] + r[8] * localFaceCentroid[2],
  ]
  const t: Vec3 = [
    requiredWorldCentroid[0] - rc[0],
    requiredWorldCentroid[1] - rc[1],
    requiredWorldCentroid[2] - rc[2],
  ]

  return [
    r[0], r[1], r[2], t[0],
    r[3], r[4], r[5], t[1],
    r[6], r[7], r[8], t[2],
    0, 0, 0, 1,
  ]
}

export function transformPoint(m: Mat4, p: Vec3): Vec3 {
  return [
    m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3],
    m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7],
    m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11],
  ]
}

/** Rotation-only (drops translation) — for transforming a normal/direction vector. */
export function transformDirection(m: Mat4, d: Vec3): Vec3 {
  return normalize([
    m[0] * d[0] + m[1] * d[1] + m[2] * d[2],
    m[4] * d[0] + m[5] * d[1] + m[6] * d[2],
    m[8] * d[0] + m[9] * d[1] + m[10] * d[2],
  ])
}
