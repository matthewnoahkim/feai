import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import {
  deriveKey,
  decrypt,
  verify,
  extractAndVerifyZip,
  migrateProject,
  manifestSchema,
  UnsupportedVersionError,
} from '@/lib/feai';

export const dynamic = 'force-dynamic';

const MAX_IMPORT_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * POST /api/projects/import
 * Body: multipart/form-data with file field (accept .feai).
 * Decrypts, verifies signature, validates manifest, migrates if needed, creates project.
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectCount = await prisma.project.count({ where: { userId: user.id } });
    if (projectCount >= 100) {
      return ApiErrors.badRequest('Maximum number of projects (100) reached.');
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return ApiErrors.badRequest('Missing or invalid file. Use form field "file" with a .feai file.');
    }

    if (file.size > MAX_IMPORT_SIZE) {
      return ApiErrors.badRequest('File too large.');
    }
    if (!file.name.toLowerCase().endsWith('.feai')) {
      return ApiErrors.badRequest('File must have .feai extension.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let zipBuffer: Buffer;
    try {
      const key = deriveKey(user.id);
      zipBuffer = decrypt(key, buffer);
    } catch (e) {
      console.error('Feai import decrypt error:', e);
      return ApiErrors.badRequest('Decryption failed. File may be corrupted or not intended for this user.');
    }

    let payload;
    try {
      payload = extractAndVerifyZip(zipBuffer, (data, sig) => verify(data, sig));
    } catch (e) {
      if (e instanceof Error && e.message.includes('Signature')) {
        return ApiErrors.badRequest('Invalid or tampered file: signature verification failed.');
      }
      throw e;
    }

    const parsedManifest = manifestSchema.safeParse(payload.manifest);
    if (!parsedManifest.success) {
      return ApiErrors.badRequest(
        `Invalid manifest: ${parsedManifest.error.errors.map((e) => e.message).join('; ')}`
      );
    }

    const version = parsedManifest.data.feai_format_version;
    let migratedPayload: typeof payload;
    try {
      migratedPayload = migrateProject(payload, version);
    } catch (e) {
      if (e instanceof UnsupportedVersionError) {
        return ApiErrors.badRequest(e.message);
      }
      throw e;
    }

    if (typeof migratedPayload.metadata?.name !== 'string' || !migratedPayload.metadata.name.trim()) {
      return ApiErrors.badRequest('Manifest or metadata missing project name.');
    }

    const geom = migratedPayload.geometry && typeof migratedPayload.geometry === 'object' ? (migratedPayload.geometry as Record<string, unknown>) : {};
    const partStudios = Array.isArray(geom.partStudios) ? geom.partStudios : [];
    const assemblies = Array.isArray(geom.assemblies) ? geom.assemblies : [];

    // Build project.data as a Document (loadDocumentFromData expects partStudios, assemblies, activeElementId)
    // plus model, dataset, simulation so the app can use the imported project seamlessly.
    const projectData = {
      ...geom,
      id: typeof geom.id === 'string' ? geom.id : `doc-${Date.now()}`,
      name: migratedPayload.metadata.name.trim(),
      partStudios,
      assemblies,
      activeElementId: geom.activeElementId == null ? null : geom.activeElementId,
      model: {
        architecture: migratedPayload.model.architecture,
        weights: Array.from(migratedPayload.model.weights),
      },
      dataset: migratedPayload.dataset,
      simulation: migratedPayload.simulation,
      ...migratedPayload.metadata,
    } as Prisma.InputJsonValue;

    const project = await prisma.project.create({
      data: {
        name: migratedPayload.metadata.name.trim().slice(0, 500),
        description: typeof migratedPayload.metadata.description === 'string' ? migratedPayload.metadata.description.slice(0, 2000) : null,
        thumbnail: typeof migratedPayload.metadata.thumbnail === 'string' ? migratedPayload.metadata.thumbnail : null,
        userId: user.id,
        data: projectData,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes('FEAI_')) {
      console.error('Feai import config error:', err.message);
      return ApiErrors.internal('Import not configured. Missing FEAI keys.');
    }
    console.error('Import project error:', err);
    return ApiErrors.internal('Failed to import project');
  }
}
