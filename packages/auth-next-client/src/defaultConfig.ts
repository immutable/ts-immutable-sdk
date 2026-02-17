/**
 * Sandbox default redirect URI for zero-config mode.
 * Defined locally to avoid importing from auth-next-server (which uses next/server).
 * OAuth requires an absolute URL; this runs in the browser when login is invoked.
 *
 * @internal
 */

import { DEFAULT_REDIRECT_URI_PATH } from './constants';

export function deriveDefaultRedirectUri(): string {
  if (typeof window === 'undefined') {
    throw new Error(
      '[auth-next-client] deriveDefaultRedirectUri requires window. '
      + 'Login hooks run in the browser when the user triggers login.',
    );
  }
  return `${window.location.origin}${DEFAULT_REDIRECT_URI_PATH}`;
}
