/**
 * documentStore's new Assembly and Drawing actions — wiring around the pure math already
 * covered by lib/assembly/mateSolver.test.ts and lib/drawing/projection.test.ts.
 */

jest.mock('../../api/client', () => ({ api: {} }));
jest.mock('../../lib/cad-solver/client', () => ({
  cadSolverClient: {
    makePrimitive: jest.fn(), extrude: jest.fn(), revolve: jest.fn(), sweep: jest.fn(), loft: jest.fn(),
    booleanOp: jest.fn(), fillet: jest.fn(), chamfer: jest.fn(), importMesh: jest.fn(), deleteShape: jest.fn(),
    linearPattern: jest.fn(), circularPattern: jest.fn(), mirror: jest.fn(), shell: jest.fn(),
    importStep: jest.fn(), exportShape: jest.fn(), directEdit: jest.fn(),
  },
}));

import { useDocumentStore, type Document, type Part } from '../documentStore';

const part = (id: string, name: string): Part => ({
  id, name, color: '#888',
  faces: [
    { faceId: 'f0', centroid: [0.5, 0, 0], normal: [1, 0, 0] },
    { faceId: 'f1', centroid: [-0.5, 0, 0], normal: [-1, 0, 0] },
  ],
});

function seed(parts: Part[]) {
  const doc: Document = {
    id: 'doc', name: 'Doc', units: 'mm',
    partStudios: [{ id: 'ps', name: 'PS', features: [], sketches: new Map(), parts }],
    assemblies: [], drawings: [], activeElementId: 'ps', activeElementType: 'partStudio',
  };
  useDocumentStore.setState({ document: doc });
}

const doc = () => useDocumentStore.getState().document!;

test('createAssembly, addAssemblyInstance and addMate solve a real face-to-face mate', () => {
  seed([part('partA', 'Block A'), part('partB', 'Block B')]);
  const store = useDocumentStore.getState();

  const assemblyId = store.createAssembly('Asm 1');
  expect(doc().assemblies).toHaveLength(1);

  const instanceA = store.addAssemblyInstance(assemblyId, 'ps', 'partA')!;
  const instanceB = store.addAssemblyInstance(assemblyId, 'ps', 'partB')!;
  expect(instanceA).toBeTruthy();
  expect(instanceB).toBeTruthy();

  const assemblyBefore = doc().assemblies[0];
  expect(assemblyBefore.instances).toHaveLength(2);
  expect(assemblyBefore.instances[0].transform).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  // Mate B's f1 (-X face) onto A's f0 (+X face), flush (offset 0).
  store.addMate(assemblyId, {
    type: 'coincident',
    movingInstanceId: instanceB, movingFaceId: `partB-face-1`,
    targetInstanceId: instanceA, targetFaceId: `partA-face-0`,
    offset: 0,
  });

  const assemblyAfter = doc().assemblies[0];
  expect(assemblyAfter.mates).toHaveLength(1);
  const movedInstance = assemblyAfter.instances.find(i => i.id === instanceB)!;
  // B's local origin (0,0,0) was 0.5 behind its own -X face; after mating flush against
  // A's +X face at world x=0.5, B's origin should land at world x=1.0.
  expect(movedInstance.transform[3]).toBeCloseTo(1);
});

test('deleteAssemblyInstance also removes any mate referencing it', () => {
  seed([part('partA', 'A'), part('partB', 'B')]);
  const store = useDocumentStore.getState();
  const assemblyId = store.createAssembly('Asm');
  const instanceA = store.addAssemblyInstance(assemblyId, 'ps', 'partA')!;
  const instanceB = store.addAssemblyInstance(assemblyId, 'ps', 'partB')!;
  store.addMate(assemblyId, {
    type: 'coincident', movingInstanceId: instanceB, movingFaceId: 'partB-face-1',
    targetInstanceId: instanceA, targetFaceId: 'partA-face-0', offset: 0,
  });
  expect(doc().assemblies[0].mates).toHaveLength(1);

  store.deleteAssemblyInstance(assemblyId, instanceB);
  const assembly = doc().assemblies[0];
  expect(assembly.instances).toHaveLength(1);
  expect(assembly.mates).toHaveLength(0);
});

test('createDrawingSheet seeds one iso view; addDrawingView appends without overlapping origins', () => {
  seed([part('partA', 'A')]);
  const store = useDocumentStore.getState();
  const sheetId = store.createDrawingSheet('ps', 'Sheet 1');

  let sheet = doc().drawings.find(d => d.id === sheetId)!;
  expect(sheet.views).toHaveLength(1);
  expect(sheet.views[0].direction).toBe('iso');

  store.addDrawingView(sheetId, 'front');
  store.addDrawingView(sheetId, 'top');
  sheet = doc().drawings.find(d => d.id === sheetId)!;
  expect(sheet.views).toHaveLength(3);
  const origins = sheet.views.map(v => v.origin.x);
  expect(new Set(origins).size).toBe(3); // no two views placed on top of each other
});

test('updateDrawingView and deleteDrawingView act only on the targeted sheet/view', () => {
  seed([part('partA', 'A')]);
  const store = useDocumentStore.getState();
  const sheetId = store.createDrawingSheet('ps', 'Sheet 1');
  const viewId = doc().drawings[0].views[0].id;

  store.updateDrawingView(sheetId, viewId, { scale: 2 });
  expect(doc().drawings[0].views[0].scale).toBe(2);

  store.deleteDrawingView(sheetId, viewId);
  expect(doc().drawings[0].views).toHaveLength(0);
});
