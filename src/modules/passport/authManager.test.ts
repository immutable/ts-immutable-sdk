import AuthManager from './authManager';
import { User, UserManager } from 'oidc-client-ts';

jest.mock('oidc-client-ts');

const authConfig = { clientId: '11111', redirectUri: 'http://test.com' };
const mockUser: User = {
  access_token: 'xxxxx',
  token_type: 'Bearer',
  scope: 'openid',
  expires_in: 167222,
} as User;

describe('AuthManager', () => {
  afterEach(jest.resetAllMocks);

  let authManager: AuthManager;
  let signInMock: jest.Mock;
  let signinPopupCallbackMock: jest.Mock;
  let signinSilentMock: jest.Mock;

  beforeEach(() => {
    signInMock = jest.fn();
    signinPopupCallbackMock = jest.fn();
    signinSilentMock = jest.fn();
    (UserManager as jest.Mock).mockReturnValue({
      signinPopup: signInMock,
      signinPopupCallback: signinPopupCallbackMock,
      signinSilent: signinSilentMock,
    });
    authManager = new AuthManager(authConfig);
  });

  it('should get the login user', async () => {
    signInMock.mockResolvedValue(mockUser);
    const user = await authManager.login();

    expect(user).toEqual(mockUser);
  });

  it('should throw the error if user is failed to login', async () => {
    signInMock.mockRejectedValue(new Error('NONO'));

    await expect(authManager.login()).rejects.toThrow();
  });

  it('should call login callback', async () => {
    await authManager.loginCallback();

    expect(signinPopupCallbackMock).toBeCalled();
  });

  it('should call refresh token', async () => {
    await authManager.refreshToken();

    expect(signinSilentMock).toBeCalled();
  });
});
