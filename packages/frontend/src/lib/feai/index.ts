/**
 * .feai project import/export – encryption, signing, ZIP, migration
 */

export { buildSignedZip, extractAndVerifyZip } from './zip';
export { deriveKey, encrypt, decrypt, sign, verify, generateSigningKeyPair } from './crypto';
export {
  FEAI_FORMAT_VERSION,
  HASH_ALGORITHM,
  manifestSchema,
  type Manifest,
  type FeaiPayload,
  type ProjectExportData,
} from './types';
export { migrateProject, UnsupportedVersionError } from './migrate';
