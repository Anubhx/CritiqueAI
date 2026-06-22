'use client';

import React from 'react';
import type { CritiqueStatus } from '@/types/critique';

interface StatusIndicatorProps {
  status: CritiqueStatus;
}

const STATUS_MESSAGES: Partial<Record<CritiqueStatus, string>> = {
  capturing: 'Capturing screenshot…',
  uploading: 'Uploading image…',
  analyzing: 'Analyzing with Gemini…',
  structuring: 'Structuring your report…',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const message = STATUS_MESSAGES[status];
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="flex items-center gap-3 py-4 px-5 rounded-lg border border-[#E7E5E4] bg-white animate-fade-in"
    >
      {/* Spinner */}
      <svg
        className="animate-spin h-4 w-4 text-[#4338CA] shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-[14px] text-[#57534E]">{message}</span>
    </div>
  );
};

export default StatusIndicator;
