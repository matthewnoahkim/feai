/**
 * .feai export/import tests: roundtrip, tampered, wrong user, version migration, corrupted
 */

import {
  buildSignedZip,
  extractAndVerifyZip,
  deriveKey,
  encrypt,
  decrypt,
  sign,
  verify,
  generateSigningKeyPair,
  migrateProject,
  UnsupportedVersionError,
} from '../index';

const EXPORT_SECRET = 'a'.repeat(32);
let SIGNING_PRIVATE_B64: string;
let SIGNING_PUBLIC_B64: string;

beforeAll(() => {
  const pair = generateSigningKeyPair();
  SIGNING_PRIVATE_B64 = pair.privateKeyBase64;
  SIGNING_PUBLIC_B64 = pair.publicKeyBase64;
  process.env.FEAI_EXPORT_SECRET = EXPORT_SECRET;
  process.env.FEAI_SIGNING_PRIVATE_KEY = SIGNING_PRIVATE_B64;
  process.env.FEAI_SIGNING_PUBLIC_KEY = SIGNING_PUBLIC_B64;
});

describe('feai export/import', () => {
  const projectId = 'proj-123';
  const userId = 'user-abc';
  const otherUserId = 'user-xyz';
  const name = 'Test Project';
  const description = 'Description';
  const data = {
    geometry: { units: 'mm', shapes: [] },
    model: { architecture: { layers: 3 }, weights: [1, 2, 3] },
    dataset: { samples: 10 },
    simulation: { steps: 100 },
  };

  test('export → import roundtrip equals original', () => {
    const zipBuffer = buildSignedZip({
      projectId,
      userId,
      name,
      description,
      data,
    });
    const key = deriveKey(userId);
    const encrypted = encrypt(key, zipBuffer);

    const decrypted = decrypt(key, encrypted);
    const payload = extractAndVerifyZip(decrypted, (d, sig) => verify(d, sig));

    expect(payload.manifest.feai_format_version).toBe('1.0');
    expect(payload.manifest.project_id).toBe(projectId);
    expect(payload.manifest.created_by).toBe(userId);
    expect(payload.metadata.name).toBe(name);
    expect(payload.metadata.description).toBe(description);
    expect(payload.geometry).toEqual(data.geometry);
    expect(payload.model.architecture).toEqual(data.model?.architecture);
    expect(Array.from(payload.model.weights)).toEqual([1, 2, 3]);
    expect(payload.dataset).toEqual(data.dataset);
    expect(payload.simulation).toEqual(data.simulation);
  });

  test('tampered file fails (signature invalid)', () => {
    const zipBuffer = buildSignedZip({
      projectId,
      userId,
      name,
      data: { geometry: { x: 1 } },
    });
    const key = deriveKey(userId);
    const encrypted = encrypt(key, zipBuffer);
    const decrypted = decrypt(key, encrypted);
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(decrypted);
    const sigEntry = zip.getEntry('signature.sig');
    const signature = sigEntry!.getData();
    const manifestEntry = zip.getEntry('manifest.json');
    const manifestData = manifestEntry!.getData();
    const tamperedManifest = Buffer.from(manifestData);
    tamperedManifest[0] ^= 0xff;
    const zipWithoutSig = new AdmZip();
    for (const entry of zip.getEntries()) {
      if (entry.entryName === 'signature.sig') continue;
      if (entry.isDirectory) continue;
      const data = entry.entryName === 'manifest.json' ? tamperedManifest : entry.getData();
      if (data) zipWithoutSig.addFile(entry.entryName, data);
    }
    const tamperedZipBuffer = zipWithoutSig.toBuffer();
    expect(() => verify(tamperedZipBuffer, signature)).toThrow(/Signature verification failed/);
  });

  test('wrong user cannot decrypt', () => {
    const zipBuffer = buildSignedZip({
      projectId,
      userId,
      name,
      data: {},
    });
    const keyA = deriveKey(userId);
    const encrypted = encrypt(keyA, zipBuffer);
    const keyB = deriveKey(otherUserId);

    expect(() => decrypt(keyB, encrypted)).toThrow();
  });

  test('old version 1.0 migrates (no-op)', () => {
    const payload = {
      manifest: {
        feai_format_version: '1.0',
        project_id: 'x',
        created_at: new Date().toISOString(),
        created_by: 'u',
        model_type: 'neural_network',
        hash_algorithm: 'sha256',
      },
      geometry: {},
      model: { architecture: {}, weights: Buffer.alloc(0) },
      dataset: {},
      simulation: {},
      metadata: { name: 'Test' },
    };
    const result = migrateProject(payload, '1.0');
    expect(result).toEqual(payload);
  });

  test('unsupported version throws UnsupportedVersionError', () => {
    const payload = {
      manifest: { feai_format_version: '2.0', project_id: 'x', created_at: '', created_by: 'u', model_type: 'neural_network', hash_algorithm: 'sha256' },
      geometry: {},
      model: { architecture: {}, weights: Buffer.alloc(0) },
      dataset: {},
      simulation: {},
      metadata: { name: 'Test' },
    };
    expect(() => migrateProject(payload, '2.0')).toThrow(UnsupportedVersionError);
    expect(() => migrateProject(payload, '2.0')).toThrow(/Unsupported .feai format version/);
  });

  test('corrupted file (truncated ciphertext) rejected', () => {
    const zipBuffer = buildSignedZip({ projectId, userId, name, data: {} });
    const key = deriveKey(userId);
    const encrypted = encrypt(key, zipBuffer);
    const truncated = encrypted.subarray(0, 20);

    expect(() => decrypt(key, truncated)).toThrow();
  });

  test('corrupted file (invalid ZIP after decrypt) rejected', () => {
    const key = deriveKey(userId);
    const fakeZip = Buffer.from('not a zip file');
    const encrypted = encrypt(key, fakeZip);
    const decrypted = decrypt(key, encrypted);
    expect(decrypted.toString()).toBe('not a zip file');
    expect(() =>
      extractAndVerifyZip(decrypted, (d, sig) => verify(d, sig))
    ).toThrow();
  });
});
