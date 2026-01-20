/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      colors: {
        /* ===== LIGHT MODE ===== */
        "background-light": "#f8fafc",
        "surface-light": "#ffffff",
        "text-light": "#0f172a",
        "muted-light": "#64748b",
        "border-light": "#e5e7eb",

        /* ===== DARK MODE ===== */
        "background-dark": "#020617",
        "surface-dark": "#0f172a",
        "text-dark": "#e5e7eb",
        "muted-dark": "#94a3b8",
        "border-dark": "#1e293b",

        primary: "#3b82f6",
        danger: "#ef4444",
        success: "#22c55e",
      },

      transitionProperty: {
        theme: "background-color, color, border-color",
      },
    },
  },
  plugins: [],
};
