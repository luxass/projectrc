import process from "node:process";
import { resolve } from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import UnoCSS from "unocss/astro";
import icon from "astro-icon";

const {
  GITHUB_TOKEN,
  ISR_BYPASS_TOKEN,
} = loadEnv(process.env.NODE_ENV!, process.cwd(), "");

if (!GITHUB_TOKEN) {
  throw new Error("No GITHUB_TOKEN found");
}

if (!ISR_BYPASS_TOKEN) {
  throw new Error("No ISR_BYPASS_TOKEN found");
}

// https://astro.build/config
export default defineConfig({
  site: "https://mosaic.luxass.dev",
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
    icon(),
  ],
  experimental: {
    env: {
      schema: {
        GITHUB_TOKEN: {
          type: "string",
          access: "secret",
          context: "server",
        },
      },
    },
  },
  compressHTML: true,
  output: "hybrid",
  adapter: vercel({
    isr: {
      bypassToken: process.env.ISR_BYPASS_TOKEN,
      exclude: ["/api/**", "!/api/v1/projects.json"],
      expiration: 3600,
    },
    maxDuration: 30,
  }),
  vite: {
    resolve: {
      alias: {
        "~/": `${new URL("./src/", import.meta.url).pathname}`,
      },
    },
  },
});
