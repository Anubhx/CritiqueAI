import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#09090B',
        surface: '#111113',
        'surface-raised': '#18181B',
        border:  'rgba(255,255,255,0.08)',
        'text-primary':   '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-tertiary':  '#71717A',
        accent: {
          DEFAULT: '#7C3AED',
          mid:     '#6D28D9',
          dark:    '#5B21B6',
          glow:    'rgba(124,58,237,0.25)',
          surface: 'rgba(124,58,237,0.08)',
        },
        severity: {
          critical: { text: '#FCA5A5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
          major:    { text: '#FCD34D', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
          minor:    { text: '#6EE7B7', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.20)' },
          suggestion:{ text: '#A5F3FC', bg: 'rgba(6,182,212,0.10)', border: 'rgba(6,182,212,0.20)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(52px,8vw,96px)', { lineHeight: '0.92', fontWeight: '700', letterSpacing: '-0.04em' }],
        'h1':  ['clamp(28px,4vw,44px)', { lineHeight: '1.1', fontWeight: '600', letterSpacing: '-0.025em' }],
        'h2':  ['clamp(20px,2.5vw,28px)', { lineHeight: '1.2', fontWeight: '600' }],
        'h3':  ['17px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.65' }],
        'small': ['13px', { lineHeight: '1.5' }],
        'label': ['11px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.09em' }],
        'mono-sm': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        '2xl': '16px',
        'xl':  '12px',
        'lg':  '10px',
        'md':  '8px',
        'sm':  '4px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(124,58,237,0.25)',
        'glow-md': '0 0 24px rgba(124,58,237,0.30)',
        'glow-lg': '0 0 40px rgba(124,58,237,0.25), 0 0 80px rgba(124,58,237,0.12)',
        'card':    '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        'inner-highlight': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      keyframes: {
        'card-reveal': {
          from: { opacity: '0', transform: 'translateY(10px)', filter: 'blur(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)',    filter: 'blur(0px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'scan-beam': {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(124,58,237,0.25)' },
          '70%':  { boxShadow: '0 0 0 10px transparent' },
          '100%': { boxShadow: '0 0 0 0 transparent' },
        },
      },
      animation: {
        'card-reveal':   'card-reveal 350ms cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        'fade-in':       'fade-in 200ms ease-out forwards',
        'shimmer':       'shimmer 1.8s ease-in-out infinite',
        'scan-beam':     'scan-beam 2.2s cubic-bezier(0.25,0.46,0.45,0.94) infinite',
        'float':         'float 5s ease-in-out infinite',
        'pulse-ring':    'pulse-ring 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
