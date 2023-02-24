import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { PassportConfig, PassportSDK } from './PassportSDK';
import { PassportError, PassportErrorType } from './errors/passportError';

jest.mock('./authManager');
jest.mock('./magicAdapter');

const config = { clientId: '11111', redirectUri: 'http://test.com' };

describe('PassportSDK', () => {
  afterEach(jest.resetAllMocks);

  let passportSDK: PassportSDK;
  let authLoginMock: jest.Mock;
  let loginCallbackMock: jest.Mock;
  let magicLoginMock: jest.Mock;

  beforeEach(() => {
    authLoginMock = jest.fn().mockReturnValue({
      id_token: '123',
    });
    loginCallbackMock = jest.fn();
    magicLoginMock = jest.fn();
    (AuthManager as jest.Mock).mockReturnValue({
      login: authLoginMock,
      loginCallback: loginCallbackMock,
    });
    (MagicAdapter as jest.Mock).mockReturnValue({
      login: magicLoginMock,
    });
    passportSDK = new PassportSDK(config);
  });

  describe('new PassportSDK', () => {
    it('should throw passport error if missing the required configuration', () => {
      expect(() => new PassportSDK({} as unknown as PassportConfig)).toThrowError(
        new PassportError(
          'clientId, redirectUri cannot be null',
          PassportErrorType.INVALID_CONFIGURATION
        )
      );
    });
  });

  describe('connect', () => {
    it('should execute connect without error', async () => {
      await passportSDK.connect();

      expect(authLoginMock).toBeCalledTimes(1);
      expect(magicLoginMock).toBeCalledTimes(1);
    });
  });

  describe('loginCallback', () => {
    it('should execute login callback', async () => {
      await passportSDK.loginCallback();

      expect(loginCallbackMock).toBeCalledTimes(1);
    });
  });
});
