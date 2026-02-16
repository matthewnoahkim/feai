import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { createProjectSchema, validationErrorResponse } from '@/schemas';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
        lastOpenedAt: true,
        folderId: true,
        folder: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('List projects error:', error);
    return ApiErrors.internal('Failed to list projects');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const raw = await request.json();
    const parsed = createProjectSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const projectCount = await prisma.project.count({ where: { userId: user.id } });
    if (projectCount >= 100) {
      return ApiErrors.badRequest('Maximum number of projects (100) reached.');
    }

    const { name, description } = parsed.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return ApiErrors.internal('Failed to create project');
  }
}
