/**
 * .feai format v1.0 – manifest and payload types with validation
 */

import { z } from 'zod';

export const FEAI_FORMAT_VERSION = '1.0';
export const HASH_ALGORITHM = 'sha256';

export const manifestSchema = z.object({
  feai_format_version: z.string().min(1),
  project_id: z.string().min(1),
  created_at: z.string(),
  created_by: z.string().min(1),
  model_type: z.string().default('neural_network'),
  hash_algorithm: z.string().default(HASH_ALGORITHM),
}).strict();

export type Manifest = z.infer<typeof manifestSchema>;

/** Payload extracted from ZIP (after decryption and verification) */
export interface FeaiPayload {
  manifest: Manifest;
  geometry: unknown;
  model: {
    architecture: unknown;
    weights: Buffer;
  };
  dataset: unknown;
  simulation: unknown;
  metadata: {
    name: string;
    description?: string | null;
    thumbnail?: string | null;
    [key: string]: unknown;
  };
}

/** Project data shape we store in DB and map to/from .feai files */
export interface ProjectExportData {
  geometry?: unknown;
  model?: {
    architecture?: unknown;
    weights?: Buffer | number[];
  };
  dataset?: unknown;
  simulation?: unknown;
  [key: string]: unknown;
}
