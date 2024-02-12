/** @jest-environment jsdom */
import { SDK_VERSION_MARKER } from '../env';
import { loadUnresolved } from './load';

describe('load', () => {
  const SDK_VERSION = SDK_VERSION_MARKER;

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Config', () => {
    it('should validate the versioning', () => {
      loadUnresolved();
      expect(document.head.innerHTML).toBe(
        '<script id="immutable-checkout-widgets-bundle" '
        + 'data-version="__SDK_VERSION__" '
        + `src="https://cdn.jsdelivr.net/npm/@imtbl/sdk@${SDK_VERSION}/dist/browser/checkout/widgets.js"></script>`,
      );
    });

    it('should not re-add script', () => {
      loadUnresolved();
      loadUnresolved();
      loadUnresolved();
      expect(document.head.innerHTML).toBe(
        '<script id="immutable-checkout-widgets-bundle" '
        + 'data-version="__SDK_VERSION__" '
        + `src="https://cdn.jsdelivr.net/npm/@imtbl/sdk@${SDK_VERSION}/dist/browser/checkout/widgets.js"></script>`,
      );
    });

    it('should change version', () => {
      loadUnresolved();
      loadUnresolved({
        major: 1,
        minor: 2,
      });
      expect(document.head.innerHTML).toBe(
        '<script id="immutable-checkout-widgets-bundle" '
        + 'data-version="__SDK_VERSION__" '
        + `src="https://cdn.jsdelivr.net/npm/@imtbl/sdk@${SDK_VERSION}/dist/browser/checkout/widgets.js"></script>`,
      );
    });
  });
});
