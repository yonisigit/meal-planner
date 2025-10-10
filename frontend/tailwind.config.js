/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#fdf4e3',
          100: '#fbead0',
          200: '#f5d8b4'
        },
        clay: {
          400: '#d37655',
          500: '#a15a38'
        },
        bark: {
          700: '#3f2a1d',
          900: '#2b1c12'
        }
      },
      boxShadow: {
        glow: '0 25px 50px -25px rgba(167, 112, 68, 0.55)'
      }
    },
  },
  plugins: [],
}
