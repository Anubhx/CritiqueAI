'use client';

import React, { useState, useCallback } from 'react';
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
  heuristic: 'Heuristics',
  accessibility: 'Accessibility',
  visual: 'Visual Hierarchy',
  mobile: 'Mobile UX',
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

  // Group issues by category
  const grouped = report.issues.reduce<Partial<Record<IssueCategory, typeof report.issues>>>(
    (acc, issue) => {
      if (!acc[issue.category]) acc[issue.category] = [];
      acc[issue.category]!.push(issue);
      return acc;
    },
    {},
  );

  const categories = Object.keys(grouped) as IssueCategory[];

  // Flat index for stagger animation across all issues
  let globalIndex = 0;

  return (
    <section aria-labelledby="report-heading" className="animate-fade-in">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 id="report-heading" className="text-h2">
          UX Critique Report
        </h2>
        <ExportControls report={report} imageBase64={imageBase64} mimeType={mimeType} />
      </div>

      {/* Score */}
      <div className="mb-6">
        <ScoreDisplay score={report.overall_score} summary={report.summary} />
      </div>

      {/* Desktop: side-by-side. Mobile: stacked. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6">
        {/* Left: Annotated screenshot (sticky on desktop) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h3 className="text-[13px] font-semibold text-[#57534E] uppercase tracking-wider mb-2">
            Screenshot
          </h3>
          <AnnotatedScreenshot
            imageBase64={imageBase64}
            mimeType={mimeType}
            issues={report.issues}
            highlightedIssueId={highlightedIssueId}
            onMarkerHover={handleMarkerHover}
          />
        </div>

        {/* Right: Issues grouped by category */}
        <div className="space-y-6">
          {/* Issues */}
          {categories.map((category) => {
            const categoryIssues = grouped[category] ?? [];
            return (
              <div key={category}>
                <h3 className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-2">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="space-y-3">
                  {categoryIssues.map((issue) => {
                    const currentIndex = globalIndex;
                    globalIndex++;
                    return (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        index={currentIndex}
                        isHighlighted={highlightedIssueId === issue.id}
                        onHover={setHighlightedIssueId}
                        style={{
                          animationDelay: `${currentIndex * 80}ms`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-2">
                Strengths
              </h3>
              <ul className="space-y-1.5 p-4 rounded-lg border border-[#E7E5E4] bg-white">
                {report.strengths.map((strength, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-[#57534E]">
                    <span className="text-[#085041] shrink-0" aria-hidden="true">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Priority Fix */}
          <div className="p-4 rounded-lg border border-[#4338CA]/30 bg-[#4338CA]/5">
            <h3 className="text-[11px] font-semibold text-[#4338CA] uppercase tracking-wider mb-1">
              Priority Fix
            </h3>
            <p className="text-[13px] text-[#1C1917] leading-relaxed">{report.priority_fix}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CritiqueReportView;
