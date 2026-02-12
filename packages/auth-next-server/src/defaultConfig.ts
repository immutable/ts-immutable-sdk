/**
 * Shared default configuration helpers for auth-next packages.
 * Used by both auth-next-server (config) and auth-next-client (hooks).
 *
 * @internal
 */

import {
  DEFAULT_PRODUCTION_CLIENT_ID,
  DEFAULT_SANDBOX_CLIENT_ID,
  DEFAULT_REDIRECT_URI_PATH,
} from './constants';

/**
 * Detect if we're in a sandbox/test environment based on the current URL.
 * Checks if the hostname includes 'sandbox' or 'localhost'.
 * Server-side safe: returns false if window is not available.
 *
 * @returns true if in sandbox environment, false otherwise
 */
export function isSandboxEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname.toLowerCase();
  return hostname.includes('sandbox') || hostname.includes('localhost');
}

/**
 * Derive the default clientId based on the environment.
 * Uses public Immutable client IDs for sandbox and production.
 *
 * @returns Default client ID for the current environment
 */
export function deriveDefaultClientId(): string {
  return isSandboxEnvironment() ? DEFAULT_SANDBOX_CLIENT_ID : DEFAULT_PRODUCTION_CLIENT_ID;
}

/**
 * Derive the default redirectUri based on the current URL.
 * Server-side safe: returns path only when window is undefined.
 *
 * @returns Default redirect URI
 */
export function deriveDefaultRedirectUri(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_REDIRECT_URI_PATH;
  }

  return `${window.location.origin}${DEFAULT_REDIRECT_URI_PATH}`;
}
