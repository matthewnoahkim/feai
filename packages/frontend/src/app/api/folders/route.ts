import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { createFolderSchema, validationErrorResponse } from '@/schemas';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('List folders error:', error);
    return ApiErrors.internal('Failed to list folders');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const raw = await request.json();
    const parsed = createFolderSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { name } = parsed.data;

    const folder = await prisma.folder.create({
      data: { name, userId: user.id },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Create folder error:', error);
    return ApiErrors.internal('Failed to create folder');
  }
}
