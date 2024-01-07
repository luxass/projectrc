// @ts-check
import process from "process";

!process.env.SKIP_ENV_VALIDATION && (await import("./env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};

export default config;
