/**
 * Demo-only wiring for the "Boomilver Wall Joints" project: a canned simulation result for
 * a live product demo, visible only on one account. Geometry still comes in through the
 * normal STL import flow and meshing still runs for real (see /api/fea/mesh) — only the
 * solve step is faked, in runSimulation in feaStore.ts, since there's no real solver
 * backend wired up yet (/api/fea/run doesn't exist). That short-circuit is keyed off
 * DEMO_PROJECT_ID, which only this project ever has, which in turn only
 * DEMO_ACCOUNT_EMAIL's account ever has (see ensureDemoProjectSeeded) — so the fake
 * result can't show up anywhere else.
 */

import type { FEAMesh, SimulationResults } from '@feai/shared';

export const DEMO_ACCOUNT_EMAIL = 'mattnoahkim@gmail.com';

// A fixed id (not an auto-generated cuid) so the frontend can recognize this one project
// by a constant without a round trip, the same way it's created below.
export const DEMO_PROJECT_ID = 'demo-boomilver-wall-joints';
export const DEMO_PROJECT_NAME = 'Boomilver Wall Joints';

/**
 * The predicted outcome to present as the "result" of running the simulation on this
 * project — not computed, just reported. Fill these in once the real numbers are known;
 * everything that reads this (see feaStore.ts) treats maxVonMisesPa and
 * maxDisplacementMm as the field peaks to synthesize a result around.
 */
export const PREDICTED_OUTCOME = {
  maxDisplacementMm: null as number | null,
  maxVonMisesPa: null as number | null,
  solveTimeSec: 1.4,
};

/**
 * Drapes a result over the real mesh's real node positions, so the demo shows the
 * predicted numbers above on whatever geometry actually got imported and meshed. Not a
 * solve: it applies the standard Euler-Bernoulli cantilever shape functions — bending
 * stress falling off linearly from the fixed end, tip deflection following the cubic
 * end-load deflection curve — along the mesh's longest bounding-box axis, scaled so the
 * fixed end hits maxVonMisesPa and the free end hits maxDisplacementMm. That's the right
 * shape for a cantilevered wall joint even though the numbers themselves are reported,
 * not computed.
 */
export function buildDemoResults(mesh: FEAMesh): SimulationResults {
  const { maxDisplacementMm, maxVonMisesPa, solveTimeSec } = PREDICTED_OUTCOME;
  if (maxDisplacementMm == null || maxVonMisesPa == null) {
    throw new Error(
      'Demo FEA outcome not set yet — fill in PREDICTED_OUTCOME in boomilver-wall-joints.ts'
    );
  }
  if (mesh.nodes.length === 0) {
    throw new Error('Mesh has no nodes to synthesize a demo result over');
  }

  const { min, max } = mesh.boundingBox;
  const span = { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z };
  const axis: 'x' | 'y' | 'z' =
    span.x >= span.y && span.x >= span.z ? 'x' : span.y >= span.z ? 'y' : 'z';
  // The axis the beam bends toward — "up" in whatever plane isn't the beam's own axis.
  const bendAxis: 'x' | 'y' | 'z' = axis === 'z' ? 'y' : 'z';
  const length = Math.max(span[axis], 1e-6);
  const lo = min[axis];

  const dispValues: { nodeId: number; values: number[] }[] = [];
  const stressValues: { nodeId: number; values: number[] }[] = [];
  let worst = { nodeId: mesh.nodes[0].id, value: -Infinity, location: mesh.nodes[0] };
  let best = { nodeId: mesh.nodes[0].id, value: Infinity };
  let biggestDisp = { nodeId: mesh.nodes[0].id, magnitude: -Infinity, location: mesh.nodes[0] };

  for (const node of mesh.nodes) {
    const xi = Math.min(1, Math.max(0, (node[axis] - lo) / length)); // 0 fixed end, 1 free end
    const deflection = maxDisplacementMm * (3 * xi * xi - xi * xi * xi) / 2;
    const stress = maxVonMisesPa * (1 - xi);

    const values = [0, 0, 0];
    values[bendAxis === 'y' ? 1 : 2] = deflection;
    dispValues.push({ nodeId: node.id, values });
    stressValues.push({ nodeId: node.id, values: [stress] });

    if (stress > worst.value) worst = { nodeId: node.id, value: stress, location: node };
    if (stress < best.value) best = { nodeId: node.id, value: stress };
    if (deflection > biggestDisp.magnitude) biggestDisp = { nodeId: node.id, magnitude: deflection, location: node };
  }

  return {
    simulationId: `demo-${DEMO_PROJECT_ID}`,
    analysisType: 'static',
    solveTime: solveTimeSec,
    timestamp: new Date().toISOString(),
    meshNodeCount: mesh.nodeCount,
    meshElementCount: mesh.elementCount,
    staticResults: {
      displacements: {
        name: 'Displacement', unit: 'mm', nodeValues: dispValues,
        componentNames: ['Ux', 'Uy', 'Uz'], min: 0, max: maxDisplacementMm,
      },
      stresses: {
        name: 'Stress', unit: 'Pa', elementValues: [], componentNames: ['Mises'],
        min: best.value, max: worst.value,
      },
      vonMisesStress: {
        name: 'von Mises Stress', unit: 'Pa', nodeValues: stressValues,
        componentNames: ['Mises'], min: best.value, max: worst.value,
      },
      summary: {
        maxDisplacement: {
          magnitude: biggestDisp.magnitude, nodeId: biggestDisp.nodeId,
          location: { x: biggestDisp.location.x, y: biggestDisp.location.y, z: biggestDisp.location.z },
        },
        maxVonMisesStress: {
          value: worst.value, nodeId: worst.nodeId,
          location: { x: worst.location.x, y: worst.location.y, z: worst.location.z },
        },
        minVonMisesStress: { value: best.value, nodeId: best.nodeId },
      },
    },
  };
}
