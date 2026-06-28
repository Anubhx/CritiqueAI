'use client';

/**
 * motion/index.tsx — Premium animation primitives
 *
 * Philosophy:
 *   Every animation here exists because it improves comprehension, signals
 *   state, or communicates hierarchy. Nothing is decorative for its own sake.
 *
 * Reduced motion: All components respect prefers-reduced-motion automatically
 *   via Framer Motion's built-in `useReducedMotion` hook.
 */

import React, { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useSpring,
  type HTMLMotionProps,
  type Variants,
} from 'framer-motion';

// ─── Shared easing curves (inspired by Apple/Linear) ────────────────────────

export const ease = {
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  snappy: [0.36, 0.66, 0.04, 1] as const,     // feels like native iOS
  spring: { type: 'spring', stiffness: 400, damping: 30 } as const,
  springGentle: { type: 'spring', stiffness: 200, damping: 25 } as const,
  springBouncy: { type: 'spring', stiffness: 500, damping: 35 } as const,
};

// ─── FadeUp ─────────────────────────────────────────────────────────────────
// Purpose: Reveals content as it enters the viewport. The upward motion
//          signals "freshly appeared" without being theatrical.

interface FadeUpProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
  distance?: number;
  children: React.ReactNode;
}

export const FadeUp: React.FC<FadeUpProps> = ({
  delay = 0,
  duration = 0.55,
  distance = 20,
  children,
  ...props
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: ease.smooth }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ─── ScrollReveal ────────────────────────────────────────────────────────────
// Purpose: Triggers FadeUp when element enters the viewport. Used for
//          below-the-fold sections so animations only fire when relevant.

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  distance?: number;
  children: React.ReactNode;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  delay = 0,
  distance = 24,
  children,
  ...props
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: ease.smooth }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ─── StaggerContainer ────────────────────────────────────────────────────────
// Purpose: Orchestrates children to stagger their entry. Used on lists of
//          cards (issue cards, mode cards) so they read as a sequence,
//          not a wall of content that appears all at once.

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
  children: React.ReactNode;
}

const staggerVariants: Variants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: { staggerChildren: staggerDelay },
  }),
};

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  staggerDelay = 0.07,
  children,
  ...props
}) => (
  <motion.div
    variants={staggerVariants}
    initial="hidden"
    animate="visible"
    custom={staggerDelay}
    {...props}
  >
    {children}
  </motion.div>
);

export const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: ease.smooth },
  },
};

// ─── StaggerChild ────────────────────────────────────────────────────────────

export const StaggerChild: React.FC<HTMLMotionProps<'div'> & { children: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <motion.div variants={staggerChildVariants} {...props}>
    {children}
  </motion.div>
);

// ─── HoverCard ───────────────────────────────────────────────────────────────
// Purpose: Adds a subtle lift + shadow deepening on hover. Signals
//          interactivity for cards that are clickable or highlightable.
//          The scale is intentionally tiny (1.005) — enough to feel alive,
//          not enough to feel like a bounce toy.

interface HoverCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  lift?: number;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  lift = 2,
  ...props
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      whileHover={reduced ? {} : { y: -lift, scale: 1.005 }}
      transition={ease.spring}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ─── TiltCard ────────────────────────────────────────────────────────────────
// Purpose: Mouse-tracked 3D tilt for the hero image. Creates a sense of
//          depth and physicality — the interface feels like an object in space,
//          not a flat diagram. This is the "handcrafted" moment.

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  intensity = 8,
}) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-intensity, intensity]);

  const springX = useSpring(rotateX, { stiffness: 200, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reduced) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reduced ? {} : { rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};

// ─── MagneticButton ──────────────────────────────────────────────────────────
// Purpose: Subtle magnetic pull toward cursor on hover. Used on primary CTA
//          buttons. This is a "premium feel" micro-interaction — signals that
//          clicking is rewarding, not just functional.

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className,
  strength = 0.25,
}) => {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

// ─── CountUp ─────────────────────────────────────────────────────────────────
// Purpose: Animates a number from 0 to target. Used for the overall score.
//          The counting motion makes the number feel earned — a reward for
//          waiting through the analysis, not just a static output.

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1.4,
  className,
}) => {
  const reduced = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const springCount = useSpring(count, {
    stiffness: reduced ? 10000 : 80,
    damping: reduced ? 100 : 20,
  });

  React.useEffect(() => {
    springCount.set(value);
  }, [value, springCount]);

  return (
    <motion.span className={className}>
      {useTransformDisplay(springCount)}
    </motion.span>
  );
};

// Helper for CountUp to display formatted spring value
function useTransformDisplay(motionVal: ReturnType<typeof useSpring>) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    return motionVal.on('change', (v) => setDisplay(Math.round(v)));
  }, [motionVal]);
  return display;
}

// ─── FloatingElement ─────────────────────────────────────────────────────────
// Purpose: Gentle infinite float animation. Used for UI annotation cards in
//          the hero image to make them feel like live, breathing elements.
//          Float speed varies per element so they don't move in lockstep.

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  amplitude?: number;
  delay?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className,
  duration = 5,
  amplitude = 8,
  delay = 0,
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduced ? {} : {
        y: [0, -amplitude, 0],
        rotate: [0, 0.5, 0, -0.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

// ─── AnimatedBackground ───────────────────────────────────────────────────────
// Purpose: Slow-moving gradient mesh background. Replaces the static
//          flat #FAFAF9 background with something that breathes.
//          Motion is imperceptible except in peripheral vision — creating
//          a "living" quality without drawing attention.

export const AnimatedBackground: React.FC<{ className?: string }> = ({ className }) => {
  const reduced = useReducedMotion();
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ''}`} aria-hidden="true">
      {/* Primary gradient blob */}
      <motion.div
        className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(67,56,202,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={reduced ? {} : {
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Secondary blob */}
      <motion.div
        className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,56,202,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={reduced ? {} : {
          x: [0, -30, 15, 0],
          y: [0, 25, -15, 0],
          scale: [1, 0.9, 1.08, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      {/* Noise texture overlay — adds grain, breaks up the "digital" flatness */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
};

// ─── SectionTransition ────────────────────────────────────────────────────────
// Purpose: Wraps major page sections. Fade + slight upward translate as the
//          section scrolls into view. Establishes a consistent "reading rhythm"
//          for the page — each section feels like a new thought, not a wall.

export const SectionTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => (
  <ScrollReveal delay={delay} distance={32} className={className}>
    {children}
  </ScrollReveal>
);
