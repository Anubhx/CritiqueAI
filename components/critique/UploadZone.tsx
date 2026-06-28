'use client';

/**
 * UploadZone.tsx
 *
 * Animation intent:
 *   - Idle: Breathing border animation (border-breathe) signals the zone is alive
 *   - Hover: Border brightens, arrow icon lifts upward (signals "bring here")
 *   - Drag over: Border becomes accent-colored, background tints, scale up slightly
 *   - Drop: Brief "pulse" scale acknowledges the drop before analysis begins
 *   - Success (file selected): Icon morphs to a checkmark, name appears
 *
 * Accessibility: Uses a real <button> semantic role via aria, keyboard works via
 *                Enter/Space, and hidden file input is the actual mechanism.
 */

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
        scale: dropped ? 1.02 : dragOver ? 1.01 : 1,
        borderColor: dragOver
          ? 'rgba(124,58,237,0.6)'
          : 'rgba(255,255,255,0.08)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={[
        'relative flex flex-col items-center justify-center gap-3',
        'min-h-[148px] rounded-xl cursor-pointer',
        'border transition-colors duration-200',
        dragOver
          ? 'bg-[rgba(124,58,237,0.06)]'
          : 'bg-[rgba(0,0,0,0.20)] hover:bg-[rgba(255,255,255,0.02)]',
        'border-breathe',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]',
      ].join(' ')}
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

      {/* Upload icon with lift animation on hover */}
      <motion.div
        animate={reduced ? {} : { y: dragOver ? -4 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`transition-colors duration-200 ${dragOver ? 'text-[#A78BFA]' : 'text-[#3F3F46]'}`}
      >
        <AnimatePresence mode="wait">
          {fileName ? (
            // File selected: checkmark morphs in
            <motion.div
              key="check"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="text-[#A78BFA]"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </motion.div>
          ) : (
            // Default: upload arrow
            <motion.div key="upload" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Text content */}
      <div className="text-center px-4">
        <AnimatePresence mode="wait">
          {fileName ? (
            <motion.p
              key="filename"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[14px] font-medium text-[#E4E4E7] truncate max-w-[220px]"
            >
              {fileName}
            </motion.p>
          ) : (
            <motion.p
              key="default"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[14px] font-medium text-[#71717A]"
            >
              {dragOver ? 'Drop to analyze' : 'Drag & drop, paste, or'}
            </motion.p>
          )}
        </AnimatePresence>

        {!fileName && !dragOver && (
          <p className="text-[12px] text-[#3F3F46] mt-1">
            <span className="text-[#7C3AED] underline underline-offset-2">browse files</span>
            {' · '}JPG, PNG, WebP · max 10 MB
          </p>
        )}
      </div>

      {/* Drag overlay ring — accent border ripple */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 rounded-xl pointer-events-none border-2 border-[#7C3AED]"
            style={{ boxShadow: '0 0 20px rgba(124,58,237,0.20) inset' }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadZone;
