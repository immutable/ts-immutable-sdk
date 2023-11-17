import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { User as OidcUser, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import jwt_decode from 'jwt-decode';
import AuthManager from './authManager';
import { PassportError, PassportErrorType } from './errors/passportError';
import { PassportConfiguration } from './config';
import { mockUser, mockUserImx, mockUserZkEvm } from './test/mocks';
import { isTokenExpired } from './utils/token';
import { DeviceTokenResponse } from './types';

jest.mock('jwt-decode');
jest.mock('./utils/token');
jest.mock('oidc-client-ts', () => ({
  ...jest.requireActual('oidc-client-ts'),
  InMemoryWebStorage: jest.fn(),
  UserManager: jest.fn(),
  WebStorageStateStore: jest.fn(),
}));

const baseConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
});
const config = new PassportConfiguration({
  baseConfig,
  logoutRedirectUri: 'https://test.com',
  clientId: '11111',
  redirectUri: 'https://test.com',
  scope: 'email profile',
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
  let mockSignIn: jest.Mock;
  let mockSigninPopupCallback: jest.Mock;
  let mockSignoutRedirect: jest.Mock;
  let mockGetUser: jest.Mock;
  let mockSigninSilent: jest.Mock;
  let mockSignoutSilent: jest.Mock;
  let mockStoreUser: jest.Mock;

  beforeEach(() => {
    mockSignIn = jest.fn();
    mockSigninPopupCallback = jest.fn();
    mockSignoutRedirect = jest.fn();
    mockGetUser = jest.fn();
    mockSigninSilent = jest.fn();
    mockSignoutSilent = jest.fn();
    mockStoreUser = jest.fn();
    (UserManager as jest.Mock).mockReturnValue({
      signinPopup: mockSignIn,
      signinPopupCallback: mockSigninPopupCallback,
      signoutRedirect: mockSignoutRedirect,
      signoutSilent: mockSignoutSilent,
      getUser: mockGetUser,
      signinSilent: mockSigninSilent,
      storeUser: mockStoreUser,
    });
    authManager = new AuthManager(config);
  });

  describe('constructor', () => {
    it('should initialise AuthManager with a configuration containing audience params', () => {
      const configWithAudience = new PassportConfiguration({
        baseConfig,
        logoutRedirectUri: 'https://test.com',
        clientId: '11111',
        redirectUri: 'https://test.com',
        scope: 'email profile',
        audience: 'audience',
      });

      // to work around new being used as a side effect, which would cause a lint failure
      const am = new AuthManager(configWithAudience);
      expect(am).toBeDefined();
      expect(UserManager).toBeCalledWith({
        authority: configWithAudience.authenticationDomain,
        client_id: configWithAudience.oidcConfiguration.clientId,
        loadUserInfo: true,
        mergeClaims: true,
        metadata: {
          authorization_endpoint: `${configWithAudience.authenticationDomain}/authorize`,
          token_endpoint: `${configWithAudience.authenticationDomain}/oauth/token`,
          userinfo_endpoint: `${configWithAudience.authenticationDomain}/userinfo`,
          end_session_endpoint:
            `${configWithAudience.authenticationDomain}/v2/logout`
            + `?returnTo=${encodeURIComponent(
              configWithAudience.oidcConfiguration.logoutRedirectUri,
            )}`
            + `&client_id=${configWithAudience.oidcConfiguration.clientId}`,
        },
        popup_redirect_uri: configWithAudience.oidcConfiguration.redirectUri,
        redirect_uri: configWithAudience.oidcConfiguration.redirectUri,
        scope: configWithAudience.oidcConfiguration.scope,
        userStore: expect.any(WebStorageStateStore),
        extraQueryParams: {
          audience: configWithAudience.oidcConfiguration.audience,
        },
      });
    });
  });

  it('should initialise AuthManager with the correct default configuration', () => {
    // to work around new being used as a side effect, which would cause a lint failure
    const am = new AuthManager(config);
    expect(am).toBeDefined();
    expect(UserManager).toBeCalledWith({
      authority: config.authenticationDomain,
      client_id: config.oidcConfiguration.clientId,
      loadUserInfo: true,
      mergeClaims: true,
      metadata: {
        authorization_endpoint: `${config.authenticationDomain}/authorize`,
        token_endpoint: `${config.authenticationDomain}/oauth/token`,
        userinfo_endpoint: `${config.authenticationDomain}/userinfo`,
        end_session_endpoint:
          `${config.authenticationDomain}/v2/logout`
          + `?returnTo=${encodeURIComponent(
            config.oidcConfiguration.logoutRedirectUri,
          )}`
          + `&client_id=${config.oidcConfiguration.clientId}`,
      },
      popup_redirect_uri: config.oidcConfiguration.redirectUri,
      redirect_uri: config.oidcConfiguration.redirectUri,
      scope: config.oidcConfiguration.scope,
      userStore: expect.any(WebStorageStateStore),
    });
  });

  describe('login', () => {
    describe('when the user has not registered for any rollup', () => {
      it('should get the login user and return the domain model', async () => {
        mockSignIn.mockResolvedValue(mockOidcUser);

        const result = await authManager.login();

        expect(result).toEqual(mockUser);
      });
    });

    describe('when the user has registered for imx', () => {
      it('should populate the imx object', async () => {
        mockSignIn.mockResolvedValue({
          ...mockOidcUser,
          profile: {
            ...mockOidcUser.profile,
            passport: {
              ...imxProfileData,
            },
          },
        });

        const result = await authManager.login();

        expect(result).toEqual(mockUserImx);
      });
    });

    describe('when the user has registered for zkEvm', () => {
      it('should populate the zkEvm object', async () => {
        mockSignIn.mockResolvedValue({
          ...mockOidcUser,
          profile: {
            ...mockOidcUser.profile,
            passport: {
              ...zkEvmProfileData,
            },
          },
        });

        const result = await authManager.login();

        expect(result).toEqual(mockUserZkEvm);
      });
    });

    describe('when the user has registered for imx & zkEvm', () => {
      it('should populate the imx & zkEvm objects', async () => {
        mockSignIn.mockResolvedValue({
          ...mockOidcUser,
          profile: {
            ...mockOidcUser.profile,
            passport: {
              ...zkEvmProfileData,
              ...imxProfileData,
            },
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
      mockSignIn.mockRejectedValue(new Error(mockErrorMsg));

      await expect(() => authManager.login()).rejects.toThrow(
        new PassportError(
          mockErrorMsg,
          PassportErrorType.AUTHENTICATION_ERROR,
        ),
      );
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
      const configuration = { ...config };
      configuration.oidcConfiguration.logoutMode = 'redirect';
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockSignoutRedirect).toBeCalled();
    });

    it('should call redirect logout if logout mode is not set', async () => {
      const configuration = { ...config };
      configuration.oidcConfiguration.logoutMode = undefined;
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockSignoutRedirect).toBeCalled();
    });

    it('should call silent logout if logout mode is silent', async () => {
      const configuration = { ...config };
      configuration.oidcConfiguration.logoutMode = 'silent';
      const manager = new AuthManager(configuration);

      await manager.logout();

      expect(mockSignoutSilent).toBeCalled();
    });

    it('should throw an error if user is failed to logout', async () => {
      const configuration = { ...config };
      configuration.oidcConfiguration.logoutMode = 'redirect';
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
  });

  describe('connectImxWithCredentials', () => {
    it('should call storeUser & return a domain model User ', async () => {
      const profileData = {
        email: mockUser.profile.email,
        nickname: mockUser.profile.nickname,
        sub: mockUser.profile.sub,
        aud: 'audience123',
        iss: 'https://auth.immutable.com/',
        iat: 1234500000,
        exp: 1234567890,
        passport: {
          ...imxProfileData,
          ...zkEvmProfileData,
        },
      };
      (jwt_decode as jest.Mock).mockReturnValue(profileData);

      const tokenResponse: DeviceTokenResponse = {
        access_token: mockUser.accessToken,
        refresh_token: mockUser.refreshToken,
        id_token: mockUser.idToken!,
        token_type: 'Bearer',
        expires_in: 167222,
      };

      const result = await authManager.connectImxWithCredentials(tokenResponse);

      expect(mockStoreUser).toHaveBeenCalledWith(expect.objectContaining({
        id_token: mockUser.idToken,
        access_token: mockUser.accessToken,
        refresh_token: mockUser.refreshToken,
        profile: profileData,
      }));

      expect(result).toEqual(expect.objectContaining({
        idToken: mockUser.idToken,
        accessToken: mockUser.accessToken,
        refreshToken: mockUser.refreshToken,
        profile: {
          sub: mockUser.profile.sub,
          email: mockUser.profile.email,
          nickname: mockUser.profile.nickname,
        },
        imx: {
          ethAddress: imxProfileData.imx_eth_address,
          starkAddress: imxProfileData.imx_stark_address,
          userAdminAddress: imxProfileData.imx_user_admin_address,
        },
        zkEvm: {
          ethAddress: zkEvmProfileData.zkevm_eth_address,
          userAdminAddress: zkEvmProfileData.zkevm_user_admin_address,
        },
      }));
    });
  });
});
