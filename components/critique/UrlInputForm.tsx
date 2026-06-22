'use client';

import React, { useState, useCallback } from 'react';
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

      if (!url.trim()) {
        setValidationError('Please enter a URL.');
        return;
      }
      if (!validate(url.trim())) {
        setValidationError('That URL doesn\'t look valid. Make sure it starts with https://');
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
          onError(data.error ?? 'Something went wrong. Try again.');
          setIsLoading(false);
          return;
        }

        onAnalysisStart('structuring');
        await new Promise((r) => setTimeout(r, 600));
        onSuccess(data.report, data.imageBase64, data.mimeType);
      } catch {
        onError('Something went wrong generating your critique. Try again in a moment.');
      } finally {
        setIsLoading(false);
      }
    },
    [url, mode, onAnalysisStart, onSuccess, onError],
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <div className="flex gap-2">
        <label htmlFor="url-input" className="sr-only">
          Website URL
        </label>
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setValidationError(null);
          }}
          placeholder="https://example.com"
          disabled={isLoading}
          autoComplete="url"
          className={`
            flex-1 px-3 py-2 text-[15px] rounded-md border bg-white
            placeholder-[#A8A29E] text-[#1C1917]
            transition-colors duration-150
            disabled:bg-[#F5F5F4] disabled:cursor-not-allowed
            ${validationError
              ? 'border-[#791F1F] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791F1F]'
              : 'border-[#E7E5E4] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4338CA]'
            }
          `}
          aria-invalid={validationError ? 'true' : 'false'}
          aria-describedby={validationError ? 'url-error' : undefined}
        />
        <Button type="submit" loading={isLoading} disabled={isLoading}>
          Capture &amp; analyze
        </Button>
      </div>

      {validationError && (
        <p id="url-error" role="alert" className="text-[13px] text-[#791F1F]">
          {validationError}
        </p>
      )}
    </form>
  );
};

export default UrlInputForm;
