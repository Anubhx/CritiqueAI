/**
 * app/api/critique/route.ts
 * POST: accepts image (base64 or file upload) + mode → Gemini → returns CritiqueReport JSON
 * Node runtime (not Edge) — handles binary image data.
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';
import { getModePrompt } from '@/lib/critique-modes';
import type { CritiqueMode } from '@/types/critique';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

function isAllowedMimeType(type: string): type is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(type as AllowedMimeType);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const modeRaw = formData.get('mode') as string;
    const imageFile = formData.get('image') as File | null;
    const imageBase64Raw = formData.get('imageBase64') as string | null;
    const imageMimeTypeRaw = formData.get('mimeType') as string | null;

    // Validate mode
    const validModes: CritiqueMode[] = [
      'quick_scan',
      'full_audit',
      'accessibility_only',
      'mobile_ux',
    ];
    if (!validModes.includes(modeRaw as CritiqueMode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }
    const mode = modeRaw as CritiqueMode;

    let imageBase64: string;
    let mimeType: AllowedMimeType;

    if (imageFile) {
      // Direct file upload
      if (!isAllowedMimeType(imageFile.type)) {
        return NextResponse.json(
          { error: "That file couldn't be processed. Try a JPG, PNG, or WebP under 10MB." },
          { status: 400 },
        );
      }
      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "That file couldn't be processed. Try a JPG, PNG, or WebP under 10MB." },
          { status: 400 },
        );
      }
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString('base64');
      mimeType = imageFile.type as AllowedMimeType;
    } else if (imageBase64Raw && imageMimeTypeRaw) {
      // Pre-captured base64 (from URL capture flow)
      if (!isAllowedMimeType(imageMimeTypeRaw)) {
        return NextResponse.json({ error: 'Invalid image mime type' }, { status: 400 });
      }
      imageBase64 = imageBase64Raw;
      mimeType = imageMimeTypeRaw as AllowedMimeType;
    } else {
      return NextResponse.json(
        { error: 'No image provided. Send an image file or base64 data.' },
        { status: 400 },
      );
    }

    const systemPrompt = getModePrompt(mode);
    const report = await analyzeWithGemini(imageBase64, mimeType, systemPrompt);

    return NextResponse.json({ report, imageBase64, mimeType });
  } catch (err) {
    const error = err as Error & { type?: string };

    if (error.type === 'rate_limit') {
      return NextResponse.json(
        { error: 'All Gemini API keys are rate-limited. Try again in a moment.' },
        { status: 429 },
      );
    }

    console.error('[/api/critique] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong generating your critique. Try again in a moment.' },
      { status: 500 },
    );
  }
}
