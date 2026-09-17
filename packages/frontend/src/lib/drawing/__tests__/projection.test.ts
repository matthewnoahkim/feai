import { projectPoint, projectEdgesToView, computeViewBounds } from '../projection';

test('top view drops Z, keeping X/Y', () => {
  expect(projectPoint(3, 4, 100, 'top')).toEqual({ x: 3, y: 4 });
});

test('front view drops Y, keeping X and using Z as vertical', () => {
  expect(projectPoint(3, 100, 5, 'front')).toEqual({ x: 3, y: 5 });
});

test('right view drops X, mapping Y->x and Z->y', () => {
  expect(projectPoint(100, 3, 5, 'right')).toEqual({ x: 3, y: 5 });
});

test('iso view is non-degenerate for a point off every axis', () => {
  const p = projectPoint(10, 5, 3, 'iso');
  expect(p.x).not.toBe(0);
  expect(p.y).not.toBe(3); // shouldn't just pass Z through unchanged
});

test('iso view maps the origin to the origin', () => {
  expect(projectPoint(0, 0, 0, 'iso')).toEqual({ x: 0, y: 0 });
});

test('projectEdgesToView preserves edge count and point-per-edge count', () => {
  const edges = [
    { edgeId: 'e0', points: [0, 0, 0, 1, 0, 0] }, // 2 points
    { edgeId: 'e1', points: [0, 0, 0, 0, 1, 0, 1, 1, 0] }, // 3 points
  ];
  const result = projectEdgesToView(edges, 'top');
  expect(result).toHaveLength(2);
  expect(result[0].edgeId).toBe('e0');
  expect(result[0].points).toHaveLength(2);
  expect(result[1].points).toHaveLength(3);
});

test('a unit box\'s top view produces the expected 1x1 square bounds', () => {
  // 4 bottom edges of a unit box (z=0), each a 2-point polyline.
  const edges = [
    { edgeId: 'e0', points: [0, 0, 0, 1, 0, 0] },
    { edgeId: 'e1', points: [1, 0, 0, 1, 1, 0] },
    { edgeId: 'e2', points: [1, 1, 0, 0, 1, 0] },
    { edgeId: 'e3', points: [0, 1, 0, 0, 0, 0] },
  ];
  const projected = projectEdgesToView(edges, 'top');
  const bounds = computeViewBounds(projected)!;
  expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 1, maxY: 1 });
});

test('computeViewBounds returns null for no edges', () => {
  expect(computeViewBounds([])).toBeNull();
});
