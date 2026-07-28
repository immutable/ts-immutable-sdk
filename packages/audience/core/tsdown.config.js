import { createBrowserNodeConfig } from '../../../tsdown.base.ts';

export default createBrowserNodeConfig({
  entry: ['src/index.ts', 'src/internal.ts'],
});
