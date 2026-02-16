import { z } from 'zod';

export const updateNameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).transform((s) => s.trim()),
}).strict();

export type UpdateNameBody = z.infer<typeof updateNameSchema>;
