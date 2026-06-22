/**
 * lib/gemini.ts — Gemini API client with multi-key round-robin rotation.
 * Server-only. Never import this in a client component.
 *
 * Key rotation strategy:
 * - Keys are read from GEMINI_API_KEY_1, GEMINI_API_KEY_2, … at startup
 * - A module-level counter picks the next key per request (round-robin)
 * - On a 429 rate-limit or 503 error, the rotator tries the next key automatically
 * - All keys exhausted → throws a rate_limit error to the caller
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CritiqueReport } from '@/types/critique';

// Collect all GEMINI_API_KEY_N env vars at module load time
function loadApiKeys(): string[] {
  const keys: string[] = [];
  let i = 1;
  while (true) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (!key) break;
    keys.push(key);
    i++;
  }
  if (keys.length === 0) {
    throw new Error('No Gemini API keys configured. Add GEMINI_API_KEY_1 to your .env.local');
  }
  return keys;
}

let keys: string[];
let keyIndex = 0;

function getNextKey(): string {
  if (!keys) keys = loadApiKeys();
  const key = keys[keyIndex % keys.length];
  keyIndex++;
  return key;
}

const MODEL_NAME = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

/**
 * Analyze an image with a given system prompt, rotating Gemini API keys
 * on 429 and 503 errors. Returns parsed CritiqueReport JSON.
 */
export async function analyzeWithGemini(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
  systemPrompt: string,
): Promise<CritiqueReport> {
  if (!keys) keys = loadApiKeys();

  let lastError: Error | null = null;

  // Try each key once before giving up
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = getNextKey();
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
        systemPrompt,
      ]);

      const text = result.response.text();

      // Strip markdown code fences if Gemini wraps output in ```json ... ```
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();

      const parsed = JSON.parse(cleaned) as CritiqueReport;
      return parsed;
    } catch (err) {
      const error = err as Error & { status?: number };
      // 429 = rate limit, 503 = service unavailable — try next key
      if (error.status === 429 || error.message?.includes('429') || error.status === 503 || error.message?.includes('503')) {
        lastError = error;
        continue;
      }
      // Other errors (4xx, parse failure) — rethrow immediately
      throw err;
    }
  }

  // All keys exhausted on 429s/503s
  throw Object.assign(
    new Error('All Gemini API keys are rate-limited or experiencing high demand. Try again in a moment.'),
    { type: 'rate_limit', cause: lastError },
  );
}
