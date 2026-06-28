import React from 'react';
import type { Severity } from '@/types/critique';

interface SeverityPillProps {
  severity: Severity;
}

const CONFIG: Record<Severity, { label: string; className: string; dot: string }> = {
  critical:   { label: 'Critical',   className: 'badge-critical',   dot: 'bg-[#F87171]' },
  major:      { label: 'Major',      className: 'badge-major',      dot: 'bg-[#FBBF24]' },
  minor:      { label: 'Minor',      className: 'badge-minor',      dot: 'bg-[#34D399]' },
  suggestion: { label: 'Suggestion', className: 'badge-suggestion', dot: 'bg-[#22D3EE]' },
};

export const SeverityPill: React.FC<SeverityPillProps> = ({ severity }) => {
  const { label, className, dot } = CONFIG[severity];
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2 py-0.5 rounded-full
        text-[11px] font-semibold tracking-wide
        ${className}
      `}
      aria-label={`Severity: ${label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
};

export default SeverityPill;
