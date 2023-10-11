// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/devtools",
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "nuxt-icon",
    "nuxt-og-image",
  ],
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
  experimental: {
    typescriptBundlerResolution: true,
    viewTransition: true,
    componentIslands: true,
    payloadExtraction: true,
    typedPages: true,
  },
  nitro: {
    routeRules: {
      "/api/schema": {
        cache: {
          maxAge: 3600,
        },
      },
      "/api/projectrc/**": {
        swr: true,
        cache: {
          maxAge: 3600,
          varies: [
            "Accept",
          ],
        },
      },
    },
  },
});
