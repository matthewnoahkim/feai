import { z } from 'zod';

const nameString = z.string().min(1, 'Name is required').max(500).transform((s) => s.trim());

export const createProjectSchema = z.object({
  name: nameString,
  description: z.string().max(2000).optional().transform((s) => s?.trim() ?? undefined),
  folderId: z.string().nullable().optional(),
}).strict();

export const updateProjectSchema = z.object({
  name: nameString.optional(),
  description: z.string().max(2000).optional().nullable().transform((s) => s === '' ? null : s?.trim()),
  thumbnail: z.string().optional(),
  folderId: z.string().nullable().optional(),
  lastOpenedAt: z.union([z.string().datetime(), z.date()]).optional().transform((v) => (v ? new Date(v) : undefined)),
}).strict();

/** Project document data (schematic, geometry, etc.) – allow any JSON object */
export const projectDataSchema = z.object({
  data: z.record(z.unknown()),
}).strict();

export type CreateProjectBody = z.infer<typeof createProjectSchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectSchema>;
export type ProjectDataBody = z.infer<typeof projectDataSchema>;
