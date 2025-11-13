import {
  UserManager,
  UserManagerSettings,
  User,
  WebStorageStateStore,
  InMemoryWebStorage,
} from 'oidc-client-ts';

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
 * OAuth-based authentication client for Immutable Passport
 */
export class Auth {
  private userManager: UserManager;

  constructor(config: AuthConfig) {
    if (!config.clientId) {
      throw new Error('clientId is required');
    }
    if (!config.redirectUri) {
      throw new Error('redirectUri is required');
    }

    this.userManager = new UserManager(buildUserManagerSettings(config));
  }

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
      // Return null if popup was closed by user
      if (error instanceof Error && error.message.includes('Popup closed')) {
        return null;
      }
      throw error;
    }
  }

  async loginRedirect(options?: LoginOptions): Promise<void> {
    await this.userManager.clearStaleState();

    const extraQueryParams = buildExtraQueryParams(options);
    await this.userManager.signinRedirect({ extraQueryParams });
  }

  async handleRedirect(): Promise<User | null> {
    const oidcUser = await this.userManager.signinCallback();
    return oidcUser || null;
  }

  async getUser(): Promise<User | null> {
    try {
      const oidcUser = await this.userManager.getUser();
      if (!oidcUser || oidcUser.expired) {
        return null;
      }
      return oidcUser;
    } catch (error) {
      if (error instanceof Error && error.message.includes('user not found')) {
        return null;
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.userManager.signoutRedirect();
  }

  async logoutSilent(): Promise<void> {
    await this.userManager.signoutSilent();
  }

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
