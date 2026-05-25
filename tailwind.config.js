/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "sans-serif"],
        latin: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Sora", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#fef3f2",
          100: "#fde8e6",
          200: "#fbd0cc",
          300: "#f8aba4",
          400: "#f27b70",
          500: "#e74f41",
          600: "#d43224",
          700: "#b1281b",
          800: "#92241a",
          900: "#79231b",
          950: "#420d09",
        },
        gold: {
          400: "#f5c842",
          500: "#e8b620",
          600: "#c99510",
        },
        surface: {
          50:  "#f8f9fa",
          100: "#f1f3f5",
          200: "#e9ecef",
          800: "#1a1d23",
          900: "#12151a",
          950: "#0a0c10",
        },
      },
      animation: {
        "fade-in":      "fadeIn 0.4s ease-out",
        "slide-up":     "slideUp 0.4s ease-out",
        "slide-in-rtl": "slideInRtl 0.3s ease-out",
        "pulse-brand":  "pulseBrand 2s infinite",
        shimmer:        "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:     { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideInRtl:  { from: { opacity: 0, transform: "translateX(16px)" }, to: { opacity: 1, transform: "translateX(0)" } },
        pulseBrand:  { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
        shimmer:     { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)",
        modal: "0 20px 60px rgba(0,0,0,.15), 0 4px 16px rgba(0,0,0,.08)",
        brand: "0 4px 20px rgba(231,79,65,0.3)",
      },
    },
  },
  plugins: [],
};
