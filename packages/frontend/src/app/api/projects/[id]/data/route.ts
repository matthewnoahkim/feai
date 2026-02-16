import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { projectDataSchema, validationErrorResponse } from '@/schemas';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = params.id;
    const raw = await request.json();
    const parsed = projectDataSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { data } = parsed.data;
    
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
      data: { data: data as Prisma.InputJsonValue },
    });
    
    return NextResponse.json({ success: true, updatedAt: updatedProject.updatedAt });
  } catch (error) {
    console.error('Save project data error:', error);
    return ApiErrors.internal('Failed to save project data');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}
