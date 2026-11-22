/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#040809',
          900: '#060d0e',
          850: '#091315',
          800: '#0d191c',
          750: '#132328',
          700: '#1a3036',
        },
        cyber: {
          teal: '#2dd4bf',
          mint: '#38efda',
          cyan: '#22d3ee',
          glow: 'rgba(45, 212, 191, 0.25)',
        },
        status: {
          healthy: '#10b981',
          warning: '#f59e0b',
          critical: '#ef4444',
          info: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px -2px rgba(45, 212, 191, 0.35)',
        'glow-mint': '0 0 25px -3px rgba(56, 239, 218, 0.45)',
        'glow-amber': '0 0 20px -2px rgba(245, 158, 11, 0.35)',
        'glow-red': '0 0 20px -2px rgba(239, 68, 68, 0.35)',
        'inner-teal': 'inset 0 0 15px 0 rgba(45, 212, 191, 0.08)',
      }
    },
  },
  plugins: [],
};
