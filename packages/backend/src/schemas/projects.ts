import { z } from 'zod';

const nameString = z.string().min(1, 'Name is required').max(500).transform((s) => s.trim());

export const createProjectSchema = z.object({
  name: nameString,
  description: z.string().max(2000).optional().transform((s) => s?.trim() ?? undefined),
}).strict();

export const updateProjectSchema = z.object({
  name: nameString.optional(),
  description: z.string().max(2000).optional().nullable().transform((s) => (s === '' ? null : s?.trim())),
  thumbnail: z.string().optional(),
}).strict();

export const projectDataSchema = z.object({
  data: z.record(z.unknown()),
}).strict();
