// Main entry point for @imtbl/auth-nextjs (Auth.js v5 / App Router)
//
// This module includes client-side types and re-exports from @imtbl/auth.
// For server-only usage (Edge Runtime, middleware), use @imtbl/auth-nextjs/server
// which doesn't import @imtbl/auth and its browser-only dependencies.

// Re-export createImmutableAuth from the server-safe module
// This function doesn't depend on @imtbl/auth
export {
  createImmutableAuth,
  ImmutableAuth,
  type ImmutableAuthOverrides,
  type ImmutableAuthResult,
} from './createAuth';

// Export config creator for advanced use cases
export { createAuthConfig } from './config';

// Types
export type {
  ImmutableAuthConfig,
  ImmutableTokenData,
  ImmutableUser,
  ZkEvmInfo,
} from './types';

// Re-export login-related types from @imtbl/auth for convenience
export type { LoginOptions, DirectLoginOptions } from '@imtbl/auth';
export { MarketingConsentStatus } from '@imtbl/auth';

// Token expiry check utility
export { isTokenExpired } from './refresh';

// Default constants (useful for configuration reference)
export {
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_AUDIENCE,
  DEFAULT_SCOPE,
  DEFAULT_NEXTAUTH_BASE_PATH,
} from './constants';
