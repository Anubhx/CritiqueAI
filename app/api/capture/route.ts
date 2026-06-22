/**
 * app/api/capture/route.ts
 * POST: accepts { url, viewport } → Playwright screenshot → forwards to /api/critique
 * Node runtime required (Playwright + Chromium binary).
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { captureScreenshot } from '@/lib/screenshot-capture';
import { analyzeWithGemini } from '@/lib/gemini';
import { getModePrompt, getModeViewport } from '@/lib/critique-modes';
import type { CritiqueMode } from '@/types/critique';
import type { CaptureError } from '@/lib/screenshot-capture';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { url?: string; mode?: string };

    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const validModes: CritiqueMode[] = [
      'quick_scan',
      'full_audit',
      'accessibility_only',
      'mobile_ux',
    ];
    const mode: CritiqueMode = validModes.includes(body.mode as CritiqueMode)
      ? (body.mode as CritiqueMode)
      : 'full_audit';

    const viewport = getModeViewport(mode);

    // Step 1: Capture screenshot
    const { imageBase64, mimeType } = await captureScreenshot(body.url, viewport);

    // Step 2: Analyze with Gemini (server-side, no client round-trip)
    const systemPrompt = getModePrompt(mode);
    const report = await analyzeWithGemini(imageBase64, mimeType, systemPrompt);

    return NextResponse.json({ report, imageBase64, mimeType });
  } catch (err) {
    const error = err as CaptureError & Error & { type?: string };

    // Typed capture errors
    if (
      error.type === 'load_failure' ||
      error.type === 'login_wall' ||
      error.type === 'redirect_loop' ||
      error.type === 'timeout' ||
      error.type === 'invalid_url'
    ) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    if (error.type === 'rate_limit') {
      return NextResponse.json(
        { error: 'All Gemini API keys are rate-limited. Try again in a moment.' },
        { status: 429 },
      );
    }

    console.error('[/api/capture] Error:', error);
    return NextResponse.json(
      {
        error:
          "We couldn't load that page. Check the URL and try again — some sites block automated access.",
      },
      { status: 500 },
    );
  }
}
