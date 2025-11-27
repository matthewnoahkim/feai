/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cad': {
          'dark': '#1a1d21',
          'darker': '#131518',
          'panel': '#252830',
          'border': '#3a3f4b',
          'text': '#e4e6eb',
          'text-dim': '#9ca3af',
          'accent': '#3b82f6',
          'accent-hover': '#60a5fa',
          'success': '#22c55e',
          'warning': '#f59e0b',
          'error': '#ef4444',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

