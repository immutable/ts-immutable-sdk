import { defineConfig, type Options } from "tsup";

// Base configuration shared across all builds
const baseConfig: Options = {
  outDir: "dist/node",
  format: ["esm", "cjs"],
  target: "es2022",
  platform: "node",
  dts: false,
  external: ["react", "next", "next-auth", "next/navigation", "next/headers"],
};

export default defineConfig([
  // Server-side entries (no 'use client' directive)
  {
    ...baseConfig,
    entry: {
      index: "src/index.ts",
      "server/index": "src/server/index.ts",
    },
    clean: true,
  },
  // Client-side entry (needs 'use client' directive for Next.js)
  {
    ...baseConfig,
    entry: {
      "client/index": "src/client/index.ts",
    },
    clean: false, // Don't clean since server build runs first
    banner: {
      js: "'use client';",
    },
  },
]);

