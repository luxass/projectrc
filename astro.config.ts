import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import solidJs from "@astrojs/solid-js";
import UnoCSS from "unocss/astro";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://projectrc.luxass.dev",
  output: "server",
  adapter: vercel(),
  compressHTML: false,
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
    solidJs(),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: {
        "~/": `${new URL("./src/", import.meta.url).pathname}`,
      },
    },
  },
});
