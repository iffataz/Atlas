import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        atlas: "#7447AE",
        "atlas-light": "#E4D7F5",
        paper: "#F2EFE9",
        ink: "#111111",
        muted: "#555555",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        display: ["var(--font-archivo-black)", "sans-serif"],
      },
      boxShadow: {
        "brutal-sm": "3px 3px 0 0 #111111",
        brutal: "4px 4px 0 0 #111111",
        "brutal-lg": "6px 6px 0 0 #111111",
        "brutal-purple": "4px 4px 0 0 #7447AE",
      },
      animation: {
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
