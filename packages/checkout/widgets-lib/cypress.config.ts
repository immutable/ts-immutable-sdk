import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    projectId: 'qtz3fu',
  },
});
