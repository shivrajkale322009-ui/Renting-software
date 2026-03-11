/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07090F",
        accent: "#FF6B35",
        secondary: "#4ECDC4",
        "text-primary": "#FFFFFF",
        "text-secondary": "#94A3B8",
        border: "#334155",
        "card-bg": "#1E293B",
      },
    },
  },
  plugins: [],
}
