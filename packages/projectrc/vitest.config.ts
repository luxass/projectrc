import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  test: {
    setupFiles: [
      "./tests/setup.ts",
    ],
    testTimeout: 30_000,
    watch: false,
  },
});
