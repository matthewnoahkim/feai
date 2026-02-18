/**
 * .feai ZIP structure: build from project, parse to payload.
 * Internal: manifest.json, geometry.json, model/architecture.json, model/weights.bin,
 * dataset.json, simulation.json, metadata.json, signature.sig
 */

import AdmZip from 'adm-zip';
import { FEAI_FORMAT_VERSION, HASH_ALGORITHM, type Manifest, type FeaiPayload, type ProjectExportData } from './types';
import { sign } from './crypto';

const MANIFEST_PATH = 'manifest.json';
const GEOMETRY_PATH = 'geometry.json';
const MODEL_ARCH_PATH = 'model/architecture.json';
const MODEL_WEIGHTS_PATH = 'model/weights.bin';
const DATASET_PATH = 'dataset.json';
const SIMULATION_PATH = 'simulation.json';
const METADATA_PATH = 'metadata.json';
const SIGNATURE_PATH = 'signature.sig';

function toJson(obj: unknown): string {
  return JSON.stringify(obj ?? {}, null, 0);
}

function parseJson(buf: Buffer): unknown {
  return JSON.parse(buf.toString('utf8'));
}

/**
 * Build in-memory ZIP from project (manifest + content), then sign the ZIP (without signature.sig)
 * and add signature.sig to the archive. Returns the final ZIP buffer (to be encrypted).
 */
export function buildSignedZip(params: {
  projectId: string;
  userId: string;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  data?: ProjectExportData | null;
}): Buffer {
  const { projectId, userId, name, description, thumbnail, data: rawData } = params;
  const data = rawData ?? {};

  const manifest: Manifest = {
    feai_format_version: FEAI_FORMAT_VERSION,
    project_id: projectId,
    created_at: new Date().toISOString(),
    created_by: userId,
    model_type: 'neural_network',
    hash_algorithm: HASH_ALGORITHM,
  };

  // App may store project.data as the document (partStudios, etc.) or as { geometry, model, ... }
  const geometry = data.geometry ?? (data.partStudios != null ? data : {});
  const modelArch = (data.model as { architecture?: unknown } | undefined)?.architecture ?? {};
  const modelWeights = (data.model as { weights?: Buffer | number[] } | undefined)?.weights;
  const weightsBuf = modelWeights instanceof Buffer
    ? modelWeights
    : Array.isArray(modelWeights)
      ? Buffer.from(modelWeights)
      : Buffer.alloc(0);
  const dataset = data.dataset ?? {};
  const simulation = data.simulation ?? {};
  const metadata = {
    name,
    description: description ?? null,
    thumbnail: thumbnail ?? null,
    ...(typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {}),
  };

  const zip = new AdmZip();

  zip.addFile(MANIFEST_PATH, Buffer.from(toJson(manifest), 'utf8'));
  zip.addFile(GEOMETRY_PATH, Buffer.from(toJson(geometry), 'utf8'));
  zip.addFile(MODEL_ARCH_PATH, Buffer.from(toJson(modelArch), 'utf8'));
  zip.addFile(MODEL_WEIGHTS_PATH, weightsBuf);
  zip.addFile(DATASET_PATH, Buffer.from(toJson(dataset), 'utf8'));
  zip.addFile(SIMULATION_PATH, Buffer.from(toJson(simulation), 'utf8'));
  zip.addFile(METADATA_PATH, Buffer.from(toJson(metadata), 'utf8'));

  const zipWithoutSig = zip.toBuffer();
  const signature = sign(zipWithoutSig);
  zip.addFile(SIGNATURE_PATH, signature);

  return zip.toBuffer();
}

/**
 * Extract ZIP and verify signature. Returns payload and metadata for DB.
 * Rebuilds ZIP without signature.sig to verify; throws if signature invalid.
 */
export function extractAndVerifyZip(
  zipBuffer: Buffer,
  verifySignature: (data: Buffer, signature: Buffer) => void
): FeaiPayload {
  const zip = new AdmZip(zipBuffer);
  const sigEntry = zip.getEntry(SIGNATURE_PATH);
  if (!sigEntry || sigEntry.isDirectory) throw new Error('signature.sig missing');
  const signature = sigEntry.getData();
  if (!signature || signature.length === 0) throw new Error('signature.sig empty');

  const zipWithoutSig = new AdmZip();
  for (const entry of zip.getEntries()) {
    if (entry.entryName === SIGNATURE_PATH) continue;
    if (entry.isDirectory) continue;
    const data = entry.getData();
    if (data) zipWithoutSig.addFile(entry.entryName, data);
  }
  const zip1Buffer = zipWithoutSig.toBuffer();
  verifySignature(zip1Buffer, signature);

  const manifestBuf = zip.getEntry(MANIFEST_PATH)?.getData();
  const geometryBuf = zip.getEntry(GEOMETRY_PATH)?.getData();
  const archBuf = zip.getEntry(MODEL_ARCH_PATH)?.getData();
  const weightsBuf = zip.getEntry(MODEL_WEIGHTS_PATH)?.getData();
  const datasetBuf = zip.getEntry(DATASET_PATH)?.getData();
  const simulationBuf = zip.getEntry(SIMULATION_PATH)?.getData();
  const metadataBuf = zip.getEntry(METADATA_PATH)?.getData();

  if (!manifestBuf) throw new Error('manifest.json missing');
  if (!metadataBuf) throw new Error('metadata.json missing');

  const manifest = JSON.parse(manifestBuf.toString('utf8')) as Manifest;
  const metadata = parseJson(metadataBuf) as FeaiPayload['metadata'];
  if (typeof metadata?.name !== 'string') throw new Error('metadata.json must contain name');

  return {
    manifest,
    geometry: geometryBuf ? parseJson(geometryBuf) : {},
    model: {
      architecture: archBuf ? parseJson(archBuf) : {},
      weights: weightsBuf ? Buffer.from(weightsBuf) : Buffer.alloc(0),
    },
    dataset: datasetBuf ? parseJson(datasetBuf) : {},
    simulation: simulationBuf ? parseJson(simulationBuf) : {},
    metadata,
  };
}
