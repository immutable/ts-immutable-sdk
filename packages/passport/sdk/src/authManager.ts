import {
  ErrorResponse,
  ErrorTimeout,
  InMemoryWebStorage,
  User as OidcUser,
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from 'oidc-client-ts';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { getDetail, Detail } from '@imtbl/metrics';
import localForage from 'localforage';
import DeviceCredentialsManager from './storage/device_credentials_manager';
import logger from './utils/logger';
import { isTokenExpired } from './utils/token';
import { PassportError, PassportErrorType, withPassportError } from './errors/passportError';
import {
  PassportMetadata,
  User,
  DeviceCodeResponse,
  DeviceConnectResponse,
  DeviceTokenResponse,
  DeviceErrorResponse,
  IdTokenPayload,
  OidcConfiguration,
  UserZkEvm,
  isUserZkEvm,
  UserImx,
  isUserImx,
} from './types';
import { PassportConfiguration } from './config';
import Overlay from './overlay';
import { LocalForageAsyncStorage } from './storage/LocalForageAsyncStorage';

const formUrlEncodedHeader = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

const logoutEndpoint = '/v2/logout';
const authorizeEndpoint = '/authorize';

const getAuthConfiguration = (config: PassportConfiguration): UserManagerSettings => {
  const { authenticationDomain, oidcConfiguration } = config;

  let store;
  if (config.crossSdkBridgeEnabled) {
    store = new LocalForageAsyncStorage('ImmutableSDKPassport', localForage.INDEXEDDB);
  } else if (typeof window !== 'undefined') {
    store = window.localStorage;
  } else {
    store = new InMemoryWebStorage();
  }
  const userStore = new WebStorageStateStore({ store });

  const endSessionEndpoint = new URL(logoutEndpoint, authenticationDomain.replace(/^(?:https?:\/\/)?(.*)/, 'https://$1'));
  endSessionEndpoint.searchParams.set('client_id', oidcConfiguration.clientId);
  if (oidcConfiguration.logoutRedirectUri) {
    endSessionEndpoint.searchParams.set('returnTo', oidcConfiguration.logoutRedirectUri);
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
      end_session_endpoint: endSessionEndpoint.toString(),
    },
    mergeClaims: true,
    automaticSilentRenew: false, // Disabled until https://github.com/authts/oidc-client-ts/issues/430 has been resolved
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

function base64URLEncode(str: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function sha256(buffer: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(buffer);
  return await window.crypto.subtle.digest('SHA-256', data);
}

export default class AuthManager {
  private userManager;

  private deviceCredentialsManager: DeviceCredentialsManager;

  private readonly config: PassportConfiguration;

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
    let passport: PassportMetadata | undefined;
    if (oidcUser.id_token) {
      passport = jwt_decode<IdTokenPayload>(oidcUser.id_token)?.passport;
    }

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

  /**
   * login
   * @param anonymousId Caller can pass an anonymousId if they want to associate their user's identity with immutable's internal instrumentation.
   */
  public async login(anonymousId?: string): Promise<User> {
    return withPassportError<User>(async () => {
      const popupWindowTarget = 'passportLoginPrompt';
      const signinPopup = async () => (
        this.userManager.signinPopup({
          extraQueryParams: {
            ...(this.userManager.settings?.extraQueryParams ?? {}),
            rid: getDetail(Detail.RUNTIME_ID) || '',
            third_party_a_id: anonymousId || '',
          },
          popupWindowFeatures: {
            width: 410,
            height: 450,
          },
          popupWindowTarget,
        })
      );

      // This promise attempts to open the signin popup, and displays the blocked popup overlay if necessary.
      return new Promise((resolve, reject) => {
        signinPopup()
          .then((oidcUser) => {
            resolve(AuthManager.mapOidcUserToDomainModel(oidcUser));
          })
          .catch((error: unknown) => {
            // Reject with the error if it is not caused by a blocked popup
            if (!(error instanceof Error) || error.message !== 'Attempted to navigate on a disposed window') {
              reject(error);
              return;
            }

            // Popup was blocked; append the blocked popup overlay to allow the user to try again.
            let popupHasBeenOpened: boolean = false;
            const overlay = new Overlay(this.config.popupOverlayOptions, true);
            overlay.append(
              async () => {
                try {
                  if (!popupHasBeenOpened) {
                    // The user is attempting to open the popup again. It's safe to assume that this will not fail,
                    // as there are no async operations between the button interaction & the popup being opened.
                    popupHasBeenOpened = true;
                    const oidcUser = await signinPopup();
                    overlay.remove();
                    resolve(AuthManager.mapOidcUserToDomainModel(oidcUser));
                  } else {
                    // The popup has already been opened. By calling `window.open` with the same target as the
                    // previously opened popup, no new window will be opened. Instead, the existing popup
                    // will be focused. This works as expected in most browsers at the time of implementation, but
                    // the following exceptions do exist:
                    // - Safari: Only the initial call will focus the window, subsequent calls will do nothing.
                    // - Firefox: The window will not be focussed, nothing will happen.
                    window.open('', popupWindowTarget);
                  }
                } catch (retryError: unknown) {
                  overlay.remove();
                  reject(retryError);
                }
              },
              () => {
                overlay.remove();
                reject(new Error('Popup closed by user'));
              },
            );
          });
      });
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  public async getUserOrLogin(): Promise<User> {
    let user: User | null = null;
    try {
      user = await this.getUser();
    } catch (err) {
      logger.warn('Failed to retrieve a cached user session', err);
    }

    return user || this.login();
  }

  public async loginCallback(): Promise<void> {
    return withPassportError<void>(
      async () => { await this.userManager.signinCallback(); },
      PassportErrorType.AUTHENTICATION_ERROR,
    );
  }

  /**
   * loginWithDeviceFlow
   * @param anonymousId Caller can pass an anonymousId if they want to associate their user's identity with immutable's internal instrumentation.
   */
  public async loginWithDeviceFlow(anonymousId?: string): Promise<DeviceConnectResponse> {
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

      const rid = getDetail(Detail.RUNTIME_ID);

      return {
        code: response.data.user_code,
        deviceCode: response.data.device_code,
        url: `${response.data.verification_uri_complete}${rid ? `&rid=${rid}` : ''}${anonymousId ? `&third_party_a_id=${anonymousId}` : ''}`,
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

  public async getPKCEAuthorizationUrl(): Promise<string> {
    const verifier = base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64URLEncode(await sha256(verifier));

    // https://auth0.com/docs/secure/attack-protection/state-parameters
    const state = base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)));

    const {
      redirectUri, scope, audience, clientId,
    } = this.config.oidcConfiguration;

    this.deviceCredentialsManager.savePKCEData({ state, verifier });

    const pKCEAuthorizationUrl = new URL(authorizeEndpoint, this.config.authenticationDomain);
    pKCEAuthorizationUrl.searchParams.set('response_type', 'code');
    pKCEAuthorizationUrl.searchParams.set('code_challenge', challenge);
    pKCEAuthorizationUrl.searchParams.set('code_challenge_method', 'S256');
    pKCEAuthorizationUrl.searchParams.set('client_id', clientId);
    pKCEAuthorizationUrl.searchParams.set('redirect_uri', redirectUri);
    pKCEAuthorizationUrl.searchParams.set('state', state);

    if (scope) pKCEAuthorizationUrl.searchParams.set('scope', scope);
    if (audience) pKCEAuthorizationUrl.searchParams.set('audience', audience);

    return pKCEAuthorizationUrl.toString();
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

  public async logoutSilentCallback(url: string): Promise<void> {
    return this.userManager.signoutSilentCallback(url);
  }

  public async removeUser(): Promise<void> {
    return this.userManager.removeUser();
  }

  public async getDeviceFlowEndSessionEndpoint(): Promise<string> {
    const { authenticationDomain, oidcConfiguration } = this.config;

    const endSessionEndpoint = new URL(logoutEndpoint, authenticationDomain);
    endSessionEndpoint.searchParams.set('client_id', oidcConfiguration.clientId);

    if (oidcConfiguration.logoutRedirectUri) endSessionEndpoint.searchParams.set('returnTo', oidcConfiguration.logoutRedirectUri);

    return endSessionEndpoint.toString();
  }

  public forceUserRefreshInBackground() {
    this.refreshTokenAndUpdatePromise().catch((error) => {
      logger.warn('Failed to refresh user token', error);
    });
  }

  public async forceUserRefresh(): Promise<User | null> {
    return this.refreshTokenAndUpdatePromise().catch((error) => {
      logger.warn('Failed to refresh user token', error);
      return null;
    });
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
        let passportErrorType = PassportErrorType.AUTHENTICATION_ERROR;
        let errorMessage = 'Failed to refresh token';

        if (err instanceof ErrorTimeout) {
          passportErrorType = PassportErrorType.SILENT_LOGIN_ERROR;
        } else if (err instanceof ErrorResponse) {
          passportErrorType = PassportErrorType.NOT_LOGGED_IN_ERROR;
          errorMessage = `${err.message}: ${err.error_description}`;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        reject(new PassportError(errorMessage, passportErrorType));
      } finally {
        this.refreshingPromise = null; // Reset the promise after completion
      }
    });

    return this.refreshingPromise;
  }

  /**
   *
   * @param typeAssertion {(user: User) => boolean} - Optional. If provided, then the User will be checked against
   * the typeAssertion. If the user meets the requirements, then it will be typed as T and returned. If the User
   * does NOT meet the type assertion, then execution will continue, and we will attempt to obtain a User that does
   * meet the type assertion.
   *
   * This function will attempt to obtain a User in the following order:
   * 1. If the User is currently refreshing, wait for the refresh to complete.
   * 2. Attempt to obtain a User from storage that has not expired.
   * 3. Attempt to refresh the User if a refresh token is present.
   * 4. Return null if no valid User can be obtained.
   */
  public async getUser<T extends User>(
    typeAssertion: (user: User) => user is T = (user: User): user is T => true,
  ): Promise<T | null> {
    if (this.refreshingPromise) {
      const user = await this.refreshingPromise;
      if (user && typeAssertion(user)) {
        return user;
      }

      return null;
    }

    const oidcUser = await this.userManager.getUser();
    if (!oidcUser) return null;

    if (!isTokenExpired(oidcUser)) {
      const user = AuthManager.mapOidcUserToDomainModel(oidcUser);
      if (user && typeAssertion(user)) {
        return user;
      }
    }

    if (oidcUser.refresh_token) {
      const user = await this.refreshTokenAndUpdatePromise();
      if (user && typeAssertion(user)) {
        return user;
      }
    }

    return null;
  }

  public async getUserZkEvm(): Promise<UserZkEvm> {
    const user = await this.getUser(isUserZkEvm);
    if (!user) {
      throw new Error('Failed to obtain a User with the required ZkEvm attributes');
    }

    return user;
  }

  public async getUserImx(): Promise<UserImx> {
    const user = await this.getUser(isUserImx);
    if (!user) {
      throw new Error('Failed to obtain a User with the required IMX attributes');
    }

    return user;
  }
}
