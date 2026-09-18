import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { assistantRequestSchema, validationErrorResponse } from '@/schemas';
import { runAssistant } from '@/lib/assistant/openai';
import { checkAndRecordRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    if (!checkAndRecordRateLimit(`assistant:${user.id}`)) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many assistant requests - please slow down.' } },
        { status: 429 }
      );
    }

    const raw = await request.json();
    const parsed = assistantRequestSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { userMessage, messages, context, model } = parsed.data;

    const result = await runAssistant(userMessage, messages, context, model);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Assistant error:', error);
    const message = error instanceof Error ? error.message : 'Assistant request failed';
    return ApiErrors.internal(message);
  }
}
