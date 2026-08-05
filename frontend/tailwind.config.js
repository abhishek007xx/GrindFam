/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0d1117",
        darkCard: "rgba(30, 41, 59, 0.7)",
        surface: "#161b22",
        surfaceElevated: "#1c2333",
        borderDefault: "#21262d",
        borderMuted: "#30363d",
        primary: "#6366f1",
        accent: "#22c55e",
        accentHover: "#16a34a",
        fire: "#f59e0b",
        muted: "#8b949e",
        mutedDim: "#6e7681",
        mutedFaint: "#484f58",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fadeSlideUp': 'fadeSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scaleIn': 'scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulseGlow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.3)' },
          '50%': { boxShadow: '0 0 16px 4px rgba(34, 197, 94, 0.15)' },
        },
      },
      spacing: {
        'sidebar': '240px',
        'navbar': '56px',
      },
    },
  },
  plugins: [],
}
