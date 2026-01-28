import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cad: {
          bg: '#ffffff',
          panel: '#ffffff',
          border: '#1a4d8f',
          text: '#1a4d8f',
          'text-dim': '#1a4d8f',
          accent: '#1a4d8f',
          'accent-hover': '#0d2a4d',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        mono: ['monospace'],
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',
      },
    },
  },
  plugins: [],
};

export default config;
