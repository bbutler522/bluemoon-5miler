/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#eef2ff',
          100: '#dce4ff',
          200: '#b9c8ff',
          300: '#7a96ff',
          400: '#4a6cf7',
          500: '#2a4dd4',
          600: '#1a35a8',
          700: '#0f2272',
          800: '#0a1744',
          900: '#060e2a',
          950: '#030816',
        },
        lunar: {
          50: '#fafbff',
          100: '#f0f2fa',
          200: '#e0e5f5',
          300: '#c8d0eb',
          400: '#a8b4d9',
          500: '#8896c1',
        },
        moonlight: '#e8eeff',
        stardust: '#b8c8f0',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'moon-glow': 'radial-gradient(circle at 50% 0%, rgba(200, 208, 235, 0.15) 0%, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200, 208, 235, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(200, 208, 235, 0.2)' },
        },
      },
    },
  },
  plugins: [],
};
