import { defineConfig, type Options } from "tsup";

// Peer dependencies that should never be bundled
const peerExternal = [
  "react",
  "next",
  "next-auth",
  "next/navigation",
  "next/headers",
  "next/server",
];

// Base configuration shared across all builds
const baseConfig: Options = {
  outDir: "dist/node",
  format: ["esm", "cjs"],
  target: "es2022",
  platform: "node",
  dts: false,
};

export default defineConfig([
  // Server entry point
  {
    ...baseConfig,
    entry: {
      "server/index": "src/server/index.ts",
    },
    external: peerExternal,
    clean: true,
  },
  // Main entry point
  {
    ...baseConfig,
    entry: {
      index: "src/index.ts",
    },
    external: peerExternal,
    clean: false,
  },
  // Client-side entry (needs 'use client' directive for Next.js)
  {
    ...baseConfig,
    entry: {
      "client/index": "src/client/index.ts",
    },
    external: peerExternal,
    clean: false,
    banner: {
      js: "'use client';",
    },
  },
]);

