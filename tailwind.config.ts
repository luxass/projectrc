import type { Config } from "tailwindcss";

import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [
    iconsPlugin({
      scale: 1.3,
      collections: getIconCollections([
        "octicon",
        "twemoji",
        "carbon",
        "lucide",
      ]),
    }),
  ],
};
export default config;
