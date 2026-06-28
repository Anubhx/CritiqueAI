'use client';

/**
 * motion/index.tsx — Premium V2 animation primitives
 *
 * Philosophy:
 *   - Cinematic, calm, intentional motion.
 *   - Mouse interactions create light and depth, not movement (VisionOS style).
 *   - Reduced motion is always respected.
 */

import React, { useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionTemplate,
  type HTMLMotionProps,
  type Variants,
} from 'framer-motion';

export const ease = {
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  snappy: [0.36, 0.66, 0.04, 1] as const,
  spring: { type: 'spring', stiffness: 400, damping: 30 } as const,
};

// ─── Entrance Animations ──────────────────────────────────────────────────

export const FadeIn: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number }> = ({ delay = 0, duration = 0.5, children, ...props }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration, delay, ease: ease.smooth }} {...props}>
      {children}
    </motion.div>
  );
};

export const SlideUp: React.FC<HTMLMotionProps<'div'> & { delay?: number; distance?: number; duration?: number }> = ({ delay = 0, distance = 20, duration = 0.6, children, ...props }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, y: distance }} animate={{ opacity: 1, y: 0 }} transition={{ duration, delay, ease: ease.smooth }} {...props}>
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number }> = ({ delay = 0, duration = 0.5, children, ...props }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration, delay, ease: ease.smooth }} {...props}>
      {children}
    </motion.div>
  );
};

export const BlurIn: React.FC<HTMLMotionProps<'div'> & { delay?: number; duration?: number }> = ({ delay = 0, duration = 0.6, children, ...props }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration, delay, ease: ease.smooth }} {...props}>
      {children}
    </motion.div>
  );
};

// ─── Stagger Orchestrators ────────────────────────────────────────────────

const heroVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const heroChildVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: ease.smooth } },
};

export const HeroReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  
  return (
    <motion.div variants={heroVariants} initial="hidden" animate="visible" className={className}>
      {React.Children.map(children, (child) => (
        <motion.div variants={heroChildVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

const cardVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardChildVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.smooth } },
};

export const CardReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className={className}>
      {React.Children.map(children, (child) => (
        <motion.div variants={cardChildVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

export const ReportReveal = CardReveal;

// ─── Interactive Elements ──────────────────────────────────────────────────

export const MagneticButton: React.FC<HTMLMotionProps<'button'> & { strength?: number }> = ({ children, strength = 0.2, className, ...props }) => {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={reduced ? {} : { scale: 1.02 }}
      whileTap={reduced ? {} : { scale: 0.98 }}
      style={{ x: springX, y: springY }}
      animate={reduced ? {} : { scale: [1, 1.01, 1] }}
      transition={{ scale: { repeat: Infinity, duration: 4, ease: 'easeInOut' } }} // breathing logic
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Spotlight: React.FC<{ children: React.ReactNode; className?: string; color?: string }> = ({ children, className, color = 'rgba(255,255,255,0.06)' }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div className={`relative group ${className || ''}`} onMouseMove={handleMouseMove}>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              ${color},
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
};

export const AnimatedBorder: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 rounded-2xl pointer-events-none p-[1px] overflow-hidden ${className || ''}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['-200% 0%', '200% 0%'] }}
        transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
      />
    </div>
  );
};

export const CountUp: React.FC<{ value: number; duration?: number; className?: string }> = ({ value, duration = 1.4, className }) => {
  const reduced = useReducedMotion();
  const count = useMotionValue(0);
  const springCount = useSpring(count, { stiffness: reduced ? 10000 : 80, damping: reduced ? 100 : 20 });
  const [display, setDisplay] = useState(0);

  React.useEffect(() => {
    springCount.set(value);
  }, [value, springCount]);

  React.useEffect(() => {
    return springCount.on('change', (v) => setDisplay(Math.round(v)));
  }, [springCount]);

  return <motion.span className={className}>{display}</motion.span>;
};

// ─── Background ────────────────────────────────────────────────────────────

export const AnimatedBackground: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  React.useEffect(() => {
    const handleGlobalMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleGlobalMouse);
    return () => window.removeEventListener('mousemove', handleGlobalMouse);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#09090B] z-0" aria-hidden="true">
      {/* Subtle global spotlight tracking mouse */}
      <motion.div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              800px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.03),
              transparent 80%
            )
          `,
        }}
      />
      {/* Noise grain overlay for matte finish */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  );
};

export { Antigravity } from './Antigravity';
export { CinematicScanner } from './CinematicScanner';
