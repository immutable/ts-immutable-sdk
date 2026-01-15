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

// Browser-only packages that must NOT be bundled into server/Edge Runtime code
// These packages access browser APIs (navigator, window) at module load time
const browserOnlyPackages = [
  "@imtbl/auth",
  "@imtbl/metrics",
  "oidc-client-ts",
  "localforage",
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
  // Server-only entry - MUST NOT bundle @imtbl/auth or its dependencies
  // This is used in Next.js middleware (Edge Runtime) where browser APIs don't exist
  {
    ...baseConfig,
    entry: {
      "server/index": "src/server/index.ts",
    },
    external: [...peerExternal, ...browserOnlyPackages],
    clean: true,
  },
  // Main entry point - can bundle @imtbl/auth for client-side type re-exports
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

