/** @jest-environment jsdom */
import { SDK_VERSION_MARKER } from '../env';
import { getWidgetsEsmUrl, loadUnresolvedBundle } from './load';

const SDK_VERSION = SDK_VERSION_MARKER;

jest.mock('./hashUtils', () => ({
  generateSHA512Hash: jest.fn(async () => 'sha512-abc123'),
  // eslint-disable-next-line max-len
  validatedHashesUrl: jest.fn(async () => `https://raw.githubusercontent.com/immutable/ts-immutable-sdk/refs/tags/${SDK_VERSION}/packages/checkout/widgets-lib/hashes.json`),
}));

describe('load', () => {
  const scriptId = 'immutable-checkout-widgets-bundle';

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  describe('load unresolved bundle', () => {
    it('should validate the versioning', async () => {
      const tag = document.createElement('script');
      await loadUnresolvedBundle(tag, scriptId, SDK_VERSION);

      expect(document.head.innerHTML).toBe(
        '<script '
        + 'integrity="sha512-abc123" '
        + 'crossorigin="anonymous" '
        + 'id="immutable-checkout-widgets-bundle" '
        + 'data-version="__SDK_VERSION__" '
        + `src="https://cdn.jsdelivr.net/npm/@imtbl/sdk@${SDK_VERSION}/dist/browser/checkout/widgets.js"></script>`,
      );
    });
  });

  describe('get widgets esm url', () => {
    beforeEach(() => {
      // @ts-expect-error mocking only json value of fetch response
      global.fetch = jest.fn(async () => ({
        json: async () => ({ 'dist/index.js': 'sha512-abc123' }),
      }));
    });

    it('should validate the versioning', async () => {
      const widgetsEsmUrl = await getWidgetsEsmUrl(SDK_VERSION);
      expect(widgetsEsmUrl).toEqual(
        `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${SDK_VERSION}/dist/browser/checkout/widgets-esm.js`,
      );
    });

    it('should change version', async () => {
      const widgetsEsmUrl = await getWidgetsEsmUrl('1.2.3');
      expect(widgetsEsmUrl).toEqual(
        'https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.2.3/dist/browser/checkout/widgets-esm.js',
      );
    });
  });
});
