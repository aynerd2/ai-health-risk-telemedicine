import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep teal/blue primary — calm, trustworthy, not clinical.
        primary: colors.teal,
        // Warm grays instead of pure gray, for backgrounds/text/borders.
        neutral: colors.stone,
        // Elevated-risk red / low-risk green, used consistently everywhere
        // a risk indication is shown.
        danger: colors.red,
        success: colors.green,
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(28 25 23 / 0.04), 0 2px 8px -2px rgb(28 25 23 / 0.06)",
        "soft-lg": "0 4px 16px -4px rgb(28 25 23 / 0.10), 0 2px 6px -2px rgb(28 25 23 / 0.06)",
      },
      keyframes: {
        "pulse-glow-danger": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(220, 38, 38, 0.28)" },
          "50%": { boxShadow: "0 0 0 5px rgba(220, 38, 38, 0)" },
        },
      },
      animation: {
        "pulse-glow-danger": "pulse-glow-danger 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
