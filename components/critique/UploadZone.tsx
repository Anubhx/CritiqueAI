'use client';

/**
 * UploadZone.tsx (V2)
 *
 * Animation intent:
 *   - Idle: Wrapped in a Spotlight that creates a subtle light aura tracking the mouse.
 *   - Hover/Drag over: Card responds physically (lifts, glows cyan).
 *   - Success (file selected): Smooth morph into checkmark.
 */

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Spotlight, AnimatedBorder } from '@/components/motion';
import type { CritiqueMode, CritiqueStatus } from '@/types/critique';

interface UploadZoneProps {
  mode: CritiqueMode;
  onAnalysisStart: (status: CritiqueStatus) => void;
  onSuccess: (report: unknown, imageBase64: string, mimeType: string) => void;
  onError: (message: string) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const UploadZone: React.FC<UploadZoneProps> = ({
  mode,
  onAnalysisStart,
  onSuccess,
  onError,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dropped, setDropped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

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

      setFileName(file.name);
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
        await new Promise((r) => setTimeout(r, 500));
        onSuccess(data.report, data.imageBase64, data.mimeType);
      } catch {
        onError('Something went wrong. Check your connection and try again.');
      }
    },
    [mode, onAnalysisStart, onSuccess, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      setDropped(true);
      setTimeout(() => setDropped(false), 400);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = Array.from(e.clipboardData.items);
      const imageItem = items.find((item) => item.kind === 'file' && ACCEPTED_TYPES.includes(item.type));
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) processFile(file);
      }
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  return (
    <Spotlight className="w-full">
      <motion.div
        role="button"
        aria-label="Screenshot upload zone — drag and drop or click to browse"
        aria-haspopup="dialog"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onPaste={handlePaste}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        animate={reduced ? {} : {
          scale: dropped ? 1.01 : dragOver ? 1.005 : 1,
          y: dragOver ? -2 : 0,
          borderColor: dragOver ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)',
          backgroundColor: dragOver ? 'rgba(6,182,212,0.04)' : 'rgba(0,0,0,0.3)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative flex flex-col items-center justify-center gap-4 min-h-[180px] rounded-2xl cursor-pointer border overflow-hidden backdrop-blur-md shadow-card hover:shadow-card-hover transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
      >
        <AnimatedBorder className="opacity-50" />
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Choose a screenshot file"
          tabIndex={-1}
        />

        {/* Custom Icon Group */}
        <motion.div
          animate={reduced ? {} : { y: dragOver ? -4 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-xl border ${dragOver ? 'border-[#06B6D4] bg-[rgba(6,182,212,0.1)] text-[#38BDF8]' : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#A1A1AA]'}`}
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
        >
          <AnimatePresence mode="wait">
            {fileName ? (
              <motion.div
                key="check"
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Custom sleek upload icon instead of Lucide default */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17V3" />
                  <path d="m7 8 5-5 5 5" />
                  <path d="M20 21H4" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="relative z-10 text-center px-4">
          <AnimatePresence mode="wait">
            {fileName ? (
              <motion.p
                key="filename"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[14px] font-medium text-[#FAFAFA] truncate max-w-[280px]"
              >
                {fileName}
              </motion.p>
            ) : (
              <motion.p
                key="default"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[14px] font-medium text-[#A1A1AA]"
              >
                {dragOver ? 'Drop screenshot here' : 'Drop screenshot, paste, or '}
                {!dragOver && <span className="text-[#38BDF8] font-medium cursor-pointer">browse</span>}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Outer Glow Ring on Drag */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: '0 0 40px rgba(6,182,212,0.2) inset, 0 0 0 1px #06B6D4 inset' }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Spotlight>
  );
};

export default UploadZone;
