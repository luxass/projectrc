// @ts-check
import luxass from "@luxass/eslint-config";

export default luxass({
  astro: true,
  unocss: true,
  formatters: true,
  ignores: ["**/vercel.json"],
});
