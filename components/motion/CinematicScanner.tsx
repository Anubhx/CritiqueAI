'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const CinematicScanner: React.FC<{ isScanning: boolean }> = ({ isScanning }) => {
  const reduced = useReducedMotion();

  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-20">
      {/* Dim overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      
      {/* Scanning Line */}
      <motion.div
        initial={reduced ? { opacity: 0 } : { top: '-10%', opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { top: '110%', opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          top: { duration: 2.5, ease: 'linear', repeat: Infinity },
          opacity: { duration: 0.3 }
        }}
        className="absolute left-0 right-0 h-[2px] bg-[#06B6D4] opacity-80 shadow-[0_0_20px_4px_rgba(6,182,212,0.6)]"
      />

      {/* Scanning Grid (subtle) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};
