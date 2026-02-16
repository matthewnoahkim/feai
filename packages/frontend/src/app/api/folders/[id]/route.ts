import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { updateFolderSchema, validationErrorResponse } from '@/schemas';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const folderId = params.id;
    const raw = await request.json();
    const parsed = updateFolderSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) return ApiErrors.notFound('Folder');
    if (folder.userId !== user.id) return ApiErrors.forbidden();

    const updated = await prisma.folder.update({
      where: { id: folderId },
      data: { name: parsed.data.name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update folder error:', error);
    return ApiErrors.internal('Failed to update folder');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const folderId = params.id;
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) return ApiErrors.notFound('Folder');
    if (folder.userId !== user.id) return ApiErrors.forbidden();

    await prisma.folder.delete({ where: { id: folderId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete folder error:', error);
    return ApiErrors.internal('Failed to delete folder');
  }
}
