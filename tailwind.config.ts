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
        bg: '#FAFAF9',
        surface: '#FFFFFF',
        'text-primary': '#1C1917',
        'text-secondary': '#57534E',
        border: '#E7E5E4',
        accent: {
          DEFAULT: '#4338CA',
          hover: '#3730A3',
          active: '#312E81',
        },
        disabled: {
          bg: '#D6D3D1',
          text: '#A8A29E',
        },
        severity: {
          critical: { text: '#791F1F', bg: '#FCEBEB' },
          major: { text: '#633806', bg: '#FAEEDA' },
          minor: { text: '#085041', bg: '#E1F5EE' },
          suggestion: { text: '#27500A', bg: '#EAF3DE' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'h1': ['36px', { lineHeight: '1.15', fontWeight: '600' }],
        'h2': ['26px', { lineHeight: '1.25', fontWeight: '600' }],
        'h3': ['17px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'mono-sm': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      maxWidth: {
        'content': '1100px',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      keyframes: {
        'border-pulse': {
          '0%, 100%': { borderColor: '#E7E5E4' },
          '50%': { borderColor: '#4338CA' },
        },
        'card-reveal': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'border-pulse': 'border-pulse 1.8s ease-in-out infinite',
        'card-reveal': 'card-reveal 250ms ease-out forwards',
        'fade-in': 'fade-in 200ms ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
