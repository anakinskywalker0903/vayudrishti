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
        background: '#f8fafc',
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f1f5f9',
          border: '#e2e8f0',
          hover: '#e2e8f0',
        },
        acid: {
          green: '#00ff87',
          emerald: '#10b981',
          dark: '#059669',
        },
        aqi: {
          good: '#10b981',
          moderate: '#f59e0b',
          unhealthySensitive: '#f97316',
          unhealthy: '#ef4444',
          veryUnhealthy: '#8b5cf6',
          hazardous: '#881337',
        },
        diwali: {
          gold: '#fbbf24',
          amber: '#d97706',
          flame: '#f97316',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        space: ['"Nunito Sans"', 'Space Grotesk', 'sans-serif'],
        sans: ['"Nunito Sans"', 'Inter', 'system-ui', 'sans-serif'],
        nunito: ['"Nunito Sans"', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      screens: {
        'xs': '390px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
      },
      borderRadius: {
        'dev-sm': '12px',
        'dev-md': '24px',
        'dev-lg': '40px',
      },
      maxWidth: {
        'dev-container': '1400px',
      },
      boxShadow: {
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.35)',
        'glow-acid': '0 0 20px -2px rgba(0, 255, 135, 0.45)',
        'glow-orange': '0 0 24px -4px rgba(249, 115, 22, 0.35)',
        'glow-gold': '0 0 24px -4px rgba(251, 191, 36, 0.4)',
        'brutalist': '3px 3px 0px 0px #94a3b8',
        'brutalist-soft': '2px 2px 0px 0px #cbd5e1',
        'brutalist-green': '3px 3px 0px 0px rgba(16, 185, 129, 0.8)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'diwali-glow': 'diwaliGlow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        diwaliGlow: {
          '0%': { filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(249, 115, 22, 0.7))' },
        }
      }
    },
  },
  plugins: [],
}
