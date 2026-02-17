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
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        order: true,
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

    const folderCount = await prisma.folder.count({ where: { userId: user.id } });
    if (folderCount >= 10) {
      return ApiErrors.badRequest('Maximum number of folders (10) reached.');
    }

    const { name } = parsed.data;

    const maxOrder = await prisma.folder
      .aggregate({
        where: { userId: user.id },
        _max: { order: true },
      })
      .then((r) => r._max.order ?? -1);

    const folder = await prisma.folder.create({
      data: { name, userId: user.id, order: maxOrder + 1 },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Create folder error:', error);
    return ApiErrors.internal('Failed to create folder');
  }
}
