'use client';

/**
 * CritiqueReport.tsx
 *
 * Report reveal sequence:
 *   1. Report header + mode badge fade up (0ms)
 *   2. Score ring animates (300ms delay — starts when visible)
 *   3. Annotated screenshot scale-reveals (200ms)
 *   4. Markers pop in staggered (600ms+)
 *   5. Issue cards stagger in (80ms per card)
 *   6. Strengths section fades in
 *   7. Priority Fix enters last with a slight glow
 *
 * This makes the report feel like it's being "built" before your eyes —
 * not just a page load. The user's attention is guided from the score
 * (most important number) → the screenshot → the detail cards.
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScoreDisplay } from '@/components/critique/ScoreDisplay';
import { IssueCard } from '@/components/critique/IssueCard';
import { AnnotatedScreenshot } from '@/components/critique/AnnotatedScreenshot';
import { ExportControls } from '@/components/critique/ExportControls';
import type { CritiqueReport, IssueCategory } from '@/types/critique';

interface CritiqueReportViewProps {
  report: CritiqueReport;
  imageBase64: string;
  mimeType: string;
}

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  heuristic:     'Usability',
  accessibility: 'Accessibility',
  visual:        'Visual Hierarchy',
  mobile:        'Mobile UX',
};

const MODE_LABELS: Record<string, string> = {
  quick_scan:        'Quick Scan',
  full_audit:        'Full Audit',
  accessibility_only:'Accessibility',
  mobile_ux:         'Mobile UX',
};

export const CritiqueReportView: React.FC<CritiqueReportViewProps> = ({
  report,
  imageBase64,
  mimeType,
}) => {
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);

  const handleMarkerHover = useCallback((id: string | null) => {
    setHighlightedIssueId(id);
  }, []);

  const grouped = report.issues.reduce<Partial<Record<IssueCategory, typeof report.issues>>>(
    (acc, issue) => {
      if (!acc[issue.category]) acc[issue.category] = [];
      acc[issue.category]!.push(issue);
      return acc;
    },
    {},
  );

  const categories = Object.keys(grouped) as IssueCategory[];
  let globalIndex = 0;

  return (
    <section aria-labelledby="report-heading">
      {/* Report header — mode badge + title + export */}
      <motion.div
        className="flex items-center justify-between mb-6 gap-4 flex-wrap"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center gap-3">
          <h2 id="report-heading" className="text-h2 text-[#FAFAFA]">
            UX Critique
          </h2>
          {/* Mode badge */}
          <span className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.30)] text-[#A78BFA]">
            {MODE_LABELS[report.mode] ?? report.mode}
          </span>
          {/* Issue count */}
          <span className="text-[11px] text-[#3F3F46] font-medium">
            {report.issues.length} {report.issues.length === 1 ? 'issue' : 'issues'}
          </span>
        </div>
        <ExportControls report={report} imageBase64={imageBase64} mimeType={mimeType} />
      </motion.div>

      {/* Score */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <ScoreDisplay score={report.overall_score} summary={report.summary} />
      </motion.div>

      {/* Two-column layout: screenshot left, issues right */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">

        {/* Left: Annotated screenshot (sticky on desktop) */}
        <motion.div
          className="lg:sticky lg:top-6 lg:self-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p className="text-label text-[#52525B] mb-2">Annotated screenshot</p>
          <AnnotatedScreenshot
            imageBase64={imageBase64}
            mimeType={mimeType}
            issues={report.issues}
            highlightedIssueId={highlightedIssueId}
            onMarkerHover={handleMarkerHover}
          />
        </motion.div>

        {/* Right: Issues + Strengths + Priority Fix */}
        <div className="space-y-6">

          {/* Issue categories */}
          {categories.map((category) => {
            const categoryIssues = grouped[category] ?? [];
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <p className="text-label text-[#52525B] mb-2.5">
                  {CATEGORY_LABELS[category]}
                </p>
                <div className="space-y-2.5">
                  {categoryIssues.map((issue) => {
                    const currentIndex = globalIndex++;
                    return (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        index={currentIndex}
                        isHighlighted={highlightedIssueId === issue.id}
                        onHover={setHighlightedIssueId}
                        style={{ animationDelay: `${currentIndex * 60}ms` }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <p className="text-label text-[#52525B] mb-2.5">Strengths</p>
              <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(52,211,153,0.04)] p-4">
                <ul className="space-y-2">
                  {report.strengths.map((strength, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] text-[#A1A1AA] items-start">
                      <span className="text-[#34D399] shrink-0 mt-0.5" aria-hidden="true">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Priority Fix — enters last, with a subtle glow to signal importance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-xl border border-[rgba(124,58,237,0.30)] bg-[rgba(124,58,237,0.06)] p-4"
            style={{ boxShadow: '0 0 20px rgba(124,58,237,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-label text-[#7C3AED]">Priority fix</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse-ring" aria-hidden="true" />
            </div>
            <p className="text-[14px] text-[#E4E4E7] leading-relaxed">{report.priority_fix}</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default CritiqueReportView;
