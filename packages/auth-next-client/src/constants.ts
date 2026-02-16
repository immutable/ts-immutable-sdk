/**
 * Client-side constants for @imtbl/auth-next-client.
 * Defined locally to avoid importing from auth-next-server (which uses next/server).
 * Values must stay in sync with auth-next-server constants.
 */

export const DEFAULT_AUTH_DOMAIN = 'https://auth.immutable.com';
export const DEFAULT_AUDIENCE = 'platform_api';
export const DEFAULT_SCOPE = 'openid profile email offline_access transact';
export const IMMUTABLE_PROVIDER_ID = 'immutable';
export const DEFAULT_NEXTAUTH_BASE_PATH = '/api/auth';
export const DEFAULT_SANDBOX_CLIENT_ID = 'mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo';
export const DEFAULT_REDIRECT_URI_PATH = '/callback';
export const DEFAULT_LOGOUT_REDIRECT_URI_PATH = '/';
export const DEFAULT_TOKEN_EXPIRY_MS = 900_000;
export const TOKEN_EXPIRY_BUFFER_MS = 60_000;
