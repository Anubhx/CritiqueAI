import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  const reduced = useReducedMotion();

  return (
    <motion.article
      id={`issue-${issue.id}`}
      data-issue-id={issue.id}
      style={style}
      onMouseEnter={() => onHover?.(issue.id)}
      onMouseLeave={() => onHover?.(null)}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      whileHover={reduced ? {} : { y: -2, scale: 1.005 }}
      transition={{
        default: { type: 'spring', stiffness: 400, damping: 30 },
        opacity: { duration: 0.35 },
        filter: { duration: 0.35 },
        y: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      className={[
        'relative rounded-xl border p-4 cursor-default',
        'transition-colors duration-200',
        isHighlighted
          ? 'border-[rgba(124,58,237,0.50)] bg-[rgba(124,58,237,0.06)] shadow-[0_0_0_1px_rgba(124,58,237,0.20)]'
          : 'border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]',
        'hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.03)]',
      ].join(' ')}
      aria-label={`Issue ${index + 1}: ${issue.title}, severity ${issue.severity}`}
    >
      {/* Number badge + severity + title */}
      <div className="flex items-start gap-3 mb-3">
        {/* Issue number */}
        <span
          className="text-mono text-[11px] font-bold text-[#3F3F46] shrink-0 mt-0.5 w-4 text-right"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityPill severity={issue.severity} />
          </div>
          <h3 className="text-[14px] font-semibold text-[#E4E4E7] leading-snug">
            {issue.title}
          </h3>
        </div>
      </div>

      {/* Heuristic / WCAG tag */}
      <div className="ml-7 mb-3">
        <span className="text-mono text-[11px] text-[#52525B] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-2 py-0.5 rounded-md">
          {issue.heuristic}
        </span>
      </div>

      {/* Body — What / Why / Fix */}
      <dl className="ml-7 space-y-2.5">
        <div>
          <dt className="text-label text-[#52525B] mb-0.5">What</dt>
          <dd className="text-[13px] text-[#A1A1AA] leading-relaxed">{issue.what}</dd>
        </div>
        <div>
          <dt className="text-label text-[#52525B] mb-0.5">Why it matters</dt>
          <dd className="text-[13px] text-[#A1A1AA] leading-relaxed">{issue.why}</dd>
        </div>
        <div>
          <dt className="text-label text-[#7C3AED] mb-0.5">Fix</dt>
          <dd className="text-[13px] text-[#E4E4E7] leading-relaxed">{issue.fix}</dd>
        </div>
      </dl>
    </motion.article>
  );
};

export default IssueCard;
