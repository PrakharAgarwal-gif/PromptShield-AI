/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070b14',
        canvas: '#0b1120',
        surface: {
          DEFAULT: '#0f172a',
          muted: '#131d33',
          elevated: '#17223b',
          border: '#1e293b',
          borderHover: '#334155',
        },
        sentinel: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        brand: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          cyan: '#06b6d4',
        },
        status: {
          healthy: '#10b981',
          degraded: '#f59e0b',
          down: '#f43f5e',
          maintenance: '#8b5cf6',
          open: '#f43f5e',
          investigating: '#f59e0b',
          resolved: '#10b981',
          simulated: '#3b82f6',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px -5px rgba(59, 130, 246, 0.3)',
      },
    },
  },
  plugins: [],
};

