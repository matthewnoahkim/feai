import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    gateway: { status: 'healthy', version: '1.0.0', timestamp: new Date().toISOString() },
    compute_server: { status: 'in-app' },
  });
}
