'use client';

import React, { useState, useCallback } from 'react';
import { UploadZone } from '@/components/critique/UploadZone';
import { UrlInputForm } from '@/components/critique/UrlInputForm';
import { ModeSelector } from '@/components/critique/ModeSelector';
import { CritiqueReportView } from '@/components/critique/CritiqueReport';
import { StatusIndicator } from '@/components/critique/StatusIndicator';
import type { CritiqueMode, CritiqueReport, CritiqueStatus } from '@/types/critique';

import Image from 'next/image';

type InputTab = 'upload' | 'url';

/* ─── Hero Visual: Static Image ─── */
function HeroVisual() {
  return (
    <div className="relative w-full h-full min-h-[400px] select-none pointer-events-none flex items-center justify-center lg:justify-end">
      <Image
        src="/img/HeroImg.png"
        alt="Example website analysis showing heuristic and accessibility annotations overlaid on a UI"
        width={1000}
        height={800}
        priority
        className="w-full max-w-[800px] h-auto object-contain scale-110 lg:scale-100 origin-center lg:origin-right"
      />
    </div>
  );
}

/* ─── Main page ─── */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<InputTab>('upload');
  const [mode, setMode]           = useState<CritiqueMode>('full_audit');
  const [status, setStatus]       = useState<CritiqueStatus>('idle');
  const [error, setError]         = useState<string | null>(null);
  const [report, setReport]       = useState<CritiqueReport | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType]   = useState<string>('image/png');

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
  const handleReset   = useCallback(() => { setStatus('idle'); setError(null); setReport(null); setImageBase64(''); }, []);

  return (
    <main className="min-h-screen bg-[#FAFAF9]">

      {/* ── HEADER ── */}
      <header className="border-b border-[#E7E5E4] bg-white h-[60px] flex items-center sticky top-0 z-40">
        <div className="w-full px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#4338CA] flex items-center justify-center shrink-0" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-[#1C1917] tracking-tight">CritiqueAI</span>
          </div>
          <span className="text-[11px] text-[#A8A29E] font-mono tracking-wide">Powered by Gemini</span>
        </div>
      </header>

      {/* ── REPORT STATE (full width below header) ── */}
      {status === 'done' && report && (
        <div className="content-container py-8">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[13px] text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
              aria-label="Start a new critique"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              New critique
            </button>
          </div>
          <CritiqueReportView report={report} imageBase64={imageBase64} mimeType={mimeType} />
        </div>
      )}

      {/* ── HERO + INPUT STATE ── */}
      {status !== 'done' && (
        <>
          {/* Hero section */}
          <section
            aria-label="CritiqueAI hero"
            className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 overflow-hidden"
          >
            {/* ── LEFT: Brand copy + input panel ── */}
            <div className="relative z-10 flex-1 w-full lg:max-w-[500px] xl:max-w-[540px] lg:py-12 xl:py-16 flex flex-col justify-center shrink-0">
              {/* Eyebrow */}
              <div className="hero-slide-1 inline-flex items-center gap-2 mb-5">
                <span className="inline-block w-5 h-[2px] bg-[#4338CA]" />
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#4338CA]">
                  Professional UX Analysis
                </span>
              </div>

              {/* Wordmark — large display */}
              <h1 className="hero-slide-2 font-bold text-[#1C1917] leading-[0.95] tracking-[-0.04em] mb-4"
                  style={{ fontSize: 'clamp(44px, 7vw, 88px)' }}>
                CRITIQUE<span className="text-[#4338CA]">AI</span>
              </h1>

              {/* Sub-headline */}
              <p className="hero-slide-3 text-[22px] md:text-[26px] font-semibold text-[#1C1917] leading-snug mb-4"
                 style={{ letterSpacing: '-0.02em' }}>
                Professional<br />UX Analysis
              </p>

              {/* Attribute tags */}
              <div className="hero-slide-4 flex items-center gap-2 flex-wrap mb-5">
                {['Accessibility', 'Heuristics', 'Visual Hierarchy'].map((tag, i) => (
                  <React.Fragment key={tag}>
                    <span className="text-[14px] text-[#57534E]">{tag}</span>
                    {i < 2 && <span className="text-[#D6D3D1] text-[14px]">•</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* Short desc */}
              <p className="hero-slide-5 text-[15px] text-[#57534E] leading-relaxed max-w-[420px] mb-8">
                Upload a screen.<br />Receive a structured critique.
              </p>

              {/* Hero visual — shows on mobile below copy, replaces the panel */}
              <div className="block lg:hidden w-full max-w-[480px] mb-8 relative h-[400px]">
                <HeroVisual />
              </div>

              {/* Input panel — inline on the left */}
              <div className="hero-slide-5 w-full bg-white border border-[#E7E5E4] rounded-2xl shadow-lg overflow-hidden">
                {/* Tab bar */}
                <div
                  role="tablist"
                  aria-label="Input method"
                  className="flex px-5 pt-3 border-b border-[#F0EFEE] gap-0 bg-[#FAFAF9]"
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
                      className={`
                        px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px cursor-pointer
                        transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4338CA]
                        ${activeTab === tab
                          ? 'border-[#4338CA] text-[#4338CA] bg-white rounded-t-lg'
                          : 'border-transparent text-[#78716C] hover:text-[#44403C]'}
                      `}
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
                  <div className="border-t border-[#F0EFEE] my-4" />

                  {/* Mode selector */}
                  <ModeSelector selected={mode} onChange={setMode} disabled={isAnalyzing} />

                  {/* Status */}
                  {isAnalyzing && (
                    <div className="mt-3">
                      <StatusIndicator status={status} />
                    </div>
                  )}

                  {/* Error */}
                  {status === 'error' && error && (
                    <div
                      role="alert"
                      className="mt-3 p-3 rounded-lg border border-[#FCEBEB] bg-[#FCEBEB] flex items-start gap-2.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#791F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <div>
                        <p className="text-[12px] text-[#791F1F] font-medium">{error}</p>
                        <button
                          onClick={handleReset}
                          className="text-[11px] text-[#791F1F] underline mt-0.5 cursor-pointer hover:no-underline"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Hero decorative visual ── */}
            <div className="hidden lg:flex flex-1 items-center justify-end min-w-0">
              <HeroVisual />
            </div>
          </section>

          {/* ── HOW IT WORKS — below the hero fold ── */}
          {status === 'idle' && (
            <section aria-labelledby="how-heading" className="border-t border-b border-[#E7E5E4] bg-[#F5F5F4]">
              <div className="content-container py-16 lg:py-24">
                <h2 id="how-heading" className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#A8A29E] mb-10">
                  How it works
                </h2>
                
                <ol className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-8">
                  {[
                    { n: '01', text: 'Upload a screenshot or paste any live URL.' },
                    { n: '02', text: 'Choose a critique mode: Quick scan, Full audit, A11y, or Mobile.' },
                    { n: '03', text: 'Gemini analyzes it — grounded in WCAG criteria and Nielsen heuristics.' },
                    { n: '04', text: 'Review severity-rated issues, each with a specific actionable fix.' },
                    { n: '05', text: 'Export as Markdown or share a read-only link with your team.' },
                  ].map(({ n, text }, i) => (
                    <li key={n} className="flex flex-col relative">
                      {/* Connector line - desktop only, connecting this step to the next */}
                      {i < 4 && (
                        <div className="hidden lg:block absolute top-[11px] left-[40px] right-[calc(-2rem)] h-[1px] bg-[#D6D3D1]" aria-hidden="true" />
                      )}
                      
                      <div className="flex items-center gap-3 relative z-10 w-max pr-4 bg-[#F5F5F4] mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#4338CA] shrink-0" aria-hidden="true" />
                        <span className="text-mono text-[15px] text-[#4338CA] font-bold tracking-wide">{n}</span>
                      </div>

                      <span className="text-[14px] text-[#57534E] leading-relaxed max-w-[260px]">
                        {text}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
