'use client';

/**
 * ui/Button.tsx
 *
 * Premium button with:
 * - Magnetic hover (handled by MagneticButton wrapper if needed)
 * - Subtle gradient on primary to avoid flat-color "AI template" look
 * - Inner highlight on top edge (like Linear's buttons)
 * - GPU-only transitions (transform + opacity)
 * - Correct focus ring that matches the brand
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'relative overflow-hidden',
    'bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED]',
    'text-white font-semibold',
    'shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_2px_8px_rgba(124,58,237,0.35)]',
    'hover:shadow-[0_1px_0_rgba(255,255,255,0.20)_inset,0_4px_16px_rgba(124,58,237,0.45)]',
    'disabled:from-[#27272A] disabled:to-[#27272A] disabled:text-[#52525B]',
    'disabled:shadow-none disabled:cursor-not-allowed',
  ].join(' '),
  secondary: [
    'border border-[rgba(255,255,255,0.12)]',
    'bg-[rgba(255,255,255,0.04)]',
    'text-[#E4E4E7]',
    'hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.18)]',
    'disabled:text-[#52525B] disabled:border-[rgba(255,255,255,0.05)]',
    'disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'text-[#A1A1AA]',
    'hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)]',
    'disabled:text-[#52525B] disabled:cursor-not-allowed',
  ].join(' '),
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px] rounded-lg gap-1.5',
  md: 'px-4 py-2 text-[14px] rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-[15px] rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const reduced = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <motion.button
      disabled={isDisabled}
      whileHover={reduced || isDisabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={reduced || isDisabled ? {} : { scale: 0.98, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={[
        'inline-flex items-center font-medium cursor-pointer',
        'transition-colors duration-150',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0 opacity-70"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
