// @ts-check
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [UnoCSS({
    injectReset: true,
  })],
  vite: {
    resolve: {
      alias: {
        "@luxass/projectrc": "../packages/projectrc/src/index.ts",
      },
    },
  },
  compressHTML: false,
  markdown: {
    
  },
  output: "server",
  adapter: vercel(),
});
