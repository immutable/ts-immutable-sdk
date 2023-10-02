import axios from 'axios';
import { sdkVersionCheck, gameBridgeVersionCheck } from './versionCheck';

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

describe('gameBridgeVersionCheck', () => {
  test('should send request to analytics API with the correct query parametrs', () => {
    const gameBridgeParams = {
      gameBridgeTag: '1.0.0',
      gameBridgeSha: '1234567890',
      engine: 'unity',
      engineVersion: '1.0.0',
      platform: 'ios',
      platformVersion: '1.0.0',
    };
    // eslint-disable-next-line max-len
    const expectedUrl = 'https://api.x.immutable.com/v1/check?version=imtbl-sdk-gamebridge-1.0.0,imtbl-sdk-gamebridge-sha-1234567890,engine-unity-1.0.0,platform-ios-1.0.0';

    gameBridgeVersionCheck(gameBridgeParams);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining((expectedUrl)));
  });

  test('should send default (SDK version, details) parameter if params object is empty', () => {
    // __SDK_VERSION__ is replaced by the SDK version during build
    const expectedParams = '?version=imtbl-sdk-__SDK_VERSION__&details=';

    gameBridgeVersionCheck({});

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining((expectedParams)));
  });

  test('should send version info if engine is missing', () => {
    const gameBridgeParams = {
      gameBridgeTag: '1.0.0',
      gameBridgeSha: '1234567890',
      engineVersion: '1.0.0',
      platform: 'ios',
      platformVersion: '1.0.0',
    };
    // details should always go last after the game bridge version params
    // eslint-disable-next-line max-len
    const expectedUrl = 'https://api.x.immutable.com/v1/check?version=imtbl-sdk-gamebridge-1.0.0,imtbl-sdk-gamebridge-sha-1234567890,platform-ios-1.0.0&details=';

    gameBridgeVersionCheck(gameBridgeParams);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining((expectedUrl)));
  });

  test('should send version info if engine version is missing', () => {
    const gameBridgeParams = {
      gameBridgeTag: '1.0.0',
      gameBridgeSha: '1234567890',
      engine: 'unity',
      platform: 'ios',
      platformVersion: '1.0.0',
    };
    // details should always go last after the game bridge version params
    // eslint-disable-next-line max-len
    const expectedUrl = 'https://api.x.immutable.com/v1/check?version=imtbl-sdk-gamebridge-1.0.0,imtbl-sdk-gamebridge-sha-1234567890,platform-ios-1.0.0&details=';

    gameBridgeVersionCheck(gameBridgeParams);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining((expectedUrl)));
  });

  test('should send version info if platform is missing', () => {
    const gameBridgeParams = {
      gameBridgeTag: '1.0.0',
      gameBridgeSha: '1234567890',
      engine: 'unity',
      engineVersion: '1.0.0',
      platformVersion: '1.0.0',
    };
    // details should always go last after the game bridge version params
    // eslint-disable-next-line max-len
    const expectedUrl = 'https://api.x.immutable.com/v1/check?version=imtbl-sdk-gamebridge-1.0.0,imtbl-sdk-gamebridge-sha-1234567890,engine-unity-1.0.0&details=';

    gameBridgeVersionCheck(gameBridgeParams);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining((expectedUrl)));
  });

  test('should send version info if platform version is missing', () => {
    const gameBridgeParams = {
      gameBridgeTag: '1.0.0',
      gameBridgeSha: '1234567890',
      engine: 'unity',
      engineVersion: '1.0.0',
      platform: 'ios',
    };
    // details should always go last after the game bridge version params
    // eslint-disable-next-line max-len
    const expectedUrl = 'https://api.x.immutable.com/v1/check?version=imtbl-sdk-gamebridge-1.0.0,imtbl-sdk-gamebridge-sha-1234567890,engine-unity-1.0.0&details=';

    gameBridgeVersionCheck(gameBridgeParams);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining((expectedUrl)));
  });

  test('should encode query parameters', () => {
    const gameBridgeParams = {
      gameBridgeTag: '0.22.0',
      gameBridgeSha: '1234567890',
      engine: 'unreal',
      engineVersion: '5.2.1-26001984+++UE5+Release-5.2',
      platform: 'Mac',
      platformVersion: '13.5.2',
    };

    // eslint-disable-next-line max-len
    const expectedUrl = 'https://api.x.immutable.com/v1/check?version=imtbl-sdk-gamebridge-0.22.0,imtbl-sdk-gamebridge-sha-1234567890,engine-unreal-5.2.1-26001984%2B%2B%2BUE5%2BRelease-5.2,platform-Mac-13.5.2&details=';

    gameBridgeVersionCheck(gameBridgeParams);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining((expectedUrl)));
  });
});
