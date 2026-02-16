import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { updateProjectSchema, validationErrorResponse } from '@/schemas';

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

    const { name, description, thumbnail } = parsed.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return ApiErrors.notFound('Project');
    }
    if (project.userId !== user.id) {
      return ApiErrors.forbidden();
    }
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(thumbnail !== undefined && { thumbnail }),
      },
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
