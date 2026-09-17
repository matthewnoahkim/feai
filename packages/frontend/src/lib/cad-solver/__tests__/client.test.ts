/**
 * cad-solver client: request shapes and error mapping against a mocked fetch.
 */

import { cadSolverClient, CadApiError } from '../client';

const ok = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const fail = (status: number, detail?: string) =>
  ({
    ok: false,
    status,
    statusText: 'ERR',
    json: async () => {
      if (detail) return { detail };
      throw new Error('no body');
    },
  }) as unknown as Response;

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  (global as any).fetch = fetchMock;
});

test('extrude POSTs JSON to /extrude and returns the parsed body', async () => {
  const result = { shapeId: 's1', mesh: { positions: [], normals: [], indices: [] }, edges: [], massProperties: {} };
  fetchMock.mockResolvedValue(ok(result));

  const req = {
    profile: { type: 'rectangle' as const, data: { corner1: { x: 0, y: 0 }, corner2: { x: 1, y: 1 } } },
    plane: { origin: [0, 0, 0], normal: [0, 0, 1], xAxis: [1, 0, 0] },
    params: {
      depth1: 5, flipDirection1: false, useSecondDirection: false, depth2: 0,
      useDraft: false, draftAngle: 0, draftOutward: false, endCondition1: 'blind',
    },
  };
  await expect(cadSolverClient.extrude(req)).resolves.toEqual(result);

  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/extrude$/);
  expect(init.method).toBe('POST');
  expect(init.headers['Content-Type']).toBe('application/json');
  expect(JSON.parse(init.body)).toEqual(req);
});

test('importMesh hits /import/mesh', async () => {
  fetchMock.mockResolvedValue(ok({ shapeId: 'm1' }));
  await cadSolverClient.importMesh({ positions: [0, 0, 0], indices: [0, 0, 0] });
  expect(fetchMock.mock.calls[0][0]).toMatch(/\/import\/mesh$/);
});

test('tetrahedralMesh POSTs JSON to /mesh/tetrahedral and returns the parsed body', async () => {
  const result = {
    nodes: [{ id: 1, x: 0, y: 0, z: 0 }],
    elements: [{ id: 1, nodeIds: [1, 2, 3, 4] }],
    boundaryFaces: [{ faceIndex: 0, triangles: [[1, 2, 3]] }],
  };
  fetchMock.mockResolvedValue(ok(result));

  await expect(cadSolverClient.tetrahedralMesh({ shapeId: 's1', maxElementSize: 5 })).resolves.toEqual(result);

  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/mesh\/tetrahedral$/);
  expect(JSON.parse(init.body)).toEqual({ shapeId: 's1', maxElementSize: 5 });
});

test('non-2xx responses throw CadApiError carrying the server detail and status', async () => {
  fetchMock.mockResolvedValue(fail(404, 'Unknown shapeId: x'));
  const promise = cadSolverClient.fillet({ shapeId: 'x', edgeIndices: [], radius: 1 });
  await expect(promise).rejects.toBeInstanceOf(CadApiError);
  await expect(promise).rejects.toMatchObject({ status: 404, message: 'Unknown shapeId: x' });
});

test('non-2xx without a JSON body falls back to an HTTP status message', async () => {
  fetchMock.mockResolvedValue(fail(500));
  await expect(cadSolverClient.makePrimitive({ type: 'box', params: {} }))
    .rejects.toMatchObject({ status: 500, message: 'HTTP 500: ERR' });
});
