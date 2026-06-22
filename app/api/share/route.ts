/**
 * app/api/share/route.ts
 * POST: stores report + image in Supabase, returns share ID + URL
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { storeReport } from '@/lib/share-store';
import type { CritiqueReport } from '@/types/critique';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      report?: CritiqueReport;
      imageBase64?: string;
      mimeType?: string;
    };

    if (!body.report || !body.imageBase64 || !body.mimeType) {
      return NextResponse.json(
        { error: 'Missing report, imageBase64, or mimeType' },
        { status: 400 },
      );
    }

    const id = await storeReport(body.report, body.imageBase64, body.mimeType);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://critiqueai.app';
    const shareUrl = `${appUrl}/report/${id}`;

    return NextResponse.json({ id, shareUrl });
  } catch (err) {
    console.error('[/api/share] Error:', err);
    return NextResponse.json(
      { error: 'Failed to create share link. Try again.' },
      { status: 500 },
    );
  }
}
