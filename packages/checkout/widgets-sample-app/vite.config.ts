import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': {},
    'global': {}
  },
  plugins: [
    nodePolyfills({
      include: ['assert', 'events', 'buffer', 'crypto', 'https', 'os', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    react()
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'jsbi': path.resolve(__dirname, './node_modules/jsbi'),
    },
    conditions: ["default"]
  }
})
