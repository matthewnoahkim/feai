import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth-helpers';

// PUT /api/projects/:id/data - Save project CAD data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    
    const projectId = params.id;
    const body = await request.json();
    const { data } = body;
    
    if (!data) {
      return ApiErrors.badRequest('Project data is required');
    }
    
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
      data: { data },
    });
    
    return NextResponse.json({ success: true, updatedAt: updatedProject.updatedAt });
  } catch (error) {
    console.error('Save project data error:', error);
    return ApiErrors.internal('Failed to save project data');
  }
}

// POST handler for sendBeacon compatibility (beacon sends POST)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}
