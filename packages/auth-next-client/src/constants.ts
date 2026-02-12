/**
 * Re-export constants from auth-next-server for consistency.
 * All shared constants live in auth-next-server to avoid duplication.
 */
export {
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_AUDIENCE,
  DEFAULT_SCOPE,
  IMMUTABLE_PROVIDER_ID,
  DEFAULT_NEXTAUTH_BASE_PATH,
  DEFAULT_PRODUCTION_CLIENT_ID,
  DEFAULT_SANDBOX_CLIENT_ID,
  DEFAULT_REDIRECT_URI_PATH,
  DEFAULT_POPUP_REDIRECT_URI_PATH,
  DEFAULT_LOGOUT_REDIRECT_URI_PATH,
  DEFAULT_TOKEN_EXPIRY_MS,
  TOKEN_EXPIRY_BUFFER_MS,
} from '@imtbl/auth-next-server';
