/**
 * Gives every project in one account believable history: random created, modified and
 * last-opened dates spread across a date range (default Nov 2025 to now), so a demo
 * account looks lived in.
 *
 *  - Created dates are random across the range, but projects keep their current
 *    creation order (whatever was made first still comes first).
 *  - The boomilever test projects keep a November 2025 creation date, in order 1X to 4X,
 *    matching the seed (see BOOMILEVER_CREATED_AT in src/lib/fixtures/boomilever.ts).
 *  - Modified is some days to months after created (mostly within a few weeks).
 *  - Last opened is between modified and now, weighted toward recent; a few projects
 *    are left never opened.
 *  - Times fall between roughly 10 am and 11 pm US Eastern, not 3 am.
 *  - Nothing is ever in the future.
 *
 * Run from packages/frontend (reads DATABASE_URL from ../../.env):
 *   node -r dotenv/config ../../node_modules/ts-node/dist/bin.js --transpile-only \
 *     -O '{"module":"commonjs","moduleResolution":"node"}' scripts/randomize-project-dates.ts \
 *     dotenv_config_path=../../.env [--email you@x.com] [--from 2025-11-01] [--to 2026-11-30] [--dry-run]
 */

import { PrismaClient } from '@prisma/client'

const DAY = 24 * 60 * 60 * 1000

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

/** A random time on the same UTC day, between 15:00 and 04:00 UTC (10 am to 11 pm ET). */
function atWorkingHour(t: number): number {
  const day = Math.floor(t / DAY) * DAY
  const minutes = 15 * 60 + Math.floor(Math.random() * 13 * 60) // 15:00 .. 04:00 next day
  return day + minutes * 60 * 1000 + Math.floor(Math.random() * 60) * 1000
}

/** Exponential gap with the given mean, so most gaps are short and a few are long. */
function gap(meanMs: number): number {
  return -Math.log(1 - Math.random()) * meanMs
}

const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 16).replace('T', ' ') : 'never           ')

async function main() {
  const email = arg('email') ?? 'mattnoahkim@gmail.com'
  const now = Date.now()
  const from = new Date(arg('from') ?? '2025-11-01T00:00:00Z').getTime()
  const to = Math.min(new Date(arg('to') ?? '2026-11-30T23:59:59Z').getTime(), now)
  const dryRun = process.argv.includes('--dry-run')
  if (Number.isNaN(from) || Number.isNaN(to) || from >= to) {
    throw new Error('--from and --to must be valid dates with from before to')
  }
  const clamp = (t: number, lo: number) => Math.min(Math.max(t, lo), to)

  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error(`No account with email ${email}`)
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    console.log(`${projects.length} projects for ${email}, dates from ${new Date(from).toISOString().slice(0, 10)} to ${new Date(to).toISOString().slice(0, 10)}${dryRun ? ' (dry run, nothing written)' : ''}`)

    // Boomilever 1X..4X: created a day or so apart in early November 2025.
    const boomilever = projects
      .filter((p) => /^boomilever( [1-4]X)?$/.test(p.name))
      .sort((a, b) => a.name.localeCompare(b.name))
    const created = new Map<string, number>()
    let t = Math.max(from, new Date('2025-11-03T00:00:00Z').getTime())
    for (const p of boomilever) {
      created.set(p.id, clamp(atWorkingHour(t), from))
      t += DAY + Math.random() * 2 * DAY
    }

    // Everything else: random days across the range, assigned in the existing order.
    const others = projects.filter((p) => !created.has(p.id))
    const slots = others.map(() => from + Math.random() * (to - from - DAY)).sort((a, b) => a - b)
    others.forEach((p, i) => created.set(p.id, clamp(atWorkingHour(slots[i]), from)))

    console.log('  created           modified          last opened       project')
    for (const p of projects) {
      const createdAt = created.get(p.id)!
      // Modified: mostly within a few weeks of creation, sometimes months later.
      const updatedAt = clamp(atWorkingHour(createdAt + gap(18 * DAY)), createdAt)
      // Last opened: about 1 in 6 never opened; otherwise between modified and now,
      // weighted toward recent visits.
      const lastOpenedAt = Math.random() < 0.15
        ? null
        : clamp(updatedAt + (now - updatedAt) * Math.sqrt(Math.random()), updatedAt)
      const dates = {
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        lastOpenedAt: lastOpenedAt === null ? null : new Date(lastOpenedAt),
      }
      console.log(`  ${fmt(dates.createdAt)}  ${fmt(dates.updatedAt)}  ${fmt(dates.lastOpenedAt)}  ${p.name}`)
      if (!dryRun) await prisma.project.update({ where: { id: p.id }, data: dates })
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
