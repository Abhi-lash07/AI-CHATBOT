/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          bg: '#0B1020',
          sidebar: '#111827',
          card: '#151C2C',
          input: '#151C2C',
          border: '#293247',
          hover: '#1E293B',
        },
        indigoAccent: {
          DEFAULT: '#818CF8',
          light: '#A5B4FC',
          dark: '#6366F1',
        },
        violetAccent: {
          DEFAULT: '#C084FC',
          light: '#E879F9',
          dark: '#A855F7',
        },
        lightSystem: {
          bg: '#F8FAFC',
          sidebar: '#FFFFFF',
          card: '#FFFFFF',
          input: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F1F5F9',
          accent: '#6366F1',
          text: '#111827',
          secondary: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'indigo-glow': '0 0 25px -4px rgba(129, 140, 248, 0.25)',
        'violet-glow': '0 0 25px -4px rgba(192, 132, 252, 0.25)',
        'card-lift': '0 12px 30px -8px rgba(11, 16, 32, 0.5), 0 0 20px -4px rgba(129, 140, 248, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
