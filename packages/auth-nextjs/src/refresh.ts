import type { JWT } from 'next-auth/jwt';
import type { ImmutableAuthConfig } from './types';
import {
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_TOKEN_EXPIRY_SECONDS,
  TOKEN_EXPIRY_BUFFER_SECONDS,
} from './constants';

/**
 * Refresh the access token using the refresh token
 * Called by NextAuth JWT callback when token is expired
 */
export async function refreshAccessToken(
  token: JWT,
  config: ImmutableAuthConfig,
): Promise<JWT> {
  const authDomain = config.authenticationDomain || DEFAULT_AUTH_DOMAIN;

  if (!token.refreshToken) {
    return {
      ...token,
      error: 'NoRefreshToken',
    };
  }

  try {
    const response = await fetch(`${authDomain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        refresh_token: token.refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.error || 'Token refresh failed');
    }

    // Calculate expiry (access_token typically expires in 1 hour)
    const expiresIn = data.expires_in || DEFAULT_TOKEN_EXPIRY_SECONDS;
    const accessTokenExpires = Date.now() + expiresIn * 1000;

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      idToken: data.id_token ?? token.idToken,
      accessTokenExpires,
      error: undefined,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[auth-nextjs] Failed to refresh token:', error);
    return {
      ...token,
      error: 'RefreshTokenError',
    };
  }
}

/**
 * Check if the access token is expired or about to expire
 * Returns true if token expires within the buffer time (default 60 seconds)
 */
export function isTokenExpired(
  accessTokenExpires: number,
  bufferSeconds: number = TOKEN_EXPIRY_BUFFER_SECONDS,
): boolean {
  return Date.now() >= accessTokenExpires - bufferSeconds * 1000;
}
