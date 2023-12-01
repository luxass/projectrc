// @ts-check
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [UnoCSS({
    injectReset: true,
  })],
  compressHTML: false,
  markdown: {
    shikiConfig: {
      experimentalThemes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
    },
  },
  output: "server",
  adapter: vercel(),
});
