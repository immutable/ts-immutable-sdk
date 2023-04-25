import { Environment, ImmutableConfiguration } from '@imtbl/config';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { Passport } from './Passport';
import { getStarkSigner } from './stark';
import { OidcConfiguration, User } from './types';
import registerPassport from './workflows/registration';

jest.mock('./authManager');
jest.mock('./magicAdapter');
jest.mock('./stark/getStarkSigner');
jest.mock('./imxProvider/passportImxProvider');
jest.mock('./workflows/registration');

const oidcConfiguration: OidcConfiguration = {
  clientId: '11111',
  redirectUri: 'https://test.com',
  logoutRedirectUri: 'https://test.com',
};

const mockUser: User = {
  idToken: 'id123',
  accessToken: 'access123',
  refreshToken: 'refresh123',
  profile: {
    sub: 'email|123',
    email: 'test@immutable.com',
    nickname: 'test',
  },
  etherKey: '123',
};

describe('Passport', () => {
  afterEach(jest.resetAllMocks);

  let passport: Passport;
  let authLoginMock: jest.Mock;
  let loginCallbackMock: jest.Mock;
  let logoutMock: jest.Mock;
  let magicLoginMock: jest.Mock;
  let getUserMock: jest.Mock;
  let requestRefreshTokenMock: jest.Mock;

  beforeEach(() => {
    authLoginMock = jest.fn().mockReturnValue({
      idToken: '123',
      etherKey: '0x123',
    });
    loginCallbackMock = jest.fn();
    magicLoginMock = jest.fn();
    logoutMock = jest.fn();
    getUserMock = jest.fn();
    requestRefreshTokenMock = jest.fn();
    (AuthManager as jest.Mock).mockReturnValue({
      login: authLoginMock,
      loginCallback: loginCallbackMock,
      logout: logoutMock,
      getUser: getUserMock,
      requestRefreshTokenAfterRegistration: requestRefreshTokenMock,
    });
    (MagicAdapter as jest.Mock).mockReturnValue({
      login: magicLoginMock,
    });
    passport = new Passport({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      ...oidcConfiguration,
    });
  });

  describe('connectImx', () => {
    it('should execute connect without error', async () => {
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      requestRefreshTokenMock.mockResolvedValue({
        accessToken: '123',
        etherKey: '0x232',
      });
      await passport.connectImx();

      expect(authLoginMock).toBeCalledTimes(1);
      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
    }, 15000);

    it('should execute connect without login if user have logged in', async () => {
      getUserMock.mockReturnValue({ ...mockUser, expired: false });
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      requestRefreshTokenMock.mockResolvedValue({
        accessToken: '123',
        etherKey: '0x232',
      });
      const provider = await passport.connectImx();

      expect(authLoginMock).toBeCalledTimes(0);
      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
    });

    it('should register user with refresh error', async () => {
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      requestRefreshTokenMock.mockResolvedValue(null);
      authLoginMock.mockResolvedValue({ idToken: '123' });

      await expect(passport.connectImx()).rejects.toThrow(
        'Failed to get refresh token'
      );

      expect(authLoginMock).toBeCalledTimes(1);
      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
      expect(registerPassport).toBeCalledTimes(1);
    });

    it('should register user successfully', async () => {
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      requestRefreshTokenMock.mockResolvedValue(mockUser);
      authLoginMock.mockResolvedValue({ idToken: '123' });

      await passport.connectImx();

      expect(authLoginMock).toBeCalledTimes(1);
      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
      expect(registerPassport).toBeCalledTimes(1);
    });
  });

  describe('reconnectImx', () => {
    it('should get imx provider is user existed and is not expired', async () => {
      getUserMock.mockReturnValue({ ...mockUser, expired: false });
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      requestRefreshTokenMock.mockResolvedValue({
        accessToken: '123',
        etherKey: '0x232',
      });
      await passport.reconnectImx();

      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
    });

    it('should return null if no existed user', async () => {
      getUserMock.mockReturnValue(null);
      const provider = await passport.reconnectImx();

      expect(magicLoginMock).toBeCalledTimes(0);
      expect(getStarkSigner).toBeCalledTimes(0);
      expect(provider).toBeNull();
    });

    it('should return null if user is expired', async () => {
      getUserMock.mockReturnValue({ ...mockUser, expired: true });
      const provider = await passport.reconnectImx();

      expect(magicLoginMock).toBeCalledTimes(0);
      expect(getStarkSigner).toBeCalledTimes(0);
      expect(provider).toBeNull();
    });

    it('should return null if user is no expired indicator', async () => {
      getUserMock.mockReturnValue(mockUser);
      const provider = await passport.reconnectImx();

      expect(magicLoginMock).toBeCalledTimes(0);
      expect(getStarkSigner).toBeCalledTimes(0);
      expect(provider).toBeNull();
    });
  });

  describe('loginCallback', () => {
    it('should execute login callback', async () => {
      await passport.loginCallback();

      expect(loginCallbackMock).toBeCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should execute logout without error', async () => {
      await passport.logout();

      expect(logoutMock).toBeCalledTimes(1);
    });
  });

  describe('getUserInfo', () => {
    it('should execute getUser', async () => {
      getUserMock.mockReturnValue(mockUser);

      const result = await passport.getUserInfo();

      expect(result).toEqual(mockUser.profile);
    });

    it('should return undefined if there is no user', async () => {
      getUserMock.mockReturnValue(null);

      const result = await passport.getUserInfo();

      expect(result).toEqual(undefined);
    });
  });

  describe('getIdToken', () => {
    it('should execute getIdToken', async () => {
      getUserMock.mockReturnValue(mockUser);

      const result = await passport.getIdToken();

      expect(result).toEqual(mockUser.idToken);
    });

    it('should return undefined if there is no user', async () => {
      getUserMock.mockReturnValue(null);

      const result = await passport.getIdToken();

      expect(result).toEqual(undefined);
    });
  });

  describe('getAccessToken', () => {
    it('should execute getAccessToken', async () => {
      getUserMock.mockReturnValue(mockUser);

      const result = await passport.getAccessToken();

      expect(result).toEqual(mockUser.accessToken);
    });

    it('should return undefined if there is no user', async () => {
      getUserMock.mockReturnValue(null);

      const result = await passport.getAccessToken();

      expect(result).toEqual(undefined);
    });
  });
});
