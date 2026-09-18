/**
 * FEAI Modeling Engine API Client — HTTP client for packages/cad-server.
 *
 * Same pattern as ../fea-solver/client.ts: a standalone service the frontend calls
 * instead of doing geometry locally. Every op returns a full ShapeResult (mesh + edge
 * polylines for picking + mass properties + a shapeId to reference in later boolean/
 * fillet/chamfer calls).
 */

import type {
  BooleanRequest,
  CadApiErrorBody,
  ChamferRequest,
  CircularPatternRequest,
  DirectEditRequest,
  ExportRequest,
  ExtrudeRequest,
  FilletRequest,
  LinearPatternRequest,
  LoftRequest,
  MeshImportRequest,
  MirrorRequest,
  PrimitiveRequest,
  RevolveRequest,
  ShapeResult,
  ShellRequest,
  StepImportRequest,
  SweepRequest,
  TetMeshResult,
  TetrahedralMeshRequest,
} from './types'

// Proxied through our own Next.js server (app/api/cad/[...path]/route.ts) rather than
// calling packages/cad-server directly - that route attaches the shared secret cad-server
// requires and enforces login + rate limiting, none of which a direct browser call could
// do without shipping the secret to the browser.
const API_BASE_URL = '/api/cad'

export class CadApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'CadApiError'
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const errorData: CadApiErrorBody = await response.json().catch(() => ({
      detail: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new CadApiError(errorData.detail, response.status)
  }
  return response.json()
}

export async function makePrimitive(request: PrimitiveRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/primitives', request)
}

export async function extrude(request: ExtrudeRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/extrude', request)
}

export async function revolve(request: RevolveRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/revolve', request)
}

export async function sweep(request: SweepRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/sweep', request)
}

export async function loft(request: LoftRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/loft', request)
}

export async function booleanOp(request: BooleanRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/boolean', request)
}

export async function fillet(request: FilletRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/fillet', request)
}

export async function chamfer(request: ChamferRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/chamfer', request)
}

export async function deleteShape(shapeId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/shapes/${shapeId}`, { method: 'DELETE' })
}

export async function importMesh(request: MeshImportRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/import/mesh', request)
}

export async function linearPattern(request: LinearPatternRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/pattern/linear', request)
}

export async function circularPattern(request: CircularPatternRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/pattern/circular', request)
}

export async function mirror(request: MirrorRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/mirror', request)
}

export async function shell(request: ShellRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/shell', request)
}

/** A STEP/IGES file can contain multiple independent solids, so this returns one
 * ShapeResult per top-level solid rather than a single ShapeResult — a real deviation
 * from every other op in this file, matching cad-server's /import/step contract. */
export async function importStep(request: StepImportRequest): Promise<ShapeResult[]> {
  return post<ShapeResult[]>('/import/step', request)
}

export interface ExportedFile {
  blob: Blob
  filename: string
}

/** /export returns a raw file body (STEP/IGES/BREP bytes), not JSON — so this can't go
 * through post<T>() the way every other op does. */
export async function exportShape(request: ExportRequest): Promise<ExportedFile> {
  const response = await fetch(`${API_BASE_URL}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    const errorData: CadApiErrorBody = await response.json().catch(() => ({
      detail: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new CadApiError(errorData.detail, response.status)
  }
  const disposition = response.headers.get('Content-Disposition') || ''
  const filenameMatch = /filename="?([^"]+)"?/.exec(disposition)
  const filename = filenameMatch?.[1] || `shape.${request.format || 'step'}`
  const blob = await response.blob()
  return { blob, filename }
}

export async function directEdit(request: DirectEditRequest): Promise<ShapeResult> {
  return post<ShapeResult>('/direct-edit', request)
}

/** Real geometry-aware volumetric meshing (gmsh, driven off the actual B-rep) for the
 * FEA workflow's Analysis phase — the replacement for the workflow's earlier bounding-
 * box placeholder mesher (see buildMeshPayload/tupleBoundingBox in fea-solver). */
export async function tetrahedralMesh(request: TetrahedralMeshRequest): Promise<TetMeshResult> {
  return post<TetMeshResult>('/mesh/tetrahedral', request)
}

export const cadSolverClient = {
  makePrimitive,
  extrude,
  revolve,
  sweep,
  loft,
  booleanOp,
  fillet,
  chamfer,
  deleteShape,
  importMesh,
  linearPattern,
  circularPattern,
  mirror,
  shell,
  importStep,
  exportShape,
  directEdit,
  tetrahedralMesh,
}
