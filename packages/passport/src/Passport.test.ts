import { Environment, ImmutableConfiguration } from '@imtbl/config';
// TODO: Remove this once the dependency has been fixed
// eslint-disable-next-line import/no-extraneous-dependencies
import { ImmutableXClient } from '@imtbl/immutablex-client';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { Passport } from './Passport';
import { getStarkSigner } from './stark';
import { Networks, OidcConfiguration, User } from './types';
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
  let loginSilentMock: jest.Mock;

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
    loginSilentMock = jest.fn();
    // TODO: Remove once fixed
    // @ts-ignore
    (AuthManager as jest.Mock).mockReturnValue({
      login: authLoginMock,
      loginCallback: loginCallbackMock,
      logout: logoutMock,
      getUser: getUserMock,
      loginSilent: loginSilentMock,
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

  describe('constructor', () => {
    describe('when modules have been overridden', () => {
      it('sets the private property to the overridden value', () => {
        const baseConfig = new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        });
        const immutableXClient = new ImmutableXClient({
          baseConfig,
        });
        // TODO: Remove this once the shadowing issue has been fixed
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const passport = new Passport({
          baseConfig,
          overrides: {
            authenticationDomain: 'authenticationDomain123',
            magicProviderId: 'providerId123',
            magicPublishableApiKey: 'publishableKey123',
            network: Networks.SANDBOX,
            passportDomain: 'customDomain123',
            immutableXClient,
          },
          ...oidcConfiguration,
        });
        // TODO: This is a private member
        // @ts-ignore
        expect(passport.immutableXClient).toEqual(immutableXClient);
      });
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

    it('should register user with refresh error', async () => {
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      requestRefreshTokenMock.mockResolvedValue(null);
      authLoginMock.mockResolvedValue({ idToken: '123' });

      await expect(passport.connectImx()).rejects.toThrow(
        'Failed to get refresh token',
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

  describe('connectImxSilent', () => {
    it('should get imx provider is user existed and is not expired', async () => {
      loginSilentMock.mockReturnValue(mockUser);
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      requestRefreshTokenMock.mockResolvedValue({
        accessToken: '123',
        etherKey: '0x232',
      });

      await passport.connectImxSilent();

      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
    });

    it('should return null if user failed to silent login', async () => {
      loginSilentMock.mockReturnValue(null);

      const provider = await passport.connectImxSilent();

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
