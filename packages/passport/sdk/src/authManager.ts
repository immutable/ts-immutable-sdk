import {
  InMemoryWebStorage,
  User as OidcUser,
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from 'oidc-client-ts';
import axios from 'axios';
import DeviceCredentialsManager from 'storage/device_credentials_manager';
import * as crypto from 'crypto';
import jwt_decode from 'jwt-decode';
import { isTokenExpired } from './utils/token';
import { PassportErrorType, withPassportError } from './errors/passportError';
import {
  PassportMetadata,
  User,
  DeviceCodeResponse,
  DeviceConnectResponse,
  DeviceTokenResponse,
  DeviceErrorResponse,
  IdTokenPayload,
  OidcConfiguration,
} from './types';
import { PassportConfiguration } from './config';

const formUrlEncodedHeader = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

const getAuthConfiguration = (config: PassportConfiguration): UserManagerSettings => {
  const { authenticationDomain, oidcConfiguration } = config;

  const store = typeof window !== 'undefined' ? window.localStorage : new InMemoryWebStorage();
  const userStore = new WebStorageStateStore({ store });

  let endSessionEndpoint = `${authenticationDomain}/v2/logout?client_id=${oidcConfiguration.clientId}`;
  if (oidcConfiguration.logoutRedirectUri) {
    endSessionEndpoint += `&returnTo=${encodeURIComponent(oidcConfiguration.logoutRedirectUri)}`;
  }

  const baseConfiguration: UserManagerSettings = {
    authority: authenticationDomain,
    redirect_uri: oidcConfiguration.redirectUri,
    popup_redirect_uri: oidcConfiguration.redirectUri,
    client_id: oidcConfiguration.clientId,
    metadata: {
      authorization_endpoint: `${authenticationDomain}/authorize`,
      token_endpoint: `${authenticationDomain}/oauth/token`,
      userinfo_endpoint: `${authenticationDomain}/userinfo`,
      end_session_endpoint: endSessionEndpoint,
    },
    mergeClaims: true,
    loadUserInfo: true,
    scope: oidcConfiguration.scope,
    userStore,
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

function base64URLEncode(str: Buffer) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export default class AuthManager {
  private userManager;

  private config: PassportConfiguration;

  private deviceCredentialsManager: DeviceCredentialsManager;

  private readonly logoutMode: Exclude<OidcConfiguration['logoutMode'], undefined>;

  /**
   * Promise that is used to prevent multiple concurrent calls to the refresh token endpoint.
   */
  private refreshingPromise: Promise<User | null> | null = null;

  constructor(config: PassportConfiguration) {
    this.config = config;
    this.userManager = new UserManager(getAuthConfiguration(config));
    this.deviceCredentialsManager = new DeviceCredentialsManager();
    this.logoutMode = config.oidcConfiguration.logoutMode || 'redirect';
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
        ethAddress: passport.imx_eth_address,
        starkAddress: passport.imx_stark_address,
        userAdminAddress: passport.imx_user_admin_address,
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

  private static mapDeviceTokenResponseToOidcUser = (tokenResponse: DeviceTokenResponse): OidcUser => {
    const idTokenPayload: IdTokenPayload = jwt_decode(tokenResponse.id_token);

    return new OidcUser({
      id_token: tokenResponse.id_token,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_type: tokenResponse.token_type,
      profile: {
        sub: idTokenPayload.sub,
        iss: idTokenPayload.iss,
        aud: idTokenPayload.aud,
        exp: idTokenPayload.exp,
        iat: idTokenPayload.iat,
        email: idTokenPayload.email,
        nickname: idTokenPayload.nickname,
        passport: idTokenPayload.passport,
      },
    });
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
      const response = await axios.post<DeviceCodeResponse>(
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
  public async loginWithDeviceFlowCallback(deviceCode: string, interval: number, timeoutMs?: number): Promise<User> {
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
          const oidcUser = AuthManager.mapDeviceTokenResponseToOidcUser(tokenResponse);
          const user = AuthManager.mapOidcUserToDomainModel(oidcUser);
          await this.userManager.storeUser(oidcUser);

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

  public getPKCEAuthorizationUrl(): string {
    const verifier = base64URLEncode(crypto.randomBytes(32));
    const challenge = base64URLEncode(sha256(verifier));

    // https://auth0.com/docs/secure/attack-protection/state-parameters
    const state = base64URLEncode(crypto.randomBytes(32));
    this.deviceCredentialsManager.savePKCEData({ state, verifier });

    return `${this.config.authenticationDomain}/authorize?`
      + 'response_type=code'
      + `&code_challenge=${challenge}`
      + '&code_challenge_method=S256'
      + `&client_id=${this.config.oidcConfiguration.clientId}`
      + `&redirect_uri=${this.config.oidcConfiguration.redirectUri}`
      + `&scope=${this.config.oidcConfiguration.scope}`
      + `&state=${state}`
      + `&audience=${this.config.oidcConfiguration.audience}`;
  }

  public async loginWithPKCEFlowCallback(authorizationCode: string, state: string): Promise<User> {
    return withPassportError<User>(async () => {
      const pkceData = this.deviceCredentialsManager.getPKCEData();
      if (!pkceData) {
        throw new Error('No code verifier or state for PKCE');
      }

      if (state !== pkceData.state) {
        throw new Error('Provided state does not match stored state');
      }

      const tokenResponse = await this.getPKCEToken(authorizationCode, pkceData.verifier);
      const oidcUser = AuthManager.mapDeviceTokenResponseToOidcUser(tokenResponse);
      const user = AuthManager.mapOidcUserToDomainModel(oidcUser);
      await this.userManager.storeUser(oidcUser);

      return user;
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  private async getPKCEToken(authorizationCode: string, codeVerifier: string): Promise<DeviceTokenResponse> {
    const response = await axios.post<DeviceTokenResponse>(
      `${this.config.authenticationDomain}/oauth/token`,
      {
        client_id: this.config.oidcConfiguration.clientId,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
        code: authorizationCode,
        redirect_uri: this.config.oidcConfiguration.redirectUri,
      },
      formUrlEncodedHeader,
    );

    return response.data;
  }

  public async logout(): Promise<void> {
    return withPassportError<void>(
      async () => {
        if (this.logoutMode === 'silent') {
          return this.userManager.signoutSilent();
        }

        return this.userManager.signoutRedirect();
      },
      PassportErrorType.LOGOUT_ERROR,
    );
  }

  public async removeUser(): Promise<void> {
    return this.userManager.removeUser();
  }

  public getDeviceFlowEndSessionEndpoint(): string {
    const { authenticationDomain, oidcConfiguration } = this.config;
    let endSessionEndpoint = `${authenticationDomain}/v2/logout`;
    if (oidcConfiguration.logoutRedirectUri) {
      endSessionEndpoint += `?client_id=${oidcConfiguration.clientId}`
        + `&returnTo=${encodeURIComponent(oidcConfiguration.logoutRedirectUri)}`;
    }

    return endSessionEndpoint;
  }

  public async logoutSilentCallback(url: string): Promise<void> {
    return this.userManager.signoutSilentCallback(url);
  }

  public async forceUserRefresh() : Promise<User | null> {
    return this.refreshTokenAndUpdatePromise();
  }

  /**
   * Refreshes the token and returns the user.
   * If the token is already being refreshed, returns the existing promise.
   */
  private async refreshTokenAndUpdatePromise(): Promise<User | null> {
    if (this.refreshingPromise) return this.refreshingPromise;

    // eslint-disable-next-line no-async-promise-executor
    this.refreshingPromise = new Promise(async (resolve, reject) => {
      try {
        const newOidcUser = await this.userManager.signinSilent();
        if (newOidcUser) {
          resolve(AuthManager.mapOidcUserToDomainModel(newOidcUser));
          return;
        }
        resolve(null);
      } catch (err) {
        reject(err);
      } finally {
        this.refreshingPromise = null; // Reset the promise after completion
      }
    });

    return this.refreshingPromise;
  }

  /**
   * Get the user from the cache or refresh the token if it's expired.
   * return null if there's no refresh token.
   */
  public async getUser(): Promise<User | null> {
    return withPassportError<User | null>(async () => {
      const oidcUser = await this.userManager.getUser();
      if (!oidcUser) return null;

      if (!isTokenExpired(oidcUser)) {
        return AuthManager.mapOidcUserToDomainModel(oidcUser);
      }

      if (oidcUser.refresh_token) {
        return this.refreshTokenAndUpdatePromise();
      }

      return null;
    }, PassportErrorType.NOT_LOGGED_IN_ERROR);
  }
}
