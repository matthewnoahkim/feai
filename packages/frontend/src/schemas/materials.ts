import { z } from 'zod';

export const MATERIAL_CATEGORIES = [
  'steel', 'aluminum', 'titanium', 'stainless', 'plastic', 'nylon', 'composite', 'ceramic', 'other',
] as const;

// ~300KB decoded cap on a client-side-compressed image (see src/lib/image/compressImage.ts,
// which targets the same constant so the client-side check and this authoritative
// server-side one never drift apart). base64 inflates a decoded byte length by ~4/3, so
// cap the encoded string length accordingly.
export const IMAGE_MAX_BASE64_LENGTH = Math.ceil((300 * 1024 * 4) / 3);

// The compression utility always re-encodes to JPEG regardless of the source format, so
// this only ever needs to validate one mime type, not an alternation.
const imageDataUrlSchema = z
  .string()
  .max(IMAGE_MAX_BASE64_LENGTH, 'Image is too large (max ~300KB)')
  .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/, 'Image must be a base64 JPEG data URL');

const finiteNumber = z.number().finite();
const optionalFiniteNumber = finiteNumber.optional().nullable();

const materialFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).transform((s) => s.trim()),
  category: z.enum(MATERIAL_CATEGORIES),
  youngsModulus: finiteNumber.positive(),
  poissonsRatio: finiteNumber.min(0).max(0.5),
  density: finiteNumber.positive(),
  yieldStrength: optionalFiniteNumber,
  ultimateStrength: optionalFiniteNumber,
  thermalExpansion: optionalFiniteNumber,
  thermalConductivity: optionalFiniteNumber,
  specificHeat: optionalFiniteNumber,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  image: imageDataUrlSchema.optional().nullable(),
});

export const createMaterialSchema = materialFieldsSchema.strict();
export const updateMaterialSchema = materialFieldsSchema.partial().strict();

// Presets can only ever have their image changed — everything else about them is a
// shared, historically-known constant (see seed-presets.ts). Rejecting other fields with
// .strict() gives a normal 400 VALIDATION_ERROR rather than needing a special-case path.
export const updatePresetMaterialSchema = z.object({
  image: imageDataUrlSchema.nullable(),
}).strict();

export type CreateMaterialBody = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialBody = z.infer<typeof updateMaterialSchema>;
export type UpdatePresetMaterialBody = z.infer<typeof updatePresetMaterialSchema>;
