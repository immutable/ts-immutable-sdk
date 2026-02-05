import { defineConfig, type Options } from "tsup";

// Base configuration shared across all builds
const baseConfig: Options = {
  outDir: "dist/node",
  format: ["esm", "cjs"],
  target: "es2022",
  platform: "node",
  dts: false,
};

export default defineConfig([
  // Server-side entries (no 'use client' directive)
  {
    ...baseConfig,
    entry: {
      index: "src/index.ts",
    },
    clean: true,
  },
]);