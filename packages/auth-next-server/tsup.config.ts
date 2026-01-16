import { defineConfig, type Options } from "tsup";

// Peer dependencies that should never be bundled
const peerExternal = [
  "next",
  "next-auth",
  "next/navigation",
  "next/headers",
  "next/server",
];

const baseConfig: Options = {
  outDir: "dist/node",
  format: ["esm", "cjs"],
  target: "es2022",
  platform: "node",
  dts: false,
};

export default defineConfig([
  {
    ...baseConfig,
    entry: {
      index: "src/index.ts",
    },
    external: peerExternal,
    clean: true,
  },
]);
