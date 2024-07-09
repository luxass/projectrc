import process from "node:process";
import { loadEnv } from "vite";
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import UnoCSS from "unocss/astro";

const {
  GITHUB_TOKEN,
} = loadEnv(process.env.NODE_ENV!, process.cwd(), "");

if (!GITHUB_TOKEN) {
  throw new Error("No GITHUB_TOKEN found");
}

// https://astro.build/config
export default defineConfig({
  site: "https://projectrc.luxass.dev",
  output: "hybrid",
  adapter: vercel(),
  compressHTML: true,
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
  experimental: {
    env: {
      schema: {
        GITHUB_TOKEN: {
          type: "string",
          access: "secret",
          context: "server",
        },
        CRON_SECRET: {
          type: "string",
          access: "secret",
          context: "server",
        },
      },
    },
  },
  vite: {
    resolve: {
      alias: {
        "~/": `${new URL("./src/", import.meta.url).pathname}`,
      },
    },
  },
});
