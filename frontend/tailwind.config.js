/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // kept empty to use daisyUI theme colors (retro)
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["retro"],
  }
}
