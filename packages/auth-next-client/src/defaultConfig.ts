/**
 * Sandbox default redirect URI for zero-config mode.
 * Defined locally to avoid importing from auth-next-server (which uses next/server).
 * Server: path only. Client: full URL (origin + path).
 *
 * @internal
 */

import { DEFAULT_REDIRECT_URI_PATH } from './constants';

export function deriveDefaultRedirectUri(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_REDIRECT_URI_PATH;
  }
  return `${window.location.origin}${DEFAULT_REDIRECT_URI_PATH}`;
}
