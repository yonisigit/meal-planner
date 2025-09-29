/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brown-dark': '#7c5c3e', // slightly darker brown
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["retro"],
  }
}
