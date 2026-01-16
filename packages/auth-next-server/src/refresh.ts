import { TOKEN_EXPIRY_BUFFER_SECONDS } from './constants';

/**
 * Check if the access token is expired or about to expire
 * Returns true if token expires within the buffer time (default 60 seconds)
 *
 * @remarks
 * If accessTokenExpires is not a valid number (undefined, null, NaN),
 * returns true to trigger a refresh as a safety measure.
 */
export function isTokenExpired(
  accessTokenExpires: number,
  bufferSeconds: number = TOKEN_EXPIRY_BUFFER_SECONDS,
): boolean {
  // If accessTokenExpires is invalid (not a number or NaN), treat as expired
  // This prevents NaN comparisons from incorrectly returning false
  if (typeof accessTokenExpires !== 'number' || Number.isNaN(accessTokenExpires)) {
    return true;
  }
  return Date.now() >= accessTokenExpires - bufferSeconds * 1000;
}
