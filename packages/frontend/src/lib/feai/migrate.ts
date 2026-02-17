/**
 * .feai version migration. Ensures backward compatibility for future format versions.
 */

import { FEAI_FORMAT_VERSION } from './types';
import type { FeaiPayload } from './types';

export class UnsupportedVersionError extends Error {
  constructor(public readonly version: string) {
    super(`Unsupported .feai format version: ${version}`);
    this.name = 'UnsupportedVersionError';
  }
}

/**
 * Migrate payload to current format. For v1.0 we accept as-is; future versions can transform here.
 */
export function migrateProject(data: FeaiPayload, version: string): FeaiPayload {
  if (version === FEAI_FORMAT_VERSION) {
    return data;
  }
  if (version === '1.1') {
    return migrate_1_1_to_1_0(data);
  }
  throw new UnsupportedVersionError(version);
}

/** Placeholder for future 1.1 → 1.0 (or current) migration */
function migrate_1_1_to_1_0(data: FeaiPayload): FeaiPayload {
  return data;
}
