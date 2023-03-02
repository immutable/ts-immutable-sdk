import AuthManager from './authManager';
import { User as OidcUser, UserManager } from 'oidc-client-ts';
import { User } from "./types";
import {PassportError, PassportErrorType} from "./errors/passportError";

jest.mock('oidc-client-ts');

const authConfig = { clientId: '11111', redirectUri: 'http://test.com' };
const mockOidcUser: OidcUser = {
  id_token: 'id123',
  access_token: 'access123',
  refresh_token: 'refresh123',
  token_type: 'Bearer',
  scope: 'openid',
  expires_in: 167222,
  profile: {
    sub: 'email|123',
    email: 'test@immutable.com',
    nickname: 'test',
  },
} as OidcUser;
const mockUser: User = {
  idToken: 'id123',
  accessToken: 'access123',
  refreshToken: 'refresh123',
  profile: {
    sub: 'email|123',
    email: 'test@immutable.com',
    nickname: 'test',
  },
};

describe('AuthManager', () => {
  afterEach(jest.resetAllMocks);

  let authManager: AuthManager;
  let signInMock: jest.Mock;
  let signinPopupCallbackMock: jest.Mock;
  let getUserMock: jest.Mock;

  beforeEach(() => {
    signInMock = jest.fn();
    signinPopupCallbackMock = jest.fn();
    getUserMock = jest.fn();
    (UserManager as jest.Mock).mockReturnValue({
      signinPopup: signInMock,
      signinPopupCallback: signinPopupCallbackMock,
      getUser: getUserMock,
    });
    authManager = new AuthManager(authConfig);
  });

  describe('login', () => {
    it('should get the login user and return the domain model', async () => {
      signInMock.mockResolvedValue(mockOidcUser);

      const result = await authManager.login();

      expect(result).toEqual(mockUser);
    });

    it('should throw the error if user is failed to login', async () => {
      signInMock.mockRejectedValue(new Error('NONO'));

      await expect(() => authManager.login()).rejects.toThrow(
        new PassportError(
          'AUTHENTICATION_ERROR: NONO',
          PassportErrorType.AUTHENTICATION_ERROR,
        )
      );
    });
  });

  describe('loginCallback', () => {
    it('should call login callback', async () => {
      await authManager.loginCallback();

      expect(signinPopupCallbackMock).toBeCalled();
    });
  });

  describe('getUser', () => {
    it('should retrieve the user from the userManager and return the domain model', async () => {
      getUserMock.mockReturnValue(mockOidcUser);

      const result = await authManager.getUser();

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if no user is returned', async () => {
      getUserMock.mockReturnValue(null);

      await expect(() => authManager.getUser()).rejects.toThrow(
        new PassportError(
          'NOT_LOGGED_IN_ERROR: Failed to retrieve user',
          PassportErrorType.NOT_LOGGED_IN_ERROR,
        )
      );
    });
  });
});
