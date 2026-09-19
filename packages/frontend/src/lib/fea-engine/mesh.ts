/**
 * Tetrahedral mesh inputs for the in-app solver: a Gmsh MSH 2.2 ASCII reader (what
 * workflowMeshToGmshMsh22 writes, and what cad-server's gmsh mesh is encoded as) and a
 * structured box generator (the request's `mesh.type: 'box'` form).
 */

export class SolverInputError extends Error {
  constructor(message: string, public details?: string[]) {
    super(message)
    this.name = 'SolverInputError'
  }
}

/** Zero-based, compact (no unused nodes) linear tetrahedral mesh. */
export interface TetMesh {
  nodes: Float64Array // 3 * nodeCount, xyz in the mesh's own length unit
  tets: Int32Array // 4 * tetCount
}

export function nodeCount(m: TetMesh): number {
  return m.nodes.length / 3
}

export function tetCount(m: TetMesh): number {
  return m.tets.length / 4
}

/** Drops nodes no tet references (a Gmsh file also lists boundary-only nodes of lower-
 * dimensional elements) — an unreferenced node has no stiffness, which would leave a
 * singular row in the system. */
function compact(nodesXYZ: Float64Array, tets: Int32Array): TetMesh {
  const used = new Int32Array(nodesXYZ.length / 3).fill(-1)
  let count = 0
  for (let i = 0; i < tets.length; i++) {
    if (used[tets[i]] < 0) used[tets[i]] = count++
  }
  const nodes = new Float64Array(count * 3)
  for (let old = 0; old < used.length; old++) {
    const n = used[old]
    if (n >= 0) {
      nodes[3 * n] = nodesXYZ[3 * old]
      nodes[3 * n + 1] = nodesXYZ[3 * old + 1]
      nodes[3 * n + 2] = nodesXYZ[3 * old + 2]
    }
  }
  const remapped = new Int32Array(tets.length)
  for (let i = 0; i < tets.length; i++) remapped[i] = used[tets[i]]
  return { nodes, tets: remapped }
}

export function parseMsh22(text: string): TetMesh {
  const lines = text.split(/\r?\n/)
  let i = 0
  const next = () => (i < lines.length ? lines[i++].trim() : '')

  let sawFormat = false
  const idToIndex = new Map<number, number>()
  let nodesXYZ = new Float64Array(0)
  const tetList: number[] = []

  while (i < lines.length) {
    const line = next()
    if (line === '$MeshFormat') {
      sawFormat = true
      const version = next().split(/\s+/)[0]
      if (!version.startsWith('2')) {
        throw new SolverInputError(`Unsupported MSH version ${version}; only MSH 2.2 ASCII is supported`)
      }
      if (next().split(/\s+/)[1] === '1') throw new SolverInputError('Binary MSH files are not supported')
    } else if (line === '$Nodes') {
      const n = parseInt(next(), 10)
      nodesXYZ = new Float64Array(n * 3)
      for (let k = 0; k < n; k++) {
        const parts = next().split(/\s+/)
        idToIndex.set(parseInt(parts[0], 10), k)
        nodesXYZ[3 * k] = parseFloat(parts[1])
        nodesXYZ[3 * k + 1] = parseFloat(parts[2])
        nodesXYZ[3 * k + 2] = parseFloat(parts[3])
      }
    } else if (line === '$Elements') {
      const n = parseInt(next(), 10)
      for (let k = 0; k < n; k++) {
        const parts = next().split(/\s+/)
        const type = parseInt(parts[1], 10)
        if (type !== 4) continue // linear tetrahedra only; lines/triangles/etc. carry no volume
        const numTags = parseInt(parts[2], 10)
        const first = 3 + numTags
        for (let c = 0; c < 4; c++) {
          const idx = idToIndex.get(parseInt(parts[first + c], 10))
          if (idx === undefined) throw new SolverInputError('MSH tetrahedron references an unknown node')
          tetList.push(idx)
        }
      }
    }
  }

  if (!sawFormat) throw new SolverInputError('Not a Gmsh MSH file (missing $MeshFormat)')
  if (tetList.length === 0) throw new SolverInputError('MSH file contains no linear tetrahedra (element type 4)')
  const bad = nodesXYZ.some((v) => !Number.isFinite(v))
  if (bad) throw new SolverInputError('MSH file contains non-finite node coordinates')
  return compact(nodesXYZ, Int32Array.from(tetList))
}

/** Decodes a request's `mesh.data`: base64 (the default encodeFileMeshData produces) or
 * raw MSH text. */
export function decodeMeshData(data: string): string {
  if (data.trimStart().startsWith('$MeshFormat')) return data
  return Buffer.from(data, 'base64').toString('utf8')
}

/** Structured box, six Kuhn tetrahedra per cell — every cell is split along its (0,0,0)
 * to (1,1,1) diagonal, which is conforming across neighboring cells (unlike an
 * arbitrary per-cell split). */
export function boxMesh(
  min: [number, number, number],
  max: [number, number, number],
  subdivisions: [number, number, number]
): TetMesh {
  const [nx, ny, nz] = subdivisions.map((s) => Math.max(1, Math.round(s))) as [number, number, number]
  const px = nx + 1, py = ny + 1, pz = nz + 1
  const nodes = new Float64Array(px * py * pz * 3)
  const id = (i: number, j: number, k: number) => i + px * (j + py * k)
  for (let k = 0; k < pz; k++)
    for (let j = 0; j < py; j++)
      for (let i = 0; i < px; i++) {
        const n = id(i, j, k)
        nodes[3 * n] = min[0] + ((max[0] - min[0]) * i) / nx
        nodes[3 * n + 1] = min[1] + ((max[1] - min[1]) * j) / ny
        nodes[3 * n + 2] = min[2] + ((max[2] - min[2]) * k) / nz
      }

  const perms = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
  ]
  const tets = new Int32Array(nx * ny * nz * 6 * 4)
  let t = 0
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++)
        for (const p of perms) {
          const c = [i, j, k]
          tets[t++] = id(c[0], c[1], c[2])
          c[p[0]]++
          tets[t++] = id(c[0], c[1], c[2])
          c[p[1]]++
          tets[t++] = id(c[0], c[1], c[2])
          c[p[2]]++
          tets[t++] = id(c[0], c[1], c[2])
        }
  return { nodes, tets }
}
