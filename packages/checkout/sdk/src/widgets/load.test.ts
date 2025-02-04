/** @jest-environment jsdom */
import { SDK_VERSION_MARKER } from '../env';
import { getWidgetsEsmUrl, loadUnresolvedBundle } from './load';

describe('load', () => {
  const SDK_VERSION = SDK_VERSION_MARKER;
  const scriptId = 'immutable-checkout-widgets-bundle';

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  describe('load unresolved bundle', () => {
    it('should validate the versioning', () => {
      const tag = document.createElement('script');
      loadUnresolvedBundle(tag, scriptId, SDK_VERSION);
      expect(document.head.innerHTML).toBe(
        '<script id="immutable-checkout-widgets-bundle" '
        + 'data-version="__SDK_VERSION__" '
        // eslint-disable-next-line max-len
        + `src="https://cdn.jsdelivr.net/npm/@imtbl/checkout-widgets@${SDK_VERSION}/dist/browser/index.cdn.js"></script>`,
      );
    });
  });

  describe('get widgets esm url', () => {
    it('should validate the versioning', () => {
      expect(getWidgetsEsmUrl(SDK_VERSION)).toEqual(
        `https://cdn.jsdelivr.net/npm/@imtbl/checkout-widgets@${SDK_VERSION}/dist/browser/index.js`,
      );
    });

    it('should change version', () => {
      expect(getWidgetsEsmUrl('2.0.0')).toEqual(
        'https://cdn.jsdelivr.net/npm/@imtbl/checkout-widgets@2.0.0/dist/browser/index.js',
      );
    });
  });
});
