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
        + `src="https://cdn.jsdelivr.net/npm/@imtbl/checkout-widgets@${SDK_VERSION}/dist/widgets.js"></script>`,
      );
    });
  });

  describe('get widgets esm url', () => {
    it('should validate the versioning', () => {
      expect(getWidgetsEsmUrl(SDK_VERSION)).toEqual(
        `https://cdn.jsdelivr.net/npm/@imtbl/checkout-widgets@${SDK_VERSION}/dist/index.js`,
      );
    });

    it('should change version', () => {
      expect(getWidgetsEsmUrl('1.2.3')).toEqual(
        'https://cdn.jsdelivr.net/npm/@imtbl/checkout-widgets@1.2.3/dist/index.js',
      );
    });
  });
});
