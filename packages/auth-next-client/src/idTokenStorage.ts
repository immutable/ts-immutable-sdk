/**
 * Utility for persisting idToken in localStorage.
 *
 * The idToken is stripped from the NextAuth session cookie (via a custom
 * jwt.encode in @imtbl/auth-next-server) to keep cookie size under CDN header
 * limits (CloudFront 20 KB). Instead, the client stores idToken in
 * localStorage so that wallet operations (e.g., MagicTEESigner) can still
 * access it via getUser().
 *
 * All functions are safe to call during SSR or in restricted environments
 * (e.g., incognito mode with localStorage disabled) -- they silently no-op.
 */

const ID_TOKEN_STORAGE_KEY = 'imtbl_id_token';

/**
 * Store the idToken in localStorage.
 * @param idToken - The raw ID token JWT string
 */
export function storeIdToken(idToken: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ID_TOKEN_STORAGE_KEY, idToken);
    }
  } catch {
    // Silently ignore -- localStorage may be unavailable (SSR, incognito, etc.)
  }
}

/**
 * Retrieve the idToken from localStorage.
 * @returns The stored idToken, or undefined if not available.
 */
export function getStoredIdToken(): string | undefined {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(ID_TOKEN_STORAGE_KEY) ?? undefined;
    }
  } catch {
    // Silently ignore
  }
  return undefined;
}

/**
 * Remove the idToken from localStorage (e.g., on logout).
 */
export function clearStoredIdToken(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ID_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Silently ignore
  }
}
