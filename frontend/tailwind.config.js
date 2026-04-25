/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0A0D14',
          card: '#11151F',
          sidebar: '#0C0F17',
        },
        line: {
          DEFAULT: '#1E2536',
        },
        accent: {
          DEFAULT: '#00E5FF',
          hover: '#33EEFF',
        },
        good: '#00E676',
        warn: '#FFEA00',
        bad: '#FF4D4D',
        ink: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};
