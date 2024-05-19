import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    nodePolyfills({
      globals: {
        Buffer: false,
      },
    }),
  ],
  server: {
    port: 5174,
  },
  define: {
    "process.env": {},
    "process.version": '""',
    global: {},
  },
  resolve: {
    alias: {
      jsbi: path.resolve(__dirname, "./node_modules/jsbi"),
    },
  },
});
