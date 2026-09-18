import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, ApiErrors } from '@/lib/auth';
import { checkAndRecordRateLimit } from '@/lib/rateLimit';

/**
 * Server-side proxy to packages/cad-server (the FreeCAD/FastAPI modeling engine on
 * Render). cad-solver/client.ts used to call that service directly from the browser via
 * NEXT_PUBLIC_CAD_API_URL - which meant anyone with the URL could run modeling operations
 * on it for free, since CORS only blocks browser JS, not a direct HTTP call. Routing
 * through here instead means: the caller must be logged in (requireAuth), is rate-limited
 * per user, and the shared secret cad-server now requires is attached server-side, never
 * shipped to the browser.
 *
 * Deliberately generic (forwards method/body/response as-is) rather than one handler per
 * cad-server endpoint, since cad-solver/client.ts already knows the full set of paths and
 * request/response shapes - this just needs to get bytes there and back honestly,
 * including the raw binary body /export returns.
 */

const CAD_SERVER_URL = process.env.CAD_SERVER_URL || 'http://localhost:8000';

async function proxy(request: NextRequest, path: string[]): Promise<NextResponse> {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!checkAndRecordRateLimit(`cad:${user.id}`, { max: 60 })) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Too many modeling requests - please slow down.' } },
      { status: 429 }
    );
  }

  const targetUrl = `${CAD_SERVER_URL}/${path.join('/')}`;
  const headers: Record<string, string> = {};
  const secret = process.env.CAD_SERVER_SECRET;
  if (secret) headers['X-CAD-Server-Secret'] = secret;

  const init: RequestInit = { method: request.method, headers };
  if (request.method === 'POST') {
    headers['Content-Type'] = 'application/json';
    init.body = await request.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch (err) {
    console.error('CAD proxy: failed to reach cad-server:', err);
    return ApiErrors.internal('Modeling engine is unreachable.');
  }

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) responseHeaders.set('content-type', contentType);
  const disposition = upstream.headers.get('content-disposition');
  if (disposition) responseHeaders.set('content-disposition', disposition);

  const body = await upstream.arrayBuffer();
  return new NextResponse(body, { status: upstream.status, headers: responseHeaders });
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params.path);
}
