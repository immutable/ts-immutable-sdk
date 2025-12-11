import {
  ErrorResponse,
  ErrorTimeout,
  InMemoryWebStorage,
  User as OidcUser,
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from 'oidc-client-ts';
import localForage from 'localforage';
import {
  Detail,
  getDetail,
  identify,
  track,
  trackError,
} from '@imtbl/metrics';
import { AuthConfiguration, IAuthConfiguration } from './config';
import {
  AuthModuleConfiguration,
  User,
  DirectLoginOptions,
  DeviceTokenResponse,
  LoginOptions,
  AuthEventMap,
  AuthEvents,
  UserZkEvm,
  OidcConfiguration,
  PassportMetadata,
  IdTokenPayload,
  isUserZkEvm,
} from './types';
import EmbeddedLoginPrompt from './login/embeddedLoginPrompt';
import TypedEventEmitter from './utils/typedEventEmitter';
import { withMetricsAsync } from './utils/metrics';
import { decodeJwtPayload } from './utils/jwt';
import DeviceCredentialsManager from './storage/device_credentials_manager';
import { PassportError, PassportErrorType, withPassportError } from './errors';
import logger from './utils/logger';
import { isAccessTokenExpiredOrExpiring } from './utils/token';
import LoginPopupOverlay from './overlay/loginPopupOverlay';
import { LocalForageAsyncStorage } from './storage/LocalForageAsyncStorage';

const LOGIN_POPUP_CLOSED_POLLING_DURATION = 500;
const formUrlEncodedHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

const parseJsonSafely = (text: string): unknown => {
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const extractTokenErrorMessage = (
  payload: unknown,
  fallbackText: string,
  status: number,
): string => {
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const description = data.error_description ?? data.message ?? data.error;
    if (typeof description === 'string' && description.trim().length > 0) {
      return description;
    }
  }
  if (fallbackText.trim().length > 0) {
    return fallbackText;
  }
  return `Token request failed with status ${status}`;
};

const logoutEndpoint = '/v2/logout';
const crossSdkBridgeLogoutEndpoint = '/im-logged-out';
const authorizeEndpoint = '/authorize';

const getLogoutEndpointPath = (crossSdkBridgeEnabled: boolean): string => (
  crossSdkBridgeEnabled ? crossSdkBridgeLogoutEndpoint : logoutEndpoint
);

const getAuthConfiguration = (config: IAuthConfiguration): UserManagerSettings => {
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

  const endSessionEndpoint = new URL(
    getLogoutEndpointPath(config.crossSdkBridgeEnabled),
    authenticationDomain.replace(/^(?:https?:\/\/)?(.*)/, 'https://$1'),
  );
  endSessionEndpoint.searchParams.set('client_id', oidcConfiguration.clientId);
  if (oidcConfiguration.logoutRedirectUri) {
    endSessionEndpoint.searchParams.set('returnTo', oidcConfiguration.logoutRedirectUri);
  }

  return {
    authority: authenticationDomain,
    redirect_uri: oidcConfiguration.redirectUri,
    popup_redirect_uri: oidcConfiguration.popupRedirectUri || oidcConfiguration.redirectUri,
    client_id: oidcConfiguration.clientId,
    metadata: {
      authorization_endpoint: `${authenticationDomain}/authorize`,
      token_endpoint: `${authenticationDomain}/oauth/token`,
      userinfo_endpoint: `${authenticationDomain}/userinfo`,
      end_session_endpoint: endSessionEndpoint.toString(),
      revocation_endpoint: `${authenticationDomain}/oauth/revoke`,
    },
    automaticSilentRenew: false,
    scope: oidcConfiguration.scope,
    userStore,
    revokeTokenTypes: ['refresh_token'],
    extraQueryParams: {
      ...(oidcConfiguration.audience ? { audience: oidcConfiguration.audience } : {}),
    },
  } as UserManagerSettings;
};

function base64URLEncode(str: ArrayBuffer | Uint8Array) {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function sha256(buffer: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(buffer);
  return window.crypto.subtle.digest('SHA-256', data);
}

/**
 * Public-facing Auth class for authentication
 * Provides login/logout helpers and exposes auth state events
 */
export class Auth {
  private readonly config: IAuthConfiguration;

  private readonly userManager: UserManager;

  private readonly deviceCredentialsManager: DeviceCredentialsManager;

  private readonly embeddedLoginPrompt: EmbeddedLoginPrompt;

  private readonly logoutMode: Exclude<OidcConfiguration['logoutMode'], undefined>;

  /**
   * Promise that is used to prevent multiple concurrent calls to the refresh token endpoint.
   */
  private refreshingPromise: Promise<User | null> | null = null;

  /**
   * Event emitter for authentication events (LOGGED_IN, LOGGED_OUT)
   * Exposed for wallet and passport packages to subscribe to auth state changes
   */
  public readonly eventEmitter: TypedEventEmitter<AuthEventMap>;

  /**
   * Create a new Auth instance
   *
   * @param config - Auth configuration
   *
   * @example
   * ```typescript
   * import { Auth } from '@imtbl/auth';
   *
   * const auth = new Auth({
   *   authenticationDomain: 'https://auth.immutable.com',
   *   passportDomain: 'https://passport.immutable.com',
   *   clientId: 'your-client-id',
   *   redirectUri: 'https://your-app.com/callback',
   *   scope: 'openid profile email transact',
   * });
   * ```
   */
  constructor(config: AuthModuleConfiguration) {
    this.config = new AuthConfiguration(config);
    this.embeddedLoginPrompt = new EmbeddedLoginPrompt(this.config);
    this.userManager = new UserManager(getAuthConfiguration(this.config));
    this.deviceCredentialsManager = new DeviceCredentialsManager();
    this.logoutMode = this.config.oidcConfiguration.logoutMode || 'redirect';
    this.eventEmitter = new TypedEventEmitter<AuthEventMap>();
    track('passport', 'initialise');
  }

  /**
   * Login the user with extended options
   * Supports cached sessions, silent login, redirect flow, and direct login
   * @param options - Extended login options
   * @returns Promise that resolves with the user or null
   */
  async login(options?: LoginOptions): Promise<User | null> {
    return withMetricsAsync(async () => {
      const { useCachedSession = false, useSilentLogin } = options || {};
      let user: User | null = null;

      // Try to get cached user
      try {
        user = await this.getUserInternal();
      } catch (error: any) {
        if (error instanceof Error && !error.message.includes('Unknown or invalid refresh token')) {
          trackError('passport', 'login', error);
        }
        if (useCachedSession) {
          throw error;
        }
        logger.warn('Failed to retrieve a cached user session', error);
      }

      // If no cached user, try silent login or regular login
      if (!user && useSilentLogin) {
        user = await this.forceUserRefreshInternal();
      } else if (!user && !useCachedSession) {
        if (options?.useRedirectFlow) {
          await this.loginWithRedirectInternal(options?.directLoginOptions);
          return null; // Redirect doesn't return user immediately
        }
        user = await this.loginWithPopup(options?.directLoginOptions);
      }

      // Emit LOGGED_IN event and identify user if logged in
      if (user) {
        this.handleSuccessfulLogin(user);
      }

      return user;
    }, 'login');
  }

  /**
   * Login with redirect
   * Redirects the page for authentication
   * @param directLoginOptions - Optional direct login options
   * @returns Promise that resolves when redirect is initiated
   */
  async loginWithRedirect(directLoginOptions?: DirectLoginOptions): Promise<void> {
    await this.loginWithRedirectInternal(directLoginOptions);
  }

  /**
   * Login callback handler
   * Call this in your redirect or popup callback page
   * @returns Promise that resolves with the authenticated user or undefined (for popup flows)
   */
  async loginCallback(): Promise<User | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.loginCallbackInternal();
      if (user) {
        this.handleSuccessfulLogin(user);
      }
      return user;
    }, 'loginCallback');
  }

  /**
   * Logout the current user
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await withMetricsAsync(async () => {
      await this.logoutInternal();
      this.eventEmitter.emit(AuthEvents.LOGGED_OUT);
    }, 'logout');
  }

  /**
   * Get the current authenticated user
   * @returns Promise that resolves with the user or null if not authenticated
   */
  async getUser(): Promise<User | null> {
    return this.getUserInternal();
  }

  /**
   * Get the current authenticated user or initiate login if needed
   * @returns Promise that resolves with an authenticated user
   */
  async getUserOrLogin(): Promise<User> {
    let user: User | null = null;
    try {
      user = await this.getUserInternal();
    } catch (err) {
      logger.warn('Failed to retrieve a cached user session', err);
    }

    if (user) {
      return user;
    }

    const loggedInUser = await this.loginWithPopup();
    this.handleSuccessfulLogin(loggedInUser);
    return loggedInUser;
  }

  /**
   * Get the current authenticated zkEVM user
   * @returns Promise that resolves with a zkEVM-capable user
   */
  async getUserZkEvm(): Promise<UserZkEvm> {
    return this.getUserZkEvmInternal();
  }

  /**
   * Get the ID token for the current user
   * @returns Promise that resolves with the ID token or undefined
   */
  async getIdToken(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.getUserInternal();
      return user?.idToken;
    }, 'getIdToken', false);
  }

  /**
   * Get the access token for the current user
   * @returns Promise that resolves with the access token or undefined
   */
  async getAccessToken(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      const user = await this.getUserInternal();
      return user?.accessToken;
    }, 'getAccessToken', false, false);
  }

  /**
   * Check if user is logged in
   * @returns Promise that resolves with true if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null;
  }

  /**
   * Force a silent user refresh (for silent login)
   * @returns Promise that resolves with the user or null if refresh fails
   */
  async forceUserRefresh(): Promise<User | null> {
    return this.forceUserRefreshInternal();
  }

  /**
   * Trigger a background user refresh without awaiting the result
   */
  forceUserRefreshInBackground(): void {
    this.forceUserRefreshInBackgroundInternal();
  }

  /**
   * Get the PKCE authorization URL for login flow
   * @param directLoginOptions - Optional direct login options
   * @param imPassportTraceId - Optional trace ID for tracking
   * @returns Promise that resolves with the authorization URL
   */
  async loginWithPKCEFlow(directLoginOptions?: DirectLoginOptions, imPassportTraceId?: string): Promise<string> {
    return withMetricsAsync(
      async () => this.getPKCEAuthorizationUrl(directLoginOptions, imPassportTraceId),
      'loginWithPKCEFlow',
    );
  }

  /**
   * Handle the PKCE login callback
   * @param authorizationCode - The authorization code from the OAuth provider
   * @param state - The state parameter for CSRF protection
   * @returns Promise that resolves with the authenticated user
   */
  async loginWithPKCEFlowCallback(authorizationCode: string, state: string): Promise<User> {
    return withMetricsAsync(async () => {
      const user = await this.loginWithPKCEFlowCallbackInternal(authorizationCode, state);
      this.handleSuccessfulLogin(user);
      return user;
    }, 'loginWithPKCEFlowCallback');
  }

  /**
   * Store tokens from device flow and retrieve user
   * @param tokenResponse - The token response from device flow
   * @returns Promise that resolves with the authenticated user
   */
  async storeTokens(tokenResponse: DeviceTokenResponse): Promise<User> {
    return withMetricsAsync(async () => {
      const user = await this.storeTokensInternal(tokenResponse);
      this.handleSuccessfulLogin(user);
      return user;
    }, 'storeTokens');
  }

  /**
   * Get the logout URL
   * @returns Promise that resolves with the logout URL or undefined if not available
   */
  async getLogoutUrl(): Promise<string | undefined> {
    return withMetricsAsync(async () => {
      await this.userManager.removeUser();
      this.eventEmitter.emit(AuthEvents.LOGGED_OUT);
      const url = await this.getLogoutUrlInternal();
      return url || undefined;
    }, 'getLogoutUrl');
  }

  /**
   * Handle the silent logout callback
   * @param url - The URL containing logout information
   * @returns Promise that resolves when callback is handled
   */
  async logoutSilentCallback(url: string): Promise<void> {
    return withMetricsAsync(() => this.userManager.signoutSilentCallback(url), 'logoutSilentCallback');
  }

  /**
   * Get auth configuration
   * @internal
   * @returns IAuthConfiguration instance
   */
  getConfig(): IAuthConfiguration {
    return this.config;
  }

  /**
   * Get the configured OIDC client ID
   * @returns Promise that resolves with the client ID string
   */
  async getClientId(): Promise<string> {
    return this.config.oidcConfiguration.clientId;
  }

  private handleSuccessfulLogin(user: User): void {
    this.eventEmitter.emit(AuthEvents.LOGGED_IN, user);
    identify({ passportId: user.profile.sub });
  }

  private buildExtraQueryParams(
    directLoginOptions?: DirectLoginOptions,
    imPassportTraceId?: string,
  ): Record<string, string> {
    const params: Record<string, string> = {
      ...(this.userManager.settings?.extraQueryParams ?? {}),
      rid: getDetail(Detail.RUNTIME_ID) || '',
    };

    if (directLoginOptions) {
      if (directLoginOptions.directLoginMethod === 'email') {
        const emailValue = directLoginOptions.email;
        if (emailValue) {
          params.direct = directLoginOptions.directLoginMethod;
          params.email = emailValue;
        }
      } else {
        params.direct = directLoginOptions.directLoginMethod;
      }
      if (directLoginOptions.marketingConsentStatus) {
        params.marketingConsent = directLoginOptions.marketingConsentStatus;
      }
    }

    if (imPassportTraceId) {
      params.im_passport_trace_id = imPassportTraceId;
    }

    return params;
  }

  private async loginWithRedirectInternal(directLoginOptions?: DirectLoginOptions): Promise<void> {
    await this.userManager.clearStaleState();
    await withPassportError<void>(async () => {
      const extraQueryParams = this.buildExtraQueryParams(directLoginOptions);
      await this.userManager.signinRedirect({ extraQueryParams });
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  private async loginWithPopup(directLoginOptions?: DirectLoginOptions): Promise<User> {
    return withPassportError<User>(async () => {
      let directLoginOptionsToUse: DirectLoginOptions | undefined;
      let imPassportTraceId: string | undefined;
      if (directLoginOptions) {
        directLoginOptionsToUse = directLoginOptions;
      } else if (!this.config.popupOverlayOptions?.disableHeadlessLoginPromptOverlay) {
        const {
          imPassportTraceId: embeddedLoginPromptTraceId,
          ...embeddedLoginPromptDirectLoginOptions
        } = await this.embeddedLoginPrompt.displayEmbeddedLoginPrompt();
        directLoginOptionsToUse = embeddedLoginPromptDirectLoginOptions;
        imPassportTraceId = embeddedLoginPromptTraceId;
      }

      const popupWindowTarget = window.crypto.randomUUID();
      const signinPopup = async () => {
        const extraQueryParams = this.buildExtraQueryParams(directLoginOptionsToUse, imPassportTraceId);

        const userPromise = this.userManager.signinPopup({
          extraQueryParams,
          popupWindowFeatures: {
            width: 410,
            height: 450,
          },
          popupWindowTarget,
          // Enable oidc-client-ts native popup close detection (works for initial screen)
          popupAbortOnClose: true,
        });

        // Additional polling workaround to detect popup closure during navigation
        // (e.g., when user navigates to third-party login, passwordless, or captcha screens)
        // This complements oidc-client-ts native detection which only checks once at start
        const popupRef = window.open('', popupWindowTarget);
        if (popupRef) {
          // Create a promise that rejects when popup is closed
          const popupClosedPromise = new Promise<never>((_, reject) => {
            const timer = setInterval(() => {
              if (popupRef.closed) {
                clearInterval(timer);
                reject(new Error('Popup closed by user'));
              }
            }, LOGIN_POPUP_CLOSED_POLLING_DURATION);

            // Clean up timer when the user promise resolves/rejects
            userPromise.finally(() => {
              clearInterval(timer);
              popupRef.close();
            });
          });

          // Race between user authentication and popup being closed
          return Promise.race([userPromise, popupClosedPromise]);
        }

        return userPromise;
      };

      return new Promise((resolve, reject) => {
        signinPopup()
          .then((oidcUser) => resolve(Auth.mapOidcUserToDomainModel(oidcUser)))
          .catch((error: unknown) => {
            if (!(error instanceof Error) || error.message !== 'Attempted to navigate on a disposed window') {
              reject(error);
              return;
            }

            let popupHasBeenOpened = false;
            const overlay = new LoginPopupOverlay(this.config.popupOverlayOptions || {}, true);
            overlay.append(
              async () => {
                try {
                  if (!popupHasBeenOpened) {
                    popupHasBeenOpened = true;
                    const oidcUser = await signinPopup();
                    overlay.remove();
                    resolve(Auth.mapOidcUserToDomainModel(oidcUser));
                  } else {
                    window.open('', popupWindowTarget);
                  }
                } catch (retryError) {
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

  private static mapOidcUserToDomainModel = (oidcUser: OidcUser): User => {
    let passport: PassportMetadata | undefined;
    let username: string | undefined;
    if (oidcUser.id_token) {
      const idTokenPayload = decodeJwtPayload<IdTokenPayload>(oidcUser.id_token);
      passport = idTokenPayload?.passport;
      if (idTokenPayload?.username) {
        username = idTokenPayload?.username;
      }
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
        username,
      },
    };
    if (passport?.zkevm_eth_address && passport?.zkevm_user_admin_address) {
      user.zkEvm = {
        ethAddress: passport.zkevm_eth_address,
        userAdminAddress: passport.zkevm_user_admin_address,
      };
    }
    return user;
  };

  private static mapDeviceTokenResponseToOidcUser = (tokenResponse: DeviceTokenResponse): OidcUser => {
    const idTokenPayload: IdTokenPayload = decodeJwtPayload(tokenResponse.id_token);
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
        ...(idTokenPayload.username ? { username: idTokenPayload.username } : {}),
      },
    });
  };

  private async loginCallbackInternal(): Promise<User | undefined> {
    return withPassportError(async () => {
      const oidcUser = await this.userManager.signinCallback();
      if (!oidcUser) {
        return undefined;
      }
      return Auth.mapOidcUserToDomainModel(oidcUser);
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  private async getPKCEAuthorizationUrl(
    directLoginOptions?: DirectLoginOptions,
    imPassportTraceId?: string,
  ): Promise<string> {
    const verifier = base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64URLEncode(await sha256(verifier));
    const state = base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)));

    const {
      redirectUri, scope, audience, clientId,
    } = this.config.oidcConfiguration;

    this.deviceCredentialsManager.savePKCEData({ state, verifier });

    const pkceAuthorizationUrl = new URL(authorizeEndpoint, this.config.authenticationDomain);
    pkceAuthorizationUrl.searchParams.set('response_type', 'code');
    pkceAuthorizationUrl.searchParams.set('code_challenge', challenge);
    pkceAuthorizationUrl.searchParams.set('code_challenge_method', 'S256');
    pkceAuthorizationUrl.searchParams.set('client_id', clientId);
    pkceAuthorizationUrl.searchParams.set('redirect_uri', redirectUri);
    pkceAuthorizationUrl.searchParams.set('state', state);

    if (scope) pkceAuthorizationUrl.searchParams.set('scope', scope);
    if (audience) pkceAuthorizationUrl.searchParams.set('audience', audience);

    if (directLoginOptions) {
      if (directLoginOptions.directLoginMethod === 'email') {
        const emailValue = directLoginOptions.email;
        if (emailValue) {
          pkceAuthorizationUrl.searchParams.set('direct', directLoginOptions.directLoginMethod);
          pkceAuthorizationUrl.searchParams.set('email', emailValue);
        }
      } else {
        pkceAuthorizationUrl.searchParams.set('direct', directLoginOptions.directLoginMethod);
      }
      if (directLoginOptions.marketingConsentStatus) {
        pkceAuthorizationUrl.searchParams.set('marketingConsent', directLoginOptions.marketingConsentStatus);
      }
    }

    if (imPassportTraceId) {
      pkceAuthorizationUrl.searchParams.set('im_passport_trace_id', imPassportTraceId);
    }

    return pkceAuthorizationUrl.toString();
  }

  private async loginWithPKCEFlowCallbackInternal(authorizationCode: string, state: string): Promise<User> {
    return withPassportError(async () => {
      const pkceData = this.deviceCredentialsManager.getPKCEData();
      if (!pkceData) {
        throw new Error('No code verifier or state for PKCE');
      }

      if (state !== pkceData.state) {
        throw new Error('Provided state does not match stored state');
      }

      const tokenResponse = await this.getPKCEToken(authorizationCode, pkceData.verifier);
      const oidcUser = Auth.mapDeviceTokenResponseToOidcUser(tokenResponse);
      const user = Auth.mapOidcUserToDomainModel(oidcUser);
      await this.userManager.storeUser(oidcUser);

      return user;
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  private async getPKCEToken(authorizationCode: string, codeVerifier: string): Promise<DeviceTokenResponse> {
    const response = await fetch(
      `${this.config.authenticationDomain}/oauth/token`,
      {
        method: 'POST',
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: this.config.oidcConfiguration.clientId,
          grant_type: 'authorization_code',
          code_verifier: codeVerifier,
          code: authorizationCode,
          redirect_uri: this.config.oidcConfiguration.redirectUri,
        }),
      },
    );

    const responseText = await response.text();
    const parsedBody = parseJsonSafely(responseText);

    if (!response.ok) {
      throw new Error(
        extractTokenErrorMessage(
          parsedBody,
          responseText,
          response.status,
        ),
      );
    }

    if (!parsedBody || typeof parsedBody !== 'object') {
      throw new Error('Token endpoint returned an invalid response');
    }

    return parsedBody as DeviceTokenResponse;
  }

  private async storeTokensInternal(tokenResponse: DeviceTokenResponse): Promise<User> {
    return withPassportError(async () => {
      const oidcUser = Auth.mapDeviceTokenResponseToOidcUser(tokenResponse);
      const user = Auth.mapOidcUserToDomainModel(oidcUser);
      await this.userManager.storeUser(oidcUser);
      return user;
    }, PassportErrorType.AUTHENTICATION_ERROR);
  }

  private async logoutInternal(): Promise<void> {
    await withPassportError(async () => {
      await this.userManager.revokeTokens(['refresh_token']);
      if (this.logoutMode === 'silent') {
        await this.userManager.signoutSilent();
      } else {
        await this.userManager.signoutRedirect();
      }
    }, PassportErrorType.LOGOUT_ERROR);
  }

  private async getLogoutUrlInternal(): Promise<string | null> {
    const endSessionEndpoint = this.userManager.settings?.metadata?.end_session_endpoint;
    if (!endSessionEndpoint) {
      logger.warn('Failed to get logout URL');
      return null;
    }
    return endSessionEndpoint;
  }

  private forceUserRefreshInBackgroundInternal() {
    this.refreshTokenAndUpdatePromise().catch((error) => {
      logger.warn('Failed to refresh user token', error);
    });
  }

  private async forceUserRefreshInternal(): Promise<User | null> {
    return this.refreshTokenAndUpdatePromise().catch((error) => {
      logger.warn('Failed to refresh user token', error);
      return null;
    });
  }

  private async refreshTokenAndUpdatePromise(): Promise<User | null> {
    if (this.refreshingPromise) {
      return this.refreshingPromise;
    }

    this.refreshingPromise = new Promise((resolve, reject) => {
      (async () => {
        try {
          const newOidcUser = await this.userManager.signinSilent();
          if (newOidcUser) {
            resolve(Auth.mapOidcUserToDomainModel(newOidcUser));
            return;
          }
          resolve(null);
        } catch (err) {
          let passportErrorType = PassportErrorType.AUTHENTICATION_ERROR;
          let errorMessage = 'Failed to refresh token';
          let removeUser = true;

          if (err instanceof ErrorTimeout) {
            passportErrorType = PassportErrorType.SILENT_LOGIN_ERROR;
            errorMessage = `${errorMessage}: ${err.message}`;
            removeUser = false;
          } else if (err instanceof ErrorResponse) {
            passportErrorType = PassportErrorType.NOT_LOGGED_IN_ERROR;
            errorMessage = `${errorMessage}: ${err.message || err.error_description}`;
          } else if (err instanceof Error) {
            errorMessage = `${errorMessage}: ${err.message}`;
          } else if (typeof err === 'string') {
            errorMessage = `${errorMessage}: ${err}`;
          }

          if (removeUser) {
            try {
              await this.userManager.removeUser();
            } catch (removeUserError) {
              if (removeUserError instanceof Error) {
                errorMessage = `${errorMessage}: Failed to remove user: ${removeUserError.message}`;
              }
            }
          }

          reject(new PassportError(errorMessage, passportErrorType));
        } finally {
          this.refreshingPromise = null;
        }
      })();
    });

    return this.refreshingPromise;
  }

  private async getUserInternal<T extends User>(
    typeAssertion: (user: User) => user is T = (user: User): user is T => true,
  ): Promise<T | null> {
    if (this.refreshingPromise) {
      const refreshingUser = await this.refreshingPromise;
      if (refreshingUser && typeAssertion(refreshingUser)) {
        return refreshingUser;
      }
      return null;
    }

    const oidcUser = await this.userManager.getUser();
    if (!oidcUser) return null;

    if (!isAccessTokenExpiredOrExpiring(oidcUser)) {
      const user = Auth.mapOidcUserToDomainModel(oidcUser);
      if (user && typeAssertion(user)) {
        return user;
      }
    }

    if (oidcUser.refresh_token) {
      const refreshedUser = await this.refreshTokenAndUpdatePromise();
      if (refreshedUser && typeAssertion(refreshedUser)) {
        return refreshedUser;
      }
    }

    return null;
  }

  private async getUserZkEvmInternal(): Promise<UserZkEvm> {
    const user = await this.getUserInternal(isUserZkEvm);
    if (!user) {
      throw new Error('Failed to obtain a User with the required ZkEvm attributes');
    }
    return user;
  }
}
