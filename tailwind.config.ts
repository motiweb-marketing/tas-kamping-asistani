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
        kamp: {
          orange: '#FEF3C7',
          'orange-border': '#F59E0B',
          green: '#D1FAE5',
          'green-border': '#10B981',
        },
      },
    },
  },
  plugins: [],
};

export default config;
