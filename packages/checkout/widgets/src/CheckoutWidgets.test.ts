import { DEFAULT_CHECKOUT_VERSION, validateAndBuildVersion } from './CheckoutWidgets';
import { SemanticVersion } from './definitions/config';

describe('CheckoutWidgets', () => {
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
        expectedVersion: DEFAULT_CHECKOUT_VERSION,
      },
      {
        title: 'all zero versions should return default version',
        version: {
          major: 0,
          minor: 0,
          patch: 0,
        },
        expectedVersion: DEFAULT_CHECKOUT_VERSION,
      },
      {
        title: 'valid major, minor and patch',
        version: {
          major: 1,
          minor: 1,
          patch: 1,
        },
        expectedVersion: '1.1.1-alpha',
      },
      {
        title: 'valid major, minor and patch 2',
        version: {
          major: 0,
          minor: 1,
          patch: 9,
        },
        expectedVersion: '0.1.9-alpha',
      },
      {
        title: 'valid major, minor and patch 3',
        version: {
          major: 2,
          minor: 0,
          patch: 8,
        },
        expectedVersion: '2.0.8-alpha',
      },
      {
        title: 'revert to default version when major undefined',
        version: {
          major: undefined as unknown as number,
          minor: 2,
          patch: 8,
        },
        expectedVersion: DEFAULT_CHECKOUT_VERSION,
      },
      {
        title: 'set minor to 0 when patch added but minor undefined',
        version: {
          major: 2,
          patch: 8,
        },
        expectedVersion: '2.0.8-alpha',
      },
      {
        title: 'valid major, minor and patch 4',
        version: {
          major: 2,
          minor: 1,
          patch: 0,
        },
        expectedVersion: '2.1.0-alpha',
      },
      {
        title: 'append -alpha to valid versions',
        version: {
          major: 0,
          minor: 1,
          patch: 0,
        },
        expectedVersion: '0.1.0-alpha',
      },
      {
        title: 'append -alpha to valid versions and add build number',
        version: {
          major: 0,
          minor: 1,
          patch: 8,
          build: 1,
        },
        expectedVersion: '0.1.8-alpha.1',
      },
    ];

    versionTestCases.forEach((testCase) => {
      it(`should validate the correct versioning for ${testCase.title}`, () => {
        const validVersion = validateAndBuildVersion(testCase.version);
        expect(validVersion).toEqual(testCase.expectedVersion);
      });
    });
  });
});
