// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@unocss/nuxt",
    "@nuxt/devtools",
    "@vueuse/nuxt",
    "nuxt-icon",
    "@nuxtjs/html-validator",
  ],
  devtools: { enabled: true },
  plugins: [
    {
      src: "~/plugins/vercel-analytics.ts",
      mode: "client",
    },
  ],
  css: [
    "@unocss/reset/tailwind.css",
  ],
  sourcemap: false,
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "ProjectRC",
    },
    pageTransition: false,
    layoutTransition: false,
  },
  htmlValidator: {
    failOnError: true,
    options: {
      rules: {
        "wcag/h37": "warn",
        "element-permitted-content": "warn",
        "element-required-attributes": "warn",
        "attribute-empty-style": "off",
      },
    },
  },
  experimental: {
    typescriptBundlerResolution: true,
    viewTransition: true,
    componentIslands: true,
    payloadExtraction: true,
    typedPages: true,
  },
});
