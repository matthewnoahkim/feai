/**
 * documentStore.regenerateModel / importSTLPart against a mocked modeling-engine client.
 */

jest.mock('../../api/client', () => ({ api: {} }));
jest.mock('../../lib/cad-solver/client', () => ({
  cadSolverClient: {
    makePrimitive: jest.fn(),
    extrude: jest.fn(),
    revolve: jest.fn(),
    sweep: jest.fn(),
    loft: jest.fn(),
    booleanOp: jest.fn(),
    fillet: jest.fn(),
    chamfer: jest.fn(),
    importMesh: jest.fn(),
    deleteShape: jest.fn(),
    linearPattern: jest.fn(),
    circularPattern: jest.fn(),
    mirror: jest.fn(),
    shell: jest.fn(),
    importStep: jest.fn(),
    exportShape: jest.fn(),
    directEdit: jest.fn(),
  },
}));

import { useDocumentStore, type Document, type Feature } from '../documentStore';
import { cadSolverClient } from '../../lib/cad-solver/client';

const client = cadSolverClient as jest.Mocked<typeof cadSolverClient>;

const shapeResult = (shapeId: string, volume = 1) => ({
  shapeId,
  mesh: {
    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2],
    faceIndexByTriangle: [0],
  },
  edges: [
    { edgeId: 'e0', points: [0, 0, 0, 1, 0, 0] },
    { edgeId: 'e1', points: [1, 0, 0, 0, 1, 0] },
  ],
  faces: [
    { faceId: 'f0', centroid: [0, 0, 0], normal: [0, 0, 1] },
  ],
  vertices: [
    { vertexId: 'v0', point: [0, 0, 0] },
  ],
  massProperties: {
    volume, surfaceArea: 1, mass: volume, centerOfMass: [0, 0, 0],
    momentOfInertia: [], principalAxes: [], principalMoments: [],
  },
});

const feature = (id: string, type: string, parameters: Record<string, any>): Feature =>
  ({ id, type, name: id, suppressed: false, parameters });

function seed(features: Feature[]) {
  const doc: Document = {
    id: 'doc', name: 'Doc', units: 'mm',
    partStudios: [{ id: 'ps', name: 'PS', features, sketches: new Map(), parts: [] }],
    assemblies: [], drawings: [], activeElementId: 'ps', activeElementType: 'partStudio',
  };
  useDocumentStore.setState({ document: doc });
}

const studio = () => useDocumentStore.getState().document!.partStudios[0];
const regenerate = () => useDocumentStore.getState().regenerateModel('ps');

// The error-path tests below exercise recordError / the import fallback, which log by
// design; keep that noise out of the suite output.
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
  client.makePrimitive.mockResolvedValue(shapeResult('box', 1000));
});

test('extrude with no sketch falls back to a box and stores shapeId, edges and mass properties', async () => {
  seed([feature('f1', 'extrude', { depth1: 10, width: 10, height: 10 })]);
  await regenerate();

  expect(client.makePrimitive).toHaveBeenCalledWith({ type: 'box', params: { width: 10, depth: 10, height: 10 } });
  const [part] = studio().parts;
  expect(part.shapeId).toBe('box');
  expect(part.massProperties?.volume).toBe(1000);
  expect(part.edges).toEqual(shapeResult('box').edges);
  expect(studio().features[0].error).toBeUndefined();
});

test('revolving a semicircle 360° falls back to a native sphere, not the generic cylinder', async () => {
  client.makePrimitive.mockResolvedValue(shapeResult('sphere', 65450));
  seed([]);

  const sketch = await useDocumentStore.getState().createSketch('ps', 'front');
  const entityId = useDocumentStore.getState().addSketchEntity(sketch!.id, {
    type: 'arc',
    construction: false,
    data: { center: { x: 0, y: 0 }, radius: 25, startAngle: -Math.PI / 2, endAngle: Math.PI / 2 },
  });
  await useDocumentStore.getState().addFeature('ps', {
    type: 'revolve', name: 'Revolve 360°', suppressed: false,
    parameters: { sketchId: sketch!.id, profileId: entityId, angle: 360, axisId: 'y-axis' },
  });

  // toCadProfile has no case for 'arc', so the real /revolve endpoint is never a valid
  // call here - this must go through the sphere fallback, not silently through revolve.
  expect(client.revolve).not.toHaveBeenCalled();
  expect(client.makePrimitive).toHaveBeenCalledWith({ type: 'sphere', params: { radius: 25 } });
  expect(studio().parts[0].shapeId).toBe('sphere');
});

test('an explicit primitiveType shortcut (no sketch at all) picks the matching primitive', async () => {
  seed([]);
  client.makePrimitive.mockResolvedValue(shapeResult('cone', 500));
  await useDocumentStore.getState().addFeature('ps', {
    type: 'revolve', name: 'Cone', suppressed: false,
    parameters: { primitiveType: 'cone', radius: 20, radius2: 5, height: 40 },
  });
  expect(client.makePrimitive).toHaveBeenCalledWith({ type: 'cone', params: { radius1: 20, radius2: 5, height: 40 } });
});

test('a non-semicircular arc (no primitiveType, no valid profile) still falls back to a cylinder', async () => {
  seed([]);
  const sketch = await useDocumentStore.getState().createSketch('ps', 'front');
  const entityId = useDocumentStore.getState().addSketchEntity(sketch!.id, {
    type: 'arc',
    construction: false,
    data: { center: { x: 0, y: 0 }, radius: 25, startAngle: 0, endAngle: Math.PI / 4 }, // 45°, not a semicircle
  });
  await useDocumentStore.getState().addFeature('ps', {
    type: 'revolve', name: 'Revolve', suppressed: false,
    parameters: { sketchId: sketch!.id, profileId: entityId, angle: 360 },
  });
  expect(client.makePrimitive).toHaveBeenCalledWith({ type: 'cylinder', params: { radius: 15, height: 30 } });
});

test('body ids derive from the creating feature so picked edge ids survive a regenerate', async () => {
  seed([feature('f1', 'extrude', {})]);
  await regenerate();
  const first = studio().parts[0].id;
  await regenerate();
  expect(first).toBe('body-f1');
  expect(studio().parts[0].id).toBe(first);
});

test('fillet maps picked <partId>-edge-N ids to server indices; empty picks mean all edges', async () => {
  client.fillet.mockResolvedValue(shapeResult('filleted'));

  seed([feature('f1', 'extrude', {}), feature('f2', 'fillet', { radius: 2, edges: [] })]);
  await regenerate();
  expect(client.fillet).toHaveBeenCalledWith({ shapeId: 'box', edgeIndices: [], radius: 2 });

  client.fillet.mockClear();
  seed([
    feature('f1', 'extrude', {}),
    feature('f2', 'fillet', { radius: 2, edges: ['body-f1-edge-3', 'other-part-edge-9', 'body-f1-edge-0'] }),
  ]);
  await regenerate();
  expect(client.fillet).toHaveBeenCalledWith({ shapeId: 'box', edgeIndices: [3, 0], radius: 2 });
  expect(studio().parts[0].shapeId).toBe('filleted');
});

test('chamfer uses distance1 from the dialog, falling back to distance from the chat path', async () => {
  client.chamfer.mockResolvedValue(shapeResult('chamfered'));

  seed([feature('f1', 'extrude', {}), feature('f2', 'chamfer', { distance1: 4, edges: [] })]);
  await regenerate();
  expect(client.chamfer).toHaveBeenLastCalledWith(expect.objectContaining({ distance: 4 }));

  seed([feature('f1', 'extrude', {}), feature('f2', 'chamfer', { distance: 3, edges: [] })]);
  await regenerate();
  expect(client.chamfer).toHaveBeenLastCalledWith(expect.objectContaining({ distance: 3 }));
});

test('linearPattern resolves axis references to real vectors and calls the pattern endpoint', async () => {
  client.linearPattern.mockResolvedValue(shapeResult('patterned'));
  seed([
    feature('f1', 'extrude', {}),
    feature('f2', 'linearPattern', { direction1: 'y-axis', count1: 3, spacing1: 15 }),
  ]);
  await regenerate();
  expect(client.linearPattern).toHaveBeenCalledWith({
    shapeId: 'box', direction1: [0, 1, 0], count1: 3, spacing1: 15,
    direction2: undefined, count2: undefined, spacing2: undefined,
  });
  expect(studio().parts[0].shapeId).toBe('patterned');
});

test('linearPattern resolves a picked real edge to its own tangent direction', async () => {
  client.linearPattern.mockResolvedValue(shapeResult('patterned'));
  seed([
    feature('f1', 'extrude', {}),
    // box's mocked 'e0' edge runs (0,0,0) -> (1,0,0), so its tangent is the X axis.
    feature('f2', 'linearPattern', { direction1: 'body-f1-edge-0', count1: 4, spacing1: 8 }),
  ]);
  await regenerate();
  expect(client.linearPattern).toHaveBeenCalledWith(expect.objectContaining({
    direction1: [1, 0, 0],
  }));
});

test('linearPattern resolves a picked real face to its own normal direction', async () => {
  client.linearPattern.mockResolvedValue(shapeResult('patterned'));
  seed([
    feature('f1', 'extrude', {}),
    feature('f2', 'linearPattern', { direction1: 'body-f1-face-0', count1: 3, spacing1: 10 }),
  ]);
  await regenerate();
  expect(client.linearPattern).toHaveBeenCalledWith(expect.objectContaining({
    direction1: [0, 0, 1],
  }));
});

test("circularPattern resolves a picked real face to its own centroid/normal as the rotation axis", async () => {
  client.circularPattern.mockResolvedValue(shapeResult('patterned'));
  seed([
    feature('f1', 'extrude', {}),
    feature('f2', 'circularPattern', { axis: 'body-f1-face-0', instanceCount: 5 }),
  ]);
  await regenerate();
  expect(client.circularPattern).toHaveBeenCalledWith(expect.objectContaining({
    axisPoint: [0, 0, 0], axisDirection: [0, 0, 1],
  }));
});

test("mirror resolves a picked face plane id to that face's real centroid/normal", async () => {
  client.mirror.mockResolvedValue(shapeResult('mirrored'));
  seed([
    feature('f1', 'extrude', {}),
    feature('f2', 'mirror', { planeId: 'body-f1-face-0', operation: 'add' }),
  ]);
  await regenerate();
  expect(client.mirror).toHaveBeenCalledWith({
    shapeId: 'box', planeOrigin: [0, 0, 0], planeNormal: [0, 0, 1], merge: true,
  });
  expect(studio().parts[0].shapeId).toBe('mirrored');
});

test('shell maps facesToRemove picked ids to server face indices', async () => {
  client.shell.mockResolvedValue(shapeResult('shelled'));
  seed([
    feature('f1', 'extrude', {}),
    feature('f2', 'shell', { facesToRemove: ['body-f1-face-0'], thickness: 2 }),
  ]);
  await regenerate();
  expect(client.shell).toHaveBeenCalledWith({ shapeId: 'box', faceIndices: [0], thickness: 2 });
  expect(studio().parts[0].shapeId).toBe('shelled');
});

test('directEdit maps a picked face id to a server face index and passes distance through', async () => {
  client.directEdit.mockResolvedValue(shapeResult('pushed'));
  seed([
    feature('f1', 'extrude', {}),
    feature('f2', 'directEdit', { faceId: 'body-f1-face-0', distance: 5 }),
  ]);
  await regenerate();
  expect(client.directEdit).toHaveBeenCalledWith({ shapeId: 'box', faceIndex: 0, distance: 5 });
  expect(studio().parts[0].shapeId).toBe('pushed');
});

test('directEdit with no face selected records an error instead of calling the endpoint', async () => {
  seed([
    feature('f1', 'extrude', {}),
    feature('f2', 'directEdit', { distance: 5 }),
  ]);
  await regenerate();
  expect(client.directEdit).not.toHaveBeenCalled();
  expect(studio().features[1].error).toMatch(/no face selected/i);
});

test('a failing operation sets feature.error, and a later success clears it', async () => {
  client.fillet.mockRejectedValue(new Error('No valid edge indices provided'));
  seed([feature('f1', 'extrude', {}), feature('f2', 'fillet', { radius: 2, edges: [] })]);
  await regenerate();
  expect(studio().features[1].error).toBe('Fillet failed: No valid edge indices provided');
  expect(studio().features[0].error).toBeUndefined();

  client.fillet.mockResolvedValue(shapeResult('filleted'));
  await regenerate();
  expect(studio().features[1].error).toBeUndefined();
});

test('fillet on a body with no engine shape reports an error instead of silently skipping', async () => {
  seed([feature('f2', 'fillet', { radius: 2, edges: [] })]);
  await regenerate();
  expect(studio().features[0].error).toMatch(/no modeling-engine shape/);
  expect(client.fillet).not.toHaveBeenCalled();
});

test('importSTLPart stores the engine solid, or keeps the raw mesh with an error if import fails', async () => {
  const mesh = { vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2] };

  client.importMesh.mockResolvedValue(shapeResult('imported', 42));
  seed([]);
  await useDocumentStore.getState().importSTLPart('ps', 'bracket', mesh);
  expect(client.importMesh).toHaveBeenCalledWith({ positions: mesh.vertices, indices: mesh.indices });
  expect(studio().parts[0].shapeId).toBe('imported');
  expect(studio().parts[0].massProperties?.volume).toBe(42);
  expect(studio().features[0].error).toBeUndefined();

  client.importMesh.mockRejectedValue(new Error('Mesh is not a closed volume'));
  seed([]);
  await useDocumentStore.getState().importSTLPart('ps', 'open', mesh);
  expect(studio().parts[0].shapeId).toBeUndefined();
  expect(studio().parts[0].mesh).toEqual(mesh);
  expect(studio().features[0].error).toMatch(/not a closed volume/);
});

test('importStepPart creates one part per returned solid, and records an error with no parts on failure', async () => {
  client.importStep.mockResolvedValue([shapeResult('step-a', 10), shapeResult('step-b', 20)]);
  seed([]);
  await useDocumentStore.getState().importStepPart('ps', 'bracket', 'BASE64...', 'step');
  expect(client.importStep).toHaveBeenCalledWith({ fileContent: 'BASE64...', format: 'step' });
  expect(studio().parts).toHaveLength(2);
  expect(studio().parts[0].shapeId).toBe('step-a');
  expect(studio().parts[1].shapeId).toBe('step-b');
  expect(studio().parts[0].name).toBe('bracket (1)');
  expect(studio().parts[1].name).toBe('bracket (2)');
  expect(studio().features.every(f => !f.error)).toBe(true);

  client.importStep.mockRejectedValue(new Error('Could not read STEP file'));
  seed([]);
  await useDocumentStore.getState().importStepPart('ps', 'broken', 'BASE64...', 'step');
  expect(studio().parts).toHaveLength(0);
  expect(studio().features[0].error).toMatch(/Could not read STEP file/);

  client.importStep.mockResolvedValue([]);
  seed([]);
  await useDocumentStore.getState().importStepPart('ps', 'empty', 'BASE64...', 'step');
  expect(studio().parts).toHaveLength(0);
  expect(studio().features[0].error).toMatch(/no usable geometry/);
});
