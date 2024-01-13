// @ts-check
import { luxass } from "@luxass/eslint-config";

export default luxass({
  astro: true,
  unocss: true,
  solid: true,
  formatters: true,
  ignores: [
    "vercel.json"
  ]
});
