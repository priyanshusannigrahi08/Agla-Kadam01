import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17221C",
        paper: "#F6F4EE",
        board: "#1F3B2E",
        "board-dark": "#152A20",
        amber: "#E2A63B",
        sage: "#B7CDBB",
        chalk: "#EDEAE0",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        noticeboard:
          "radial-gradient(circle at 1px 1px, rgba(246,244,238,0.06) 1px, transparent 0)",
      },
      backgroundSize: {
        cork: "18px 18px",
      },
    },
  },
  plugins: [],
};
export default config;
