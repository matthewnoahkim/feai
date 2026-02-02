import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth-helpers';

// GET /api/projects/:id - Get single project
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
    
    // Check ownership - user can only access their own projects
    if (project.userId !== user.id) {
      return ApiErrors.forbidden();
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    return ApiErrors.internal('Failed to get project');
  }
}

// PATCH /api/projects/:id - Update project metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    
    const projectId = params.id;
    const body = await request.json();
    const { name, description, thumbnail } = body;
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return ApiErrors.notFound('Project');
    }
    
    // Check ownership
    if (project.userId !== user.id) {
      return ApiErrors.forbidden();
    }
    
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(thumbnail !== undefined && { thumbnail }),
      },
    });
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    return ApiErrors.internal('Failed to update project');
  }
}

// DELETE /api/projects/:id - Delete project
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
    
    // Check ownership
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
