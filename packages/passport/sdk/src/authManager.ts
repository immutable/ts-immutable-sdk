import {
  User as OidcUser,
  UserManager,
  UserManagerSettings,
} from 'oidc-client-ts';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import DeviceCredentialsManager from 'storage/device_credentials_manager';
import { PassportErrorType, withPassportError } from './errors/passportError';
import {
  PassportMetadata,
  User,
  DeviceCodeReponse,
  DeviceConnectResponse,
  DeviceTokenResponse,
  DeviceErrorResponse,
  IdTokenPayload,
} from './types';
import { PassportConfiguration } from './config';

const formUrlEncodedHeader = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

const getAuthConfiguration = ({
  oidcConfiguration,
  authenticationDomain,
}: PassportConfiguration): UserManagerSettings => {
  const baseConfiguration: UserManagerSettings = {
    authority: authenticationDomain,
    redirect_uri: oidcConfiguration.redirectUri,
    popup_redirect_uri: oidcConfiguration.redirectUri,
    client_id: oidcConfiguration.clientId,
    metadata: {
      authorization_endpoint: `${authenticationDomain}/authorize`,
      token_endpoint: `${authenticationDomain}/oauth/token`,
      userinfo_endpoint: `${authenticationDomain}/userinfo`,
      end_session_endpoint:
        `${authenticationDomain}/v2/logout`
        + `?returnTo=${encodeURIComponent(oidcConfiguration.logoutRedirectUri)}`
        + `&client_id=${oidcConfiguration.clientId}`,
    },
    mergeClaims: true,
    loadUserInfo: true,
    scope: oidcConfiguration.scope,
  };

  if (oidcConfiguration.audience) {
    baseConfiguration.extraQueryParams = {
      audience: oidcConfiguration.audience,
    };
  }
  return baseConfiguration;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default class AuthManager {
  private userManager;

  private config: PassportConfiguration;

  private deviceCredentialsManager: DeviceCredentialsManager;

  constructor(config: PassportConfiguration) {
    this.config = config;
    this.userManager = new UserManager(getAuthConfiguration(config));
    this.deviceCredentialsManager = new DeviceCredentialsManager();
  }

  private static mapOidcUserToDomainModel = (oidcUser: OidcUser): User => {
    const passport = oidcUser.profile?.passport as PassportMetadata;
    const user: User = {
      expired: oidcUser.expired,
      idToken: oidcUser.id_token,
      accessToken: oidcUser.access_token,
      refreshToken: oidcUser.refresh_token,
      profile: {
        sub: oidcUser.profile.sub,
        email: oidcUser.profile.email,
        nickname: oidcUser.profile.nickname,
      },
    };
    if (passport?.imx_eth_address) {
      user.imx = {
        ethAddress: passport?.imx_eth_address,
        starkAddress: passport?.imx_stark_address,
        userAdminAddress: passport?.imx_user_admin_address,
      };
    }
    if (passport?.zkevm_eth_address) {
      user.zkEvm = {
        ethAddress: passport?.zkevm_eth_address,
        userAdminAddress: passport?.zkevm_user_admin_address,
      };
    }

    return user;
  };

  private static mapDeviceTokenResponseToDomainUserModel = (tokenResponse: DeviceTokenResponse): User => {
    const idTokenPayload: IdTokenPayload = jwt_decode(tokenResponse.id_token);
    const user: User = {
      idToken: tokenResponse.id_token,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      profile: {
        sub: idTokenPayload.sub,
        email: idTokenPayload.email,
        nickname: idTokenPayload.nickname,
      },
    };
    if (idTokenPayload?.passport?.imx_eth_address) {
      user.imx = {
        ethAddress: idTokenPayload?.passport?.imx_eth_address,
        starkAddress: idTokenPayload?.passport?.imx_stark_address,
        userAdminAddress: idTokenPayload?.passport?.imx_user_admin_address,
      };
    }

    return user;
  };

  public async login(): Promise<User> {
    return withPassportError<User>(async () => {
      const popupWindowFeatures = { width: 410, height: 450 };
      const oidcUser = await this.userManager.signinPopup({
        popupWindowFeatures,
      });

      return AuthManager.mapOidcUserToDomainModel(oidcUser);
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  public async loginCallback(): Promise<void> {
    return withPassportError<void>(
      async () => this.userManager.signinPopupCallback(),
      PassportErrorType.AUTHENTICATION_ERROR,
    );
  }

  public async loginWithDeviceFlow(): Promise<DeviceConnectResponse> {
    return withPassportError<DeviceConnectResponse>(async () => {
      const response = await axios.post<DeviceCodeReponse>(
        `${this.config.authenticationDomain}/oauth/device/code`,
        {
          client_id: this.config.oidcConfiguration.clientId,
          scope: this.config.oidcConfiguration.scope,
          audience: this.config.oidcConfiguration.audience,
        },
        formUrlEncodedHeader,
      );

      return {
        code: response.data.user_code,
        deviceCode: response.data.device_code,
        url: response.data.verification_uri_complete,
        interval: response.data.interval,
      };
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  /* eslint-disable no-await-in-loop */
  public async connectImxDeviceFlow(deviceCode: string, interval: number, timeoutMs?: number): Promise<User> {
    return withPassportError<User>(async () => {
      const startTime = Date.now();
      const loopCondition = true;
      while (loopCondition) {
        if (timeoutMs != null && Date.now() - startTime > timeoutMs) {
          throw new Error('Timed out');
        }

        await wait(interval * 1000);

        try {
          const tokenResponse = await this.getDeviceFlowToken(deviceCode);
          const user = AuthManager.mapDeviceTokenResponseToDomainUserModel(tokenResponse);

          // Only persist credentials that contain the necessary data
          if (user.imx?.ethAddress && user.imx?.starkAddress && user.imx?.userAdminAddress) {
            this.deviceCredentialsManager.saveCredentials(tokenResponse);
          }

          return user;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const responseError: DeviceErrorResponse = error.response?.data;
            switch (responseError.error) {
              case 'authorization_pending':
                break;
              case 'slow_down':
                break;
              case 'expired_token':
                throw new Error('Token expired, please log in again');
              case 'access_denied':
                throw new Error('User denied access');
              default:
                throw new Error('Error getting token');
            }
          } else {
            throw error;
          }
        }
      }

      throw new Error('Failed to get credentials');
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }
  /* eslint-enable no-await-in-loop */

  private async getDeviceFlowToken(deviceCode: string): Promise<DeviceTokenResponse> {
    const response = await axios.post<DeviceTokenResponse>(
      `${this.config.authenticationDomain}/oauth/token`,
      {
        client_id: this.config.oidcConfiguration.clientId,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: deviceCode,
      },
      formUrlEncodedHeader,
    );

    return response.data;
  }

  public async connectImxWithCredentials(tokenResponse: DeviceTokenResponse): Promise<User | null> {
    return withPassportError<User | null>(async () => {
      if (this.deviceCredentialsManager.areValid(tokenResponse)) {
        // Credentials exist and are still valid
        return AuthManager.mapDeviceTokenResponseToDomainUserModel(tokenResponse);
      }

      const refreshToken = tokenResponse?.refresh_token ?? null;
      if (refreshToken) {
        // Token is no longer valid, but refresh token can be used to a new one
        const newTokenResponse = await this.refreshToken(refreshToken);
        return AuthManager.mapDeviceTokenResponseToDomainUserModel(newTokenResponse);
      }

      return null;
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  private async refreshToken(refreshToken: string): Promise<DeviceTokenResponse> {
    const response = await axios.post<DeviceTokenResponse>(
      `${this.config.authenticationDomain}/oauth/token`,
      {
        client_id: this.config.oidcConfiguration.clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      formUrlEncodedHeader,
    );

    return response.data;
  }

  public async logout(): Promise<void> {
    return withPassportError<void>(
      async () => this.userManager.signoutRedirect(),
      PassportErrorType.LOGOUT_ERROR,
    );
  }

  public async logoutDeviceFlow(): Promise<void> {
    return withPassportError<void>(async () => {
      this.deviceCredentialsManager.clearCredentials();
    }, PassportErrorType.LOGOUT_ERROR);
  }

  public async loginSilent(): Promise<User | null> {
    return withPassportError<User | null>(async () => {
      const existedUser = await this.getUser();
      if (!existedUser) {
        return null;
      }
      const oidcUser = await this.userManager.signinSilent();
      if (!oidcUser) {
        return null;
      }
      return AuthManager.mapOidcUserToDomainModel(oidcUser);
    }, PassportErrorType.SILENT_LOGIN_ERROR);
  }

  public async getUser(): Promise<User | null> {
    return withPassportError<User | null>(async () => {
      const oidcUser = await this.userManager.getUser();
      if (oidcUser) {
        return AuthManager.mapOidcUserToDomainModel(oidcUser);
      }

      const deviceToken = this.deviceCredentialsManager.getCredentials();
      if (deviceToken) {
        return AuthManager.mapDeviceTokenResponseToDomainUserModel(deviceToken);
      }
      return null;
    }, PassportErrorType.NOT_LOGGED_IN_ERROR);
  }

  public async getUserDeviceFlow(): Promise<User | null> {
    return withPassportError<User | null>(async () => {
      const deviceToken = this.deviceCredentialsManager.getCredentials();
      if (deviceToken) {
        return AuthManager.mapDeviceTokenResponseToDomainUserModel(deviceToken);
      }
      return null;
    }, PassportErrorType.NOT_LOGGED_IN_ERROR);
  }

  public checkStoredDeviceFlowCredentials(): DeviceTokenResponse | null {
    return this.deviceCredentialsManager.getCredentials();
  }
}
