import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0f1e',
          800: '#0d1530',
          700: '#111d42',
          600: '#162352',
          500: '#1c2d6b',
        },
        scigreen: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          glow: '#00ff88',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      animation: {
        'particle-float': 'particleFloat 3s ease-in-out infinite',
        'particle-orbit': 'particleOrbit 4s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.7' },
          '50%': { transform: 'translateY(-15px)', opacity: '1' },
        },
        particleOrbit: {
          '0%': { transform: 'rotate(0deg) translateX(30px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(30px) rotate(-360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88' },
          '50%': { boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88, 0 0 60px #00ff88' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
