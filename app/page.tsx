'use client';

/**
 * page.tsx — CritiqueAI main page
 *
 * Design intent:
 *   - Dark, cinematic, premium — like Linear built a UX tool
 *   - Hero: TiltCard with mouse parallax depth on the hero preview image
 *   - Animated background: slow-moving violet gradient blobs + noise grain
 *   - Page entrance: staggered reveal (logo → headline → sub → tags → body → input)
 *   - Input panel: glass surface with inner highlight
 *   - "How it works": Scroll-triggered stagger
 *   - Report: Slides up with a full staggered reveal sequence
 *
 * Motion philosophy:
 *   - Every animation must improve usability or signal hierarchy
 *   - prefers-reduced-motion is respected by all components
 *   - GPU-only transforms (no layout animation on scroll)
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

import { UploadZone } from '@/components/critique/UploadZone';
import { UrlInputForm } from '@/components/critique/UrlInputForm';
import { ModeSelector } from '@/components/critique/ModeSelector';
import { CritiqueReportView } from '@/components/critique/CritiqueReport';
import { StatusIndicator } from '@/components/critique/StatusIndicator';
import { AnimatedBackground, TiltCard, ScrollReveal, MagneticButton } from '@/components/motion';
import type { CritiqueMode, CritiqueReport, CritiqueStatus } from '@/types/critique';

type InputTab = 'upload' | 'url';

// ─── Hero visual — the product preview image in the TiltCard ────────────────
function HeroVisual() {
  return (
    <TiltCard className="w-full h-full" intensity={6}>
      <div className="relative w-full h-full min-h-[400px] select-none pointer-events-none flex items-center justify-center lg:justify-end">
        {/* Glow behind the image */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }}
        />
        <Image
          src="/img/HeroImg.png"
          alt="Example analysis showing heuristic annotations and accessibility findings overlaid on a UI screenshot"
          width={1000}
          height={800}
          priority
          className="w-full max-w-[760px] h-auto object-contain relative z-10"
          style={{ filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.6))' }}
        />
      </div>
    </TiltCard>
  );
}

// ─── Stat chip ───────────────────────────────────────────────────────────────
function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
      <span className="text-[13px] font-semibold text-[#E4E4E7]">{value}</span>
      <span className="text-[12px] text-[#52525B]">{label}</span>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<InputTab>('upload');
  const [mode, setMode]           = useState<CritiqueMode>('full_audit');
  const [status, setStatus]       = useState<CritiqueStatus>('idle');
  const [error, setError]         = useState<string | null>(null);
  const [report, setReport]       = useState<CritiqueReport | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType]   = useState<string>('image/png');
  const reduced = useReducedMotion();

  const isAnalyzing = ['capturing', 'uploading', 'analyzing', 'structuring'].includes(status);

  const handleAnalysisStart = useCallback((s: CritiqueStatus) => {
    setStatus(s); setError(null); setReport(null);
  }, []);

  const handleSuccess = useCallback((incoming: unknown, img: string, mime: string) => {
    setReport(incoming as CritiqueReport);
    setImageBase64(img);
    setMimeType(mime);
    setStatus('done');
  }, []);

  const handleError   = useCallback((msg: string) => { setError(msg); setStatus('error'); }, []);
  const handleReset   = useCallback(() => {
    setStatus('idle'); setError(null); setReport(null); setImageBase64('');
  }, []);

  return (
    <main className="relative min-h-screen bg-[#09090B] overflow-x-hidden">
      {/* ── Animated background (blobs + grain) ── */}
      <AnimatedBackground />

      {/* ── HEADER ── */}
      <motion.header
        className="relative z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.80)] h-[56px] flex items-center"
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="w-full px-5 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                boxShadow: '0 2px 8px rgba(124,58,237,0.40)',
              }}
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">CritiqueAI</span>
          </div>

          {/* Right: Gemini badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#52525B]">Powered by</span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] text-[#A1A1AA]"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              Gemini
            </span>
          </div>
        </div>
      </motion.header>

      {/* ── REPORT STATE ── */}
      <AnimatePresence mode="wait">
        {status === 'done' && report && (
          <motion.div
            key="report"
            className="content-container py-10"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Back button */}
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={reduced ? {} : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[13px] text-[#52525B] hover:text-[#A1A1AA] transition-colors cursor-pointer group"
                aria-label="Start a new critique"
              >
                <motion.svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                  animate={reduced ? {} : { x: [0, -2, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </motion.svg>
                New critique
              </button>
            </motion.div>
            <CritiqueReportView report={report} imageBase64={imageBase64} mimeType={mimeType} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO + INPUT STATE ── */}
      <AnimatePresence mode="wait">
        {status !== 'done' && (
          <motion.div
            key="hero"
            initial={reduced ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.99, filter: 'blur(4px)' }}
            transition={{ duration: 0.4 }}
          >
            {/* Hero section */}
            <section
              aria-label="CritiqueAI hero"
              className="relative w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 pt-14 lg:pt-20 pb-10 lg:pb-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 overflow-hidden"
            >
              {/* ── LEFT: Copy + Input panel ── */}
              <div className="relative z-10 flex-1 w-full lg:max-w-[500px] xl:max-w-[520px] flex flex-col justify-center shrink-0">

                {/* Eyebrow badge */}
                <motion.div
                  className="inline-flex items-center gap-2 mb-6 w-max"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <span
                    className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border"
                    style={{
                      color: '#A78BFA',
                      borderColor: 'rgba(124,58,237,0.30)',
                      background: 'rgba(124,58,237,0.08)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" aria-hidden="true" />
                    Free · Powered by Gemini
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  className="font-bold text-[#FAFAFA] leading-[0.92] tracking-[-0.04em] mb-5"
                  style={{ fontSize: 'clamp(52px, 8vw, 88px)' }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  Ship better{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 60%, #5B21B6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    UI.
                  </span>
                </motion.h1>

                {/* Sub-headline */}
                <motion.p
                  className="text-[20px] md:text-[22px] font-medium text-[#71717A] leading-snug mb-5"
                  style={{ letterSpacing: '-0.015em' }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  Find what's broken before your users do.
                </motion.p>

                {/* Feature tags */}
                <motion.div
                  className="flex items-center gap-3 flex-wrap mb-5"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.44, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {['WCAG', 'Nielsen Heuristics', 'Visual Hierarchy', 'Mobile UX'].map((tag, i) => (
                    <React.Fragment key={tag}>
                      <span className="text-[12px] font-medium text-[#52525B]">{tag}</span>
                      {i < 3 && <span className="text-[#27272A] text-[10px]">·</span>}
                    </React.Fragment>
                  ))}
                </motion.div>

                {/* Body copy */}
                <motion.p
                  className="text-[14px] text-[#52525B] leading-relaxed max-w-[400px] mb-7"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.54, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  Upload any screenshot or paste a URL. Get scored, actionable
                  feedback in under 60 seconds — grounded in real standards.
                </motion.p>

                {/* Stat chips */}
                <motion.div
                  className="flex flex-wrap gap-2 mb-8"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.62, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <StatChip value="4 modes" label="of analysis" />
                  <StatChip value="WCAG 2.2" label="grounded" />
                  <StatChip value="< 60s" label="turnaround" />
                </motion.div>

                {/* Hero visual — mobile only (shows before input) */}
                <motion.div
                  className="block lg:hidden w-full max-w-[480px] mb-8 relative h-[340px]"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <HeroVisual />
                </motion.div>

                {/* Input panel */}
                <motion.div
                  className="w-full rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.68, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Tab bar */}
                  <div
                    role="tablist"
                    aria-label="Input method"
                    className="flex px-5 pt-3 gap-0 border-b border-[rgba(255,255,255,0.06)]"
                    style={{ background: 'rgba(0,0,0,0.20)' }}
                  >
                    {(['upload', 'url'] as const).map((tab) => (
                      <button
                        key={tab}
                        role="tab"
                        id={`tab-${tab}`}
                        aria-selected={activeTab === tab}
                        aria-controls={`panel-${tab}`}
                        onClick={() => setActiveTab(tab)}
                        disabled={isAnalyzing}
                        className={[
                          'px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px cursor-pointer',
                          'transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7C3AED]',
                          activeTab === tab
                            ? 'border-[#7C3AED] text-[#A78BFA]'
                            : 'border-transparent text-[#52525B] hover:text-[#A1A1AA]',
                        ].join(' ')}
                      >
                        {tab === 'upload' ? 'Upload image' : 'Paste URL'}
                      </button>
                    ))}
                  </div>

                  {/* Panel body */}
                  <div className="p-5">
                    <div
                      role="tabpanel"
                      id="panel-upload"
                      aria-labelledby="tab-upload"
                      hidden={activeTab !== 'upload'}
                    >
                      {activeTab === 'upload' && (
                        <UploadZone
                          mode={mode}
                          onAnalysisStart={handleAnalysisStart}
                          onSuccess={handleSuccess}
                          onError={handleError}
                        />
                      )}
                    </div>
                    <div
                      role="tabpanel"
                      id="panel-url"
                      aria-labelledby="tab-url"
                      hidden={activeTab !== 'url'}
                    >
                      {activeTab === 'url' && (
                        <UrlInputForm
                          mode={mode}
                          onAnalysisStart={handleAnalysisStart}
                          onSuccess={handleSuccess}
                          onError={handleError}
                        />
                      )}
                    </div>

                    {/* Divider */}
                    <div className="divider my-4" />

                    {/* Mode selector */}
                    <ModeSelector selected={mode} onChange={setMode} disabled={isAnalyzing} />

                    {/* Status indicator */}
                    <AnimatePresence>
                      {isAnalyzing && (
                        <StatusIndicator status={status} />
                      )}
                    </AnimatePresence>

                    {/* Error state */}
                    <AnimatePresence>
                      {status === 'error' && error && (
                        <motion.div
                          role="alert"
                          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="mt-3 p-3 rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] flex items-start gap-2.5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <div>
                            <p className="text-[13px] text-[#FCA5A5] font-medium">{error}</p>
                            <button
                              onClick={handleReset}
                              className="text-[12px] text-[#F87171] underline underline-offset-2 mt-1 cursor-pointer hover:no-underline"
                            >
                              Try again
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* ── RIGHT: Hero visual (desktop) ── */}
              <motion.div
                className="hidden lg:flex flex-1 items-center justify-end min-w-0 lg:py-8"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <HeroVisual />
              </motion.div>
            </section>

            {/* ── HOW IT WORKS ── */}
            {status === 'idle' && (
              <section
                aria-labelledby="how-heading"
                className="border-t border-[rgba(255,255,255,0.06)]"
                style={{ background: 'rgba(255,255,255,0.01)' }}
              >
                <div className="content-container py-16 lg:py-24">
                  <ScrollReveal>
                    <h2
                      id="how-heading"
                      className="text-label text-[#3F3F46] mb-10"
                    >
                      How it works
                    </h2>
                  </ScrollReveal>

                  <ol className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6">
                    {[
                      { n: '01', text: 'Upload a screenshot or paste any live URL.' },
                      { n: '02', text: 'Choose Quick scan, Full audit, Accessibility, or Mobile.' },
                      { n: '03', text: 'Gemini analyzes it — grounded in WCAG 2.2 and Nielsen\'s 10 heuristics.' },
                      { n: '04', text: 'Review severity-rated issues, each with an actionable fix.' },
                      { n: '05', text: 'Export as Markdown or share a read-only link with your team.' },
                    ].map(({ n, text }, i) => (
                      <ScrollReveal key={n} delay={i * 0.08} distance={20}>
                        <li className="flex flex-col relative">
                          {i < 4 && (
                            <div
                              className="hidden lg:block absolute top-[8px] left-[28px] right-[calc(-1.5rem)] h-[1px]"
                              style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.3), rgba(255,255,255,0.04))' }}
                              aria-hidden="true"
                            />
                          )}

                          <div className="flex items-center gap-2.5 relative z-10 w-max pr-4 mb-3"
                               style={{ background: 'rgba(9,9,11,0.9)' }}>
                            <div className="w-4 h-4 rounded-full border border-[rgba(124,58,237,0.40)] bg-[rgba(124,58,237,0.10)] flex items-center justify-center shrink-0" aria-hidden="true">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                            </div>
                            <span className="text-mono text-[13px] text-[#7C3AED] font-bold">{n}</span>
                          </div>

                          <p className="text-[14px] text-[#52525B] leading-relaxed max-w-[220px]">
                            {text}
                          </p>
                        </li>
                      </ScrollReveal>
                    ))}
                  </ol>
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
