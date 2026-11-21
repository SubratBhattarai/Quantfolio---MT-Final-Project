/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quant: {
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          cardhover: "#182234",
          accent: "#3B82F6",
          emerald: "#10B981",
          rose: "#F43F5E",
          text: "#F3F4F6",
          muted: "#9CA3AF"
        }
      }
    },
  },
  plugins: [],
}
