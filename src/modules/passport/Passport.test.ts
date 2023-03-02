import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { PassportConfig, Passport } from './Passport';
import { PassportError, PassportErrorType } from './errors/passportError';
import { getStarkSigner } from './stark';
import { User } from './types';

jest.mock('./authManager');
jest.mock('./magicAdapter');
jest.mock('./stark/getStarkSigner');

const config = { clientId: '11111', redirectUri: 'http://test.com' };

describe('Passport', () => {
  afterEach(jest.resetAllMocks);

  let passport: Passport;
  let authLoginMock: jest.Mock;
  let loginCallbackMock: jest.Mock;
  let magicLoginMock: jest.Mock;
  let getUserMock: jest.Mock;

  beforeEach(() => {
    authLoginMock = jest.fn().mockReturnValue({
      idToken: '123',
    });
    loginCallbackMock = jest.fn();
    magicLoginMock = jest.fn();
    getUserMock = jest.fn();
    (AuthManager as jest.Mock).mockReturnValue({
      login: authLoginMock,
      loginCallback: loginCallbackMock,
      getUser: getUserMock,
    });
    (MagicAdapter as jest.Mock).mockReturnValue({
      login: magicLoginMock,
    });
    passport = new Passport(config);
  });

  describe('new Passport', () => {
    it('should throw passport error if missing the required configuration', () => {
      expect(() => new Passport({} as unknown as PassportConfig)).toThrowError(
        new PassportError(
          'clientId, redirectUri cannot be null',
          PassportErrorType.INVALID_CONFIGURATION
        )
      );
    });
  });

  describe('connectImx', () => {
    it('should execute connect without error', async () => {
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      await passport.connectImx();

      expect(authLoginMock).toBeCalledTimes(1);
      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
    });
  });

  describe('loginCallback', () => {
    it('should execute login callback', async () => {
      await passport.loginCallback();

      expect(loginCallbackMock).toBeCalledTimes(1);
    });
  });

  describe('getUserInfo', () => {
    it('should execute getUser', async () => {
      const userMock: User = {
        idToken: 'id123',
        refreshToken: 'refresh123',
        profile: {
          sub: 'email|123',
        },
      };
      getUserMock.mockReturnValue(userMock);

      const result = await passport.getUserInfo();

      expect(result).toEqual(userMock);
    });
  });
});
