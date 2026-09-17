/**
 * solveSketch's constraint cases — tangent/midpoint/symmetric (newly implemented) and
 * fixed (which every 2-entity case must now respect via pickAdjustable).
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

import { useDocumentStore, type Document, type Sketch, type SketchEntity, type SketchConstraint } from '../documentStore';

function seedSketch(entities: SketchEntity[], constraints: SketchConstraint[]) {
  const sketch: Sketch = {
    id: 'sk1', name: 'Sketch 1',
    plane: { origin: [0, 0, 0], normal: [0, 0, 1], xAxis: [1, 0, 0] },
    entities, constraints, solved: false, status: 'under-constrained',
  };
  const sketches = new Map([['sk1', sketch]]);
  const doc: Document = {
    id: 'doc', name: 'Doc', units: 'mm',
    partStudios: [{ id: 'ps', name: 'PS', features: [], sketches, parts: [] }],
    assemblies: [], drawings: [], activeElementId: 'ps', activeElementType: 'partStudio',
  };
  useDocumentStore.setState({ document: doc });
}

const entity = (id: string, type: SketchEntity['type'], data: Record<string, any>): SketchEntity =>
  ({ id, type, construction: false, data });

const constraint = (
  id: string, type: SketchConstraint['type'], entityIds: string[], referenceId?: string
): SketchConstraint => ({ id, type, entityIds, status: 'satisfied', ...(referenceId ? { referenceId } : {}) });

const getSketch = () => useDocumentStore.getState().document!.partStudios[0].sketches.get('sk1')!;
const findEntity = (id: string) => getSketch().entities.find(e => e.id === id)!;

test('tangent (line-circle) sets the circle radius to its center-to-line distance', () => {
  seedSketch(
    [
      entity('line1', 'line', { start: { x: 0, y: 0 }, end: { x: 10, y: 0 } }),
      entity('circle1', 'circle', { center: { x: 5, y: 4 }, radius: 1 }),
    ],
    [constraint('c1', 'tangent', ['line1', 'circle1'])]
  );
  useDocumentStore.getState().solveSketch('sk1');
  expect(findEntity('circle1').data.radius).toBeCloseTo(4);
});

test('tangent (circle-circle) sets the adjustable radius so centers are exactly radius1+radius2 apart', () => {
  seedSketch(
    [
      entity('c1', 'circle', { center: { x: 0, y: 0 }, radius: 3 }),
      entity('c2', 'circle', { center: { x: 10, y: 0 }, radius: 1 }),
    ],
    [constraint('t1', 'tangent', ['c1', 'c2'])]
  );
  useDocumentStore.getState().solveSketch('sk1');
  expect(findEntity('c2').data.radius).toBeCloseTo(7); // 10 - 3
});

test('midpoint moves the point to the line\'s midpoint, never the line', () => {
  seedSketch(
    [
      entity('line1', 'line', { start: { x: 0, y: 0 }, end: { x: 10, y: 20 } }),
      entity('point1', 'point', { x: 999, y: 999 }),
    ],
    [constraint('m1', 'midpoint', ['line1', 'point1'])]
  );
  useDocumentStore.getState().solveSketch('sk1');
  expect(findEntity('point1').data).toMatchObject({ x: 5, y: 10 });
  expect(findEntity('line1').data.start).toEqual({ x: 0, y: 0 });
  expect(findEntity('line1').data.end).toEqual({ x: 10, y: 20 });
});

test('symmetric reflects the adjustable point across the referenced mirror line', () => {
  seedSketch(
    [
      entity('mirror', 'line', { start: { x: 0, y: -10 }, end: { x: 0, y: 10 } }), // the Y axis
      entity('p1', 'point', { x: 5, y: 3 }),
      entity('p2', 'point', { x: 999, y: 999 }),
    ],
    [{ id: 's1', type: 'symmetric', entityIds: ['p1', 'p2'], referenceId: 'mirror', status: 'satisfied' }]
  );
  useDocumentStore.getState().solveSketch('sk1');
  expect(findEntity('p2').data).toMatchObject({ x: -5, y: 3 });
});

test('a fixed entity never moves; the other side of a concentric pair adjusts instead', () => {
  seedSketch(
    [
      entity('fixedCircle', 'circle', { center: { x: 0, y: 0 }, radius: 2 }),
      entity('otherCircle', 'circle', { center: { x: 50, y: 50 }, radius: 5 }),
    ],
    [
      constraint('f1', 'fixed', ['fixedCircle']),
      constraint('c1', 'concentric', ['fixedCircle', 'otherCircle']),
    ]
  );
  useDocumentStore.getState().solveSketch('sk1');
  expect(findEntity('fixedCircle').data.center).toEqual({ x: 0, y: 0 });
  expect(findEntity('otherCircle').data.center).toEqual({ x: 0, y: 0 });
});

test('a fixed entity as the first-listed side still lets the second (unfixed) side adjust', () => {
  seedSketch(
    [
      entity('fixedCircle', 'circle', { center: { x: 7, y: 7 }, radius: 2 }),
      entity('otherCircle', 'circle', { center: { x: 50, y: 50 }, radius: 5 }),
    ],
    [
      constraint('f1', 'fixed', ['fixedCircle']),
      // fixedCircle listed first, so the naive "always adjust entityIds[1]" behavior
      // would already happen to work here — concentric-with-fixed-second (above) is the
      // real regression check for pickAdjustable's fallback.
      constraint('c1', 'concentric', ['fixedCircle', 'otherCircle']),
    ]
  );
  useDocumentStore.getState().solveSketch('sk1');
  expect(findEntity('fixedCircle').data.center).toEqual({ x: 7, y: 7 });
  expect(findEntity('otherCircle').data.center).toEqual({ x: 7, y: 7 });
});

test('a chained equal-length constraint converges across multiple entities in one solve', () => {
  // line1 (len 10) -- equal -- line2 (len 1) -- equal -- line3 (len 1)
  // A single pass only fixes line2 to line1's length; line3 needs a second pass to see
  // line2's NEW length. solveSketch's iteration loop should settle all three in one call.
  seedSketch(
    [
      entity('line1', 'line', { start: { x: 0, y: 0 }, end: { x: 10, y: 0 } }),
      entity('line2', 'line', { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } }),
      entity('line3', 'line', { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } }),
    ],
    [
      constraint('e1', 'equal', ['line1', 'line2']),
      constraint('e2', 'equal', ['line2', 'line3']),
    ]
  );
  useDocumentStore.getState().solveSketch('sk1');
  const len = (e: SketchEntity) => Math.hypot(e.data.end.x - e.data.start.x, e.data.end.y - e.data.start.y);
  expect(len(findEntity('line2'))).toBeCloseTo(10);
  expect(len(findEntity('line3'))).toBeCloseTo(10);
});
