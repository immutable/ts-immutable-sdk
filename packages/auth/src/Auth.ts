import AuthManager from './authManager';
import { AuthConfiguration, IAuthConfiguration } from './config';
import {
  AuthModuleConfiguration, User, DirectLoginOptions, DeviceTokenResponse, LoginOptions, AuthEventMap, AuthEvents,
} from './types';
import EmbeddedLoginPrompt from './login/embeddedLoginPrompt';
import TypedEventEmitter from './utils/typedEventEmitter';
import { identify, track } from '@imtbl/metrics';

/**
 * Public-facing Auth class for authentication
 * Wraps AuthManager with a simpler API
 */
export class Auth {
  private authManager: AuthManager;

  private config: IAuthConfiguration;

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
    const embeddedLoginPrompt = new EmbeddedLoginPrompt(this.config);
    this.authManager = new AuthManager(this.config, embeddedLoginPrompt);
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
    const { useCachedSession = false, useSilentLogin } = options || {};
    let user: User | null = null;

    // Try to get cached user
    try {
      user = await this.authManager.getUser();
    } catch (error: any) {
      if (useCachedSession) {
        throw error;
      }
      // Silently ignore errors if not requiring cached session
    }

    // If no cached user, try silent login or regular login
    if (!user && useSilentLogin) {
      user = await this.authManager.forceUserRefresh();
    }

    if (!user && !useCachedSession) {
      if (options?.useRedirectFlow) {
        await this.authManager.loginWithRedirect(options?.directLoginOptions);
        return null; // Redirect doesn't return user immediately
      }
      user = await this.authManager.login(options?.directLoginOptions);
    }

    // Emit LOGGED_IN event and identify user if logged in
    if (user) {
      this.eventEmitter.emit(AuthEvents.LOGGED_IN, user);
      identify({ passportId: user.profile.sub });
    }

    return user;
  }

  /**
   * Login with redirect
   * Redirects the page for authentication
   * @param directLoginOptions - Optional direct login options
   * @returns Promise that resolves when redirect is initiated
   */
  async loginWithRedirect(directLoginOptions?: DirectLoginOptions): Promise<void> {
    await this.authManager.loginWithRedirect(directLoginOptions);
  }

  /**
   * Login callback handler
   * Call this in your redirect URI page
   * @returns Promise that resolves with the authenticated user
   */
  async loginCallback(): Promise<User> {
    const user = await this.authManager.loginCallback();
    if (!user) {
      throw new Error('Login callback failed - no user returned');
    }
    this.eventEmitter.emit(AuthEvents.LOGGED_IN, user);
    identify({ passportId: user.profile.sub });
    return user;
  }

  /**
   * Logout the current user
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await this.authManager.logout();
    this.eventEmitter.emit(AuthEvents.LOGGED_OUT);
  }

  /**
   * Get the current authenticated user
   * @returns Promise that resolves with the user or null if not authenticated
   */
  async getUser(): Promise<User | null> {
    return this.authManager.getUser();
  }

  /**
   * Get the ID token for the current user
   * @returns Promise that resolves with the ID token or undefined
   */
  async getIdToken(): Promise<string | undefined> {
    const user = await this.authManager.getUser();
    return user?.idToken;
  }

  /**
   * Get the access token for the current user
   * @returns Promise that resolves with the access token or undefined
   */
  async getAccessToken(): Promise<string | undefined> {
    const user = await this.authManager.getUser();
    return user?.accessToken;
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
    return this.authManager.forceUserRefresh();
  }

  /**
   * Get the PKCE authorization URL for login flow
   * @param directLoginOptions - Optional direct login options
   * @param imPassportTraceId - Optional trace ID for tracking
   * @returns Promise that resolves with the authorization URL
   */
  async loginWithPKCEFlow(directLoginOptions?: DirectLoginOptions, imPassportTraceId?: string): Promise<string> {
    return this.authManager.getPKCEAuthorizationUrl(directLoginOptions, imPassportTraceId);
  }

  /**
   * Handle the PKCE login callback
   * @param authorizationCode - The authorization code from the OAuth provider
   * @param state - The state parameter for CSRF protection
   * @returns Promise that resolves with the authenticated user
   */
  async loginWithPKCEFlowCallback(authorizationCode: string, state: string): Promise<User> {
    const user = await this.authManager.loginWithPKCEFlowCallback(authorizationCode, state);
    this.eventEmitter.emit(AuthEvents.LOGGED_IN, user);
    identify({ passportId: user.profile.sub });
    return user;
  }

  /**
   * Store tokens from device flow and retrieve user
   * @param tokenResponse - The token response from device flow
   * @returns Promise that resolves with the authenticated user
   */
  async storeTokens(tokenResponse: DeviceTokenResponse): Promise<User> {
    const user = await this.authManager.storeTokens(tokenResponse);
    this.eventEmitter.emit(AuthEvents.LOGGED_IN, user);
    identify({ passportId: user.profile.sub });
    return user;
  }

  /**
   * Get the logout URL
   * @returns Promise that resolves with the logout URL or undefined if not available
   */
  async getLogoutUrl(): Promise<string | undefined> {
    await this.authManager.removeUser();
    this.eventEmitter.emit(AuthEvents.LOGGED_OUT);
    const url = await this.authManager.getLogoutUrl();
    return url || undefined;
  }

  /**
   * Handle the silent logout callback
   * @param url - The URL containing logout information
   * @returns Promise that resolves when callback is handled
   */
  async logoutSilentCallback(url: string): Promise<void> {
    return this.authManager.logoutSilentCallback(url);
  }

  /**
   * Get internal AuthManager instance
   * @internal
   * @returns AuthManager instance for advanced use cases
   */
  getAuthManager(): AuthManager {
    return this.authManager;
  }

  /**
   * Get auth configuration
   * @internal
   * @returns IAuthConfiguration instance
   */
  getConfig(): IAuthConfiguration {
    return this.config;
  }
}
