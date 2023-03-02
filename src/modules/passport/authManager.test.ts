import AuthManager from './authManager';
import { User as OidcUser, UserManager } from 'oidc-client-ts';

jest.mock('oidc-client-ts');

const authConfig = { clientId: '11111', redirectUri: 'http://test.com' };

describe('AuthManager', () => {
  afterEach(jest.resetAllMocks);

  let authManager: AuthManager;
  let signInMock: jest.Mock;
  let signinPopupCallbackMock: jest.Mock;

  beforeEach(() => {
    signInMock = jest.fn();
    signinPopupCallbackMock = jest.fn();
    (UserManager as jest.Mock).mockReturnValue({
      signinPopup: signInMock,
      signinPopupCallback: signinPopupCallbackMock,
    });
    authManager = new AuthManager(authConfig);
  });

  describe('login', () => {
    it('should get the login user and return the domain model', async () => {
      const mockUser: OidcUser = {
        id_token: 'abcd',
        access_token: 'xxxxx',
        token_type: 'Bearer',
        scope: 'openid',
        expires_in: 167222,
      } as OidcUser;
      signInMock.mockResolvedValue(mockUser);

      const user = await authManager.login();

      expect(user).toEqual({
        idToken: mockUser.id_token,
        accessToken: mockUser.access_token,
      });
    });

    it('should throw the error if user is failed to login', async () => {
      signInMock.mockRejectedValue(new Error('NONO'));

      await expect(authManager.login()).rejects.toThrow();
    });
  });

  describe('loginCallback', () => {
    it('should call login callback', async () => {
      await authManager.loginCallback();

      expect(signinPopupCallbackMock).toBeCalled();
    });
  });

  describe('getUser', () => {

  });
});
