import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { createMaterialSchema, validationErrorResponse } from '@/schemas';
import { ensurePresetMaterialsSeeded } from '@/lib/materials/seed-presets';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    await ensurePresetMaterialsSeeded(user.id);

    const materials = await prisma.material.findMany({
      where: { userId: user.id },
      orderBy: [{ isPreset: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('List materials error:', error);
    return ApiErrors.internal('Failed to list materials');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const raw = await request.json();
    const parsed = createMaterialSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const customCount = await prisma.material.count({ where: { userId: user.id, isPreset: false } });
    if (customCount >= 50) {
      return ApiErrors.badRequest('Maximum number of custom materials (50) reached.');
    }

    const material = await prisma.material.create({
      data: { ...parsed.data, userId: user.id, isPreset: false, presetKey: null },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Create material error:', error);
    return ApiErrors.internal('Failed to create material');
  }
}
