/**
 * Shared default configuration helpers for auth-next packages.
 * Used by both auth-next-server (config) and auth-next-client (hooks).
 *
 * @internal
 */

import {
  DEFAULT_SANDBOX_CLIENT_ID,
  DEFAULT_REDIRECT_URI_PATH,
} from './constants';

/**
 * Default client ID for zero-config mode.
 * When no config is provided, we always use sandbox to avoid conflicts.
 * Policy: provide nothing → full sandbox; provide config → provide everything.
 *
 * @returns Sandbox client ID (used when createAuthConfig is called with no args)
 */
export function deriveDefaultClientId(): string {
  return DEFAULT_SANDBOX_CLIENT_ID;
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
