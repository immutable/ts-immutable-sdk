import axios from 'axios';
import { sdkVersionCheck } from './versionCheck';

jest.mock('axios');

beforeEach(() => {
  (axios.get as jest.Mock).mockResolvedValue({});
  // prevent console.log from logging to the terminal
  jest.spyOn(console, 'log').mockImplementation();
});

describe('sdkVersionCheck', () => {
  test('should now throw errors', () => {
    expect(() => sdkVersionCheck('test-package', '1.0.0')).not.toThrow();
    expect(() => sdkVersionCheck()).not.toThrow();
  });

  test('should send request to analytics API', () => {
    const defaultApi = 'https://api.x.immutable.com';
    const defaultVersionApi = '/v1/check';

    sdkVersionCheck();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(`${defaultApi}${defaultVersionApi}`));
  });

  test('should include SDK version', () => {
    const defaultApi = 'https://api.x.immutable.com';
    const defaultVersionApi = '/v1/check';
    const sdkVersion = '__SDK_VERSION__';
    const expectedUrl = `${defaultApi}${defaultVersionApi}`;
    const expectedQueryParams = `?version=imtbl-sdk-${sdkVersion}`;

    sdkVersionCheck();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(`${expectedUrl}${expectedQueryParams}`));
  });

  test('should send details query parameter', () => {
    sdkVersionCheck();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('&details='));
  });

  test('should not send id query parameters if runtimeId is not set', () => {
    sdkVersionCheck();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.not.stringContaining('&id='));
  });

  test('should send app name and version number', () => {
    const sdkVersion = '__SDK_VERSION__';
    const packageName = 'test-package';
    const packageVersion = '1.0.0';
    const expectedQueryParams = `?version=imtbl-sdk-${sdkVersion},${packageName}-${packageVersion}`;

    sdkVersionCheck(packageName, packageVersion);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(`${expectedQueryParams}`));
  });

  test('should encode query parameters', () => {
    const sdkVersion = '__SDK_VERSION__';
    const packageName = 'test-package';
    const packageVersion = '1.0.0++1';
    const expectedQueryParams = `?version=imtbl-sdk-${sdkVersion},${packageName}-1.0.0%2B%2B1`;

    sdkVersionCheck(packageName, packageVersion);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining((expectedQueryParams)));
  });
});
