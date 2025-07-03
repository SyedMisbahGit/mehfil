/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f5132',     // Deep emerald
        accent: '#d6b877',      // Muted gold
        surface: '#0e0f13',     // Near-black
        text: '#f1f5f9',        // Soft white
        soft: '#1e2a24',        // Card background
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Noto Naskh Arabic"', 'serif'],
      },
    },
  },
  plugins: [],
}
