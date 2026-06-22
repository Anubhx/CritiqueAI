/**
 * lib/screenshot-capture.ts — Playwright URL-to-screenshot capture.
 * User-facing URL capture flow (NOT test tooling — see /e2e for tests).
 * Server-only. Called from app/api/capture/route.ts.
 */

import type { ViewportPreference } from '@/lib/critique-modes';

export interface CaptureResult {
  imageBase64: string;
  mimeType: 'image/png';
}

export interface CaptureError {
  type: 'load_failure' | 'login_wall' | 'redirect_loop' | 'timeout' | 'invalid_url';
  message: string;
}

const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };
const PAGE_TIMEOUT_MS = 25_000;
const NAVIGATION_TIMEOUT_MS = 20_000;

// Login wall indicators — common patterns across major platforms
const LOGIN_WALL_INDICATORS = [
  'sign in',
  'log in',
  'login',
  'create account',
  'join now',
  'password',
  'authentication required',
  '401',
  '403',
];

export async function captureScreenshot(
  url: string,
  viewport: ViewportPreference,
): Promise<CaptureResult> {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    const err: CaptureError = {
      type: 'invalid_url',
      message: 'That URL doesn\'t look valid. Make sure it starts with https://',
    };
    throw err;
  }

  // Dynamic import so this module only loads server-side
  // On Vercel, uses @sparticuz/chromium-min + playwright-core
  let chromium: typeof import('@sparticuz/chromium-min');
  let playwright: typeof import('playwright-core');

  try {
    chromium = await import('@sparticuz/chromium-min');
    playwright = await import('playwright-core');
  } catch {
    // Local dev fallback — use system Playwright install
    const { chromium: localChromium } = await import('playwright-core');
    return captureWithBrowser(url, viewport, localChromium, null);
  }

  try {
    await (chromium.default as unknown as { font: (url: string) => Promise<void> }).font(
      'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
    );
  } catch {
    // Font preload is optional — continue if it fails
  }

  const executablePath = await chromium.default.executablePath(
    `https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar`
  );

  const browser = await playwright.chromium.launch({
    args: chromium.default.args,
    executablePath,
    headless: true,
  });

  try {
    return await captureWithBrowser(url, viewport, null, browser);
  } finally {
    await browser.close();
  }
}

async function captureWithBrowser(
  url: string,
  viewport: ViewportPreference,
  chromiumLauncher: { launch: (opts: object) => Promise<import('playwright-core').Browser> } | null,
  existingBrowser: import('playwright-core').Browser | null,
): Promise<CaptureResult> {
  const viewportSize = viewport === 'mobile' ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT;

  let browser = existingBrowser;
  if (!browser && chromiumLauncher) {
    browser = await chromiumLauncher.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: viewportSize,
    });
  }
  if (!browser) throw new Error('No browser available');

  const page = await browser.newPage();
  page.setDefaultTimeout(PAGE_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);

  await page.setViewportSize(viewportSize);
  await page.setExtraHTTPHeaders({
    'User-Agent':
      viewport === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  try {
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: NAVIGATION_TIMEOUT_MS,
    });

    const status = response?.status() ?? 0;

    if (status === 401 || status === 403) {
      const err: CaptureError = {
        type: 'login_wall',
        message:
          'That page appears to require login or didn\'t render any content — try a public URL instead.',
      };
      throw err;
    }

    if (status >= 400) {
      const err: CaptureError = {
        type: 'load_failure',
        message: `We couldn't load that page (HTTP ${status}). Check the URL and try again.`,
      };
      throw err;
    }

    // Check for login wall via page content
    const bodyText = await page.evaluate(() => document.body?.innerText?.toLowerCase() ?? '');
    const isLoginWall = LOGIN_WALL_INDICATORS.some(
      (indicator) =>
        bodyText.includes(indicator) &&
        bodyText.length < 2000, // Short page + login keywords = likely a gate
    );

    if (isLoginWall) {
      const err: CaptureError = {
        type: 'login_wall',
        message:
          'That page appears to require login or didn\'t render any content — try a public URL instead.',
      };
      throw err;
    }

    // Wait a bit for JS-rendered content to settle
    await page.waitForTimeout(1500);

    const screenshotBuffer = await page.screenshot({
      type: 'png',
      fullPage: false, // Viewport capture, not full page scroll
    });

    const imageBase64 = screenshotBuffer.toString('base64');
    return { imageBase64, mimeType: 'image/png' };
  } catch (err) {
    // Re-throw our typed CaptureErrors
    if ((err as CaptureError).type) throw err;

    const error = err as Error;
    if (error.message?.includes('net::ERR') || error.message?.includes('NS_ERROR')) {
      const captureErr: CaptureError = {
        type: 'load_failure',
        message:
          "We couldn't load that page. Check the URL and try again — some sites block automated access.",
      };
      throw captureErr;
    }

    if (error.message?.includes('Timeout') || error.message?.includes('timeout')) {
      const captureErr: CaptureError = {
        type: 'timeout',
        message: 'That page took too long to load. Try again or use a faster-loading URL.',
      };
      throw captureErr;
    }

    throw err;
  } finally {
    await page.close();
  }
}
