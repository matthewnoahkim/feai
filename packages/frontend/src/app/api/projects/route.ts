import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth-helpers';

// GET /api/projects - List all projects for the current user
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
      },
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('List projects error:', error);
    return ApiErrors.internal('Failed to list projects');
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    
    const body = await request.json();
    const { name, description } = body;
    
    if (!name || typeof name !== 'string') {
      return ApiErrors.badRequest('Project name is required');
    }
    
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || undefined,
        userId: user.id,
      },
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return ApiErrors.internal('Failed to create project');
  }
}
