import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        crimson: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        ink: {
          50:  '#f8f8f8',
          100: '#ececec',
          200: '#d4d4d4',
          300: '#ababab',
          400: '#717171',
          500: '#4d4d4d',
          600: '#2e2e2e',
          700: '#242424',
          800: '#1a1a1a',
          900: '#111111',
          950: '#080808',
        },
        parchment: {
          50:  '#fdfaf5',
          100: '#faf3e0',
          200: '#f5e6c4',
          300: '#edd5a0',
          400: '#e4c07a',
          500: '#d4a657',
          600: '#b8873a',
          700: '#9a6a2c',
          800: '#7c5228',
          900: '#664527',
          950: '#3a2511',
        },
        dynasty: {
          50:  '#fef2f0',
          100: '#fce4dd',
          200: '#facdc2',
          300: '#f6ac9a',
          400: '#f07d66',
          500: '#e65434',
          600: '#d63a1b',
          700: '#b32d14',
          800: '#942818',
          900: '#7a271a',
          950: '#431109',
        },
      },
      fontFamily: {
        chinese: ['"Noto Serif SC"', '"Noto Sans SC"', 'serif'],
        game:    ['"Cinzel Decorative"', '"Noto Serif SC"', 'serif'],
        ui:      ['"Noto Sans SC"', '"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'silk-pattern':
          "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='%23c9a86c' fill-opacity='.05'/%3E%3Cpath d='M0 0l10 10L0 20M20 0l-10 10 10 10' stroke='%23c9a86c' stroke-opacity='.1' fill='none'/%3E%3C/svg%3E\")",
        'paper-texture':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float':        'float 3s ease-in-out infinite',
        'pulse-jade':   'pulse-jade 2s ease-in-out infinite',
        'brush-stroke': 'brush-stroke 0.5s ease-out forwards',
        'slide-up':     'slide-up 0.3s ease-out forwards',
        'fade-in':      'fade-in 0.4s ease-out forwards',
        'shimmer':      'shimmer 1.5s ease-in-out infinite',
        'dragon-fly':   'dragon-fly 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-jade': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(34, 197, 94, 0.15)' },
        },
        'brush-stroke': {
          from: { clipPath: 'inset(0 100% 0 0)' },
          to:   { clipPath: 'inset(0 0% 0 0)' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'dragon-fly': {
          '0%, 100%': { transform: 'translateX(0) translateY(0) rotate(0deg)' },
          '25%':      { transform: 'translateX(10px) translateY(-5px) rotate(5deg)' },
          '50%':      { transform: 'translateX(5px) translateY(-10px) rotate(-3deg)' },
          '75%':      { transform: 'translateX(-5px) translateY(-5px) rotate(3deg)' },
        },
      },
      borderRadius: {
        chinese: '2px 8px 2px 8px',
      },
    },
  },
  plugins: [],
};

export default config;
