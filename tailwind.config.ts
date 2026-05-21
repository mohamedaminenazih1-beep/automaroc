/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#66bb6a",
        secondary: "#43a047",
        accent: "#a5d6a7",
        backgroundStart: "#e8f5e9",
        backgroundMid: "#c8e6c9",
        backgroundEnd: "#a5d6a7",
      },
      fontFamily: {
        sans: ["'Outfit'", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};