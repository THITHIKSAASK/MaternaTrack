/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          rose: '#BE185D',
          hover: '#9D174D',
          ticker: '#FCE7F3',
          soft: '#FFF7FA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
        },
        slate: {
          main: '#1F2937',
          muted: '#64748B',
          border: '#E5E7EB',
        },
        status: {
          success: '#15803D',
          warning: '#B45309',
          critical: '#B91C1C',
          info: '#0369A1',
        }
      },
      fontFamily: {
        sans: ['Noto Sans Tamil', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
