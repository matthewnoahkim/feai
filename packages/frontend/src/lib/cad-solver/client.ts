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
  ExtrudeRequest,
  FilletRequest,
  LoftRequest,
  MeshImportRequest,
  PrimitiveRequest,
  RevolveRequest,
  ShapeResult,
  SweepRequest,
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_CAD_API_URL || 'http://localhost:8000'

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
}

export default cadSolverClient
