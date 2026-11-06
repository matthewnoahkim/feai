import { prisma } from '@/lib/prisma';
import { DEMO_ACCOUNT_EMAIL, DEMO_PROJECT_ID, DEMO_PROJECT_NAME } from './boomilver-wall-joints';

/**
 * Lazily creates the "Boomilver Wall Joints" demo project on its first
 * GET /api/projects for the one account it's for — mirrors
 * ensurePresetMaterialsSeeded's lazy-seed pattern. No-op for every other account.
 *
 * Uses a fixed id instead of upsert-by-name (Project has no unique constraint on
 * name+userId) so a repeat call is still a plain, race-safe idempotent check.
 */
export async function ensureDemoProjectSeeded(user: { id: string; email: string }): Promise<void> {
  if (user.email !== DEMO_ACCOUNT_EMAIL) return;

  const existing = await prisma.project.findUnique({ where: { id: DEMO_PROJECT_ID } });
  if (existing) return;

  await prisma.project.create({
    data: {
      id: DEMO_PROJECT_ID,
      name: DEMO_PROJECT_NAME,
      userId: user.id,
      data: undefined, // opens as a fresh, empty document — import the real STL parts into it as usual
    },
  });
}
