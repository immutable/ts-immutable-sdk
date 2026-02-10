/**
 * Shared constants for @imtbl/auth-next-client
 */

/**
 * Default Immutable authentication domain
 */
export const DEFAULT_AUTH_DOMAIN = 'https://auth.immutable.com';

/**
 * Default OAuth audience
 */
export const DEFAULT_AUDIENCE = 'platform_api';

/**
 * Default OAuth scopes
 */
export const DEFAULT_SCOPE = 'openid profile email offline_access transact';

/**
 * NextAuth credentials provider ID for Immutable
 */
export const IMMUTABLE_PROVIDER_ID = 'immutable';

/**
 * Default NextAuth API base path
 */
export const DEFAULT_NEXTAUTH_BASE_PATH = '/api/auth';

/**
 * Default token expiry in seconds (15 minutes)
 * Used as fallback when exp claim cannot be extracted from JWT
 */
export const DEFAULT_TOKEN_EXPIRY_SECONDS = 900;

/**
 * Default token expiry in milliseconds
 */
export const DEFAULT_TOKEN_EXPIRY_MS = DEFAULT_TOKEN_EXPIRY_SECONDS * 1000;

/**
 * Buffer time in milliseconds before token expiry to trigger refresh.
 * Matches TOKEN_EXPIRY_BUFFER_SECONDS (60s) in @imtbl/auth-next-server.
 */
export const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000;

/**
 * Default Client IDs for auto-detection
 * These are public client IDs for Immutable's default applications
 */
export const DEFAULT_PRODUCTION_CLIENT_ID = 'PtQRK4iRJ8GkXjiz6xfImMAYhPhW0cYk';
export const DEFAULT_SANDBOX_CLIENT_ID = 'mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo';

/**
 * Default redirect URI paths
 * Note: popupRedirectUri uses the same path as redirectUri to align with @imtbl/auth and @imtbl/wallet behavior
 */
export const DEFAULT_REDIRECT_URI_PATH = '/callback';
export const DEFAULT_POPUP_REDIRECT_URI_PATH = '/callback';
export const DEFAULT_LOGOUT_REDIRECT_URI_PATH = '/';
