import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export * from './fea';
export * from './projects';
export * from './folders';
export * from './auth';
export * from './env';

/**
 * Return 400 JSON response with Zod error message for use in API routes.
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ') || 'Validation failed';
  return NextResponse.json(
    { success: false, error: { code: 'VALIDATION_ERROR', message } },
    { status: 400 }
  );
}
