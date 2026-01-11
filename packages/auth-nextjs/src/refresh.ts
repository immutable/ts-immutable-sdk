import type { JWT } from 'next-auth/jwt';
import type { ImmutableAuthConfig } from './types';
import {
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_TOKEN_EXPIRY_SECONDS,
  TOKEN_EXPIRY_BUFFER_SECONDS,
} from './constants';

/**
 * Map of pending refresh promises keyed by refresh token.
 * Used to deduplicate concurrent refresh requests and prevent race conditions
 * caused by OAuth refresh token rotation.
 *
 * When multiple concurrent requests detect an expired token, they all attempt
 * to refresh simultaneously. Due to refresh token rotation, only the first
 * request succeeds - the rest would fail with "Unknown or invalid refresh token"
 * because the original refresh token was invalidated.
 *
 * This map ensures only ONE actual refresh request is made per refresh token.
 * All concurrent requests wait for and share the same result.
 */
const pendingRefreshes = new Map<string, Promise<JWT>>();

/**
 * Internal function that performs the actual token refresh HTTP request.
 * This is called by refreshAccessToken after deduplication checks.
 */
async function doRefreshAccessToken(
  token: JWT,
  config: ImmutableAuthConfig,
  authDomain: string,
): Promise<JWT> {
  try {
    const response = await fetch(`${authDomain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        refresh_token: token.refreshToken!,
      }),
    });

    // Check response.ok before parsing JSON to avoid confusing errors
    // when server returns non-JSON responses (e.g., HTML error pages)
    if (!response.ok) {
      let errorMessage = `Token refresh failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error_description || errorData.error) {
          errorMessage = errorData.error_description || errorData.error;
        }
      } catch {
        // Response is not JSON (e.g., HTML error page from proxy/load balancer)
        // Use the status-based error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Validate that access_token exists in the response
    if (!data.access_token || typeof data.access_token !== 'string') {
      throw new Error('Invalid token response: missing access_token');
    }

    // Calculate expiry
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
 * Refresh the access token using the refresh token.
 * Called by Auth.js JWT callback when token is expired.
 *
 * This function implements deduplication to handle concurrent refresh requests.
 * When multiple requests detect an expired token simultaneously, only ONE actual
 * refresh request is made to the OAuth server. All concurrent requests wait for
 * and share the same result.
 *
 * This prevents "Unknown or invalid refresh token" errors caused by OAuth
 * refresh token rotation, where using the same refresh token twice fails
 * because it was invalidated after the first use.
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

  const { refreshToken } = token;

  // Check if a refresh is already in progress for this refresh token
  const existingRefresh = pendingRefreshes.get(refreshToken);
  if (existingRefresh) {
    // Wait for the existing refresh to complete and use its result
    // The result will have updated tokens that we merge with our token's other fields
    const result = await existingRefresh;
    return {
      ...token,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      idToken: result.idToken,
      accessTokenExpires: result.accessTokenExpires,
      error: result.error,
    };
  }

  // Start a new refresh and store the promise
  const refreshPromise = doRefreshAccessToken(token, config, authDomain);
  pendingRefreshes.set(refreshToken, refreshPromise);

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    // Clean up the pending refresh after completion (success or failure)
    pendingRefreshes.delete(refreshToken);
  }
}

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
