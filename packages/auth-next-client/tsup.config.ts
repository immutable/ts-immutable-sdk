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
  // Client-side entry (needs 'use client' directive for Next.js)
  {
    ...baseConfig,
    entry: {
        index: "src/index.ts",
    },
    clean: false, // Don't clean since server build runs first
    banner: {
      js: "'use client';",
    },
  },
]);