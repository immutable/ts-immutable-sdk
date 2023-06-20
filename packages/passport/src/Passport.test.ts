import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ImmutableXClient } from '@imtbl/immutablex-client';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { Passport } from './Passport';
import { PassportImxProvider, PassportImxProviderFactory } from './starkEx';
import { Networks, OidcConfiguration, User } from './types';

jest.mock('./authManager');
jest.mock('./magicAdapter');
jest.mock('./starkEx');

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
  let getPassportImxProviderMock: jest.Mock;

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
    getPassportImxProviderMock = jest.fn();
    (AuthManager as unknown as jest.Mock).mockReturnValue({
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
    (PassportImxProviderFactory as jest.Mock).mockReturnValue({
      getPassportImxProvider: getPassportImxProviderMock,
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
        const passportInstance = new Passport({
          baseConfig,
          overrides: {
            authenticationDomain: 'authenticationDomain123',
            imxPublicApiDomain: 'guardianDomain123',
            magicProviderId: 'providerId123',
            magicPublishableApiKey: 'publishableKey123',
            network: Networks.SANDBOX,
            passportDomain: 'customDomain123',
            immutableXClient,
          },
          ...oidcConfiguration,
        });
        // @ts-ignore
        expect(passportInstance.immutableXClient).toEqual(immutableXClient);
      });
    });
  });

  describe('connectImx', () => {
    it('should execute connect without error', async () => {
      const passportImxProvider = {} as PassportImxProvider;
      getPassportImxProviderMock.mockResolvedValue(passportImxProvider);

      const result = await passport.connectImx();

      expect(result).toBe(passportImxProvider);
      expect(getPassportImxProviderMock).toHaveBeenCalledWith();
    });
  });

  describe('connectImxSilent', () => {
    describe('when getPassportImxProvider returns null', () => {
      it('returns null', async () => {
        getPassportImxProviderMock.mockResolvedValue(null);

        const result = await passport.connectImxSilent();

        expect(result).toBe(null);
        expect(getPassportImxProviderMock).toHaveBeenCalledWith(true);
      });
    });
    describe('when getPassportImxProvider returns a provider', () => {
      it('should return the provider', async () => {
        const passportImxProvider = {} as PassportImxProvider;
        getPassportImxProviderMock.mockResolvedValue(passportImxProvider);

        const result = await passport.connectImxSilent();

        expect(result).toBe(passportImxProvider);
        expect(getPassportImxProviderMock).toHaveBeenCalledWith(true);
      });
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
