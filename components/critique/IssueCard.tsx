import React from 'react';
import { SeverityPill } from '@/components/ui/SeverityPill';
import type { CritiqueIssue } from '@/types/critique';

interface IssueCardProps {
  issue: CritiqueIssue;
  index: number;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
  style?: React.CSSProperties;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  index,
  isHighlighted = false,
  onHover,
  style,
}) => {
  return (
    <article
      id={`issue-${issue.id}`}
      data-issue-id={issue.id}
      style={style}
      onMouseEnter={() => onHover?.(issue.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`
        rounded-lg border bg-white p-4 opacity-0 animate-card-reveal
        transition-colors duration-200
        ${isHighlighted ? 'border-[#4338CA] ring-1 ring-[#4338CA]/20' : 'border-[#E7E5E4]'}
      `}
      aria-label={`Issue ${index + 1}: ${issue.title}, severity ${issue.severity}`}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <span
          className="text-mono text-[11px] font-bold text-[#A8A29E] shrink-0 mt-0.5 w-5"
          aria-hidden="true"
        >
          {index + 1}
        </span>
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <SeverityPill severity={issue.severity} />
          <h3 className="text-[14px] font-semibold text-[#1C1917] leading-snug">{issue.title}</h3>
        </div>
      </div>

      {/* Heuristic / WCAG tag */}
      <div className="ml-7 mb-3">
        <span className="text-mono text-[11px] text-[#A8A29E] bg-[#F5F5F4] px-2 py-0.5 rounded">
          {issue.heuristic}
        </span>
      </div>

      {/* Body — three labeled blocks */}
      <dl className="ml-7 space-y-2.5">
        <div>
          <dt className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
            What
          </dt>
          <dd className="text-[13px] text-[#1C1917] leading-relaxed">{issue.what}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">
            Why it matters
          </dt>
          <dd className="text-[13px] text-[#57534E] leading-relaxed">{issue.why}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold text-[#4338CA] uppercase tracking-wider mb-0.5">
            Fix
          </dt>
          <dd className="text-[13px] text-[#1C1917] leading-relaxed">{issue.fix}</dd>
        </div>
      </dl>
    </article>
  );
};

export default IssueCard;
