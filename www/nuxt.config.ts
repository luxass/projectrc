// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      viewport: "width=device-width,initial-scale=1",
    },
    layoutTransition: false,
    pageTransition: false,
  },
  colorMode: {
    classSuffix: "",
    fallback: "dark",
    preference: "dark",
  },
  css: ["@unocss/reset/tailwind.css"],
  devtools: { enabled: true },
  experimental: {
    componentIslands: true,
    payloadExtraction: true,
    typedPages: true,
    typescriptBundlerResolution: true,
    viewTransition: true,
  },
  modules: [
    "@nuxt/devtools",
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "nuxt-icon",
    "nuxt-og-image",
    "@nuxtjs/color-mode",
  ],
  plugins: [
    {
      mode: "client",
      src: "~/plugins/vercel-analytics.ts",
    },
  ],
  site: {
    url: "https://projectrc.luxass.dev",
  },
  sourcemap: false,
  vite: {
    resolve: {
      alias: {
        "@luxass/projectrc": "../packages/projectrc/src/index.ts",
      },
    },
  },
});
