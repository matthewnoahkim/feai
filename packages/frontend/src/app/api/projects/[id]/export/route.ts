import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { buildSignedZip, deriveKey, encrypt } from '@/lib/feai';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/:id/export
 * Returns encrypted .feai file (AES-256-GCM, signed). User must own the project.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = params.id;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return ApiErrors.notFound('Project');
    if (project.userId !== user.id) return ApiErrors.forbidden();

    const data = (project.data ?? {}) as Record<string, unknown>;
    const zipBuffer = buildSignedZip({
      projectId: project.id,
      userId: user.id,
      name: project.name,
      description: project.description,
      thumbnail: project.thumbnail,
      data: data as { geometry?: unknown; model?: { architecture?: unknown; weights?: Buffer | number[] }; dataset?: unknown; simulation?: unknown; metadata?: unknown },
    });

    const key = deriveKey(user.id);
    const encrypted = encrypt(key, zipBuffer);

    const safeName = (project.name.replace(/[^\w\s-]/g, '').trim() || 'project');
    const filename = `${encodeURIComponent(safeName)}.feai`;

    return new NextResponse(new Uint8Array(encrypted), {
      status: 200,
      headers: {
        'Content-Type': 'application/x-feai',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('FEAI_')) {
      console.error('Feai export config error:', err.message);
      return ApiErrors.internal('Export not configured. Missing FEAI_EXPORT_SECRET or signing keys.');
    }
    console.error('Export project error:', err);
    return ApiErrors.internal('Failed to export project');
  }
}
