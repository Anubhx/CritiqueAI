import React from 'react';

interface ScoreDisplayProps {
  score: number;
  summary: string;
}

function getQualitativeLabel(score: number): string {
  if (score >= 85) return 'Solid foundation';
  if (score >= 70) return 'Some issues to address';
  if (score >= 50) return 'Needs work';
  if (score >= 30) return 'Significant problems';
  return 'Critical issues present';
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-[#085041]';
  if (score >= 70) return 'text-[#633806]';
  if (score >= 50) return 'text-[#633806]';
  return 'text-[#791F1F]';
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, summary }) => {
  const label = getQualitativeLabel(score);
  const colorClass = getScoreColor(score);

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-[#E7E5E4] bg-white">
      <div className="shrink-0 text-center">
        <div
          className={`text-[44px] font-bold leading-none tabular-nums ${colorClass}`}
          aria-label={`Overall score: ${score} out of 100`}
        >
          {score}
        </div>
        <div className="text-mono text-[11px] text-[#A8A29E] mt-1">/100</div>
      </div>
      <div className="flex-1 pt-1">
        <div className={`text-[15px] font-semibold ${colorClass}`}>{label}</div>
        <p className="text-[13px] text-[#57534E] mt-1 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
};

export default ScoreDisplay;
