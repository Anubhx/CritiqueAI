'use client';

/**
 * ScoreDisplay.tsx
 *
 * Animation intent:
 *   The score counts up from 0 to its final value after a short delay.
 *   This creates a "earned reveal" — the number means more when you watch
 *   it arrive than when it just appears. The ring animates its stroke as
 *   the count progresses.
 *
 *   Color shifts from red → amber → green as the score improves — the
 *   UI itself communicates the quality judgement before you read a word.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  summary: string;
}

function getScoreTheme(score: number): { color: string; glow: string; label: string } {
  if (score >= 85) return { color: '#34D399', glow: 'rgba(52,211,153,0.20)', label: 'Solid foundation' };
  if (score >= 70) return { color: '#FBBF24', glow: 'rgba(251,191,36,0.20)',  label: 'Some issues to address' };
  if (score >= 50) return { color: '#FB923C', glow: 'rgba(251,146,60,0.20)',  label: 'Needs attention' };
  return              { color: '#F87171', glow: 'rgba(248,113,113,0.20)',     label: 'Significant problems' };
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, summary }) => {
  const { color, glow, label } = getScoreTheme(score);
  const reduced = useReducedMotion();

  // CountUp logic
  const [display, setDisplay] = useState(reduced ? score : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) { setDisplay(score); return; }
    const start = performance.now();
    const duration = 1400;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(easeOut(progress) * score));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    // Small delay so the user sees 0 briefly before it starts counting
    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [score, reduced]);

  // SVG ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - display / 100);

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-center gap-5 p-5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]"
    >
      {/* Score ring */}
      <div className="shrink-0 relative" aria-label={`Overall score: ${score} out of 100`}>
        <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true">
          {/* Track */}
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="5"
          />
          {/* Progress */}
          <motion.circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 44 44)"
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
            initial={reduced ? {} : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </svg>

        {/* Score number inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[28px] font-bold tabular-nums leading-none"
            style={{ color }}
          >
            {display}
          </span>
          <span className="text-mono text-[10px] text-[#52525B] mt-0.5">/100</span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="text-[15px] font-semibold mb-1" style={{ color }}>{label}</div>
          <p className="text-[13px] text-[#71717A] leading-relaxed">{summary}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ScoreDisplay;
