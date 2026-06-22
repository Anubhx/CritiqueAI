'use client';

import React, { useCallback, useRef, useState } from 'react';
import type { CritiqueMode, CritiqueStatus } from '@/types/critique';

interface UploadZoneProps {
  mode: CritiqueMode;
  onAnalysisStart: (status: CritiqueStatus) => void;
  onSuccess: (report: unknown, imageBase64: string, mimeType: string) => void;
  onError: (message: string) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const UploadZone: React.FC<UploadZoneProps> = ({
  mode,
  onAnalysisStart,
  onSuccess,
  onError,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError("That file couldn't be processed. Try a JPG, PNG, or WebP under 10MB.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        onError("That file couldn't be processed. Try a JPG, PNG, or WebP under 10MB.");
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
          onError(data.error ?? 'Something went wrong. Try again.');
          return;
        }

        onAnalysisStart('structuring');
        await new Promise((r) => setTimeout(r, 600)); // brief pause for UX
        onSuccess(data.report, data.imageBase64, data.mimeType);
      } catch {
        onError('Something went wrong generating your critique. Try again in a moment.');
      }
    },
    [mode, onAnalysisStart, onSuccess, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
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
    <div
      role="region"
      aria-label="Screenshot upload zone"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onPaste={handlePaste}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      tabIndex={0}
      className={`
        relative flex flex-col items-center justify-center gap-2
        min-h-[140px] rounded-lg cursor-pointer
        border transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] focus-visible:ring-offset-2
        ${dragOver
          ? 'border-solid border-[#4338CA] bg-[#4338CA]/5'
          : 'border-dashed border-[#E7E5E4] hover:border-[#A8A29E]'
        }
      `}
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

      {/* Upload icon */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke={dragOver ? '#4338CA' : '#A8A29E'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>

      <div className="text-center px-4">
        <p className="text-[15px] font-medium text-[#1C1917]">
          {fileName ?? 'Drag and drop a screenshot, or click to browse'}
        </p>
        <p className="text-small mt-1">JPG, PNG, WebP — any app, website, or mobile screen</p>
      </div>

      {dragOver && (
        <div className="absolute inset-0 rounded-lg pointer-events-none border-2 border-[#4338CA]" aria-hidden="true" />
      )}
    </div>
  );
};

export default UploadZone;
