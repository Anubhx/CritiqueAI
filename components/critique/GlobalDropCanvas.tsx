'use client';

/**
 * GlobalDropCanvas.tsx
 *
 * Replaces the containerized UploadZone. 
 * Makes the entire screen a drop target while providing explicit typography affordances.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { CritiqueMode, CritiqueStatus } from '@/types/critique';

interface GlobalDropCanvasProps {
  mode: CritiqueMode;
  onAnalysisStart: (status: CritiqueStatus) => void;
  onSuccess: (report: unknown, imageBase64: string, mimeType: string) => void;
  onError: (message: string) => void;
  onUrlInputTrigger?: () => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const GlobalDropCanvas: React.FC<GlobalDropCanvasProps> = ({
  mode,
  onAnalysisStart,
  onSuccess,
  onError,
  onUrlInputTrigger,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  // Track drag events globally to handle the visual state
  const dragCounter = useRef(0);

  const processFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError("Unsupported format. Try a JPG, PNG, or WebP under 10 MB.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        onError("File too large. Max 10 MB — try compressing or cropping first.");
        return;
      }

      onAnalysisStart('uploading');

      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', mode);

      try {
        onAnalysisStart('analyzing');
        const res = await fetch('/api/critique', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
          onError(data.error ?? 'Analysis failed. Try again.');
          return;
        }

        onAnalysisStart('structuring');
        // No fake delay here. We just wait for the component to handle the staggered reveal.
        onSuccess(data.report, data.imageBase64, data.mimeType);
      } catch {
        onError('Something went wrong. Check your connection and try again.');
      }
    },
    [mode, onAnalysisStart, onSuccess, onError],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      dragCounter.current = 0;
      
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imageItem = items.find((item) => item.kind === 'file' && ACCEPTED_TYPES.includes(item.type));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) processFile(file);
      }
    },
    [processFile],
  );

  // Bind global paste listener
  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [processFile],
  );

  return (
    <motion.div
      className="absolute inset-0 z-0 flex items-center justify-center"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Choose a screenshot file"
        tabIndex={-1}
      />

      {/* Background Dim/Glow on Drag Over */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[rgba(6,182,212,0.03)] pointer-events-none"
            style={{ boxShadow: 'inset 0 0 100px rgba(6,182,212,0.1)' }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo/Icon */}
        <motion.div 
          className="mb-8 w-12 h-12 flex items-center justify-center opacity-80"
          animate={{ scale: dragOver ? 1.1 : 1, opacity: dragOver ? 1 : 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </motion.div>

        {/* Primary Affordance */}
        <motion.h1 
          className="text-[32px] md:text-[40px] font-medium text-[#FAFAFA] tracking-tight mb-6"
          animate={{ y: dragOver ? -10 : 0, scale: dragOver ? 1.05 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {dragOver ? (
            <span className="text-[#06B6D4]">Drop to analyze</span>
          ) : (
            'Drop a screenshot'
          )}
        </motion.h1>

        {/* Secondary Affordances */}
        <motion.div 
          className="flex items-center gap-3 text-[14px] text-[#A1A1AA] font-medium"
          animate={{ opacity: dragOver ? 0 : 1, y: dragOver ? 10 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span>or</span>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[#E4E4E7] hover:text-[#06B6D4] transition-colors underline decoration-[rgba(255,255,255,0.2)] underline-offset-4 hover:decoration-[#06B6D4]"
          >
            browse files
          </button>
          <span>/</span>
          <button 
            onClick={onUrlInputTrigger}
            className="text-[#E4E4E7] hover:text-[#06B6D4] transition-colors underline decoration-[rgba(255,255,255,0.2)] underline-offset-4 hover:decoration-[#06B6D4]"
          >
            paste website URL
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
