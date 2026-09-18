import { z } from 'zod';

/**
 * Optional: validate env at build/startup.
 * Use: envSchema.safeParse(process.env) and fail fast if invalid.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  // Server-only (no NEXT_PUBLIC_ prefix) - read by src/lib/assistant/openai.ts, which only
  // app/api/assistant/route.ts may import. Never re-add a NEXT_PUBLIC_ variant of this: that
  // inlines the key into the client bundle, where anyone can read it out of devtools.
  OPENAI_API_KEY: z.string().min(1).optional(),
  // packages/cad-server's base URL and its shared secret - both server-only, read by
  // app/api/cad/[...path]/route.ts. The client calls that proxy via a relative '/api/cad'
  // path (see lib/cad-solver/client.ts), never this URL directly, so this also never needs
  // a NEXT_PUBLIC_ variant.
  CAD_SERVER_URL: z.string().url().optional(),
  CAD_SERVER_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;
