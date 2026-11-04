import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bmw: {
          primary: "#1c69d4",
          "primary-active": "#0653b6",
          "primary-disabled": "#d6d6d6",
          ink: "#262626",
          body: "#3c3c3c",
          "body-strong": "#1a1a1a",
          muted: "#6b6b6b",
          "muted-soft": "#9a9a9a",
          hairline: "#e6e6e6",
          "hairline-strong": "#cccccc",
          canvas: "#ffffff",
          "surface-soft": "#f7f7f7",
          "surface-card": "#fafafa",
          "surface-strong": "#ebebeb",
          "surface-dark": "#1a2129",
          "surface-dark-elevated": "#262e38",
          "on-primary": "#ffffff",
          "on-dark": "#ffffff",
          "on-dark-soft": "#bbbbbb",
          "m-blue-light": "#0066b1",
          "m-blue-dark": "#1c69d4",
          "m-red": "#e22718",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#dc2626",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "Consolas",
          "'Courier New'",
          "monospace",
        ],
      },
      letterSpacing: {
        uppercase: "1.5px",
        wide: "0.5px",
      },
    },
  },
  plugins: [],
};

export default config;
