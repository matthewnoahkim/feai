import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/projects - List all projects for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Get projects - if authenticated, get user's projects; otherwise, return empty
    let projects;
    if (session?.user?.id) {
      projects = await prisma.project.findMany({
        where: { userId: session.user.id },
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
    } else {
      // For unauthenticated users, return empty array
      // They can still create projects but they won't persist across sessions
      projects = [];
    }
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('List projects error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list projects' } },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { name, description } = body;
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Project name is required' } },
        { status: 400 }
      );
    }
    
    // Require authentication for creating projects
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in to create projects' } },
        { status: 401 }
      );
    }
    
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || undefined,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } },
      { status: 500 }
    );
  }
}
