import { NextResponse } from 'next/server';
import { MATERIAL_PRESETS } from '@/lib/fea-engine/analyze';

/** The presets the solver resolves `materials.default` against. */
export async function GET() {
  return NextResponse.json({ materials: MATERIAL_PRESETS });
}
