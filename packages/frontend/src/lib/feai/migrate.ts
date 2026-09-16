/**
 * .feai version migration: an ordered chain of upgrade steps, each taking a payload at
 * one version to the next. Older archives walk the chain up to FEAI_FORMAT_VERSION;
 * anything newer than we know is rejected rather than silently misread.
 */

import { FEAI_FORMAT_VERSION } from './types';
import type { FeaiPayload } from './types';

export class UnsupportedVersionError extends Error {
  constructor(public readonly version: string) {
    super(`Unsupported .feai format version: ${version}`);
    this.name = 'UnsupportedVersionError';
  }
}

type Step = { from: string; to: string; apply: (data: FeaiPayload) => FeaiPayload };

// Append a step here whenever FEAI_FORMAT_VERSION is bumped, e.g.
//   { from: '1.0', to: '1.1', apply: normalizeFeatureTypes }
const STEPS: Step[] = [];

export function migrateProject(data: FeaiPayload, version: string): FeaiPayload {
  let current = version;
  let payload = data;
  while (current !== FEAI_FORMAT_VERSION) {
    const step = STEPS.find(s => s.from === current);
    if (!step) throw new UnsupportedVersionError(version);
    payload = step.apply(payload);
    current = step.to;
  }
  return payload;
}
