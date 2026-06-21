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
        // Navy-blue darkness (replaces neutral gray) — Genshin "abyss" vibe
        ink: {
          50:  '#ecf0f8',
          100: '#d0d8ec',
          200: '#a8b4d4',
          300: '#7080b0',
          400: '#445090',
          500: '#2c3470',
          600: '#1e2558',
          700: '#141840',
          800: '#0e1230',
          900: '#090d22',
          950: '#050810',
        },
        // Geo-amber gold — Genshin warmth
        gold: {
          50:  '#fefbf0',
          100: '#fdf5d8',
          200: '#fae9b0',
          300: '#f0d070',
          400: '#e0b848',
          500: '#c9a86c',
          600: '#a88548',
          700: '#8a6830',
          800: '#6c5020',
          900: '#503a14',
          950: '#2a1e06',
        },
        // Anemo teal — Genshin nature/wind color
        jade: {
          50:  '#f0fdf8',
          100: '#d8f8ec',
          200: '#b0f0d8',
          300: '#74d4a8',
          400: '#44b888',
          500: '#2a9c6e',
          600: '#1a8055',
          700: '#0f6040',
          800: '#08422c',
          900: '#04281a',
          950: '#021510',
        },
        // Crimson — HP / danger
        crimson: {
          50:  '#fff1f2',
          100: '#ffe0e2',
          200: '#fec8cc',
          300: '#fd9aa0',
          400: '#fc6070',
          500: '#f04050',
          600: '#d82035',
          700: '#b8142a',
          800: '#981028',
          900: '#800f27',
          950: '#460510',
        },
        // Steel-blue — secondary UI text (Genshin celestial tone)
        celestial: {
          50:  '#f0f4ff',
          100: '#e0e8fc',
          200: '#c0ccf0',
          300: '#98aad8',
          400: '#7088c0',
          500: '#4d68a8',
          600: '#345090',
          700: '#1e3878',
          800: '#102458',
          900: '#081438',
          950: '#040a20',
        },
        // Parchment — ivory text
        parchment: {
          50:  '#fefdf8',
          100: '#faf5e8',
          200: '#f5eacc',
          300: '#edd8a8',
          400: '#e2c078',
          500: '#d0a040',
          600: '#b07e28',
          700: '#906018',
          800: '#72480e',
          900: '#5a3808',
          950: '#321e04',
        },
        // Legacy dynasty (dynasty red accent)
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
          "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='%23c9a86c' fill-opacity='.04'/%3E%3Cpath d='M0 0l10 10L0 20M20 0l-10 10 10 10' stroke='%23c9a86c' stroke-opacity='.08' fill='none'/%3E%3C/svg%3E\")",
        'gi-noise':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float':          'float 3s ease-in-out infinite',
        'glow-pulse':     'glow-pulse 2.5s ease-in-out infinite',
        'glow-pulse-teal':'glow-pulse-teal 2.5s ease-in-out infinite',
        'brush-stroke':   'brush-stroke 0.5s ease-out forwards',
        'slide-up':       'slide-up 0.3s ease-out forwards',
        'fade-in':        'fade-in 0.4s ease-out forwards',
        'shimmer':        'shimmer 2s ease-in-out infinite',
        'dragon-fly':     'dragon-fly 6s ease-in-out infinite',
        'breath':         'breath 4s ease-in-out infinite',
        'corner-glow':    'corner-glow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 6px rgba(201, 168, 108, 0.2), inset 0 0 6px rgba(201, 168, 108, 0.05)' },
          '50%':      { boxShadow: '0 0 20px rgba(201, 168, 108, 0.5), inset 0 0 10px rgba(201, 168, 108, 0.1)' },
        },
        'glow-pulse-teal': {
          '0%, 100%': { boxShadow: '0 0 6px rgba(116, 212, 168, 0.2)' },
          '50%':      { boxShadow: '0 0 20px rgba(116, 212, 168, 0.5)' },
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
        breath: {
          '0%, 100%': { opacity: '0.7' },
          '50%':      { opacity: '1' },
        },
        'corner-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
      },
      boxShadow: {
        'gi':          '0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(201,168,108,0.08) inset',
        'gi-lg':       '0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(201,168,108,0.1) inset',
        'gi-gold':     '0 0 16px rgba(201, 168, 108, 0.4)',
        'gi-teal':     '0 0 16px rgba(116, 212, 168, 0.4)',
        'gi-crimson':  '0 0 16px rgba(240, 64, 80, 0.4)',
        'gi-inner':    'inset 0 0 20px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        'gi': '4px',
      },
    },
  },
  plugins: [],
};

export default config;
