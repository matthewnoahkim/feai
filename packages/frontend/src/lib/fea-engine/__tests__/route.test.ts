/**
 * POST /api/solver/analyze end to end: gzipped body (how the browser sends a big MSH),
 * auth/rate-limit mocked, status-code mapping.
 */

jest.mock('@/lib/auth', () => ({ requireAuth: jest.fn(async () => ({ user: { id: 'u1' }, error: null })) }));
jest.mock('@/lib/rateLimit', () => ({ checkAndRecordRateLimit: jest.fn(() => true) }));

import { NextRequest } from 'next/server';
import { gzipSync } from 'zlib';
import { POST } from '@/app/api/solver/analyze/route';
import { requireAuth } from '@/lib/auth';
import { checkAndRecordRateLimit } from '@/lib/rateLimit';

const request = {
  mesh: { type: 'box', min: [0, 0, 0], max: [100, 10, 10], subdivisions: [10, 2, 2] },
  materials: { default: 'steel_structural' },
  units: { type: 'SI_MM' },
  boundary_conditions: [
    { type: 'displacement', target: { type: 'box', min: [0, 0, 0], max: [0, 10, 10] }, values: [0, null, null] },
    { type: 'displacement', target: { type: 'point', location: [0, 0, 0] }, values: [null, 0, 0] },
    { type: 'displacement', target: { type: 'point', location: [0, 10, 0] }, values: [null, null, 0] },
  ],
  loads: [{ type: 'surface_force', target: { type: 'box', min: [100, 0, 0], max: [100, 10, 10] }, force_per_area: [1e6, 0, 0] }],
};

const post = (body: Buffer | string, headers: Record<string, string> = {}) =>
  POST(new NextRequest('http://localhost/api/solver/analyze', { method: 'POST', body: typeof body === 'string' ? body : new Uint8Array(body), headers }));

test('solves a plain JSON request and returns a completed job with results and a VTU', async () => {
  const res = await post(JSON.stringify(request));
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.status).toBe('completed');
  expect(data.results.job_id).toBe(data.job_id);
  expect(data.results.displacements.max.x).toBeCloseTo(5e-7, 12);
  expect(data.results.output_files.vtk).toBe('results.vtu');
  expect(data.vtu).toContain('<VTKFile');
});

test('accepts a gzipped body flagged with X-Body-Encoding', async () => {
  const res = await post(gzipSync(JSON.stringify(request)), { 'x-body-encoding': 'gzip' });
  expect(res.status).toBe(200);
  expect((await res.json()).results.stress.von_mises.max).toBeCloseTo(1e6, -1);
});

test('unsupported input is a 400 with the reason', async () => {
  const res = await post(JSON.stringify({ ...request, solver_options: { fe_degree: 2 } }));
  expect(res.status).toBe(400);
  expect((await res.json()).error).toMatch(/fe_degree 2/);
});

test('a model that cannot be solved is a 422, not a 500', async () => {
  const res = await post(JSON.stringify({
    ...request,
    boundary_conditions: [request.boundary_conditions[0]], // rigid-body motion left free
    loads: [{ type: 'surface_force', target: { type: 'box', min: [100, 0, 0], max: [100, 10, 10] }, force_per_area: [1e6, 1e5, 0] }],
  }));
  expect(res.status).toBe(422);
  expect((await res.json()).error).toMatch(/did not converge|out of time/);
});

test('malformed bodies are a 400', async () => {
  expect((await post('not json')).status).toBe(400);
  expect((await post(Buffer.from('not gzip'), { 'x-body-encoding': 'gzip' })).status).toBe(400);
  expect((await post(JSON.stringify({ mesh: request.mesh }))).status).toBe(400);
});

test('requires login and honors the rate limit', async () => {
  (requireAuth as jest.Mock).mockResolvedValueOnce({ user: null, error: new Response('nope', { status: 401 }) });
  expect((await post(JSON.stringify(request))).status).toBe(401);

  (checkAndRecordRateLimit as jest.Mock).mockReturnValueOnce(false);
  expect((await post(JSON.stringify(request))).status).toBe(429);
});
