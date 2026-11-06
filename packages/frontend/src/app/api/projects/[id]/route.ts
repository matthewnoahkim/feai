import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { updateProjectSchema, validationErrorResponse } from '@/schemas';
import { Prisma } from '@prisma/client';
import { upgradeStaleBoomileverData } from '@/lib/fixtures/boomilever-solve';

// Upgrading a stale boomilever seed re-solves it here, which takes a few seconds.
export const maxDuration = 60;

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
    
    if (!project) {
      return ApiErrors.notFound('Project');
    }
    if (project.userId !== user.id) {
      return ApiErrors.forbidden();
    }

    // A seeded boomilever project from an older seed (e.g. v2, which meshed the open slot
    // between the prongs as solid plate) is re-meshed and re-solved once, and saved, so
    // every browser picks up the corrected geometry and results.
    let upgradedData: Record<string, unknown> | null = null;
    try {
      upgradedData = upgradeStaleBoomileverData(project.data);
    } catch (e) {
      console.error('Boomilever seed upgrade failed:', e);
    }
    if (upgradedData) {
      const updated = await prisma.project.update({
        where: { id: projectId },
        data: { data: upgradedData as Prisma.InputJsonValue },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    return ApiErrors.internal('Failed to get project');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    
    const projectId = params.id;
    const raw = await request.json();
    const parsed = updateProjectSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { name, description, thumbnail, folderId, lastOpenedAt } = parsed.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return ApiErrors.notFound('Project');
    }
    if (project.userId !== user.id) {
      return ApiErrors.forbidden();
    }

    if (folderId != null) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      });
      if (!folder || folder.userId !== user.id) {
        return ApiErrors.badRequest('Folder not found or access denied.');
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(folderId !== undefined && { folderId }),
        ...(lastOpenedAt !== undefined && { lastOpenedAt }),
      },
      include: { folder: { select: { id: true, name: true } } },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    return ApiErrors.internal('Failed to update project');
  }
}

export async function DELETE(
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
    
    if (!project) {
      return ApiErrors.notFound('Project');
    }
    if (project.userId !== user.id) {
      return ApiErrors.forbidden();
    }
    await prisma.project.delete({
      where: { id: projectId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return ApiErrors.internal('Failed to delete project');
  }
}
