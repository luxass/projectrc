import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "./src/**/*.ts",
  ],
  bundle: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  outExtension(ctx) {
    return {
      js: ctx.format === "cjs" ? ".cjs" : ".mjs",
    };
  },
});
