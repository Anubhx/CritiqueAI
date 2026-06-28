'use client';

/**
 * AnnotatedScreenshot.tsx
 *
 * Animation intent:
 *   - Markers stagger in with a scale+opacity pop after a brief delay
 *     (they shouldn't compete with the screenshot reveal itself)
 *   - Highlighted marker scales up with a glow ring
 *   - Connecting line draws in from marker toward the issue card side
 *     (using SVG stroke-dashoffset animation)
 *   - Screenshot itself fades in
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { CritiqueIssue } from '@/types/critique';

interface Marker {
  id: string;
  index: number;
  x: number;
  y: number;
}

interface AnnotatedScreenshotProps {
  imageBase64: string;
  mimeType: string;
  issues: CritiqueIssue[];
  highlightedIssueId: string | null;
  onMarkerHover: (id: string | null) => void;
}

function deriveMarkerPosition(hint: string, index: number, total: number): { x: number; y: number } {
  const h = hint.toLowerCase();
  let x = 50, y = 50;

  if (h.includes('top') || h.includes('header') || h.includes('nav')) y = 15;
  else if (h.includes('bottom') || h.includes('footer')) y = 85;
  else if (h.includes('middle') || h.includes('center')) y = 50;
  else y = 15 + (index / Math.max(total - 1, 1)) * 70;

  if (h.includes('left')) x = 20;
  else if (h.includes('right')) x = 80;
  else if (h.includes('center') || h.includes('middle')) x = 50;
  else x = index % 2 === 0 ? 25 : 75;

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
  const reduced = useReducedMotion();

  useEffect(() => {
    const derived: Marker[] = issues.map((issue, index) => {
      const { x, y } = deriveMarkerPosition(issue.location_hint, index, issues.length);
      return { id: issue.id, index: index + 1, x, y };
    });
    setMarkers(derived);
  }, [issues]);

  const scrollToIssue = useCallback((issueId: string) => {
    const el = document.getElementById(`issue-${issueId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.07)] bg-[#0A0A0B]"
      aria-label="Annotated screenshot with issue markers"
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Screenshot */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt="Analyzed screenshot — annotated with UX issue markers"
        className="w-full h-auto block opacity-90"
        draggable={false}
      />

      {/* Subtle overlay to make markers pop against any screenshot */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.12)' }} aria-hidden="true" />

      {/* Marker overlays */}
      {markers.map((marker, i) => {
        const issue = issues.find((iss) => iss.id === marker.id);
        const isHighlighted = highlightedIssueId === marker.id;

        return (
          <motion.button
            key={marker.id}
            onClick={() => scrollToIssue(marker.id)}
            onMouseEnter={() => onMarkerHover(marker.id)}
            onMouseLeave={() => onMarkerHover(null)}
            aria-label={`Issue ${marker.index}: ${issue?.title ?? 'Unknown'}. Click to scroll to details.`}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
              delay: 0.6 + i * 0.06,
            }}
            whileHover={reduced ? {} : { scale: 1.2 }}
            whileTap={reduced ? {} : { scale: 0.9 }}
          >
            {/* Glow ring for highlighted marker */}
            <AnimatePresence>
              {isHighlighted && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={reduced ? {} : { scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ backgroundColor: '#06B6D4' }}
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>

            {/* Marker bubble */}
            <motion.div
              animate={{
                scale: isHighlighted ? 1.25 : 1,
                backgroundColor: isHighlighted ? '#06B6D4' : 'rgba(6,182,212,0.85)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              <span className="text-[10px] font-bold text-white leading-none">{marker.index}</span>
            </motion.div>
          </motion.button>
        );
      })}

      {/* SVG connector lines — draw from marker toward right edge when highlighted */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {markers.map((marker) => {
          const isHighlighted = highlightedIssueId === marker.id;
          if (!isHighlighted) return null;
          return (
            <motion.line
              key={marker.id}
              x1={`${marker.x}%`}
              y1={`${marker.y}%`}
              x2="98%"
              y2={`${marker.y}%`}
              stroke="url(#line-gradient)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              initial={reduced ? { pathLength: 0, opacity: 0 } : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
};

export default AnnotatedScreenshot;
