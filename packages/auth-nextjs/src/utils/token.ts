import { decodeJwtPayload } from '@imtbl/auth';
import { DEFAULT_TOKEN_EXPIRY_MS } from '../constants';

/**
 * JWT payload with expiry claim
 */
interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Extract the expiry timestamp from a JWT access token.
 * Returns the expiry as a Unix timestamp in milliseconds.
 *
 * @param accessToken - JWT access token
 * @returns Expiry timestamp in milliseconds, or a default 15-minute expiry if extraction fails
 */
export function getTokenExpiry(accessToken: string | undefined): number {
  if (!accessToken) {
    return Date.now() + DEFAULT_TOKEN_EXPIRY_MS;
  }

  try {
    const payload = decodeJwtPayload<JwtPayload>(accessToken);

    if (payload.exp && typeof payload.exp === 'number') {
      // JWT exp is in seconds, convert to milliseconds
      return payload.exp * 1000;
    }

    // No exp claim, fall back to default
    return Date.now() + DEFAULT_TOKEN_EXPIRY_MS;
  } catch {
    // Failed to decode token, fall back to default
    return Date.now() + DEFAULT_TOKEN_EXPIRY_MS;
  }
}
