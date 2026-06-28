'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { CritiqueMode, CritiqueStatus } from '@/types/critique';

interface UrlInputFormProps {
  mode: CritiqueMode;
  onAnalysisStart: (status: CritiqueStatus) => void;
  onSuccess: (report: unknown, imageBase64: string, mimeType: string) => void;
  onError: (message: string) => void;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({
  mode,
  onAnalysisStart,
  onSuccess,
  onError,
}) => {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const reduced = useReducedMotion();

  const validate = (val: string): boolean => {
    try {
      const u = new URL(val);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError(null);

      if (!url.trim()) { setValidationError('Enter a URL to analyze.'); return; }
      if (!validate(url.trim())) {
        setValidationError('URL needs to start with https:// or http://');
        return;
      }

      setIsLoading(true);
      onAnalysisStart('capturing');

      try {
        onAnalysisStart('analyzing');
        const res = await fetch('/api/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim(), mode }),
        });

        const data = await res.json();

        if (!res.ok) {
          onError(data.error ?? 'Capture failed. Try another URL.');
          setIsLoading(false);
          return;
        }

        onAnalysisStart('structuring');
        await new Promise((r) => setTimeout(r, 500));
        onSuccess(data.report, data.imageBase64, data.mimeType);
      } catch {
        onError('Something went wrong. Check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [url, mode, onAnalysisStart, onSuccess, onError],
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      {/* Visible label */}
      <label htmlFor="url-input" className="text-[12px] font-medium text-[#71717A]">
        Website URL
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          {/* Animated focus ring glow — signals "this is where you type" */}
          {isFocused && !reduced && (
            <motion.div
              layoutId="url-focus-ring"
              className="absolute -inset-[2px] rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: validationError
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(124,58,237,0.12)',
                boxShadow: validationError
                  ? '0 0 0 1.5px rgba(239,68,68,0.50)'
                  : '0 0 0 1.5px rgba(124,58,237,0.50)',
                borderRadius: '12px',
              }}
              aria-hidden="true"
            />
          )}
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setValidationError(null); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="https://example.com"
            disabled={isLoading}
            autoComplete="url"
            aria-invalid={validationError ? 'true' : 'false'}
            aria-describedby={validationError ? 'url-error' : undefined}
            className={[
              'relative w-full px-3 py-2 text-[14px] rounded-xl',
              'bg-[rgba(0,0,0,0.30)] border text-[#E4E4E7]',
              'placeholder-[#3F3F46]',
              'transition-colors duration-150',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              validationError
                ? 'border-[rgba(239,68,68,0.40)]'
                : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)]',
            ].join(' ')}
          />
        </div>
        <Button type="submit" loading={isLoading} disabled={isLoading}>
          Analyze
        </Button>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {validationError && (
          <motion.p
            id="url-error"
            role="alert"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-[12px] text-[#FCA5A5] flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {validationError}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
};

export default UrlInputForm;
