// Main entry point for @imtbl/auth-nextjs (Auth.js v5 / App Router)

import NextAuthImport from 'next-auth';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Type exists in next-auth v5 but TS resolver may use stale types
import type { NextAuthConfig } from 'next-auth';
import { createAuthConfig } from './config';
import type { ImmutableAuthConfig } from './types';

// Handle ESM/CJS interop - in some bundler configurations, the default export
// may be nested under a 'default' property
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextAuth = ((NextAuthImport as any).default || NextAuthImport) as typeof NextAuthImport;

/**
 * Auth.js v5 config options that can be overridden.
 * Excludes 'providers' as that's managed internally.
 */
export type ImmutableAuthOverrides = Omit<NextAuthConfig, 'providers'>;

/**
 * Return type of createImmutableAuth - the NextAuth instance with handlers
 */
export type ImmutableAuthResult = ReturnType<typeof NextAuth>;

/**
 * Create an Auth.js v5 instance with Immutable authentication
 *
 * @param config - Immutable auth configuration
 * @param overrides - Optional Auth.js options to override defaults
 * @returns NextAuth instance with { handlers, auth, signIn, signOut }
 *
 * @remarks
 * Callback composition: The `jwt` and `session` callbacks are composed rather than
 * replaced. Internal callbacks run first (handling token storage and refresh), then
 * your custom callbacks receive the result. Other callbacks (`signIn`, `redirect`)
 * are replaced entirely if provided.
 *
 * @example Basic usage (App Router)
 * ```typescript
 * // lib/auth.ts
 * import { createImmutableAuth } from "@imtbl/auth-nextjs";
 *
 * export const { handlers, auth, signIn, signOut } = createImmutableAuth({
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * });
 *
 * // app/api/auth/[...nextauth]/route.ts
 * import { handlers } from "@/lib/auth";
 * export const { GET, POST } = handlers;
 * ```
 *
 * @example With Auth.js overrides
 * ```typescript
 * export const { handlers, auth } = createImmutableAuth(
 *   { clientId: "...", redirectUri: "..." },
 *   {
 *     pages: { signIn: "/custom-login", error: "/auth-error" },
 *     debug: true,
 *   }
 * );
 * ```
 *
 * @example With custom jwt callback (composed with internal callback)
 * ```typescript
 * export const { handlers, auth } = createImmutableAuth(
 *   { clientId: "...", redirectUri: "..." },
 *   {
 *     callbacks: {
 *       // Your jwt callback receives the token after internal processing
 *       async jwt({ token }) {
 *         // Add custom claims
 *         token.customClaim = "value";
 *         return token;
 *       },
 *     },
 *   }
 * );
 * ```
 */
export function createImmutableAuth(
  config: ImmutableAuthConfig,
  overrides?: ImmutableAuthOverrides,
): ImmutableAuthResult {
  const authConfig = createAuthConfig(config);

  // If no overrides, use auth config as-is
  if (!overrides) {
    return NextAuth(authConfig);
  }

  // Compose callbacks to ensure internal callbacks always run first
  // User callbacks receive the result and can modify it further
  const composedCallbacks: NextAuthConfig['callbacks'] = {
    ...authConfig.callbacks,
  };

  if (overrides.callbacks) {
    // Compose jwt callback - internal callback runs first, then user callback
    if (overrides.callbacks.jwt) {
      const internalJwt = authConfig.callbacks?.jwt;
      const userJwt = overrides.callbacks.jwt;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      composedCallbacks.jwt = async (params: any) => {
        // Run internal jwt callback first to handle token storage and refresh
        const token = internalJwt ? await internalJwt(params) : params.token;
        // Then run user's jwt callback with the result
        return userJwt({ ...params, token });
      };
    }

    // Compose session callback - internal callback runs first, then user callback
    if (overrides.callbacks.session) {
      const internalSession = authConfig.callbacks?.session;
      const userSession = overrides.callbacks.session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      composedCallbacks.session = async (params: any) => {
        // Run internal session callback first to expose token data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = internalSession ? await internalSession(params) : params.session;
        // Then run user's session callback with the result
        return userSession({ ...params, session });
      };
    }

    // For other callbacks (signIn, redirect, authorized), just use overrides if provided
    // These don't need composition as there's no internal implementation
    if (overrides.callbacks.signIn) {
      composedCallbacks.signIn = overrides.callbacks.signIn;
    }
    if (overrides.callbacks.redirect) {
      composedCallbacks.redirect = overrides.callbacks.redirect;
    }
    if (overrides.callbacks.authorized) {
      composedCallbacks.authorized = overrides.callbacks.authorized;
    }
  }

  // Merge session config to preserve critical settings like strategy: 'jwt'
  // User can override maxAge, updateAge, etc. but strategy is always preserved
  const mergedSession = overrides.session
    ? {
      ...authConfig.session,
      ...overrides.session,
      // Always enforce JWT strategy - this is required for token storage/refresh
      strategy: 'jwt' as const,
    }
    : authConfig.session;

  const mergedConfig: NextAuthConfig = {
    ...authConfig,
    ...overrides,
    callbacks: composedCallbacks,
    session: mergedSession,
  };

  return NextAuth(mergedConfig);
}

// Legacy alias for backwards compatibility during migration
export const ImmutableAuth = createImmutableAuth;

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

// Token refresh utilities (for advanced use)
export { refreshAccessToken, isTokenExpired } from './refresh';

// Default constants (useful for configuration reference)
export {
  DEFAULT_AUTH_DOMAIN,
  DEFAULT_AUDIENCE,
  DEFAULT_SCOPE,
  DEFAULT_NEXTAUTH_BASE_PATH,
} from './constants';
