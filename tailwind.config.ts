import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        parchment: {
          light: "#E3DACE",
          DEFAULT: "#D5C4A1",
          dark: "#B8A383",
        },
        medieval: {
          stone: "#1C1917",
          gold: "#F59E0B",
          blood: "#7F1D1D",
          iron: "#374151",
        },
      },
      fontFamily: {
        serif: ["var(--font-cinzel)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
