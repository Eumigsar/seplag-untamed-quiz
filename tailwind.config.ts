import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:    '#D4AF37',
        jade:    '#00A86B',
        crimson: '#8B1A1A',
        ink:     '#0A0F1E',
        paper:   '#F0E6C8',
        stone:   '#2A2A3E',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        chinese: ['var(--font-noto)', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 8px #D4AF37' }, '50%': { boxShadow: '0 0 24px #D4AF37, 0 0 48px #D4AF3755' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
};

export default config;
