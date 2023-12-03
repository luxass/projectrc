import { writeFile } from "node:fs/promises";
import { defineConfig } from "tsup";
import {
  toJSONSchema,
} from "@gcornut/valibot-json-schema";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/schema.ts",
    "./src/utils.ts",
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
  async onSuccess() {
    const schema = await import("./src/schema").then((m) => m.SCHEMA);
    const jsonSchema = toJSONSchema({
      schema,
    });
    await writeFile("./schema.json", `${JSON.stringify(jsonSchema, null, 2)}\n`);
  },
});
