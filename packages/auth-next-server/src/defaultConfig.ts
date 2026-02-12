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
 * Client-side: checks if the hostname includes 'sandbox' or 'localhost'.
 * Server-side: uses NODE_ENV === 'development' as fallback so server and client
 * use the same sandbox client ID when running locally (e.g. `next dev`).
 *
 * @returns true if in sandbox environment, false otherwise
 */
export function isSandboxEnvironment(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: NODE_ENV is set by Next.js (development in `next dev`, production in `next build` + `next start`)
    return process.env.NODE_ENV === 'development';
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
