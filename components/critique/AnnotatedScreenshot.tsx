'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CritiqueIssue } from '@/types/critique';

interface Marker {
  id: string;
  index: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

interface AnnotatedScreenshotProps {
  imageBase64: string;
  mimeType: string;
  issues: CritiqueIssue[];
  highlightedIssueId: string | null;
  onMarkerHover: (id: string | null) => void;
}

// Parse location_hint to derive a rough x/y percentage
// Since we don't have real pixel data, we use heuristic positioning from keywords
function deriveMarkerPosition(hint: string, index: number, total: number): { x: number; y: number } {
  const h = hint.toLowerCase();
  let x = 50;
  let y = 50;

  if (h.includes('top') || h.includes('header') || h.includes('nav')) y = 15;
  else if (h.includes('bottom') || h.includes('footer')) y = 85;
  else if (h.includes('middle') || h.includes('center')) y = 50;
  else {
    // Distribute vertically across the image height
    y = 15 + (index / Math.max(total - 1, 1)) * 70;
  }

  if (h.includes('left')) x = 20;
  else if (h.includes('right')) x = 80;
  else if (h.includes('center') || h.includes('middle')) x = 50;
  else {
    // Alternate left/right to avoid overlap
    x = index % 2 === 0 ? 25 : 75;
  }

  return { x, y };
}

export const AnnotatedScreenshot: React.FC<AnnotatedScreenshotProps> = ({
  imageBase64,
  mimeType,
  issues,
  highlightedIssueId,
  onMarkerHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const imgSrc = `data:${mimeType};base64,${imageBase64}`;

  useEffect(() => {
    const derived: Marker[] = issues.map((issue, index) => {
      const { x, y } = deriveMarkerPosition(issue.location_hint, index, issues.length);
      return { id: issue.id, index: index + 1, x, y };
    });
    setMarkers(derived);
  }, [issues]);

  const scrollToIssue = useCallback((issueId: string) => {
    const el = document.getElementById(`issue-${issueId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden border border-[#E7E5E4] bg-[#F5F5F4]"
      aria-label="Annotated screenshot with issue markers"
    >
      {/* Screenshot */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt="Analyzed screenshot"
        className="w-full h-auto block"
        draggable={false}
      />

      {/* Marker overlays */}
      {markers.map((marker) => {
        const issue = issues.find((i) => i.id === marker.id);
        const isHighlighted = highlightedIssueId === marker.id;

        return (
          <button
            key={marker.id}
            onClick={() => scrollToIssue(marker.id)}
            onMouseEnter={() => onMarkerHover(marker.id)}
            onMouseLeave={() => onMarkerHover(null)}
            aria-label={`Issue ${marker.index}: ${issue?.title ?? 'Unknown issue'}`}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2
              w-6 h-6 rounded-full border-2 border-white
              flex items-center justify-center
              text-[11px] font-bold text-white
              transition-transform duration-150 cursor-pointer
              shadow-sm
              ${isHighlighted ? 'scale-125 z-20' : 'z-10 hover:scale-110'}
              bg-[#4338CA]
            `}
          >
            {marker.index}
          </button>
        );
      })}

      {/* Dotted connector lines — SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        {markers.map((marker) => {
          const isHighlighted = highlightedIssueId === marker.id;
          if (!isHighlighted) return null;

          // Draw a subtle dotted line from marker to bottom-right (issue list side)
          const x1 = marker.x;
          const y1 = marker.y;
          const x2 = 95;
          const y2 = marker.y;

          return (
            <line
              key={marker.id}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="#4338CA"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.6"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default AnnotatedScreenshot;
