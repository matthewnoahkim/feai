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
  NEXT_PUBLIC_OPENAI_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
