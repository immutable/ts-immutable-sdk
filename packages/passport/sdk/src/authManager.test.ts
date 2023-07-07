import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { User as OidcUser, UserManager } from 'oidc-client-ts';
import AuthManager from './authManager';
import { PassportError, PassportErrorType } from './errors/passportError';
import { PassportConfiguration } from './config';
import { mockUser, mockUserImx, mockUserZkEvm } from './test/mocks';

jest.mock('oidc-client-ts');

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

const mockOidcUser: OidcUser = {
  id_token: mockUser.idToken,
  access_token: mockUser.accessToken,
  refresh_token: mockUser.refreshToken,
  token_type: 'Bearer',
  scope: 'openid',
  expires_in: 167222,
  profile: {
    sub: mockUser.profile.sub,
    email: mockUser.profile.email,
    nickname: mockUser.profile.nickname,
  },
  expired: false,
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
    it('should initial AuthManager the configuration contains audience params', () => {
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
        extraQueryParams: {
          audience: configWithAudience.oidcConfiguration.audience,
        },
      });
    });
  });

  it('should initial AuthManager the default configuration', () => {
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
    });
  });

  describe('login', () => {
    describe('when the user has not registered for any rollup', () => {
      it('should get the login user and return the domain model', async () => {
        signInMock.mockResolvedValue(mockOidcUser);

        const result = await authManager.login();

        expect(result).toEqual(mockUser);
      });
    });

    describe('when the user has registered for imx', () => {
      it('should populate the imx object', async () => {
        signInMock.mockResolvedValue({
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
        signInMock.mockResolvedValue({
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
        signInMock.mockResolvedValue({
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
      signInMock.mockRejectedValue(new Error(mockErrorMsg));

      await expect(() => authManager.login()).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.AUTHENTICATION_ERROR}: ${mockErrorMsg}`,
          PassportErrorType.AUTHENTICATION_ERROR,
        ),
      );
    });
  });

  describe('loginSilent', () => {
    it('should get the login user and return the domain model', async () => {
      getUserMock.mockReturnValue(mockOidcUser);
      signinSilentMock.mockResolvedValue(mockOidcUser);

      const result = await authManager.loginSilent();

      expect(result).toEqual(mockUser);
    });

    it('should return null if there is no existed user', async () => {
      getUserMock.mockReturnValue(null);

      const result = await authManager.loginSilent();

      expect(result).toBeNull();
    });

    it('should return null if user is returned', async () => {
      getUserMock.mockReturnValue(mockOidcUser);
      signinSilentMock.mockResolvedValue(null);

      const result = await authManager.loginSilent();

      expect(result).toBeNull();
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
          PassportErrorType.LOGOUT_ERROR,
        ),
      );
    });
  });

  describe('getUser', () => {
    it('should retrieve the user from the userManager and return the domain model', async () => {
      getUserMock.mockReturnValue(mockOidcUser);

      const result = await authManager.getUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is returned', async () => {
      getUserMock.mockReturnValue(null);

      expect(await authManager.getUser()).toBeNull();
    });
  });
});
