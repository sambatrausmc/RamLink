import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: "#0B5D3B",
          forestDark: "#073d27",
          green: "#127C4A",
          greenLight: "#18a856",
          gold: "#D49A00",
          goldLight: "#f0b429",
          goldDark: "#a37800",
          ink: "#1F2933",
          muted: "#607080",
          mist: "#E8F1EC",
          mistDark: "#c8ddd0",
          surface: "#F6F8F7",
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(7, 61, 39, 0.08)",
        lift: "0 14px 36px rgba(7, 61, 39, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-hanken)", "Arial", "sans-serif"],
        display: ["var(--font-bricolage)", "var(--font-hanken)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
