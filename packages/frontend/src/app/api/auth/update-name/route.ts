import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { updateNameSchema, validationErrorResponse } from '@/schemas';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const raw = await request.json();
    const parsed = updateNameSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { name } = parsed.data;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user name:', error);
    return ApiErrors.internal('Failed to update name');
  }
}
