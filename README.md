# CritiqueAI

Instant AI-powered UX critique for any screen. Upload a screenshot or paste a URL — get severity-rated issues with specific fixes, grounded in Nielsen's heuristics, WCAG 2.1 AA, and Gestalt principles.

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your keys
4. Run Supabase migration (see `supabase/migration.sql`)
5. `npm run dev`

## Tech Stack

- **Next.js 14** App Router, TypeScript strict
- **Tailwind CSS v3** with custom design token config
- **Google Gemini API** (`gemini-2.5-flash`) — multiple key rotation for free tier
- **Playwright** + `@sparticuz/chromium-min` — URL-to-screenshot capture on Vercel
- **Supabase** — Postgres for reports + Storage for images

## Environment Variables

See `.env.example` for all required variables.