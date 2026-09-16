/**
 * Lazily seeds a user's personal copy of the built-in material presets into the
 * account-wide `Material` library on their first `GET /api/materials`. Each user gets
 * their own rows (not shared global rows) so they can attach their own uploaded image
 * to a preset without affecting any other user's copy of it.
 *
 * Values match workflowStore.ts's historical DEFAULT_MATERIALS exactly, so this doesn't
 * change what any existing user sees — it just moves the same data into the DB.
 */

import { prisma } from '@/lib/prisma';

const PRESET_MATERIALS = [
  {
    presetKey: 'steel-1018', name: 'Steel AISI 1018', category: 'steel',
    youngsModulus: 205e9, poissonsRatio: 0.29, density: 7870,
    yieldStrength: 370e6, ultimateStrength: 440e6, color: '#71797E',
  },
  {
    presetKey: 'aluminum-6061', name: 'Aluminum 6061-T6', category: 'aluminum',
    youngsModulus: 68.9e9, poissonsRatio: 0.33, density: 2700,
    yieldStrength: 276e6, ultimateStrength: 310e6, color: '#A8A9AD',
  },
  {
    presetKey: 'titanium-ti6al4v', name: 'Titanium Ti-6Al-4V', category: 'titanium',
    youngsModulus: 113.8e9, poissonsRatio: 0.342, density: 4430,
    yieldStrength: 880e6, ultimateStrength: 950e6, color: '#878681',
  },
  {
    presetKey: 'stainless-304', name: 'Stainless Steel 304', category: 'stainless',
    youngsModulus: 193e9, poissonsRatio: 0.29, density: 8000,
    yieldStrength: 215e6, ultimateStrength: 505e6, color: '#C0C0C0',
  },
  {
    presetKey: 'abs-plastic', name: 'ABS Plastic', category: 'plastic',
    youngsModulus: 2.3e9, poissonsRatio: 0.35, density: 1050,
    yieldStrength: 45e6, color: '#2C2C2C',
  },
  {
    presetKey: 'nylon-66', name: 'Nylon 6/6', category: 'nylon',
    youngsModulus: 3.0e9, poissonsRatio: 0.39, density: 1140,
    yieldStrength: 82e6, color: '#F5F5DC',
  },
] as const;

export async function ensurePresetMaterialsSeeded(userId: string): Promise<void> {
  // upsert (not count-then-create) so two concurrent first-loads for the same user
  // (two tabs, React StrictMode's double-effect) can't create duplicate preset rows —
  // Postgres's ON CONFLICT is atomic, a plain check-then-insert wouldn't be.
  await Promise.all(
    PRESET_MATERIALS.map((preset) =>
      prisma.material.upsert({
        where: { userId_presetKey: { userId, presetKey: preset.presetKey } },
        update: {}, // never overwrite a user's own edits (e.g. an uploaded image)
        create: { ...preset, userId, isPreset: true },
      })
    )
  );
}
