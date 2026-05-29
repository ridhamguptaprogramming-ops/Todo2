/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          light: '#f7f8fb',
          dark: '#0b1220',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}

