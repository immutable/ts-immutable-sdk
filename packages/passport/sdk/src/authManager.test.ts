import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { User as OidcUser, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import jwt_decode from 'jwt-decode';
import AuthManager from './authManager';
import { PassportError, PassportErrorType } from './errors/passportError';
import { PassportConfiguration } from './config';
import { mockUser, mockUserImx, mockUserZkEvm } from './test/mocks';
import { isTokenExpired } from './utils/token';
import { isUserZkEvm, PassportModuleConfiguration } from './types';

jest.mock('jwt-decode');
jest.mock('./utils/token');
jest.mock('oidc-client-ts', () => ({
  ...jest.requireActual('oidc-client-ts'),
  InMemoryWebStorage: jest.fn(),
  UserManager: jest.fn(),
  WebStorageStateStore: jest.fn(),
}));

const authenticationDomain = 'auth.immutable.com';
const clientId = '11111';
const redirectUri = 'https://test.com';
const logoutEndpoint = '/v2/logout';
const logoutRedirectUri = `${redirectUri}logout/callback`;

const getConfig = (values?: Partial<PassportModuleConfiguration>) => new PassportConfiguration({
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
  clientId,
  redirectUri,
  scope: 'email profile',
  ...values,
});

const commonOidcUser: OidcUser = {
  id_token: mockUser.idToken,
  access_token: mockUser.accessToken,
  token_type: 'Bearer',
  scope: 'openid',
  expires_in: 167222,
  profile: {
    sub: mockUser.profile.sub,
    email: mockUser.profile.email,
    nickname: mockUser.profile.nickname,
  },
} as OidcUser;

const mockOidcUser: OidcUser = {
  ...commonOidcUser,
  refresh_token: mockUser.refreshToken,
  expired: false,
} as OidcUser;

const mockOidcExpiredUser: OidcUser = {
  ...commonOidcUser,
  refresh_token: mockUser.refreshToken,
  expired: true,
} as OidcUser;

const mockOidcExpiredNoRefreshTokenUser: OidcUser = {
  ...commonOidcUser,
  expired: true,
} as OidcUser;

const imxProfileData = {
  imx_eth_address: mockUserImx.imx.ethAddress,
  imx_stark_address: mockUserImx.imx.starkAddress,
  imx_user_admin_address: mockUserImx.imx.userAdminAddress,
};

const zkEvmProfileData = {
  zkevm_eth_address: mockUserZkEvm.zkEvm.ethAddress,
  zkevm_user_admin_address: mockUserZkEvm.zkEvm.userAdminAddress,
};

const mockErrorMsg = 'NONO';

describe('AuthManager', () => {
  afterEach(jest.resetAllMocks);

  let authManager: AuthManager;
  let mockSigninPopup: jest.Mock;
  let mockSigninPopupCallback: jest.Mock;
  let mockSignoutRedirect: jest.Mock;
  let mockGetUser: jest.Mock;
  let mockSigninSilent: jest.Mock;
  let mockSignoutSilent: jest.Mock;
  let mockStoreUser: jest.Mock;

  beforeEach(() => {
    mockSigninPopup = jest.fn();
    mockSigninPopupCallback = jest.fn();
    mockSignoutRedirect = jest.fn();
    mockGetUser = jest.fn();
    mockSigninSilent = jest.fn();
    mockSignoutSilent = jest.fn();
    mockStoreUser = jest.fn();
    (UserManager as jest.Mock).mockReturnValue({
      signinPopup: mockSigninPopup,
      signinPopupCallback: mockSigninPopupCallback,
      signoutRedirect: mockSignoutRedirect,
      signoutSilent: mockSignoutSilent,
      getUser: mockGetUser,
      signinSilent: mockSigninSilent,
      storeUser: mockStoreUser,
    });
    authManager = new AuthManager(getConfig());
  });

  describe('constructor', () => {
    it('should initialise AuthManager with the correct default configuration', () => {
      const config = getConfig();
      const am = new AuthManager(config);
      expect(am).toBeDefined();
      expect(UserManager).toBeCalledWith({
        authority: config.authenticationDomain,
        client_id: config.oidcConfiguration.clientId,
        mergeClaims: true,
        automaticSilentRenew: false,
        metadata: {
          authorization_endpoint: `${config.authenticationDomain}/authorize`,
          token_endpoint: `${config.authenticationDomain}/oauth/token`,
          userinfo_endpoint: `${config.authenticationDomain}/userinfo`,
          end_session_endpoint: `${config.authenticationDomain}${logoutEndpoint}`
            + `?client_id=${config.oidcConfiguration.clientId}`,
        },
        popup_redirect_uri: config.oidcConfiguration.redirectUri,
        redirect_uri: config.oidcConfiguration.redirectUri,
        scope: config.oidcConfiguration.scope,
        userStore: expect.any(WebStorageStateStore),
      });
    });

    describe('when an audience is specified', () => {
      it('should initialise AuthManager with a configuration containing audience params', () => {
        const configWithAudience = getConfig({
          audience: 'audience',
        });
        const am = new AuthManager(configWithAudience);
        expect(am).toBeDefined();
        expect(UserManager).toBeCalledWith(expect.objectContaining({
          extraQueryParams: {
            audience: configWithAudience.oidcConfiguration.audience,
          },
        }));
      });
    });

    describe('when a logoutRedirectUri is specified', () => {
      it('should set the endSessionEndpoint `returnTo` and `client_id` query string params', () => {
        const configWithLogoutRedirectUri = getConfig({ logoutRedirectUri });
        const am = new AuthManager(configWithLogoutRedirectUri);

        const uri = new URL(logoutEndpoint, `https://${authenticationDomain}`);
        uri.searchParams.append('client_id', clientId);
        uri.searchParams.append('returnTo', logoutRedirectUri);

        expect(am).toBeDefined();
        expect(UserManager).toBeCalledWith(expect.objectContaining({
          metadata: expect.objectContaining({
            end_session_endpoint: uri.toString(),
          }),
        }));
      });
    });
  });

  describe('login', () => {
    describe('when the user has not registered for any rollup', () => {
      it('should get the login user and return the domain model', async () => {
        mockSigninPopup.mockResolvedValue(mockOidcUser);

        const result = await authManager.login();
        expect(result).toEqual(mockUser);
      });
    });

    describe('when the user has registered for imx', () => {
      it('should populate the imx object', async () => {
        mockSigninPopup.mockResolvedValue(mockOidcUser);
        (jwt_decode as jest.Mock).mockReturnValue({
          passport: {
            imx_eth_address: mockUserImx.imx.ethAddress,
            imx_stark_address: mockUserImx.imx.starkAddress,
            imx_user_admin_address: mockUserImx.imx.userAdminAddress,
          },
        });

        const result = await authManager.login();

        expect(result).toEqual(mockUserImx);
      });
    });

    describe('when the user has registered for zkEvm', () => {
      it('should populate the zkEvm object', async () => {
        mockSigninPopup.mockResolvedValue(mockOidcUser);

        (jwt_decode as jest.Mock).mockReturnValue({
          passport: {
            zkevm_eth_address: mockUserZkEvm.zkEvm.ethAddress,
            zkevm_user_admin_address: mockUserZkEvm.zkEvm.userAdminAddress,
          },
        });

        const result = await authManager.login();

        expect(result).toEqual(mockUserZkEvm);
      });
    });

    describe('when the user has registered for imx & zkEvm', () => {
      it('should populate the imx & zkEvm objects', async () => {
        mockSigninPopup.mockResolvedValue(mockOidcUser);
        (jwt_decode as jest.Mock).mockReturnValue({
          passport: {
            zkevm_eth_address: mockUserZkEvm.zkEvm.ethAddress,
            zkevm_user_admin_address: mockUserZkEvm.zkEvm.userAdminAddress,
            imx_eth_address: mockUserImx.imx.ethAddress,
            imx_stark_address: mockUserImx.imx.starkAddress,
            imx_user_admin_address: mockUserImx.imx.userAdminAddress,
          },
        });

        const result = await authManager.login();

        expect(result).toEqual({
          ...mockUserImx,
          imx: {
            ethAddress: imxProfileData.imx_eth_address,
            starkAddress: imxProfileData.imx_stark_address,
            userAdminAddress: imxProfileData.imx_user_admin_address,
          },
          zkEvm: {
            ethAddress: zkEvmProfileData.zkevm_eth_address,
            userAdminAddress: zkEvmProfileData.zkevm_user_admin_address,
          },
        });
      });
    });

    it('should throw the error if user is failed to login', async () => {
      mockSigninPopup.mockRejectedValue(new Error(mockErrorMsg));

      await expect(() => authManager.login()).rejects.toThrow(
        new PassportError(
          mockErrorMsg,
          PassportErrorType.AUTHENTICATION_ERROR,
        ),
      );
    });
  });

  describe('getUserOrLogin', () => {
    describe('when getUser returns a user', () => {
      it('should return the user', async () => {
        mockGetUser.mockReturnValue(mockOidcUser);
        (isTokenExpired as jest.Mock).mockReturnValue(false);

        const result = await authManager.getUserOrLogin();

        expect(result).toEqual(mockUser);
      });
    });

    describe('when getUser throws an error', () => {
      it('calls attempts to sign in the user using signinPopup', async () => {
        mockGetUser.mockRejectedValue(new Error(mockErrorMsg));
        mockSigninPopup.mockReturnValue(mockOidcUser);
        (isTokenExpired as jest.Mock).mockReturnValue(false);

        const result = await authManager.getUserOrLogin();

        expect(result).toEqual(mockUser);
      });
    });
  });

  describe('loginCallback', () => {
    it('should call login callback', async () => {
      await authManager.loginCallback();

      expect(mockSigninPopupCallback).toBeCalled();
    });
  });

  describe('logout', () => {
    it('should call redirect logout if logout mode is redirect', async () => {
      const configuration = getConfig({
        logoutMode: 'redirect',
      });
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockSignoutRedirect).toBeCalled();
    });

    it('should call redirect logout if logout mode is not set', async () => {
      const configuration = getConfig({
        logoutMode: undefined,
      });
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockSignoutRedirect).toBeCalled();
    });

    it('should call silent logout if logout mode is silent', async () => {
      const configuration = getConfig({
        logoutMode: 'silent',
      });
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockSignoutSilent).toBeCalled();
    });

    it('should throw an error if user is failed to logout', async () => {
      const configuration = getConfig({
        logoutMode: 'redirect',
      });
      const manager = new AuthManager(configuration);

      mockSignoutRedirect.mockRejectedValue(new Error(mockErrorMsg));

      await expect(() => manager.logout()).rejects.toThrow(
        new PassportError(
          mockErrorMsg,
          PassportErrorType.LOGOUT_ERROR,
        ),
      );
    });
  });

  describe('forceUserRefresh', () => {
    it('should call signinSilent and return the domain model', async () => {
      mockSigninSilent.mockReturnValue(mockOidcUser);

      const result = await authManager.forceUserRefresh();

      expect(result).toEqual(mockUser);
      expect(mockSigninSilent).toBeCalled();
      expect(mockGetUser).not.toBeCalled();
    });
  });

  describe('getUser', () => {
    it('should retrieve the user from the userManager and return the domain model', async () => {
      mockGetUser.mockReturnValue(mockOidcUser);
      (isTokenExpired as jest.Mock).mockReturnValue(false);

      const result = await authManager.getUser();

      expect(result).toEqual(mockUser);
    });

    it('should call signinSilent and returns user when user token is expired with the refresh token', async () => {
      mockGetUser.mockReturnValue(mockOidcExpiredUser);
      (isTokenExpired as jest.Mock).mockReturnValue(true);
      mockSigninSilent.mockResolvedValue(mockOidcUser);

      const result = await authManager.getUser();

      expect(mockSigninSilent).toBeCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when the user token is expired without refresh token', async () => {
      mockGetUser.mockReturnValue(mockOidcExpiredNoRefreshTokenUser);
      (isTokenExpired as jest.Mock).mockReturnValue(true);

      const result = await authManager.getUser();

      expect(mockSigninSilent).toBeCalledTimes(0);
      expect(result).toEqual(null);
    });

    it('should return null when the user token is expired with the refresh token, but signinSilent returns null', async () => {
      mockGetUser.mockReturnValue(mockOidcExpiredUser);
      (isTokenExpired as jest.Mock).mockReturnValue(true);
      mockSigninSilent.mockResolvedValue(null);
      const result = await authManager.getUser();

      expect(mockSigninSilent).toBeCalledTimes(1);
      expect(result).toEqual(null);
    });

    it('should return null if no user is returned', async () => {
      mockGetUser.mockReturnValue(null);

      expect(await authManager.getUser()).toBeNull();
    });

    describe('when concurrent requests forceUserRefresh are made', () => {
      describe('when forceUserRefresh', () => {
        it('should only call refresh the token once', async () => {
          mockSigninSilent.mockReturnValue(mockOidcUser);

          await Promise.allSettled([
            authManager.forceUserRefresh(),
            authManager.forceUserRefresh(),
          ]);

          expect(mockSigninSilent).toBeCalledTimes(1);
        });
      });

      describe('when the user is expired', () => {
        it('should only call refresh the token once', async () => {
          mockGetUser.mockReturnValue(mockOidcExpiredUser);
          (isTokenExpired as jest.Mock).mockReturnValue(true);
          mockSigninSilent.mockReturnValue(mockOidcUser);

          await Promise.allSettled([
            authManager.getUser(),
            authManager.getUser(),
          ]);

          expect(mockSigninSilent).toBeCalledTimes(1);
        });
      });
    });

    describe('when the user does not meet the type assertion', () => {
      it('should return null', async () => {
        mockGetUser.mockReturnValue(mockOidcUser);
        (isTokenExpired as jest.Mock).mockReturnValue(false);

        const result = await authManager.getUser(isUserZkEvm);

        expect(result).toBeNull();
      });
    });

    describe('when the user does meet the type assertion', () => {
      it('should return the user', async () => {
        mockGetUser.mockReturnValue(mockOidcUser);
        (jwt_decode as jest.Mock).mockReturnValue({
          passport: {
            zkevm_eth_address: mockUserZkEvm.zkEvm.ethAddress,
            zkevm_user_admin_address: mockUserZkEvm.zkEvm.userAdminAddress,
          },
        });
        (isTokenExpired as jest.Mock).mockReturnValue(false);

        const result = await authManager.getUser(isUserZkEvm);

        expect(result).toEqual(mockUserZkEvm);
      });
    });

    describe('when the user is refreshing', () => {
      it('should return the refreshed used', async () => {
        mockSigninSilent.mockReturnValue(mockOidcUser);

        authManager.forceUserRefreshInBackground();

        const result = await authManager.getUser();
        expect(result).toEqual(mockUser);

        expect(mockSigninSilent).toBeCalledTimes(1);
        expect(mockGetUser).toBeCalledTimes(0);
      });
    });
  });

  describe('getUserZkEvm', () => {
    it('should throw an error if no user is returned', async () => {
      mockGetUser.mockReturnValue(null);

      await expect(() => authManager.getUserZkEvm()).rejects.toThrow(
        new Error('Failed to obtain a User with the required ZkEvm attributes'),
      );
    });
  });

  describe('getUserImx', () => {
    it('should throw an error if no user is returned', async () => {
      mockGetUser.mockReturnValue(null);

      await expect(() => authManager.getUserImx()).rejects.toThrow(
        new Error('Failed to obtain a User with the required IMX attributes'),
      );
    });
  });

  describe('getDeviceFlowEndSessionEndpoint', () => {
    describe('with a logged in user', () => {
      describe('when a logoutRedirectUri is specified', () => {
        it('should set the endSessionEndpoint `post_logout_redirect_uri` and `client_id` query string params', async () => {
          mockGetUser.mockReturnValue(mockOidcUser);

          const am = new AuthManager(getConfig({ logoutRedirectUri }));
          const result = await am.getDeviceFlowEndSessionEndpoint();
          const uri = new URL(result);

          expect(uri.hostname).toEqual(authenticationDomain);
          expect(uri.pathname).toEqual(logoutEndpoint);
          expect(uri.searchParams.get('client_id')).toEqual(clientId);
        });
      });

      describe('when no post_logout_redirect_uri is specified', () => {
        it('should return the endSessionEndpoint without a `post_logout_redirect_uri` or `client_id` query string params', async () => {
          mockGetUser.mockReturnValue(mockOidcUser);

          const am = new AuthManager(getConfig());
          const result = await am.getDeviceFlowEndSessionEndpoint();
          const uri = new URL(result);

          expect(uri.hostname).toEqual(authenticationDomain);
          expect(uri.pathname).toEqual(logoutEndpoint);
          expect(uri.searchParams.get('client_id')).toEqual(clientId);
        });
      });
    });
  });
});
