import { buildAnalysisRequestFromWorkflow } from '../workflow-request';
import type { Material } from '@/store/materialLibraryStore';

const material = (over: Partial<Material> = {}): Material => ({
  id: 'm1', name: 'Custom Alloy', category: 'other', isPreset: false,
  youngsModulus: 90e9, poissonsRatio: 0.31, density: 3100, yieldStrength: 400e6, thermalExpansion: 2e-5,
  ...over,
});

const build = (m: Material) => buildAnalysisRequestFromWorkflow({
  meshData: { nodeCount: 8, elementCount: 6, elementType: 'C3D4', boundingBox: { min: { x: 0, y: 0, z: 0 }, max: { x: 10, y: 10, z: 10 } } },
  boundaryConditions: [{ id: 'b', type: 'fixed', name: 'Fix', enabled: true, target: { type: 'point', location: [0, 0, 0] } }],
  loads: [],
  materials: [m],
  defaultMaterialId: m.id,
});

test('the selected material\'s real properties reach the solver, not just a preset id', () => {
  const built = build(material());
  if (!built.ok) throw new Error(built.error);
  expect(built.request.materials!.custom).toMatchObject({
    youngs_modulus: 90e9, poissons_ratio: 0.31, density: 3100, yield_strength: 400e6, thermal_expansion: 2e-5,
  });
});

test('null optional properties are omitted rather than sent as null', () => {
  const built = build(material({ yieldStrength: null, thermalExpansion: null, ultimateStrength: null }));
  if (!built.ok) throw new Error(built.error);
  const custom = built.request.materials!.custom!;
  expect('yield_strength' in custom).toBe(false);
  expect('thermal_expansion' in custom).toBe(false);
});
