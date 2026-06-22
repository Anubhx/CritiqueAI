/**
 * lib/critique-modes.ts — Maps mode string → prompt + viewport preference.
 * Pure functions, no side effects.
 */

import type { CritiqueMode } from '@/types/critique';
import {
  QUICK_SCAN_PROMPT,
  FULL_AUDIT_PROMPT,
  ACCESSIBILITY_ONLY_PROMPT,
  MOBILE_UX_PROMPT,
} from '@/lib/critique-prompt';

export type ViewportPreference = 'desktop' | 'mobile';

interface ModeConfig {
  prompt: string;
  viewport: ViewportPreference;
  label: string;
  description: string;
  timeEstimate: string;
}

const MODE_MAP: Record<CritiqueMode, ModeConfig> = {
  quick_scan: {
    prompt: QUICK_SCAN_PROMPT,
    viewport: 'desktop',
    label: 'Quick scan',
    description: 'Top issues only — a fast gut-check',
    timeEstimate: '~30 sec',
  },
  full_audit: {
    prompt: FULL_AUDIT_PROMPT,
    viewport: 'desktop',
    label: 'Full audit',
    description: 'Comprehensive pass across heuristics, accessibility, and visual hierarchy',
    timeEstimate: '~60 sec',
  },
  accessibility_only: {
    prompt: ACCESSIBILITY_ONLY_PROMPT,
    viewport: 'desktop',
    label: 'Accessibility only',
    description: 'WCAG 2.1 AA-focused — contrast, focus states, semantic structure',
    timeEstimate: '~45 sec',
  },
  mobile_ux: {
    prompt: MOBILE_UX_PROMPT,
    viewport: 'mobile',
    label: 'Mobile UX check',
    description: 'Touch targets, thumb reach, gesture conflicts, safe areas',
    timeEstimate: '~45 sec',
  },
};

export function getModeConfig(mode: CritiqueMode): ModeConfig {
  return MODE_MAP[mode];
}

export function getModePrompt(mode: CritiqueMode): string {
  return MODE_MAP[mode].prompt;
}

export function getModeViewport(mode: CritiqueMode): ViewportPreference {
  return MODE_MAP[mode].viewport;
}

export function getAllModes(): Array<{ mode: CritiqueMode } & ModeConfig> {
  return (Object.entries(MODE_MAP) as [CritiqueMode, ModeConfig][]).map(
    ([mode, config]) => ({ mode, ...config }),
  );
}
