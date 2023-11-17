import { defineConfig } from "tsup";

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  entry: ["./src/index.ts", "./src/schema.ts"],
  format: ["cjs", "esm"],
  outExtension(ctx) {
    return {
      js: ctx.format === "cjs" ? ".cjs" : ".mjs",
    };
  },
  treeshake: true,
});
