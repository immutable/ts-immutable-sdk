import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "client/index": "src/client/index.ts",
    "server/index": "src/server/index.ts",
  },
  outDir: "dist/node",
  format: ["esm", "cjs"],
  target: "es2022",
  platform: "node",
  dts: false,
  clean: true,
  external: ["react", "next", "next-auth", "next/navigation", "next/headers"],
});

