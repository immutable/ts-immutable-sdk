import { TOKEN_EXPIRY_BUFFER_SECONDS, DEFAULT_AUTH_DOMAIN } from './constants';

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

/**
 * Result of a token refresh operation
 */
export interface RefreshedTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires: number;
}

/**
 * Decode JWT payload to extract expiry time
 */
function decodeJwtExpiry(token: string): number {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return Date.now() + 15 * 60 * 1000; // Default 15 min
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    if (payload.exp) {
      return payload.exp * 1000; // Convert to milliseconds
    }
  } catch {
    // Fall back to default
  }
  return Date.now() + 15 * 60 * 1000; // Default 15 min
}

/**
 * zkEvm user data extracted from the ID token
 */
export interface ZkEvmData {
  ethAddress: string;
  userAdminAddress: string;
}

/**
 * Extract zkEvm claims from an ID token.
 * The ID token contains zkEvm data in the `passport` claim after user registration.
 *
 * @param idToken - The JWT ID token to parse
 * @returns The zkEvm data if present and valid, undefined otherwise
 */
export function extractZkEvmFromIdToken(idToken?: string): ZkEvmData | undefined {
  if (!idToken) return undefined;

  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return undefined;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    // zkEvm data is stored in the passport claim
    if (payload.passport?.zkevm_eth_address && payload.passport?.zkevm_user_admin_address) {
      return {
        ethAddress: payload.passport.zkevm_eth_address,
        userAdminAddress: payload.passport.zkevm_user_admin_address,
      };
    }
  } catch {
    // Ignore parse errors - return undefined
  }

  return undefined;
}

/**
 * Refresh access token using the refresh token.
 * This is called server-side in the JWT callback when the access token is expired.
 *
 * @param refreshToken - The refresh token to use
 * @param clientId - The OAuth client ID
 * @param authDomain - The authentication domain (default: https://auth.immutable.com)
 * @returns The refreshed tokens
 * @throws Error if refresh fails
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  authDomain: string = DEFAULT_AUTH_DOMAIN,
): Promise<RefreshedTokens> {
  const tokenUrl = `${authDomain}/oauth/token`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Token refresh failed with status ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error_description) {
        errorMessage = errorData.error_description;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      if (errorText) {
        errorMessage = errorText;
      }
    }
    throw new Error(errorMessage);
  }

  const tokenData = await response.json();

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || refreshToken, // Use new refresh token if provided
    idToken: tokenData.id_token,
    accessTokenExpires: decodeJwtExpiry(tokenData.access_token),
  };
}
