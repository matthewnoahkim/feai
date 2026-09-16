import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { updateMaterialSchema, updatePresetMaterialSchema, validationErrorResponse } from '@/schemas';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const materialId = params.id;
    const existing = await prisma.material.findUnique({ where: { id: materialId } });
    if (!existing) return ApiErrors.notFound('Material');
    if (existing.userId !== user.id) return ApiErrors.forbidden();

    const raw = await request.json();
    // Presets only ever allow their image to change; everything else 400s via .strict().
    const schema = existing.isPreset ? updatePresetMaterialSchema : updateMaterialSchema;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const material = await prisma.material.update({
      where: { id: materialId },
      data: parsed.data,
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('Update material error:', error);
    return ApiErrors.internal('Failed to update material');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const materialId = params.id;
    const existing = await prisma.material.findUnique({ where: { id: materialId } });
    if (!existing) return ApiErrors.notFound('Material');
    if (existing.userId !== user.id) return ApiErrors.forbidden();
    if (existing.isPreset) return ApiErrors.badRequest('Preset materials cannot be deleted.');

    await prisma.material.delete({ where: { id: materialId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete material error:', error);
    return ApiErrors.internal('Failed to delete material');
  }
}
