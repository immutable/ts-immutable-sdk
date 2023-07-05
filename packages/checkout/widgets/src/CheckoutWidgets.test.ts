import { CheckoutWidgets, validateAndBuildVersion } from './CheckoutWidgets';
import { SemanticVersion } from './definitions/config';
import { SDK_VERSION_MARKER } from './lib/env';

describe('CheckoutWidgets', () => {
  const SDK_VERSION = SDK_VERSION_MARKER;

  /**
   * This versioning is currently tied to our current release process of the unified SDK
   */
  describe('Versioning', () => {
    const versionTestCases:
    {
      title: string,
      version: SemanticVersion | undefined,
      expectedVersion: string,
    }[] = [
      {
        title: 'missing version object should return default version',
        version: undefined,
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'all zero versions should return default version',
        version: {
          major: 0,
          minor: 0,
          patch: 0,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'append -alpha to valid versions',
        version: {
          major: 0,
          minor: 1,
          patch: 0,
          prerelease: 'alpha',
        },
        expectedVersion: '0.1.0-alpha',
      },
      {
        title: 'append -alpha to valid versions and add build number',
        version: {
          major: 0,
          minor: 1,
          patch: 8,
          prerelease: 'alpha',
          build: 1,
        },
        expectedVersion: '0.1.8-alpha.1',
      },
      {
        title: 'negative major returns default version',
        version: {
          major: -1,
          minor: 1,
          patch: 1,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'negative minor returns default version',
        version: {
          major: 1,
          minor: -1,
          patch: 1,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'negative patch returns default version',
        version: {
          major: 1,
          minor: 1,
          patch: -1,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
    ];

    versionTestCases.forEach((testCase) => {
      it(`should validate the correct versioning for ${testCase.title}`, () => {
        const validVersion = validateAndBuildVersion(testCase.version);
        expect(validVersion).toEqual(testCase.expectedVersion);
      });
    });

    it('should validate the correct versioning when using CheckoutWidgets', () => {
      CheckoutWidgets();
      expect(document.head.innerHTML).toBe(
        `<script src="https://cdn.jsdelivr.net/npm/@imtbl/sdk@${
          SDK_VERSION
        }/dist/browser/checkout.js"></script>`,
      );
    });
  });
});
