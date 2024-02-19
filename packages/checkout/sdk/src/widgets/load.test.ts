/** @jest-environment jsdom */
import { SDK_VERSION_MARKER } from '../env';
import { getWidgetsEsmUrl, loadUnresolvedBundle } from './load';

describe('load', () => {
  const SDK_VERSION = SDK_VERSION_MARKER;
  const scriptId = 'immutable-checkout-widgets-bundle';

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('load unresolved bundle', () => {
    it('should validate the versioning', () => {
      const tag = document.createElement('script');
      loadUnresolvedBundle(tag, scriptId, SDK_VERSION);
      expect(document.head.innerHTML).toBe(
        '<script id="immutable-checkout-widgets-bundle" '
        + 'data-version="__SDK_VERSION__" '
        + `src="https://cdn.jsdelivr.net/npm/@imtbl/sdk@${SDK_VERSION}/dist/browser/checkout/widgets.js"></script>`,
      );
    });
  });

  describe('get widgets esm url', () => {
    it('should validate the versioning', () => {
      expect(getWidgetsEsmUrl()).toEqual(
        `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${SDK_VERSION}/dist/browser/checkout/widgets-esm.js`,
      );
    });

    it('should change version', () => {
      expect(getWidgetsEsmUrl({
        major: 1,
        minor: 2,
        patch: 3,
      })).toEqual(
        'https://cdn.jsdelivr.net/npm/@imtbl/sdk@1.2.3/dist/browser/checkout/widgets-esm.js',
      );
    });
  });
});
