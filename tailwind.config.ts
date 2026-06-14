import type { Config } from "tailwindcss";

// Canonical token set = the app's indigo theme (per migration decision).
// The marketing landing keeps its own navy/mint surface, scoped to .mb-landing.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: "#211eaf",
          mid: "#4c67ed",
          bright: "#383bca",
          light: "#1d4ebf",
          pale: "#436fd5",
        },
        amber: { DEFAULT: "#f2a024", light: "#fdf0d5" },
        warm: "#e05c3a",
        cream: "#faf8f3",
        ink: { DEFAULT: "#0f2318", mid: "#3a5c47", muted: "#7a9e88" },
        accent: { green: "#3db870" },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
