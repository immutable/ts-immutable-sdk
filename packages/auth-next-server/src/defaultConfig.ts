/**
 * Sandbox default configuration for zero-config mode.
 * When createAuthConfig() is called with no args, these values are used.
 * Used by auth-next-server (config) and auth-next-client (hooks).
 *
 * @internal
 */

import { DEFAULT_REDIRECT_URI_PATH } from './constants';

/**
 * Sandbox default redirect URI for zero-config mode.
 * Server: path only. Client: full URL (origin + path).
 *
 * @returns Redirect URI path or full URL
 */
export function deriveDefaultRedirectUri(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_REDIRECT_URI_PATH;
  }

  return `${window.location.origin}${DEFAULT_REDIRECT_URI_PATH}`;
}
