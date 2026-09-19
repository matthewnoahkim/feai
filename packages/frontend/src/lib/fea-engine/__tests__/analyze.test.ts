/**
 * The in-app solver against problems with closed-form answers. A linear tetrahedron
 * reproduces a constant-strain field exactly, so uniaxial tension and free thermal
 * expansion have no discretization error to excuse — a mismatch means a real bug.
 */

import { runAnalysis, SolverInputError } from '../analyze';
import { boxMesh, parseMsh22, nodeCount, tetCount } from '../mesh';
import { workflowMeshToGmshMsh22 } from '../../fea-solver/mesh-to-gmsh';
import type { AnalysisRequest } from '../../fea-solver/types';

const E = 200e9;
const NU = 0.3;

// 100 x 10 x 10 mm bar along X, SI_MM units, structural steel (E = 200 GPa).
const bar = (over: Partial<AnalysisRequest> = {}): AnalysisRequest => ({
  mesh: { type: 'box', min: [0, 0, 0], max: [100, 10, 10], subdivisions: [10, 2, 2] },
  materials: { default: 'steel_structural' },
  units: { type: 'SI_MM' },
  // Roller at x=0 (ux=0), plus just enough to remove the remaining rigid-body modes
  // without restraining the Poisson contraction.
  boundary_conditions: [
    { type: 'displacement', target: { type: 'box', min: [0, 0, 0], max: [0, 10, 10] }, values: [0, null, null] },
    { type: 'displacement', target: { type: 'point', location: [0, 0, 0] }, values: [null, 0, 0] },
    { type: 'displacement', target: { type: 'point', location: [0, 10, 0] }, values: [null, null, 0] },
  ],
  ...over,
});

test('uniaxial tension matches sigma*L/E and von Mises = sigma exactly', () => {
  const sigma = 1e6; // Pa
  const { results } = runAnalysis(bar({
    loads: [{ type: 'surface_force', target: { type: 'box', min: [100, 0, 0], max: [100, 10, 10] }, force_per_area: [sigma, 0, 0] }],
  }));
  const expectedTip = (sigma * 0.1) / E; // metres
  expect(results.displacements.max.x).toBeCloseTo(expectedTip, 12);
  expect(results.stress.von_mises.max).toBeCloseTo(sigma, -1);
  expect(results.stress.von_mises.min).toBeCloseTo(sigma, -1);
  // Reaction balances the applied F = sigma * A = 1e6 * 1e-4 = 100 N.
  expect(results.reactions!.total_force[0]).toBeCloseTo(-100, 4);
  expect(results.reactions!.equilibrium!.is_balanced).toBe(true);
  // Poisson contraction: lateral displacement = -nu * sigma / E * lateral coordinate.
  expect(results.displacements.min.y).toBeCloseTo(-NU * (sigma / E) * 0.01, 12);
});

test('safety factor is yield / von Mises', () => {
  const sigma = 1e6;
  const { results } = runAnalysis(bar({
    loads: [{ type: 'surface_force', target: { type: 'box', min: [100, 0, 0], max: [100, 10, 10] }, force_per_area: [sigma, 0, 0] }],
  }));
  expect(results.safety_factors!.min).toBeCloseTo(250e6 / sigma, 3);
});

test('a pressure load is compressive: positive pressure on the far face shortens the bar', () => {
  const p = 2e6;
  const { results } = runAnalysis(bar({
    loads: [{ type: 'pressure', target: { type: 'box', min: [100, 0, 0], max: [100, 10, 10] }, value: p }],
  }));
  expect(results.displacements.min.x).toBeCloseTo(-(p * 0.1) / E, 12);
});

test('free thermal expansion moves the tip by alpha*dT*L and leaves no stress', () => {
  const { results } = runAnalysis(bar({
    loads: [{ type: 'thermal', reference_temperature: 20, applied_temperature: 120 }],
  }));
  expect(results.displacements.max.x).toBeCloseTo(1.2e-5 * 100 * 0.1, 10);
  expect(results.stress.von_mises.max).toBeLessThan(1e3); // Pa; ~0 next to E*alpha*dT = 240 MPa
});

test('gravity on a fully fixed block: total reaction equals the weight', () => {
  const { results } = runAnalysis({
    mesh: { type: 'box', min: [0, 0, 0], max: [20, 20, 20], subdivisions: [3, 3, 3] },
    materials: { default: 'aluminum_6061_t6' },
    units: { type: 'SI_MM' },
    boundary_conditions: [{ type: 'fixed', target: { type: 'box', min: [0, 0, 0], max: [20, 20, 0] } }],
    loads: [{ type: 'gravity', acceleration: [0, 0, -9.81] }],
  });
  const weight = 2700 * (0.02 ** 3) * 9.81;
  expect(results.reactions!.total_force[2]).toBeCloseTo(weight, 6);
  expect(results.displacements.min.z).toBeLessThan(0);
});

test('a custom material overrides the preset', () => {
  const sigma = 1e6;
  const { results } = runAnalysis(bar({
    materials: { custom: { id: 'x', name: 'Soft', youngs_modulus: 1e9, poissons_ratio: 0.3, density: 1000 } },
    loads: [{ type: 'surface_force', target: { type: 'box', min: [100, 0, 0], max: [100, 10, 10] }, force_per_area: [sigma, 0, 0] }],
  }));
  expect(results.displacements.max.x).toBeCloseTo((sigma * 0.1) / 1e9, 10);
  expect(results.safety_factors).toBeUndefined(); // no yield strength given
});

test('a spring support resists the load with F = k*u', () => {
  const k = 1e12; // N/m^3 per unit area
  const area = 1e-4;
  const F = 100;
  const { results } = runAnalysis(bar({
    boundary_conditions: [
      { type: 'displacement', target: { type: 'box', min: [0, 0, 0], max: [0, 10, 10] }, values: [null, 0, 0] },
      { type: 'displacement', target: { type: 'point', location: [0, 0, 0] }, values: [0, null, null] },
      { type: 'displacement', target: { type: 'point', location: [0, 10, 0] }, values: [null, null, 0] },
      { type: 'elastic_support', target: { type: 'box', min: [0, 0, 0], max: [0, 10, 10] }, stiffness_per_area: [k, 0, 0] },
    ],
    loads: [{ type: 'point_force', location: [100, 5, 5], force: [F, 0, 0], distribution_radius: 50 }],
  }));
  // Wall spring alone: u_wall = F / (k * A); tip adds the bar's own elastic stretch.
  expect(results.displacements.max.x).toBeGreaterThan(F / (k * area) * 0.99);
});

test('an MSH 2.2 file mesh solves identically to the equivalent box mesh', () => {
  const tm = boxMesh([0, 0, 0], [100, 10, 10], [10, 2, 2]);
  const nodes = Array.from({ length: nodeCount(tm) }, (_, i) => ({ id: i + 1, x: tm.nodes[3 * i], y: tm.nodes[3 * i + 1], z: tm.nodes[3 * i + 2] }));
  const elements = Array.from({ length: tetCount(tm) }, (_, e) => ({ id: e + 1, nodeIds: [0, 1, 2, 3].map((c) => tm.tets[4 * e + c] + 1) }));
  const msh = workflowMeshToGmshMsh22(nodes, elements)!;
  const parsed = parseMsh22(msh);
  expect(nodeCount(parsed)).toBe(nodeCount(tm));
  expect(tetCount(parsed)).toBe(tetCount(tm));

  const load = [{ type: 'surface_force' as const, target: { type: 'box' as const, min: [100, 0, 0] as [number, number, number], max: [100, 10, 10] as [number, number, number] }, force_per_area: [1e6, 0, 0] as [number, number, number] }];
  const viaFile = runAnalysis(bar({ mesh: { type: 'file', format: 'msh', data: Buffer.from(msh).toString('base64') }, loads: load }));
  const viaBox = runAnalysis(bar({ loads: load }));
  expect(viaFile.results.displacements.max.x).toBeCloseTo(viaBox.results.displacements.max.x, 14);
});

test('produces a well-formed VTU with displacement and stress arrays', () => {
  const { vtu } = runAnalysis(bar({
    loads: [{ type: 'gravity', acceleration: [0, 0, -9.81] }],
  }));
  expect(vtu).toContain('<VTKFile type="UnstructuredGrid"');
  expect(vtu).toContain('Name="displacement_m"');
  expect(vtu).toContain('Name="von_mises_Pa"');
});

describe('rejects what it cannot solve, instead of approximating', () => {
  const expectInput = (fn: () => unknown, re: RegExp) => {
    expect(fn).toThrow(SolverInputError);
    expect(fn).toThrow(re);
  };

  test('no boundary conditions', () => expectInput(() => runAnalysis(bar({ boundary_conditions: [] })), /boundary condition/i));
  test('quadratic elements', () => expectInput(() => runAnalysis(bar({ solver_options: { fe_degree: 2 } })), /fe_degree 2/));
  test('large deformation', () => expectInput(() => runAnalysis(bar({ solver_options: { large_deformation: true } })), /Large-deformation/));
  test('cylinder meshes', () => expectInput(() => runAnalysis(bar({ mesh: { type: 'cylinder', radius: 1, height: 1 } })), /not supported/));
  test('US customary units', () => expectInput(() => runAnalysis(bar({ units: { type: 'US_CUSTOMARY' } })), /US_CUSTOMARY/));
  test('boundary_id targets', () => expectInput(() => runAnalysis(bar({
    boundary_conditions: [{ type: 'fixed', target: { type: 'boundary_id', id: 1 } }],
  })), /boundary_id/));
  test('unknown material', () => expectInput(() => runAnalysis(bar({ materials: { default: 'unobtainium' } })), /Unknown material/));
  test('non-axis-aligned symmetry', () => expectInput(() => runAnalysis(bar({
    boundary_conditions: [{ type: 'symmetry', target: { type: 'box', min: [0, 0, 0], max: [0, 10, 10] }, plane_normal: [1, 1, 0] }],
  })), /axis-aligned/));
  test('a target that touches no nodes', () => expectInput(() => runAnalysis(bar({
    boundary_conditions: [{ type: 'fixed', target: { type: 'box', min: [500, 500, 500], max: [600, 600, 600] } }],
  })), /does not contain any mesh nodes/));
  test('a mesh over the node cap', () => expectInput(() => runAnalysis(bar(), { maxNodes: 10 }), /limit/));
  test('garbage MSH', () => expectInput(() => runAnalysis(bar({ mesh: { type: 'file', format: 'msh', data: Buffer.from('nope').toString('base64') } })), /MSH/));
});

test('an under-constrained model fails loudly rather than returning nonsense', () => {
  expect(() => runAnalysis(bar({
    // Only the x-roller: rigid-body translation in Y/Z and rotations stay free.
    boundary_conditions: [{ type: 'displacement', target: { type: 'box', min: [0, 0, 0], max: [0, 10, 10] }, values: [0, null, null] }],
    loads: [{ type: 'surface_force', target: { type: 'box', min: [100, 0, 0], max: [100, 10, 10] }, force_per_area: [1e6, 1e5, 0] }],
  }), { deadline: Date.now() + 10_000 })).toThrow(/did not converge|out of time/);
});
