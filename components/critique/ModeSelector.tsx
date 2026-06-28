'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { getAllModes } from '@/lib/critique-modes';
import type { CritiqueMode } from '@/types/critique';

interface ModeSelectorProps {
  selected: CritiqueMode;
  onChange: (mode: CritiqueMode) => void;
  disabled?: boolean;
}

// Mode icons — unique, purposeful, not generic Feather icons
const MODE_ICONS: Record<CritiqueMode, React.ReactNode> = {
  quick_scan: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m13 2-2 2.5h3L12 7" /><path d="M10 14v-3" /><path d="M14 14v-3" /><path d="M11 19c-1.7 0-3-1.3-3-3v-2h8v2c0 1.7-1.3 3-3 3Z" /><path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  ),
  full_audit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  accessibility_only: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /><circle cx="12" cy="5" r="1" fill="currentColor" />
    </svg>
  ),
  mobile_ux: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
    </svg>
  ),
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
}) => {
  const modes = getAllModes();
  const reduced = useReducedMotion();

  return (
    <div role="radiogroup" aria-labelledby="mode-legend">
      <div
        id="mode-legend"
        className="text-label text-[#71717A] mb-2.5"
      >
        Critique mode
      </div>
      <div className="grid grid-cols-2 gap-2">
        {modes.map(({ mode, label, description, timeEstimate }) => {
          const isSelected = selected === mode;
          return (
            <label
              key={mode}
              className={[
                'relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer',
                'transition-colors duration-150 group',
                isSelected
                  ? 'bg-[rgba(6,182,212,0.12)] border border-[rgba(6,182,212,0.40)]'
                  : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)]',
                'hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.04)]',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              <input
                type="radio"
                name="critique-mode"
                value={mode}
                checked={isSelected}
                onChange={() => !disabled && onChange(mode)}
                disabled={disabled}
                className="sr-only"
              />

              {/* Selected indicator glow dot */}
              {isSelected && (
                <motion.span
                  layoutId="mode-indicator"
                  className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#38BDF8]"
                  initial={false}
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
                  aria-hidden="true"
                />
              )}

              {/* Icon + Label row */}
              <div className="flex items-center gap-2">
                <span className={isSelected ? 'text-[#38BDF8]' : 'text-[#52525B] group-hover:text-[#71717A]'}>
                  {MODE_ICONS[mode]}
                </span>
                <span
                  className={`text-[13px] font-semibold leading-tight ${
                    isSelected ? 'text-[#E4E4E7]' : 'text-[#A1A1AA]'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Description */}
              <span className={`text-[11px] leading-snug pl-[22px] ${isSelected ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>
                {description}
              </span>

              {/* Time estimate */}
              <span className={`text-mono text-[11px] pl-[22px] mt-0.5 ${isSelected ? 'text-[#06B6D4]' : 'text-[#3F3F46]'}`}>
                {timeEstimate}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSelector;
