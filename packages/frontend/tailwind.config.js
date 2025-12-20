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
          'bg': '#ffffff',
          'panel': '#ffffff',
          'border': '#1a4d8f',
          'text': '#1a4d8f',
          'text-dim': '#1a4d8f',
          'accent': '#1a4d8f',
          'accent-hover': '#0d2a4d',
          'success': '#1a4d8f',
          'warning': '#1a4d8f',
          'error': '#1a4d8f',
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'mono': ['monospace'],
      },
      borderRadius: {
        'none': '0',
        DEFAULT: '0',
      }
    },
  },
  plugins: [],
}
