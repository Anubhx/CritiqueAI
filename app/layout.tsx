import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
    <html lang="en" className={inter.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAFAF9] text-[#1C1917] antialiased">{children}</body>
    </html>
  );
}
