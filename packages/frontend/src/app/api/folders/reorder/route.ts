import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { z } from 'zod';

const reorderSchema = z.object({
  folderIds: z.array(z.string()).min(1, 'At least one folder id required'),
});

export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const raw = await request.json();
    const parsed = reorderSchema.safeParse(raw);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error.message ?? 'Invalid request');
    }

    const { folderIds } = parsed.data;

    const folders = await prisma.folder.findMany({
      where: { id: { in: folderIds }, userId: user.id },
      select: { id: true },
    });
    if (folders.length !== folderIds.length) {
      return ApiErrors.badRequest('One or more folders not found or access denied.');
    }

    await prisma.$transaction(
      folderIds.map((id, index) =>
        prisma.folder.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder folders error:', error);
    return ApiErrors.internal('Failed to reorder folders');
  }
}
