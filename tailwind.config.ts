import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        kamp: {
          orange: '#FEF3C7',
          'orange-border': '#F59E0B',
          green: '#D1FAE5',
          'green-border': '#10B981',
        },
        forest: {
          50: '#f4f7f5',
          100: '#e5ede8',
          200: '#cbdcd1',
          300: '#a2c2af',
          400: '#71a084',
          500: '#4c8062',
          600: '#3a654c',
          700: '#30523e',
          800: '#294334',
          900: '#1a2a21',
          950: '#0d1611',
        },
        sand: {
          50: '#fcfbfa',
          100: '#f7f4ee',
          200: '#efe8dc',
          300: '#e0d4c1',
          400: '#ccb99f',
          500: '#b89d7d',
          600: '#aa8665',
          700: '#8e6c52',
          800: '#745744',
          900: '#5f4739',
          950: '#33251d',
        },
      },
    },
  },
  plugins: [],
};

export default config;
