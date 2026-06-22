/**
 * app/api/share/[id]/route.ts
 * GET: fetches a stored report by share ID (for /report/[id] page)
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { fetchReport } from '@/lib/share-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const report = await fetchReport(params.id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error('[/api/share/[id]] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}
