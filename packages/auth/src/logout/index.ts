/**
 * Internal logout utilities shared between Auth class and standalone functions.
 * NOT exported from package index - only used internally.
 */

const LOGOUT_ENDPOINT = '/v2/logout';
const CROSS_SDK_BRIDGE_LOGOUT_ENDPOINT = '/im-logged-out';
const DEFAULT_AUTH_DOMAIN = 'https://auth.immutable.com';

/**
 * Internal config for building logout URLs.
 * Includes crossSdkBridgeEnabled for Auth class (Passport SDK).
 * NOT exported publicly from the package.
 */
export interface InternalLogoutConfig {
  /** The client ID for the application */
  clientId: string;
  /** The authentication domain (defaults to https://auth.immutable.com) */
  authenticationDomain?: string;
  /** The URI to redirect to after logout */
  logoutRedirectUri?: string;
  /** Whether cross-SDK bridge is enabled (internal to Auth class) */
  crossSdkBridgeEnabled?: boolean;
}

/**
 * Normalize authentication domain to ensure https:// prefix.
 */
function normalizeAuthDomain(domain: string): string {
  return domain.replace(/^(?:https?:\/\/)?(.*)/, 'https://$1');
}

/**
 * Build logout URL for federated logout.
 * Used by both Auth class (with crossSdkBridgeEnabled) and standalone functions.
 *
 * @param config - Configuration for building the logout URL
 * @returns The complete logout URL string
 */
export function buildLogoutUrl(config: InternalLogoutConfig): string {
  const authDomain = normalizeAuthDomain(config.authenticationDomain || DEFAULT_AUTH_DOMAIN);
  const endpoint = config.crossSdkBridgeEnabled
    ? CROSS_SDK_BRIDGE_LOGOUT_ENDPOINT
    : LOGOUT_ENDPOINT;

  const url = new URL(endpoint, authDomain);
  url.searchParams.set('client_id', config.clientId);
  if (config.logoutRedirectUri) {
    url.searchParams.set('returnTo', config.logoutRedirectUri);
  }
  return url.toString();
}
