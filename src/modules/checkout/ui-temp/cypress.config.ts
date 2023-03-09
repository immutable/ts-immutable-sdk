import { defineConfig } from 'cypress'
import webpackConfig from './webpack.config';

export default defineConfig({
  component: {
    specPattern: './src/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: false,
    excludeSpecPattern: './dist/**/*',
    indexHtmlFile: './public/index.html',
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig,
    },
    env: {
      coverage: false,
    },
  },
  viewportWidth: 500,
  viewportHeight: 500,
  defaultCommandTimeout: 5000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  video: false,
});
