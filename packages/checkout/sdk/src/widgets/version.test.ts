import { SDK_VERSION_MARKER } from '../env';
import { CheckoutVersionConfig } from '../types';
import { SemanticVersion } from './definitions/types';
import { determineWidgetsVersion, validateAndBuildVersion } from './version';

describe('CheckoutWidgets', () => {
  const SDK_VERSION = SDK_VERSION_MARKER;

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  describe('Version Validation', () => {
    const versionTestCases: {
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

  describe('Determine Widget Version', () => {
    const determineWidgetVersionTestCases: {
      title: string,
      expectedVersion: string,
      validatedBuildVersion: string,
      initVersionProvided: boolean,
      checkoutVersionConfig?: CheckoutVersionConfig,
    }[] = [
      {
        title: 'version is provided in widget init params',
        expectedVersion: '1.0.0',
        validatedBuildVersion: '1.0.0',
        checkoutVersionConfig: undefined,
        initVersionProvided: true,
      },
      {
        title: 'version is provided in widget init params and compatibleVersionMarkers are available',
        expectedVersion: '1.0.0',
        validatedBuildVersion: '1.0.0',
        initVersionProvided: true,
        checkoutVersionConfig: { compatibleVersionMarkers: ['2.0.0', '1.0.0'] },
      },
      {
        title: 'there is a matching compatible version marker',
        expectedVersion: '1.1.1',
        validatedBuildVersion: '1.0.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.1'] },
      },
      {
        title: 'there is a matching compatible version marker',
        expectedVersion: '1.1.1',
        validatedBuildVersion: '1.0.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.1', '2.0.0'] },
      },
      {
        title: 'there is a matching compatible version marker',
        expectedVersion: '1.1.1',
        validatedBuildVersion: '1.1.1',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.1', '2.0.0'] },
      },
      {
        title: 'there is a matching compatible version marker',
        expectedVersion: '2.0.0',
        validatedBuildVersion: '1.2.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.1', '2.0.0'] },
      },
      {
        title: 'there is no matching compatible version marker, returning latest',
        expectedVersion: 'latest',
        validatedBuildVersion: '1.0.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: [] },
      },
      {
        title: 'there is no matching compatible version marker, returning latest',
        expectedVersion: 'latest',
        validatedBuildVersion: '1.2.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.0'] },
      },
      {
        title: 'all compatible version markers are invalid',
        expectedVersion: 'latest',
        validatedBuildVersion: '1.2.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['invalid', 'invalid'] },
      },
      {
        title: 'there are invalid compatible version markers',
        expectedVersion: 'latest',
        validatedBuildVersion: '1.2.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.0', 'invalid'] },
      },
      {
        title: 'there are invalid compatible version markers',
        expectedVersion: '1.1.0',
        validatedBuildVersion: '1.0.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.0', 'invalid'] },
      },
      {
        title: 'there are invalid compatible version markers',
        expectedVersion: '2.0.0',
        validatedBuildVersion: '1.51.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.0', 'invalid', '2.0.0'] },
      },
      {
        title: 'there are invalid compatible version markers',
        expectedVersion: 'latest',
        validatedBuildVersion: '2.1.0',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['1.1.0', 'invalid', '2.0.0'] },
      },
      {
        title: 'the build version is an alpha',
        expectedVersion: '1.2.0-alpha',
        validatedBuildVersion: '1.2.0-alpha',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: ['2.0.0'] },
      },
      {
        title: 'the build version is an alpha',
        expectedVersion: '1.2.0-alpha',
        validatedBuildVersion: '1.2.0-alpha',
        initVersionProvided: false,
        checkoutVersionConfig: { compatibleVersionMarkers: [] },
      },
      {
        title: 'no version config provided',
        expectedVersion: 'latest',
        validatedBuildVersion: '1.2.0',
        initVersionProvided: false,
        checkoutVersionConfig: undefined,
      },
    ];

    determineWidgetVersionTestCases.forEach((testCase) => {
      it(`should determine correct widget version when ${testCase.title}`, () => {
        const widgetVersion = determineWidgetsVersion(
          testCase.validatedBuildVersion,
          testCase.initVersionProvided,
          testCase?.checkoutVersionConfig,
        );
        expect(widgetVersion).toEqual(testCase.expectedVersion);
      });
    });
  });
});
