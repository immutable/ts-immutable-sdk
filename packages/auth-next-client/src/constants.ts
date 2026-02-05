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
