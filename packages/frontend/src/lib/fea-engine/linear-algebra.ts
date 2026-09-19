/**
 * Block-CSR stiffness storage (3x3 blocks, one per node pair) and a symmetric
 * block-Gauss-Seidel preconditioned conjugate gradient solver. A direct solver isn't
 * viable here: a 3D tetrahedral system's Cholesky fill-in grows far past a serverless
 * function's memory long before the mesh gets interesting, while CG needs only the
 * matrix itself.
 */

export interface BlockCSR {
  n: number // node count; matrix is 3n x 3n
  rowPtr: Int32Array
  colIdx: Int32Array
  vals: Float64Array // 9 per stored block, row-major within each block
  diagPos: Int32Array // index (into colIdx) of each row's diagonal block
}

export function buildPattern(n: number, tets: Int32Array): BlockCSR {
  const tetCount = tets.length / 4
  const keys = new Float64Array(tetCount * 16)
  let k = 0
  for (let e = 0; e < tetCount; e++) {
    for (let a = 0; a < 4; a++) {
      const na = tets[4 * e + a]
      for (let b = 0; b < 4; b++) keys[k++] = na * n + tets[4 * e + b]
    }
  }
  keys.sort()

  const cols: number[] = []
  const rowPtr = new Int32Array(n + 1)
  let prev = -1
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key === prev) continue
    prev = key
    const row = Math.floor(key / n)
    cols.push(key - row * n)
    rowPtr[row + 1]++
  }
  for (let r = 0; r < n; r++) rowPtr[r + 1] += rowPtr[r]

  const colIdx = Int32Array.from(cols)
  const diagPos = new Int32Array(n)
  for (let r = 0; r < n; r++) {
    let lo = rowPtr[r], hi = rowPtr[r + 1] - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (colIdx[mid] === r) { diagPos[r] = mid; break }
      if (colIdx[mid] < r) lo = mid + 1
      else hi = mid - 1
    }
  }
  return { n, rowPtr, colIdx, vals: new Float64Array(colIdx.length * 9), diagPos }
}

function findBlock(K: BlockCSR, row: number, col: number): number {
  let lo = K.rowPtr[row], hi = K.rowPtr[row + 1] - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const c = K.colIdx[mid]
    if (c === col) return mid
    if (c < col) lo = mid + 1
    else hi = mid - 1
  }
  throw new Error('internal: block missing from sparsity pattern')
}

/** Adds the 3x3 slice of a 12x12 element matrix for local nodes (a, b). */
export function addElementBlock(
  K: BlockCSR, nodeA: number, nodeB: number, ke: Float64Array, a: number, b: number
): void {
  const base = findBlock(K, nodeA, nodeB) * 9
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) K.vals[base + 3 * r + c] += ke[(3 * a + r) * 12 + 3 * b + c]
}

export function matvec(K: BlockCSR, x: Float64Array, y: Float64Array): void {
  const { n, rowPtr, colIdx, vals } = K
  for (let i = 0; i < n; i++) {
    let s0 = 0, s1 = 0, s2 = 0
    for (let p = rowPtr[i]; p < rowPtr[i + 1]; p++) {
      const j = 3 * colIdx[p], v = 9 * p
      const x0 = x[j], x1 = x[j + 1], x2 = x[j + 2]
      s0 += vals[v] * x0 + vals[v + 1] * x1 + vals[v + 2] * x2
      s1 += vals[v + 3] * x0 + vals[v + 4] * x1 + vals[v + 5] * x2
      s2 += vals[v + 6] * x0 + vals[v + 7] * x1 + vals[v + 8] * x2
    }
    y[3 * i] = s0
    y[3 * i + 1] = s1
    y[3 * i + 2] = s2
  }
}

function invert3(m: number[]): number[] | null {
  const [a, b, c, d, e, f, g, h, i] = m
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g
  const det = a * A + b * B + c * C
  if (Math.abs(det) < 1e-300) return null
  const id = 1 / det
  return [
    A * id, -(b * i - c * h) * id, (b * f - c * e) * id,
    B * id, (a * i - c * g) * id, -(a * f - c * d) * id,
    C * id, -(a * h - b * g) * id, (a * e - b * d) * id,
  ]
}

/** Inverse of each node's diagonal block, with constrained DOFs replaced by identity
 * rows/columns so they neither pollute nor receive preconditioning. */
function blockJacobi(K: BlockCSR, constrained: Uint8Array): Float64Array {
  const inv = new Float64Array(9 * K.n)
  for (let i = 0; i < K.n; i++) {
    const base = 9 * K.diagPos[i]
    const m = Array.from(K.vals.subarray(base, base + 9))
    for (let d = 0; d < 3; d++) {
      if (constrained[3 * i + d]) {
        for (let o = 0; o < 3; o++) { m[3 * d + o] = 0; m[3 * o + d] = 0 }
        m[3 * d + d] = 1
      }
    }
    const r = invert3(m) ?? [1, 0, 0, 0, 1, 0, 0, 0, 1]
    inv.set(r, 9 * i)
  }
  return inv
}

export interface CgResult {
  x: Float64Array
  iterations: number
  relativeResidual: number
  converged: boolean
  timedOut: boolean
}

/** Solves K_ff x = b on the free DOFs (constrained entries of x stay 0, and b must
 * already be zero there). */
export function solveCG(
  K: BlockCSR,
  b: Float64Array,
  constrained: Uint8Array,
  opts: { tolerance: number; maxIterations: number; deadline: number }
): CgResult {
  const N = 3 * K.n
  const x = new Float64Array(N)
  const r = Float64Array.from(b)
  const z = new Float64Array(N)
  const p = new Float64Array(N)
  const Ap = new Float64Array(N)
  const inv = blockJacobi(K, constrained)

  const y = new Float64Array(N)
  // Symmetric block Gauss-Seidel: z = (D+U)^-1 D (D+L)^-1 r. Costs about one matvec per
  // application (each triangle of the matrix is swept once) and, unlike block-Jacobi,
  // lets each node see its already-updated neighbours, which cuts CG iterations a lot on
  // the slender, badly conditioned models where Jacobi needs thousands.
  const applyM = (src: Float64Array, dst: Float64Array) => {
    const { rowPtr, colIdx, vals, diagPos } = K
    for (let i = 0; i < K.n; i++) {
      const s = 3 * i
      let a0 = src[s], a1 = src[s + 1], a2 = src[s + 2]
      for (let p = rowPtr[i]; p < diagPos[i]; p++) {
        const j = 3 * colIdx[p], v = 9 * p
        a0 -= vals[v] * y[j] + vals[v + 1] * y[j + 1] + vals[v + 2] * y[j + 2]
        a1 -= vals[v + 3] * y[j] + vals[v + 4] * y[j + 1] + vals[v + 5] * y[j + 2]
        a2 -= vals[v + 6] * y[j] + vals[v + 7] * y[j + 1] + vals[v + 8] * y[j + 2]
      }
      const m = 9 * i
      y[s] = constrained[s] ? 0 : inv[m] * a0 + inv[m + 1] * a1 + inv[m + 2] * a2
      y[s + 1] = constrained[s + 1] ? 0 : inv[m + 3] * a0 + inv[m + 4] * a1 + inv[m + 5] * a2
      y[s + 2] = constrained[s + 2] ? 0 : inv[m + 6] * a0 + inv[m + 7] * a1 + inv[m + 8] * a2
    }
    for (let i = K.n - 1; i >= 0; i--) {
      const s = 3 * i
      let a0 = 0, a1 = 0, a2 = 0
      for (let p = diagPos[i] + 1; p < rowPtr[i + 1]; p++) {
        const j = 3 * colIdx[p], v = 9 * p
        a0 += vals[v] * dst[j] + vals[v + 1] * dst[j + 1] + vals[v + 2] * dst[j + 2]
        a1 += vals[v + 3] * dst[j] + vals[v + 4] * dst[j + 1] + vals[v + 5] * dst[j + 2]
        a2 += vals[v + 6] * dst[j] + vals[v + 7] * dst[j + 1] + vals[v + 8] * dst[j + 2]
      }
      const m = 9 * i
      dst[s] = constrained[s] ? 0 : y[s] - (inv[m] * a0 + inv[m + 1] * a1 + inv[m + 2] * a2)
      dst[s + 1] = constrained[s + 1] ? 0 : y[s + 1] - (inv[m + 3] * a0 + inv[m + 4] * a1 + inv[m + 5] * a2)
      dst[s + 2] = constrained[s + 2] ? 0 : y[s + 2] - (inv[m + 6] * a0 + inv[m + 7] * a1 + inv[m + 8] * a2)
    }
  }
  const dot = (u: Float64Array, v: Float64Array) => {
    let s = 0
    for (let i = 0; i < N; i++) s += u[i] * v[i]
    return s
  }

  const bNorm = Math.sqrt(dot(b, b))
  if (bNorm === 0) return { x, iterations: 0, relativeResidual: 0, converged: true, timedOut: false }

  applyM(r, z)
  p.set(z)
  let rz = dot(r, z)
  let rel = 1
  for (let it = 1; it <= opts.maxIterations; it++) {
    matvec(K, p, Ap)
    for (let i = 0; i < N; i++) if (constrained[i]) Ap[i] = 0
    const pAp = dot(p, Ap)
    if (!(pAp > 0)) return { x, iterations: it, relativeResidual: rel, converged: false, timedOut: false }
    const alpha = rz / pAp
    for (let i = 0; i < N; i++) {
      x[i] += alpha * p[i]
      r[i] -= alpha * Ap[i]
    }
    rel = Math.sqrt(dot(r, r)) / bNorm
    if (rel < opts.tolerance) return { x, iterations: it, relativeResidual: rel, converged: true, timedOut: false }
    if (it % 25 === 0 && Date.now() > opts.deadline) {
      return { x, iterations: it, relativeResidual: rel, converged: false, timedOut: true }
    }
    applyM(r, z)
    const rzNew = dot(r, z)
    const beta = rzNew / rz
    rz = rzNew
    for (let i = 0; i < N; i++) p[i] = z[i] + beta * p[i]
  }
  return { x, iterations: opts.maxIterations, relativeResidual: rel, converged: false, timedOut: false }
}
