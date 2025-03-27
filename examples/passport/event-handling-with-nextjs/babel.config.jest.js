module.exports = {
  presets: ['next/babel'],
  plugins: [
    ['istanbul', {
      include: ['src/app/event-handling/**/*.{ts,tsx}'],
      exclude: ['node_modules/**', '.next/**', '**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'],
      useInlineSourceMaps: true,
    }],
  ],
}; 