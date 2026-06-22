'use client';

import React from 'react';
import { getAllModes } from '@/lib/critique-modes';
import type { CritiqueMode } from '@/types/critique';

interface ModeSelectorProps {
  selected: CritiqueMode;
  onChange: (mode: CritiqueMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
}) => {
  const modes = getAllModes();

  return (
    <div
      role="radiogroup"
      aria-labelledby="mode-legend"
      className=""
    >
      <div id="mode-legend" className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-2">
        Critique mode
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {modes.map(({ mode, label, description, timeEstimate }) => {
          const isSelected = selected === mode;
          return (
            <label
              key={mode}
              className={`
                relative flex flex-col gap-0.5 p-2.5 rounded-lg border cursor-pointer
                transition-all duration-150
                ${isSelected
                  ? 'border-[#4338CA] bg-[#4338CA] shadow-sm'
                  : 'border-[#E7E5E4] bg-[#FAFAF9] hover:border-[#A8A29E] hover:bg-white'
                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
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
              <span
                className={`text-[12px] font-semibold leading-tight ${isSelected ? 'text-white' : 'text-[#1C1917]'}`}
              >
                {label}
              </span>
              <span className={`text-[10px] leading-snug ${isSelected ? 'text-white/75' : 'text-[#57534E]'}`}>
                {description}
              </span>
              <span className={`text-mono text-[9px] mt-0.5 ${isSelected ? 'text-white/60' : 'text-[#A8A29E]'}`}>
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
