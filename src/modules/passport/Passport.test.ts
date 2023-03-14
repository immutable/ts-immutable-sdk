import axios from 'axios';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { Config } from './config';
import { Passport } from './Passport';
import { getStarkSigner } from './stark';
import { OidcConfiguration, User } from './types';
import registerPassport from './workflows/registration';

jest.mock('./authManager');
jest.mock('./magicAdapter');
jest.mock('./stark/getStarkSigner');
jest.mock('axios');
jest.mock('./imxProvider/passportImxProvider');
jest.mock('./workflows/registration');


const oidcConfiguration: OidcConfiguration = {
  clientId: '11111',
  redirectUri: 'https://test.com',
  logoutRedirectUri: 'https://test.com',
};

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Passport', () => {
  afterEach(jest.resetAllMocks);

  let passport: Passport;
  let authLoginMock: jest.Mock;
  let loginCallbackMock: jest.Mock;
  let magicLoginMock: jest.Mock;
  let getUserMock: jest.Mock;
  let refreshToken: jest.Mock;

  beforeEach(() => {
    authLoginMock = jest.fn().mockReturnValue({
      idToken: '123',
      etherKey: "0x123"
    });
    loginCallbackMock = jest.fn();
    magicLoginMock = jest.fn();
    getUserMock = jest.fn();
    refreshToken = jest.fn();
    (AuthManager as jest.Mock).mockReturnValue({
      login: authLoginMock,
      loginCallback: loginCallbackMock,
      getUser: getUserMock,
      requestRefreshTokenAfterRegistration: refreshToken,
    });
    (MagicAdapter as jest.Mock).mockReturnValue({
      login: magicLoginMock,
    });
    mockedAxios.get.mockResolvedValue({
      data: {
        passport: {
          ether_key: '0x232',
          stark_key: '0x567',
          user_admin_key: '0x123',
        }
      }
    });
    passport = new Passport(Config.SANDBOX, oidcConfiguration);
  });

  describe('connectImx', () => {
    it('should execute connect without error', async () => {
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      refreshToken.mockResolvedValue({ access_token: "123" });
      await passport.connectImx();

      expect(authLoginMock).toBeCalledTimes(1);
      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
    }, 15000);

    it('should register user with refresh error', async () => {
      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      refreshToken.mockRejectedValue("error");
      authLoginMock.mockResolvedValue({ idToken: '123' });

      await expect(passport.connectImx())
        .rejects
        .toThrow('error registering new passport user');

      expect(authLoginMock).toBeCalledTimes(1);
      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
      expect(registerPassport).toBeCalledTimes(1);
    });

    it('should register user successfully', async () => {
      const mockUser: User = {
        idToken: 'id123',
        accessToken: 'access123',
        refreshToken: 'refresh123',
        profile: {
          sub: 'email|123',
          email: 'test@immutable.com',
          nickname: 'test',
        },
        etherKey: "",
      };

      magicLoginMock.mockResolvedValue({ getSigner: jest.fn() });
      refreshToken.mockResolvedValue(mockUser);
      authLoginMock.mockResolvedValue({ idToken: '123' });

      await passport.connectImx();

      expect(authLoginMock).toBeCalledTimes(1);
      expect(magicLoginMock).toBeCalledTimes(1);
      expect(getStarkSigner).toBeCalledTimes(1);
      expect(registerPassport).toBeCalledTimes(1);
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
