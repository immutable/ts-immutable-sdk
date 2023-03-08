import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { Passport } from './Passport';
import { getStarkSigner } from './stark';
import { User } from './types';
import { PassportConfiguration, ValidateConfig } from './config';

jest.mock('./authManager');
jest.mock('./magicAdapter');
jest.mock('./stark/getStarkSigner');
jest.mock('./config')

const config: PassportConfiguration = {
  oidcConfiguration: {
    clientId: '11111',
    redirectUri: 'https://test.com',
  },
} as PassportConfiguration;

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
    it('should validate the config', () => {
      const config = {} as unknown as PassportConfiguration;
      new Passport(config);
      expect(ValidateConfig).toHaveBeenCalledWith(config)
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
        accessToken: 'access123',
        profile: {
          sub: 'email|123',
        },
      };
      getUserMock.mockReturnValue(userMock);

      const result = await passport.getUserInfo();

      expect(result).toEqual(userMock.profile);
    });
  });

  describe('getIdToken', () => {
    it('should execute getIdToken', async () => {
      const userMock: User = {
        idToken: 'id123',
        refreshToken: 'refresh123',
        accessToken: 'access123',
        profile: {
          sub: 'email|123',
        },
      };
      getUserMock.mockReturnValue(userMock);

      const result = await passport.getIdToken();

      expect(result).toEqual(userMock.idToken);
    });
  });
});
