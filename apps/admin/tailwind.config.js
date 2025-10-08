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
        snkhouse: {
          yellow: '#FFED00',
          'yellow-dark': '#E6D600',
          black: '#000000',
        },
      },
    },
  },
  plugins: [],
};
