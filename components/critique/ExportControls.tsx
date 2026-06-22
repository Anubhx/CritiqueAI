'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { reportToMarkdown } from '@/lib/markdown-export';
import type { CritiqueReport } from '@/types/critique';

interface ExportControlsProps {
  report: CritiqueReport;
  imageBase64: string;
  mimeType: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  report,
  imageBase64,
  mimeType,
}) => {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [shareState, setShareState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');

  const handleCopyMarkdown = useCallback(async () => {
    const markdown = reportToMarkdown(report);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const ta = document.createElement('textarea');
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  }, [report]);

  const handleShareLink = useCallback(async () => {
    setShareState('loading');
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, imageBase64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShareState('error');
        setTimeout(() => setShareState('idle'), 3000);
        return;
      }
      await navigator.clipboard.writeText(data.shareUrl);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2500);
    } catch {
      setShareState('error');
      setTimeout(() => setShareState('idle'), 3000);
    }
  }, [report, imageBase64, mimeType]);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Export options">
      {/* Copy Markdown */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopyMarkdown}
        aria-live="polite"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copyState === 'copied' ? 'Copied!' : 'Copy as Markdown'}
      </Button>

      {/* Share Link */}
      <Button
        variant="secondary"
        size="sm"
        loading={shareState === 'loading'}
        onClick={handleShareLink}
        aria-live="polite"
      >
        {shareState !== 'loading' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        )}
        {shareState === 'copied'
          ? 'Link copied!'
          : shareState === 'error'
          ? 'Failed — try again'
          : shareState === 'loading'
          ? 'Creating link…'
          : 'Copy share link'}
      </Button>
    </div>
  );
};

export default ExportControls;
