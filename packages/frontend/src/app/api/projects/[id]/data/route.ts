import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/projects/:id/data - Save project CAD data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const projectId = params.id;
    const body = await request.json();
    const { data } = body;
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Project data is required' } },
        { status: 400 }
      );
    }
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (session?.user?.id && project.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }
    
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { data },
    });
    
    return NextResponse.json({ success: true, updatedAt: updatedProject.updatedAt });
  } catch (error) {
    console.error('Save project data error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save project data' } },
      { status: 500 }
    );
  }
}

// POST handler for sendBeacon compatibility (beacon sends POST)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}
