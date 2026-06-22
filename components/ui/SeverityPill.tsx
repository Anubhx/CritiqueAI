'use client';

import React from 'react';
import type { Severity } from '@/types/critique';

interface SeverityPillProps {
  severity: Severity;
  className?: string;
}

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  major: 'Major',
  minor: 'Minor',
  suggestion: 'Suggestion',
};

const SEVERITY_CLASSES: Record<Severity, string> = {
  critical: 'badge-critical',
  major: 'badge-major',
  minor: 'badge-minor',
  suggestion: 'badge-suggestion',
};

export const SeverityPill: React.FC<SeverityPillProps> = ({ severity, className = '' }) => {
  return (
    <span
      className={`text-mono inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_CLASSES[severity]} ${className}`}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  );
};

export default SeverityPill;
