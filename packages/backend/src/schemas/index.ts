import { Response } from 'express';
import { ZodError } from 'zod';

export * from './projects';
export * from './fea';

export function validationErrorResponse(res: Response, error: ZodError): Response {
  const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ') || 'Validation failed';
  return res.status(400).json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message },
  });
}
