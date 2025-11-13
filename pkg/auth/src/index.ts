/**
 * @imtbl/auth - Minimal authentication package
 * 
 * Provides OAuth-based authentication for Immutable Passport.
 * Can be used standalone or passed to wallet/Passport clients for enhanced functionality.
 */

import {
  UserManager,
  UserManagerSettings,
  User,
  WebStorageStateStore,
  InMemoryWebStorage,
} from 'oidc-client-ts';

// Re-export User from oidc-client-ts as the main User type
export type { User } from 'oidc-client-ts';

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** OAuth client ID (required) */
  clientId: string;
  /** OAuth redirect URI */
  redirectUri: string;
  /** Optional popup redirect URI (defaults to redirectUri) */
  popupRedirectUri?: string;
  /** Optional logout redirect URI */
  logoutRedirectUri?: string;
  /** OAuth scope (defaults to 'openid profile email') */
  scope?: string;
}

/**
 * Login options
 */
export interface LoginOptions {
  /** Direct login method (e.g., 'google', 'apple', 'email') */
  directLoginMethod?: string;
  /** Email address (required when directLoginMethod is 'email') */
  email?: string;
  /** Marketing consent status */
  marketingConsent?: 'opted_in' | 'unsubscribed';
}

/**
 * Builds UserManagerSettings from AuthConfig
 */
function buildUserManagerSettings(config: AuthConfig): UserManagerSettings {
  const authDomain = 'https://auth.immutable.com';
  
  // Use localStorage in browser, InMemoryWebStorage for SSR
  const store: Storage = typeof window !== 'undefined' 
    ? window.localStorage 
    : new InMemoryWebStorage();
  
  const userStore = new WebStorageStateStore({ store });

  // Build logout endpoint
  const logoutEndpoint = '/v2/logout';
  const endSessionEndpoint = new URL(logoutEndpoint, authDomain.replace(/^(?:https?:\/\/)?(.*)/, 'https://$1'));
  endSessionEndpoint.searchParams.set('client_id', config.clientId);
  if (config.logoutRedirectUri) {
    endSessionEndpoint.searchParams.set('returnTo', config.logoutRedirectUri);
  }

  const settings: UserManagerSettings = {
    authority: authDomain,
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    popup_redirect_uri: config.popupRedirectUri || config.redirectUri,
    scope: config.scope || 'openid profile email',
    userStore,
    metadata: {
      authorization_endpoint: `${authDomain}/authorize`,
      token_endpoint: `${authDomain}/oauth/token`,
      userinfo_endpoint: `${authDomain}/userinfo`,
      end_session_endpoint: endSessionEndpoint.toString(),
      revocation_endpoint: `${authDomain}/oauth/revoke`,
    },
    mergeClaimsStrategy: { array: 'merge' },
    automaticSilentRenew: false,
    revokeTokenTypes: ['refresh_token'],
    extraQueryParams: { audience: 'platform_api' },
  };

  return settings;
}

/**
 * Builds extra query parameters for login
 */
function buildExtraQueryParams(options?: LoginOptions): Record<string, string> {
  const params: Record<string, string> = {};

  if (options?.directLoginMethod) {
    params.direct = options.directLoginMethod;
    if (options.directLoginMethod === 'email' && options.email) {
      params.email = options.email;
    }
  }

  if (options?.marketingConsent) {
    params.marketingConsent = options.marketingConsent;
  }

  return params;
}

/**
 * Minimal authentication client
 *
 * @example
 * ```typescript
 * import { Auth } from '@imtbl/auth';
 *
 * const auth = new Auth({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback'
 * });
 *
 * // Login with popup
 * const user = await auth.loginPopup();
 * console.log(user?.profile.email);
 *
 * // Or login with redirect
 * await auth.loginRedirect();
 * // Then on callback page:
 * const user = await auth.handleRedirect();
 * ```
 */
export class Auth {
  private userManager: UserManager;

  /**
   * Creates a new Auth instance
   */
  constructor(config: AuthConfig) {
    if (!config.clientId) {
      throw new Error('clientId is required');
    }
    if (!config.redirectUri) {
      throw new Error('redirectUri is required');
    }

    this.userManager = new UserManager(buildUserManagerSettings(config));
  }

  /**
   * Initiates login with popup window
   * @param options Optional login options
   * @returns Promise resolving to User, or null if cancelled
   */
  async loginPopup(options?: LoginOptions): Promise<User | null> {
    try {
      await this.userManager.clearStaleState();

      const extraQueryParams = buildExtraQueryParams(options);
      const oidcUser = await this.userManager.signinPopup({
        extraQueryParams,
        popupWindowFeatures: {
          width: 410,
          height: 450,
        },
      });

      return oidcUser;
    } catch (error) {
      // Return null if popup was closed by user, otherwise pass through error
      if (error instanceof Error && error.message.includes('Popup closed')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Initiates login with redirect
   * @param options Optional login options
   */
  async loginRedirect(options?: LoginOptions): Promise<void> {
    await this.userManager.clearStaleState();

    const extraQueryParams = buildExtraQueryParams(options);
    await this.userManager.signinRedirect({ extraQueryParams });
  }

  /**
   * Handles OAuth callback after redirect
   * Call this on your callback page after loginRedirect()
   * @returns Promise resolving to User, or null if no user
   */
  async handleRedirect(): Promise<User | null> {
    const oidcUser = await this.userManager.signinCallback();
    return oidcUser || null;
  }

  /**
   * Gets the current authenticated user
   * @returns Promise resolving to User, or null if not authenticated
   */
  async getUser(): Promise<User | null> {
    try {
      const oidcUser = await this.userManager.getUser();
      if (!oidcUser || oidcUser.expired) {
        return null;
      }
      return oidcUser;
    } catch (error) {
      // If user not found, return null (not an error)
      if (error instanceof Error && error.message.includes('user not found')) {
        return null;
      }
      // Pass through other errors - they're already well-formed
      throw error;
    }
  }

  /**
   * Logs out the current user
   */
  async logout(): Promise<void> {
    // Pass through errors - oidc-client-ts errors are already clear
    await this.userManager.signoutRedirect();
  }

  /**
   * Logs out silently (without redirect)
   */
  async logoutSilent(): Promise<void> {
    // Pass through errors - oidc-client-ts errors are already clear
    await this.userManager.signoutSilent();
  }

  /**
   * Refreshes the access token if expired
   * Called automatically by oidc-client-ts when needed, but can be called manually
   */
  async refreshToken(): Promise<void> {
    const oidcUser = await this.userManager.getUser();
    if (!oidcUser) {
      throw new Error('No user to refresh');
    }

    if (oidcUser.expired) {
      await this.userManager.signinSilent();
    }
  }
}
