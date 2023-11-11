// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "nuxt-icon",
    "nuxt-og-image",
    "@nuxtjs/color-mode",
  ],
  site: {
    url: "https://projectrc.luxass.dev",
  },
  devtools: { enabled: true },
  plugins: [
    {
      src: "~/plugins/vercel-analytics.ts",
      mode: "client",
    },
  ],
  css: ["@unocss/reset/tailwind.css"],
  sourcemap: false,
  app: {
    head: {
      viewport: "width=device-width,initial-scale=1",
      htmlAttrs: {
        lang: "en",
      },
    },
    pageTransition: false,
    layoutTransition: false,
  },
  colorMode: {
    fallback: "dark",
    preference: "dark",
    classSuffix: "",
  },
  experimental: {
    typescriptBundlerResolution: true,
    viewTransition: true,
    componentIslands: true,
    payloadExtraction: true,
    typedPages: true,
  },
  nitro: {
    vercel: {
      config: {
        routes: [
          {
            src: "^/schema$",
            dest: "/api/schema",
            continue: false,
          },
          {
            src: "^/schema.json$",
            dest: "/api/schema",
            continue: false,
          },
        ],
      },
    },
  },
  vite: {
    resolve: {
      alias: {
        "@luxass/projectrc": "../packages/projectrc/src/index.ts",
      },
    },
  },
});
