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
        jade: '#00A86B',
        imperial: '#ED2939',
        ink: '#1A1A1A',
        paper: '#F5F5DC',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
};

export default config;
