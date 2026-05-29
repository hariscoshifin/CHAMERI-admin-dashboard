/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          50: "#f0f4ff",
          100: "#dce6ff",
          200: "#b9ccff",
          300: "#85a5ff",
          400: "#4d74ff",
          500: "#2952ff",  // Primary
          600: "#1a3de0",
          700: "#132db5",
          800: "#0f2291",
          900: "#091778",
        },
        // Dark sidebar / backgrounds
        dark: {
          900: "#0a0d1a",
          800: "#0f1326",
          700: "#141832",
          600: "#1c2240",
          500: "#242b50",
          400: "#2e3660",
        },
        // Surface cards
        surface: {
          DEFAULT: "#1a1f35",
          light: "#222840",
          border: "#2a3158",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #2952ff 0%, #7c3aed 100%)",
        "gradient-dark": "linear-gradient(180deg, #0f1326 0%, #0a0d1a 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(41, 82, 255, 0.25)",
        "glow-sm": "0 0 10px rgba(41, 82, 255, 0.15)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-in": "slideIn 0.3s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: 0, transform: "translateX(-12px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
