'use client';

/**
 * StatusIndicator.tsx
 *
 * Animation intent:
 *   Instead of a generic spinner + text, this renders:
 *   1. A progress timeline showing the 4 steps
 *   2. Each step has: complete (checkmark), active (pulsing dot), pending (circle)
 *   3. A connecting bar fills between steps as they complete
 *   4. A subtle scan beam moves vertically to imply "working"
 *
 *   This communicates: "I'm doing real work" — not "I'm waiting."
 *   The metaphor is a pipeline executing, not a black box spinning.
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { CritiqueStatus } from '@/types/critique';

interface StatusIndicatorProps {
  status: CritiqueStatus;
}

const STEPS: { status: CritiqueStatus; label: string; sub: string }[] = [
  { status: 'uploading',   label: 'Processing image',    sub: 'Preparing for analysis' },
  { status: 'analyzing',   label: 'AI analysis',         sub: 'Gemini scanning heuristics' },
  { status: 'structuring', label: 'Structuring report',  sub: 'Organising findings' },
];

const STATUS_ORDER: CritiqueStatus[] = ['uploading', 'analyzing', 'structuring', 'done'];

function getStepState(stepStatus: CritiqueStatus, currentStatus: CritiqueStatus): 'complete' | 'active' | 'pending' {
  const stepIndex    = STATUS_ORDER.indexOf(stepStatus);
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  if (currentIndex > stepIndex) return 'complete';
  if (currentIndex === stepIndex) return 'active';
  return 'pending';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={`Analysis in progress: ${status}`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-3 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(0,0,0,0.30)] p-4 overflow-hidden relative"
    >
      {/* Subtle scan beam — communicates "active processing" */}
      {!reduced && (
        <motion.div
          className="absolute inset-x-0 h-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.6) 50%, transparent 100%)',
          }}
          animate={{ top: ['-2px', 'calc(100% + 2px)'] }}
          transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
          aria-hidden="true"
        />
      )}

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const state = getStepState(step.status, status);
          return (
            <div key={step.status} className="flex items-center gap-3">
              {/* Step indicator */}
              <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                <AnimatePresence mode="wait">
                  {state === 'complete' ? (
                    <motion.div
                      key="check"
                      initial={reduced ? {} : { scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full bg-[rgba(124,58,237,0.20)] border border-[rgba(124,58,237,0.40)] flex items-center justify-center"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  ) : state === 'active' ? (
                    <motion.div
                      key="active"
                      className="w-5 h-5 rounded-full border border-[rgba(124,58,237,0.60)] flex items-center justify-center"
                      animate={reduced ? {} : { boxShadow: ['0 0 0 0 rgba(124,58,237,0.4)', '0 0 0 6px rgba(124,58,237,0)', '0 0 0 0 rgba(124,58,237,0)'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#7C3AED]"
                        animate={reduced ? {} : { scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.10)]"
                    />
                  )}
                </AnimatePresence>

                {/* Connecting line to next step */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-3 mt-0.5"
                    aria-hidden="true"
                  >
                    <motion.div
                      className="w-full"
                      style={{ backgroundColor: 'rgba(124,58,237,0.4)' }}
                      initial={{ height: 0 }}
                      animate={{ height: state === 'complete' ? '100%' : '0%' }}
                      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                    <div
                      className="w-full"
                      style={{ height: state === 'complete' ? '0%' : '100%', backgroundColor: 'rgba(255,255,255,0.08)' }}
                    />
                  </div>
                )}
              </div>

              {/* Label */}
              <div>
                <p className={`text-[13px] font-medium leading-tight ${state === 'pending' ? 'text-[#52525B]' : 'text-[#E4E4E7]'}`}>
                  {step.label}
                </p>
                {state === 'active' && (
                  <motion.p
                    initial={reduced ? {} : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[11px] text-[#7C3AED] mt-0.5"
                  >
                    {step.sub}
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StatusIndicator;
