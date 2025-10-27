/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foltz: {
          // Primary: Amarelo limão neon
          yellow: {
            DEFAULT: '#DAF10D',
            50: '#FAFEF5',
            100: '#F5FDE7',
            200: '#EBFAC8',
            300: '#E1F8A9',
            400: '#DAF10D', // Main
            500: '#C5DB0A',
            600: '#A8BA08',
            700: '#8A9906',
            800: '#6D7805',
            900: '#4F5703',
          },
          // Secondary: Dark black gradient
          black: {
            DEFAULT: '#1A1A1A',
            50: '#F2F2F2',
            100: '#E6E6E6',
            200: '#CCCCCC',
            300: '#B3B3B3',
            400: '#999999',
            500: '#808080',
            600: '#666666',
            700: '#4D4D4D',
            800: '#333333',
            900: '#1A1A1A', // Main
            950: '#0D0D0D',
          },
          // White (text)
          white: '#FFFFFF',
        },
      },
      backgroundImage: {
        'foltz-gradient': 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)',
        'foltz-yellow-gradient': 'linear-gradient(135deg, #DAF10D 0%, #C5DB0A 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-up': 'slide-in-up 0.5s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        shimmer: 'shimmer 2s infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
      },
    },
  },
  plugins: [],
};
