'use client';

/**
 * page.tsx — CritiqueAI V3
 *
 * "Quiet Confidence" architecture.
 * Global drop target. No containers. Seamless layout morphs.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { GlobalDropCanvas } from '@/components/critique/GlobalDropCanvas';
import { UrlInputForm } from '@/components/critique/UrlInputForm';
import { ActionMenu } from '@/components/critique/ActionMenu';
import { CritiqueReportView } from '@/components/critique/CritiqueReport';
import { CinematicScanner } from '@/components/motion';
import type { CritiqueMode, CritiqueReport, CritiqueStatus } from '@/types/critique';

export default function HomePage() {
  const [mode, setMode]           = useState<CritiqueMode>('full_audit');
  const [status, setStatus]       = useState<CritiqueStatus>('idle');
  const [error, setError]         = useState<string | null>(null);
  const [report, setReport]       = useState<CritiqueReport | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType]   = useState<string>('image/png');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const reduced = useReducedMotion();

  const isAnalyzing = ['capturing', 'uploading', 'analyzing', 'structuring'].includes(status);

  const handleAnalysisStart = useCallback((s: CritiqueStatus) => {
    setStatus(s); 
    setError(null); 
    setReport(null);
  }, []);

  const handleSuccess = useCallback((incoming: unknown, img: string, mime: string) => {
    setReport(incoming as CritiqueReport);
    setImageBase64(img);
    setMimeType(mime);
    setStatus('done');
    setShowUrlInput(false);
  }, []);

  const handleError   = useCallback((msg: string) => { setError(msg); setStatus('error'); }, []);
  const handleReset   = useCallback(() => {
    setStatus('idle'); 
    setError(null); 
    setReport(null); 
    setImageBase64('');
    setShowUrlInput(false);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#000000] flex flex-col items-center justify-center overflow-x-hidden selection:bg-[#06B6D4] selection:text-white">
      {/* ── GLOBAL DECORATIONS ── */}
      <div 
        className="fixed z-50 font-mono text-white pointer-events-none"
        style={{ top: 24, left: 24, fontSize: 13, opacity: 0.35 }}
      >
        CritiqueAI
      </div>
      
      <div 
        className="fixed z-50 text-white pointer-events-none"
        style={{ 
          bottom: 24, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          fontSize: 12, 
          opacity: 0.22,
          letterSpacing: '0.03em'
        }}
      >
        ⌘V to paste from clipboard
      </div>

      {/* ── ERROR TOAST ── */}
      <AnimatePresence>
        {status === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] backdrop-blur-md shadow-2xl"
          >
            <p className="text-[14px] text-[#FCA5A5] font-medium flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── URL INPUT OVERLAY ── */}
      <AnimatePresence>
        {showUrlInput && status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 w-full max-w-md z-40 px-6"
          >
            <div className="p-4 rounded-2xl bg-[rgba(17,17,19,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-2xl relative">
              <button 
                onClick={() => setShowUrlInput(false)}
                className="absolute top-2 right-2 p-2 text-[#71717A] hover:text-[#FAFAFA] transition-colors"
                aria-label="Close URL input"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <UrlInputForm mode={mode} onAnalysisStart={handleAnalysisStart} onSuccess={handleSuccess} onError={handleError} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN VIEWS ── */}
      <AnimatePresence mode="wait">
        
        {/* IDLE / GLOBAL CANVAS */}
        {status === 'idle' && (
          <motion.div 
            key="canvas" 
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <GlobalDropCanvas 
              mode={mode} 
              onAnalysisStart={handleAnalysisStart} 
              onSuccess={handleSuccess} 
              onError={handleError}
              onUrlInputTrigger={() => setShowUrlInput(true)}
            />
          </motion.div>
        )}

        {/* SCANNING STATE (Authentic wait) */}
        {isAnalyzing && (
          <motion.div
            key="scanning"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
             <div className="relative w-24 h-24 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] overflow-hidden shadow-2xl">
               <CinematicScanner isScanning={true} />
             </div>
             <motion.p 
               animate={{ opacity: [0.5, 1, 0.5] }} 
               transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
               className="text-[14px] text-[#A1A1AA] font-mono tracking-wider uppercase"
             >
               {status === 'capturing' ? 'Capturing URL...' : status === 'uploading' ? 'Uploading...' : 'Analyzing Interface...'}
             </motion.p>
          </motion.div>
        )}

        {/* DONE / REPORT VIEW */}
        {status === 'done' && report && (
          <motion.div
            key="report"
            className="content-container py-16 w-full relative z-30 min-h-screen"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
          >
            {/* Top Toolbar */}
            <motion.div
              className="flex justify-between items-center mb-12"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                       border: '1px solid rgba(255,255,255,0.08)'
                     }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <span className="text-[#FAFAFA] font-medium text-[14px]">CritiqueAI</span>
              </div>
              
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

      {/* ── ACTION MENU (Gear icon for settings) ── */}
      {status === 'idle' && (
        <ActionMenu mode={mode} onModeChange={setMode} disabled={isAnalyzing} />
      )}
    </main>
  );
}
