import { workflowMaterialIdToApiPreset, FEA_SOLVER_DEFAULT_MATERIAL_PRESET } from '../map-material';

test('a seeded preset maps via presetKey, not its DB id', () => {
  const material = { id: 'ck_some_generated_cuid', presetKey: 'aluminum-6061' };
  expect(workflowMaterialIdToApiPreset(material)).toBe('aluminum_6061_t6');
});

test('a preset whose presetKey is not one of the known literals falls back to default', () => {
  const material = { id: 'ck_some_generated_cuid', presetKey: 'some-unknown-preset' };
  expect(workflowMaterialIdToApiPreset(material)).toBe(FEA_SOLVER_DEFAULT_MATERIAL_PRESET);
});

test('a custom material (no presetKey) always falls back, regardless of its id', () => {
  const material = { id: 'steel-1018', presetKey: null }; // even an id that collides with a legacy literal
  expect(workflowMaterialIdToApiPreset(material)).toBe(FEA_SOLVER_DEFAULT_MATERIAL_PRESET);
});

test('null/undefined material falls back to default', () => {
  expect(workflowMaterialIdToApiPreset(null)).toBe(FEA_SOLVER_DEFAULT_MATERIAL_PRESET);
  expect(workflowMaterialIdToApiPreset(undefined)).toBe(FEA_SOLVER_DEFAULT_MATERIAL_PRESET);
});
