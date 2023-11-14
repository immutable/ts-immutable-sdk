import { SDK_VERSION_MARKER } from '../env';
import { SemanticVersion } from './definitions/types';
import { validateAndBuildVersion } from './version';

describe('CheckoutWidgets', () => {
  const SDK_VERSION = SDK_VERSION_MARKER;

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

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
        title: 'undefined minor should return major version',
        version: {
          major: 1,
          minor: undefined,
          patch: 1,
          prerelease: 'alpha',
        },
        expectedVersion: '1',
      },
      {
        title: 'undefined patch should return major.minor version',
        version: {
          major: 1,
          minor: 1,
          patch: undefined,
          prerelease: 'alpha',
        },
        expectedVersion: '1.1',
      },
      {
        title: 'undefined patch with zero minor should return major.minor version',
        version: {
          major: 1,
          minor: 0,
          patch: undefined,
          prerelease: 'alpha',
        },
        expectedVersion: '1.0',
      },
      {
        title: 'Minor and patch zero values should return in version number',
        version: {
          major: 1,
          minor: 0,
          patch: 0,
          prerelease: undefined,
        },
        expectedVersion: '1.0.0',
      },
      {
        title: 'non-alpha prerelease should return major.minor.patch version',
        version: {
          major: 1,
          minor: 0,
          patch: 0,
          prerelease: 'test' as 'alpha',
        },
        expectedVersion: '1.0.0',
      },
      {
        title: 'undefined prerelease should return major.minor.patch version',
        version: {
          major: 1,
          minor: 1,
          patch: 1,
          prerelease: undefined,
        },
        expectedVersion: '1.1.1',
      },
      {
        title: 'zero major version and rest are all undefined should return default version',
        version: {
          major: 0,
          minor: undefined,
          patch: undefined,
          prerelease: undefined,
        },
        expectedVersion: SDK_VERSION,
      },
      {
        title: 'major and minor as zeros and patch undefined should return default version',
        version: {
          major: 0,
          minor: 0,
          patch: undefined,
          prerelease: undefined,
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
        title: 'invalid prerelease should return major.minor.patch version',
        version: {
          major: 0,
          minor: 1,
          patch: 0,
          prerelease: 'test' as 'alpha',
        },
        expectedVersion: '0.1.0',
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
  });
});
