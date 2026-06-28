'use client';

/**
 * page.tsx — CritiqueAI main page (V2)
 *
 * Design intent:
 *   - Ultra-premium, deeply calm, centered experience.
 *   - Removed all SaaS "fluff" (navbars, split layouts, feature pills).
 *   - Staggered, cinematic entrance.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { UploadZone } from '@/components/critique/UploadZone';
import { UrlInputForm } from '@/components/critique/UrlInputForm';
import { ModeSelector } from '@/components/critique/ModeSelector';
import { CritiqueReportView } from '@/components/critique/CritiqueReport';
import { StatusIndicator } from '@/components/critique/StatusIndicator';
import { AnimatedBackground, FadeIn, SlideUp, ScaleIn } from '@/components/motion';
import type { CritiqueMode, CritiqueReport, CritiqueStatus } from '@/types/critique';

type InputTab = 'upload' | 'url';

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
    <main className="relative min-h-screen bg-[#09090B] flex flex-col items-center overflow-x-hidden selection:bg-[#06B6D4] selection:text-white">
      <AnimatedBackground />

      {/* ── REPORT STATE ── */}
      <AnimatePresence mode="wait">
        {status === 'done' && report && (
          <motion.div
            key="report"
            className="content-container py-16 w-full relative z-10"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // smooth apple-like spring curve
          >
            {/* Back button */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-[13px] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                aria-label="Start a new critique"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
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
            className="flex-1 flex flex-col items-center justify-center w-full px-5 md:px-8 py-20 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Centered Brand Mark */}
            <FadeIn delay={0.1}>
              <div className="w-10 h-10 rounded-xl mb-8 flex items-center justify-center mx-auto"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                   }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </FadeIn>

            {/* Headline */}
            <SlideUp delay={0.2} className="text-center">
              <h1 className="text-[40px] md:text-[56px] font-bold text-[#FAFAFA] leading-[1.05] tracking-tight mb-4 max-w-[600px] mx-auto">
                Every Interface Has Flaws. <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#67E8F9] to-[#0891B2]">Find Yours.</span>
              </h1>
            </SlideUp>

            {/* Subheading */}
            <SlideUp delay={0.3} className="text-center">
              <p className="text-[16px] md:text-[18px] text-[#A1A1AA] leading-relaxed max-w-[500px] mx-auto mb-10">
                Stop guessing. Upload a screenshot and get actionable UX feedback grounded in heuristics.
              </p>
            </SlideUp>

            {/* Main Input Box */}
            <ScaleIn delay={0.4} className="w-full max-w-[540px]">
              <div className="rounded-3xl p-[1px] relative overflow-hidden">
                {/* Subtle border wrap */}
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-[rgba(255,255,255,0.02)] pointer-events-none rounded-3xl" />
                
                <div className="relative rounded-[23px] bg-[rgba(17,17,19,0.7)] backdrop-blur-xl p-2 pb-5 flex flex-col gap-4">
                  {/* Tabs */}
                  <div className="flex items-center gap-1 p-1 rounded-2xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.04)] w-max mx-auto mt-2">
                    {(['upload', 'url'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        disabled={isAnalyzing}
                        className={`relative px-5 py-1.5 rounded-xl text-[13px] font-medium transition-colors ${
                          activeTab === tab ? 'text-white' : 'text-[#71717A] hover:text-[#A1A1AA]'
                        } disabled:opacity-50`}
                      >
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-[rgba(255,255,255,0.08)] rounded-xl border border-[rgba(255,255,255,0.05)]"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{tab === 'upload' ? 'Upload Image' : 'Paste URL'}</span>
                      </button>
                    ))}
                  </div>

                  <div className="px-4 pt-2">
                    <AnimatePresence mode="wait">
                      {activeTab === 'upload' ? (
                        <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          <UploadZone mode={mode} onAnalysisStart={handleAnalysisStart} onSuccess={handleSuccess} onError={handleError} />
                        </motion.div>
                      ) : (
                        <motion.div key="url" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                          <UrlInputForm mode={mode} onAnalysisStart={handleAnalysisStart} onSuccess={handleSuccess} onError={handleError} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="my-5 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />
                    
                    <ModeSelector selected={mode} onChange={setMode} disabled={isAnalyzing} />

                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-5">
                          <StatusIndicator status={status} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {status === 'error' && error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-center"
                        >
                          <p className="text-[13px] text-[#FCA5A5] font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </ScaleIn>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
