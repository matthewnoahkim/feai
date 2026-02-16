import { z } from 'zod';

/** Part mesh: vertices array and optional indices */
const partMeshSchema = z.object({
  vertices: z.array(z.number()).optional(),
  indices: z.array(z.number()).optional(),
}).passthrough();

/** Part sent from frontend (id, name, meshData or mesh) */
const meshPartSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  meshData: partMeshSchema.optional(),
  mesh: partMeshSchema.optional(),
}).passthrough();

export const meshRequestBodySchema = z.object({
  partStudioId: z.string().min(1, 'partStudioId is required'),
  settings: z.object({
    parts: z.array(meshPartSchema).optional(),
    globalSize: z.number().min(2).max(100).optional(),
    elementType: z.string().optional(),
  }).optional(),
}).strict();

export type MeshRequestBody = z.infer<typeof meshRequestBodySchema>;
