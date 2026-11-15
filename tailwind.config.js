/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/pages/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          DEFAULT: '#0B1020',
          midnight: '#10172D',
          secondary: '#151F38',
        },
        surface: {
          DEFAULT: '#202B48',
          card: '#202B48',
          elevated: '#263553',
          glass: 'rgba(32, 43, 72, 0.72)',
          border: 'rgba(148, 163, 184, 0.16)',
          borderHover: 'rgba(56, 189, 248, 0.4)',
        },
        aurora: {
          cyan: '#38BDF8',
          blue: '#3B82F6',
          lavender: '#A78BFA',
          purple: '#C084FC',
          mint: '#2DD4BF',
          emerald: '#34D399',
          coral: '#FB7185',
          amber: '#FBBF24',
        },
        status: {
          healthy: '#34D399',
          mint: '#2DD4BF',
          degraded: '#FBBF24',
          down: '#FB7185',
          critical: '#FB7185',
          open: '#FB7185',
          investigating: '#FBBF24',
          resolved: '#34D399',
          simulated: '#38BDF8',
          maintenance: '#A78BFA',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#A8B5CC',
          muted: '#71829F',
        },
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
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-cyan': '0 0 25px -5px rgba(56, 189, 248, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(192, 132, 252, 0.35)',
        'glow-mint': '0 0 25px -5px rgba(45, 212, 191, 0.35)',
        'glow-coral': '0 0 25px -5px rgba(251, 113, 133, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(251, 191, 36, 0.35)',
      },
      backgroundImage: {
        'aurora-mesh':
          'radial-gradient(at 10% 10%, rgba(56, 189, 248, 0.12) 0px, transparent 50%), radial-gradient(at 90% 20%, rgba(192, 132, 252, 0.12) 0px, transparent 50%), radial-gradient(at 50% 80%, rgba(45, 212, 191, 0.08) 0px, transparent 50%)',
        'glass-gradient':
          'linear-gradient(135deg, rgba(38, 53, 83, 0.75) 0%, rgba(32, 43, 72, 0.6) 100%)',
        'aurora-accent':
          'linear-gradient(135deg, #38BDF8 0%, #A78BFA 50%, #C084FC 100%)',
      },
    },
  },
  plugins: [],
};
