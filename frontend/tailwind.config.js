/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0f172a",
        darkCard: "rgba(30, 41, 59, 0.7)",
        primary: "#6366f1",
        accent: "#10b981",
        fire: "#f59e0b",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
