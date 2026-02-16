import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(200).transform((s) => s.trim()),
}).strict();

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(200).transform((s) => s.trim()),
}).strict();

export type CreateFolderBody = z.infer<typeof createFolderSchema>;
export type UpdateFolderBody = z.infer<typeof updateFolderSchema>;
