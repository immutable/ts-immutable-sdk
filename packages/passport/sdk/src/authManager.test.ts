import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { User as OidcUser, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import jwt_decode from 'jwt-decode';
import AuthManager from './authManager';
import Overlay from './overlay';
import { PassportError, PassportErrorType } from './errors/passportError';
import { PassportConfiguration } from './config';
import { mockUser, mockUserImx, mockUserZkEvm } from './test/mocks';
import { isAccessTokenExpiredOrExpiring } from './utils/token';
import { isUserZkEvm, PassportModuleConfiguration } from './types';

jest.mock('jwt-decode');
jest.mock('oidc-client-ts', () => ({
  ...jest.requireActual('oidc-client-ts'),
  InMemoryWebStorage: jest.fn(),
  UserManager: jest.fn(),
  WebStorageStateStore: jest.fn(),
}));
jest.mock('./utils/token');
jest.mock('./overlay');

const authenticationDomain = 'auth.immutable.com';
const clientId = '11111';
const redirectUri = 'https://test.com';
const popupRedirectUri = `${redirectUri}-popup`;
const logoutEndpoint = '/v2/logout';
const crossSdkBridgeLogoutEndpoint = '/im-logged-out';
const logoutRedirectUri = `${redirectUri}logout/callback`;

const getConfig = (values?: Partial<PassportModuleConfiguration>) => new PassportConfiguration({
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
  clientId,
  redirectUri,
  popupRedirectUri,
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
  let mockSigninCallback: jest.Mock;
  let mockSigninRedirectCallback: jest.Mock;
  let mockSignoutRedirect: jest.Mock;
  let mockGetUser: jest.Mock;
  let mockSigninSilent: jest.Mock;
  let mockSignoutSilent: jest.Mock;
  let mockStoreUser: jest.Mock;
  let mockOverlayAppend: jest.Mock;
  let mockOverlayRemove: jest.Mock;
  let mockRevokeTokens: jest.Mock;

  beforeEach(() => {
    mockSigninPopup = jest.fn();
    mockSigninCallback = jest.fn();
    mockSigninRedirectCallback = jest.fn();
    mockSignoutRedirect = jest.fn();
    mockGetUser = jest.fn();
    mockSigninSilent = jest.fn();
    mockSignoutSilent = jest.fn();
    mockStoreUser = jest.fn();
    mockOverlayAppend = jest.fn();
    mockOverlayRemove = jest.fn();
    mockRevokeTokens = jest.fn();
    (UserManager as jest.Mock).mockImplementation((config) => ({
      signinPopup: mockSigninPopup,
      signinCallback: mockSigninCallback,
      signinRedirectCallback: mockSigninRedirectCallback,
      signoutRedirect: mockSignoutRedirect,
      signoutSilent: mockSignoutSilent,
      getUser: mockGetUser,
      signinSilent: mockSigninSilent,
      storeUser: mockStoreUser,
      revokeTokens: mockRevokeTokens,
      settings: {
        metadata: {
          end_session_endpoint: config.metadata?.end_session_endpoint,
        },
      },
    }));
    (Overlay as jest.Mock).mockReturnValue({
      append: mockOverlayAppend,
      remove: mockOverlayRemove,
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
        extraQueryParams: {},
        mergeClaimsStrategy: { array: 'merge' },
        automaticSilentRenew: false,
        metadata: {
          authorization_endpoint: `${config.authenticationDomain}/authorize`,
          token_endpoint: `${config.authenticationDomain}/oauth/token`,
          userinfo_endpoint: `${config.authenticationDomain}/userinfo`,
          end_session_endpoint: `${config.authenticationDomain}${logoutEndpoint}`
            + `?client_id=${config.oidcConfiguration.clientId}`,
          revocation_endpoint: `${config.authenticationDomain}/oauth/revoke`,
        },
        popup_redirect_uri: config.oidcConfiguration.popupRedirectUri,
        redirect_uri: config.oidcConfiguration.redirectUri,
        scope: config.oidcConfiguration.scope,
        userStore: expect.any(WebStorageStateStore),
        revokeTokenTypes: ['refresh_token'],
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
          revokeTokenTypes: ['refresh_token'],
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
      expect(mockOverlayAppend).not.toHaveBeenCalled();
    });

    describe('when the popup is blocked', () => {
      beforeEach(() => {
        mockSigninPopup.mockRejectedValueOnce(new Error('Attempted to navigate on a disposed window'));
      });

      it('should render the blocked popup overlay', async () => {
        const configWithPopupOverlayOptions = getConfig({
          popupOverlayOptions: {
            disableGenericPopupOverlay: false,
            disableBlockedPopupOverlay: false,
          },
        });
        const am = new AuthManager(configWithPopupOverlayOptions);

        mockSigninPopup.mockReturnValue(mockOidcUser);
        // Simulate `tryAgainOnClick` being called so that the `login()` promise can resolve
        mockOverlayAppend.mockImplementation(async (tryAgainOnClick: () => Promise<void>) => {
          await tryAgainOnClick();
        });

        const result = await am.login();

        expect(result).toEqual(mockUser);
        expect(Overlay).toHaveBeenCalledWith(configWithPopupOverlayOptions.popupOverlayOptions, true);
        expect(mockOverlayAppend).toHaveBeenCalledTimes(1);
      });

      describe('when tryAgainOnClick is called once', () => {
        beforeEach(() => {
          mockOverlayAppend.mockImplementation(async (tryAgainOnClick: () => Promise<void>) => {
            await tryAgainOnClick();
          });
        });

        it('should return a user', async () => {
          mockSigninPopup.mockReturnValue(mockOidcUser);

          const result = await authManager.login();

          expect(result).toEqual(mockUser);
          expect(mockSigninPopup).toHaveBeenCalledTimes(2);
          expect(mockOverlayRemove).toHaveBeenCalled();
        });

        describe('and the user closes the popup', () => {
          it('should throw an error', async () => {
            mockSigninPopup.mockRejectedValueOnce(new Error('Popup closed by user'));

            await expect(() => authManager.login()).rejects.toThrow(
              new Error('Popup closed by user'),
            );

            expect(mockSigninPopup).toHaveBeenCalledTimes(2);
            expect(mockOverlayRemove).toHaveBeenCalled();
          });
        });
      });

      describe('when onCloseClick is called', () => {
        it('should remove the overlay', async () => {
          mockOverlayAppend.mockImplementation(async (_: () => Promise<void>, onCloseClick: () => void) => {
            onCloseClick();
          });

          await expect(() => authManager.login()).rejects.toThrow(
            new Error('Popup closed by user'),
          );

          expect(mockOverlayRemove).toHaveBeenCalled();
        });
      });
    });
  });

  describe('getUserOrLogin', () => {
    describe('when getUser returns a user', () => {
      it('should return the user', async () => {
        mockGetUser.mockReturnValue(mockOidcUser);
        (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(false);

        const result = await authManager.getUserOrLogin();

        expect(result).toEqual(mockUser);
      });
    });

    describe('when getUser throws an error', () => {
      it('calls attempts to sign in the user using signinPopup', async () => {
        mockGetUser.mockRejectedValue(new Error(mockErrorMsg));
        mockSigninPopup.mockReturnValue(mockOidcUser);
        (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(false);

        const result = await authManager.getUserOrLogin();

        expect(result).toEqual(mockUser);
      });
    });
  });

  describe('loginCallback', () => {
    it('should call login callback', async () => {
      await authManager.loginCallback();

      expect(mockSigninCallback).toBeCalled();
    });

    it('should call login redirect callback and map to domain model', async () => {
      mockSigninCallback.mockReturnValue(mockOidcUser);
      const user = await authManager.loginCallback();
      expect(mockSigninCallback).toBeCalled();
      expect(user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should call redirect logout if logout mode is redirect', async () => {
      const configuration = getConfig({
        logoutMode: 'redirect',
      });
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockRevokeTokens).toHaveBeenCalledWith(['refresh_token']);
      expect(mockSignoutRedirect).toBeCalled();
    });

    it('should call redirect logout if logout mode is not set', async () => {
      const configuration = getConfig({
        logoutMode: undefined,
      });
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockRevokeTokens).toHaveBeenCalledWith(['refresh_token']);
      expect(mockSignoutRedirect).toBeCalled();
    });

    it('should call silent logout if logout mode is silent', async () => {
      const configuration = getConfig({
        logoutMode: 'silent',
      });
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockRevokeTokens).toHaveBeenCalledWith(['refresh_token']);
      expect(mockSignoutSilent).toBeCalled();
    });

    describe('when revoking of refresh tokens fails', () => {
      it('should throw an error for redirect logout', async () => {
        const configuration = getConfig({
          logoutMode: 'redirect',
        });
        const manager = new AuthManager(configuration);
        mockRevokeTokens.mockRejectedValue(new Error(mockErrorMsg));

        await expect(() => manager.logout()).rejects.toThrow(
          new PassportError(
            mockErrorMsg,
            PassportErrorType.LOGOUT_ERROR,
          ),
        );
        expect(mockSignoutRedirect).not.toHaveBeenCalled();
      });

      it('should throw an error for silent logout', async () => {
        const configuration = getConfig({
          logoutMode: 'silent',
        });
        const manager = new AuthManager(configuration);
        mockRevokeTokens.mockRejectedValue(new Error(mockErrorMsg));

        await expect(() => manager.logout()).rejects.toThrow(
          new PassportError(
            mockErrorMsg,
            PassportErrorType.LOGOUT_ERROR,
          ),
        );
        expect(mockSignoutSilent).not.toHaveBeenCalled();
      });
    });

    it('should throw an error if user is failed to logout with redirect', async () => {
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
      expect(mockRevokeTokens).toHaveBeenCalledWith(['refresh_token']);
    });

    it('should throw an error if user is failed to logout silently', async () => {
      const configuration = getConfig({
        logoutMode: 'silent',
      });
      const manager = new AuthManager(configuration);

      mockSignoutSilent.mockRejectedValue(new Error(mockErrorMsg));

      await expect(() => manager.logout()).rejects.toThrow(
        new PassportError(
          mockErrorMsg,
          PassportErrorType.LOGOUT_ERROR,
        ),
      );
      expect(mockRevokeTokens).toHaveBeenCalledWith(['refresh_token']);
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
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(false);

      const result = await authManager.getUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when user has no idToken', async () => {
      const userWithoutIdToken = { ...mockOidcUser, id_token: undefined, refresh_token: undefined };
      mockGetUser.mockReturnValue(userWithoutIdToken);
      // Restore real function behavior for this test
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockImplementation(
        jest.requireActual('./utils/token').isAccessTokenExpiredOrExpiring,
      );

      const result = await authManager.getUser();

      expect(result).toBeNull();
    });

    it('should refresh token when access token is expired or expiring', async () => {
      const userWithExpiringAccessToken = { ...mockOidcUser };
      mockGetUser.mockReturnValue(userWithExpiringAccessToken);
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(true);
      mockSigninSilent.mockResolvedValue(mockOidcUser);

      const result = await authManager.getUser();

      expect(mockSigninSilent).toBeCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should handle user with missing access token', async () => {
      const userWithoutAccessToken = { ...mockOidcUser, access_token: undefined };
      mockGetUser.mockReturnValue(userWithoutAccessToken);
      // Restore real function behavior for this test
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockImplementation(
        jest.requireActual('./utils/token').isAccessTokenExpiredOrExpiring,
      );
      mockSigninSilent.mockResolvedValue(mockOidcUser);

      const result = await authManager.getUser();

      expect(mockSigninSilent).toBeCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should return user directly when access token is not expired or expiring', async () => {
      const freshUser = { ...mockOidcUser };
      mockGetUser.mockReturnValue(freshUser);
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(false);

      const result = await authManager.getUser();

      expect(mockSigninSilent).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should call signinSilent and returns user when user token is expired with the refresh token', async () => {
      mockGetUser.mockReturnValue(mockOidcExpiredUser);
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(true);
      mockSigninSilent.mockResolvedValue(mockOidcUser);

      const result = await authManager.getUser();

      expect(mockSigninSilent).toBeCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should reject with an error when signinSilent throws a string', async () => {
      mockGetUser.mockReturnValue(mockOidcExpiredUser);
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(true);
      mockSigninSilent.mockRejectedValue('oops');

      await expect(() => authManager.getUser()).rejects.toThrow(
        new PassportError(
          'Failed to refresh token: oops: Failed to remove user: this.userManager.removeUser is not a function',
          PassportErrorType.AUTHENTICATION_ERROR,
        ),
      );
    });

    it('should return null when the user token is expired without refresh token', async () => {
      mockGetUser.mockReturnValue(mockOidcExpiredNoRefreshTokenUser);
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(true);

      const result = await authManager.getUser();

      expect(mockSigninSilent).toBeCalledTimes(0);
      expect(result).toEqual(null);
    });

    it('should return null when the user token is expired with the refresh token, but signinSilent returns null', async () => {
      mockGetUser.mockReturnValue(mockOidcExpiredUser);
      (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(true);
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
          (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(true);
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
        (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(false);

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
        (isAccessTokenExpiredOrExpiring as jest.Mock).mockReturnValue(false);

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

  describe('getLogoutUrl', () => {
    describe('with a logged in user', () => {
      describe('when a logoutRedirectUri is specified', () => {
        it('should set the endSessionEndpoint `returnTo` and `client_id` query string params', async () => {
          mockGetUser.mockReturnValue(mockOidcUser);

          const am = new AuthManager(getConfig({ logoutRedirectUri }));
          const result = await am.getLogoutUrl();

          expect(result).not.toBeNull();
          const uri = new URL(result!);

          expect(uri.hostname).toEqual(authenticationDomain);
          expect(uri.pathname).toEqual(logoutEndpoint);
          expect(uri.searchParams.get('client_id')).toEqual(clientId);
          expect(uri.searchParams.get('returnTo')).toEqual(logoutRedirectUri);
        });
      });

      describe('when no post_logout_redirect_uri is specified', () => {
        it('should return the endSessionEndpoint without a `returnTo` or `client_id` query string params', async () => {
          mockGetUser.mockReturnValue(mockOidcUser);

          const am = new AuthManager(getConfig());
          const result = await am.getLogoutUrl();

          expect(result).not.toBeNull();
          const uri = new URL(result!);

          expect(uri.hostname).toEqual(authenticationDomain);
          expect(uri.pathname).toEqual(logoutEndpoint);
          expect(uri.searchParams.get('client_id')).toEqual(clientId);
        });
      });

      describe('when crossSdkBridgeEnabled is true', () => {
        it('should use the bridge logout endpoint path', async () => {
          mockGetUser.mockReturnValue(mockOidcUser);

          const am = new AuthManager(getConfig({ crossSdkBridgeEnabled: true, logoutRedirectUri }));
          const result = await am.getLogoutUrl();

          expect(result).not.toBeNull();
          const uri = new URL(result!);

          expect(uri.hostname).toEqual(authenticationDomain);
          expect(uri.pathname).toEqual(crossSdkBridgeLogoutEndpoint);
          expect(uri.searchParams.get('client_id')).toEqual(clientId);
          expect(uri.searchParams.get('returnTo')).toEqual(logoutRedirectUri);
        });
      });
    });

    describe('when end_session_endpoint is not available', () => {
      it('should return null', async () => {
        const am = new AuthManager(getConfig());
        // eslint-disable-next-line @typescript-eslint/dot-notation
        am['userManager'].settings.metadata!.end_session_endpoint = undefined;

        const result = await am.getLogoutUrl();
        expect(result).toBeNull();
      });
    });
  });

  describe('getPKCEAuthorizationUrl', () => {
    beforeEach(() => {
      // Mock crypto.getRandomValues for PKCE verifier and state generation
      const mockArrayBuffer = new ArrayBuffer(32);
      const mockUint8Array = new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      ]);
      Object.defineProperty(window, 'crypto', {
        value: {
          getRandomValues: jest.fn().mockReturnValue(mockUint8Array),
          subtle: {
            digest: jest.fn().mockResolvedValue(mockArrayBuffer),
          },
        },
        writable: true,
      });

      // Mock TextEncoder
      global.TextEncoder = jest.fn().mockImplementation(() => ({
        encode: jest.fn().mockReturnValue(mockUint8Array),
      }));

      // Mock btoa function used in base64URLEncode
      global.btoa = jest.fn().mockReturnValue('bW9ja2VkLWJhc2U2NC1zdHJpbmc=');
    });

    it('should generate a PKCE authorization URL with required parameters', async () => {
      const result = await authManager.getPKCEAuthorizationUrl();
      const url = new URL(result);

      expect(url.hostname).toEqual(authenticationDomain);
      expect(url.pathname).toEqual('/authorize');
      expect(url.searchParams.get('response_type')).toEqual('code');
      expect(url.searchParams.get('code_challenge_method')).toEqual('S256');
      expect(url.searchParams.get('client_id')).toEqual(clientId);
      expect(url.searchParams.get('redirect_uri')).toEqual(redirectUri);
      expect(url.searchParams.get('scope')).toEqual('email profile');
      expect(url.searchParams.get('code_challenge')).toEqual('bW9ja2VkLWJhc2U2NC1zdHJpbmc');
      expect(url.searchParams.get('state')).toEqual('bW9ja2VkLWJhc2U2NC1zdHJpbmc');
    });

    it('should not include direct parameter when directLoginMethod is not provided', async () => {
      const result = await authManager.getPKCEAuthorizationUrl();
      const url = new URL(result);

      expect(url.searchParams.get('direct')).toBeNull();
    });

    it('should include direct parameter when directLoginMethod is provided', async () => {
      const directLoginMethod = 'apple';
      const result = await authManager.getPKCEAuthorizationUrl(directLoginMethod);
      const url = new URL(result);

      expect(url.searchParams.get('direct')).toEqual('apple');
    });

    it('should include direct parameter for google login method', async () => {
      const directLoginMethod = 'google';
      const result = await authManager.getPKCEAuthorizationUrl(directLoginMethod);
      const url = new URL(result);

      expect(url.searchParams.get('direct')).toEqual('google');
    });

    it('should include direct parameter for facebook login method', async () => {
      const directLoginMethod = 'facebook';
      const result = await authManager.getPKCEAuthorizationUrl(directLoginMethod);
      const url = new URL(result);

      expect(url.searchParams.get('direct')).toEqual('facebook');
    });

    it('should include audience parameter when specified in config', async () => {
      const configWithAudience = getConfig({ audience: 'test-audience' });
      const am = new AuthManager(configWithAudience);

      const result = await am.getPKCEAuthorizationUrl();
      const url = new URL(result);

      expect(url.searchParams.get('audience')).toEqual('test-audience');
    });

    it('should include both direct and audience parameters', async () => {
      const configWithAudience = getConfig({ audience: 'test-audience' });
      const am = new AuthManager(configWithAudience);

      const result = await am.getPKCEAuthorizationUrl('apple');
      const url = new URL(result);

      expect(url.searchParams.get('direct')).toEqual('apple');
      expect(url.searchParams.get('audience')).toEqual('test-audience');
    });
  });

  describe('login with directLoginMethod', () => {
    it('should pass directLoginMethod to login popup', async () => {
      mockSigninPopup.mockResolvedValue(mockOidcUser);

      await authManager.login('anonymous-id', { directLoginMethod: 'apple' });

      expect(mockSigninPopup).toHaveBeenCalledWith({
        extraQueryParams: {
          rid: '',
          third_party_a_id: 'anonymous-id',
          direct: 'apple',
        },
        popupWindowFeatures: {
          width: 410,
          height: 450,
        },
        popupWindowTarget: 'passportLoginPrompt',
      });
    });

    it('should not include direct parameter when directLoginMethod is not provided', async () => {
      mockSigninPopup.mockResolvedValue(mockOidcUser);

      await authManager.login('anonymous-id');

      expect(mockSigninPopup).toHaveBeenCalledWith({
        extraQueryParams: {
          rid: '',
          third_party_a_id: 'anonymous-id',
        },
        popupWindowFeatures: {
          width: 410,
          height: 450,
        },
        popupWindowTarget: 'passportLoginPrompt',
      });
    });
  });

  describe('loginWithRedirect with directLoginMethod', () => {
    let mockSigninRedirect: jest.Mock;

    beforeEach(() => {
      mockSigninRedirect = jest.fn();
      (UserManager as jest.Mock).mockReturnValue({
        signinPopup: mockSigninPopup,
        signinCallback: mockSigninCallback,
        signinRedirectCallback: mockSigninRedirectCallback,
        signoutRedirect: mockSignoutRedirect,
        signoutSilent: mockSignoutSilent,
        getUser: mockGetUser,
        signinSilent: mockSigninSilent,
        storeUser: mockStoreUser,
        revokeTokens: mockRevokeTokens,
        signinRedirect: mockSigninRedirect,
        clearStaleState: jest.fn(),
      });
      authManager = new AuthManager(getConfig());
    });

    it('should pass directLoginMethod to redirect login', async () => {
      await authManager.loginWithRedirect('anonymous-id', { directLoginMethod: 'google' });

      expect(mockSigninRedirect).toHaveBeenCalledWith({
        extraQueryParams: {
          rid: '',
          third_party_a_id: 'anonymous-id',
          direct: 'google',
        },
      });
    });

    it('should not include direct parameter when directLoginMethod is not provided', async () => {
      await authManager.loginWithRedirect('anonymous-id');

      expect(mockSigninRedirect).toHaveBeenCalledWith({
        extraQueryParams: {
          rid: '',
          third_party_a_id: 'anonymous-id',
        },
      });
    });
  });
});
