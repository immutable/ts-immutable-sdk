import { User as OidcUser, UserManager } from 'oidc-client-ts';
import AuthManager from './authManager';
import { PassportError, PassportErrorType } from './errors/passportError';
import { User } from './types';
import { PassportConfiguration } from './config';
import { MAX_RETRIES } from './util/retry';

jest.mock('oidc-client-ts');

const config: PassportConfiguration = {
  oidcConfiguration: {
    clientId: '11111',
    redirectUri: 'https://test.com',
    authenticationDomain: 'https://auth.dev.immutable.com',
  },
} as PassportConfiguration;

const passportData = {
  passport: {
    ether_key: '0x232',
    stark_key: '0x567',
    user_admin_key: '0x123',
  },
};
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

const mockOidcUserWithPassportInfo: OidcUser = {
  ...mockOidcUser,
  profile: { ...mockOidcUser.profile, ...passportData },
} as never;
const mockUser: User = {
  idToken: 'id123',
  accessToken: 'access123',
  refreshToken: 'refresh123',
  profile: {
    sub: 'email|123',
    email: 'test@immutable.com',
    nickname: 'test',
  },
  etherKey: '',
};
const mockErrorMsg = 'NONO';

describe('AuthManager', () => {
  afterEach(jest.resetAllMocks);

  let authManager: AuthManager;
  let signInMock: jest.Mock;
  let signinPopupCallbackMock: jest.Mock;
  let signoutRedirectMock: jest.Mock;
  let getUserMock: jest.Mock;
  let signinSilentMock: jest.Mock;

  beforeEach(() => {
    signInMock = jest.fn();
    signinPopupCallbackMock = jest.fn();
    signoutRedirectMock = jest.fn();
    getUserMock = jest.fn();
    signinSilentMock = jest.fn();
    (UserManager as jest.Mock).mockReturnValue({
      signinPopup: signInMock,
      signinPopupCallback: signinPopupCallbackMock,
      signoutRedirect: signoutRedirectMock,
      getUser: getUserMock,
      signinSilent: signinSilentMock,
    });
    authManager = new AuthManager(config);
  });

  describe('constructor', () => {
    it('should initial AuthManager the default configuration', () => {
      new AuthManager(config);
      expect(UserManager).toBeCalledWith({
        authority: config.oidcConfiguration.authenticationDomain,
        client_id: config.oidcConfiguration.clientId,
        loadUserInfo: true,
        mergeClaims: true,
        metadata: {
          authorization_endpoint: `${config.oidcConfiguration.authenticationDomain}/authorize`,
          token_endpoint: `${config.oidcConfiguration.authenticationDomain}/oauth/token`,
          userinfo_endpoint: `${config.oidcConfiguration.authenticationDomain}/userinfo`,
          end_session_endpoint:
            `${config.oidcConfiguration.authenticationDomain}/v2/logout` +
            `?returnTo=${encodeURIComponent(
              config.oidcConfiguration.logoutRedirectUri
            )}` +
            `&client_id=${config.oidcConfiguration.clientId}`,
        },
        popup_redirect_uri: config.oidcConfiguration.redirectUri,
        redirect_uri: config.oidcConfiguration.redirectUri,
      });
    });
  });

  describe('login', () => {
    it('should get the login user and return the domain model', async () => {
      signInMock.mockResolvedValue(mockOidcUser);

      const result = await authManager.login();

      expect(result).toEqual(mockUser);
    });

    it('should get the login user and return the user with ether key info', async () => {
      signInMock.mockResolvedValue(mockOidcUserWithPassportInfo);

      const result = await authManager.login();

      expect(result).toEqual({
        ...mockUser,
        etherKey: passportData.passport.ether_key,
      });
    });

    it('should throw the error if user is failed to login', async () => {
      signInMock.mockRejectedValue(new Error(mockErrorMsg));

      await expect(() => authManager.login()).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.AUTHENTICATION_ERROR}: ${mockErrorMsg}`,
          PassportErrorType.AUTHENTICATION_ERROR
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

  describe('logout', () => {
    it('should call logout ', async () => {
      await authManager.logout();

      expect(signoutRedirectMock).toBeCalled();
    });

    it('should throw the error if user is failed to logout', async () => {
      signoutRedirectMock.mockRejectedValue(new Error(mockErrorMsg));

      await expect(() => authManager.logout()).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.LOGOUT_ERROR}: ${mockErrorMsg}`,
          PassportErrorType.LOGOUT_ERROR
        )
      );
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
            PassportErrorType.NOT_LOGGED_IN_ERROR
          )
        );
      });
    });
    describe('requestRefreshTokenAfterRegistration', () => {
      it('requestRefreshTokenAfterRegistration successful with user wallet address in metadata', async () => {
        const expected = {
          ...mockUser,
          etherKey: passportData.passport.ether_key,
        };
        signinSilentMock.mockReturnValue(mockOidcUserWithPassportInfo);

        const res = await authManager.requestRefreshTokenAfterRegistration();

        expect(res).toEqual(expected);
        expect(signinSilentMock).toHaveBeenCalledTimes(1);
      });

      it('requestRefreshTokenAfterRegistration failed without user wallet address in metadata with retries', async () => {
        const response = {
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
        };
        signinSilentMock.mockResolvedValue(response);

        await expect(
          authManager.requestRefreshTokenAfterRegistration()
        ).rejects.toThrow('REFRESH_TOKEN_ERROR');

        expect(signinSilentMock).toHaveBeenCalledTimes(MAX_RETRIES + 1);
      }, 15000);

      it('requestRefreshTokenAfterRegistration failed with fetching user info error in metadata with retries', async () => {
        signinSilentMock.mockResolvedValue(null);
        await expect(
          authManager.requestRefreshTokenAfterRegistration()
        ).rejects.toThrow('REFRESH_TOKEN_ERROR');

        expect(signinSilentMock).toHaveBeenCalledTimes(MAX_RETRIES + 1);
      }, 15000);
    });
  });
});
