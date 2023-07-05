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
        title: 'undefined major should return default version',
        version: {
          major: undefined as unknown as number,
          minor: 1,
          patch: 1,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'undefined minor should return default version',
        version: {
          major: 1,
          minor: undefined as unknown as number,
          patch: 1,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'undefined patch should return default version',
        version: {
          major: 1,
          minor: 1,
          patch: undefined as unknown as number,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'undefined prerelease should return default version',
        version: {
          major: 1,
          minor: 1,
          patch: 1,
          prerelease: undefined as unknown as 'alpha',
        },
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
        title: 'invalid prerelease should return default version',
        version: {
          major: 0,
          minor: 1,
          patch: 0,
          prerelease: 'test' as 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'provided prerelease should be appended to version',
        version: {
          major: 0,
          minor: 1,
          patch: 0,
          prerelease: 'alpha',
        },
        expectedVersion: '0.1.0-alpha',
      },
      {
        title: 'provided build number should be appended to version',
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
        title: 'negative major should return default version',
        version: {
          major: -1,
          minor: 1,
          patch: 1,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'negative minor should return default version',
        version: {
          major: 1,
          minor: -1,
          patch: 1,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'negative patch should return default version',
        version: {
          major: 1,
          minor: 1,
          patch: -1,
          prerelease: 'alpha',
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'negative build should not be appended',
        version: {
          major: 1,
          minor: 1,
          patch: 1,
          prerelease: 'alpha',
          build: -1,
        },
        expectedVersion: '1.1.1-alpha',
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
