import { solveFaceMateTransform, transformPoint, transformDirection, identityTransform } from '../mateSolver';

test('identityTransform maps points/directions to themselves', () => {
  const id = identityTransform();
  expect(transformPoint(id, [1, 2, 3])).toEqual([1, 2, 3]);
  expect(transformDirection(id, [0, 0, 1])).toEqual([0, 0, 1]);
});

test('mating two already-aligned, already-opposed faces needs no rotation, only translation', () => {
  // Moving part's face points +X at local (5, 0, 0); target requires it at world
  // (100, 0, 0) pointing -X (already opposite of +X, so a pure translation suffices).
  const m = solveFaceMateTransform([5, 0, 0], [1, 0, 0], [100, 0, 0], [-1, 0, 0]);
  expect(transformPoint(m, [5, 0, 0])[0]).toBeCloseTo(100);
  expect(transformDirection(m, [1, 0, 0])[0]).toBeCloseTo(-1);
});

test('two unit cubes mate flush face-to-face along X, offset 0 (touching)', () => {
  // Cube A fixed at the origin, its +X face at local (0.5, 0, 0) with outward normal +X.
  // Cube B (the moving part) has its own -X face at local (-0.5, 0, 0) with outward
  // normal -X. Mating them flush (offset 0) should place cube B's -X face exactly where
  // cube A's +X face is, in world space, with B's face normal now pointing -X (into A).
  const targetWorldCentroid: [number, number, number] = [0.5, 0, 0]; // A's +X face, world == local since A is unplaced
  const targetWorldNormal: [number, number, number] = [1, 0, 0];
  const requiredWorldNormal: [number, number, number] = [-targetWorldNormal[0], -targetWorldNormal[1], -targetWorldNormal[2]];

  const m = solveFaceMateTransform([-0.5, 0, 0], [-1, 0, 0], targetWorldCentroid, requiredWorldNormal);

  // B's mated face should land exactly on A's face.
  const bFaceWorld = transformPoint(m, [-0.5, 0, 0]);
  expect(bFaceWorld[0]).toBeCloseTo(0.5);
  expect(bFaceWorld[1]).toBeCloseTo(0);
  expect(bFaceWorld[2]).toBeCloseTo(0);

  // B's own center (originally at its local origin) should now sit one full unit away
  // from A's center along X (0.5 + 0.5), since B wasn't rotated (its face already
  // pointed -X, matching what mating requires) — just translated.
  const bCenterWorld = transformPoint(m, [0, 0, 0]);
  expect(bCenterWorld).toEqual([1, 0, 0]);
});

test('mating with a positive offset separates the faces by that distance along the target normal', () => {
  const targetWorldCentroid: [number, number, number] = [0, 0, 0];
  const targetWorldNormal: [number, number, number] = [0, 0, 1];
  const offset = 3;
  const requiredWorldCentroid: [number, number, number] = [
    targetWorldCentroid[0] + targetWorldNormal[0] * offset,
    targetWorldCentroid[1] + targetWorldNormal[1] * offset,
    targetWorldCentroid[2] + targetWorldNormal[2] * offset,
  ];
  const requiredWorldNormal: [number, number, number] = [0, 0, -1];

  const m = solveFaceMateTransform([0, 0, 0], [0, 0, -1], requiredWorldCentroid, requiredWorldNormal);
  const facePoint = transformPoint(m, [0, 0, 0]);
  expect(facePoint).toEqual([0, 0, 3]);
});

test('mating rotates a local normal that starts perpendicular to the required direction', () => {
  // Local face normal points +Z; the mate requires it to point +X — a genuine 90° rotation.
  const m = solveFaceMateTransform([0, 0, 0], [0, 0, 1], [10, 0, 0], [1, 0, 0]);
  const rotatedNormal = transformDirection(m, [0, 0, 1]);
  expect(rotatedNormal[0]).toBeCloseTo(1);
  expect(rotatedNormal[1]).toBeCloseTo(0);
  expect(rotatedNormal[2]).toBeCloseTo(0);
  // A point 2 units along the original normal (local (0,0,2)) should now be 2 units
  // along the new (+X) normal from the required centroid.
  const p = transformPoint(m, [0, 0, 2]);
  expect(p[0]).toBeCloseTo(12);
  expect(p[1]).toBeCloseTo(0);
  expect(p[2]).toBeCloseTo(0);
});
