import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Moved from Google Fonts <link> (render-blocking) to next/font (zero FOUT)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'CritiqueAI — Instant UX Critique for Any Screen',
  description:
    'Upload a screenshot or paste a URL and get a structured UX critique — heuristics, accessibility, and visual hierarchy issues with severity ratings and specific fixes, powered by Gemini.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://critiqueai.app'),
  openGraph: {
    title: 'CritiqueAI — Instant UX Critique for Any Screen',
    description:
      'Upload a screenshot or paste a URL and get a structured UX critique — heuristics, accessibility, and visual hierarchy issues with severity ratings and specific fixes, powered by Gemini.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CritiqueAI — Instant UX Critique for Any Screen',
    description: 'Structured AI-powered UX critique grounded in real heuristics and WCAG criteria.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#09090B] text-[#FAFAFA] antialiased">{children}</body>
    </html>
  );
}
