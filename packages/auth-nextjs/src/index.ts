// Main entry point for @imtbl/auth-nextjs

import NextAuthDefault, { type NextAuthOptions } from 'next-auth';
import { createAuthOptions } from './config';
import type { ImmutableAuthConfig } from './types';

// Handle ESM/CJS interop - in some bundler configurations, the default export
// may be nested under a 'default' property
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextAuth = ((NextAuthDefault as any).default || NextAuthDefault) as typeof NextAuthDefault;

/**
 * NextAuth options that can be overridden.
 * Excludes 'providers' as that's managed internally.
 */
export type ImmutableAuthOverrides = Omit<NextAuthOptions, 'providers'>;

/**
 * Create a NextAuth handler with Immutable authentication
 *
 * @param config - Immutable auth configuration
 * @param overrides - Optional NextAuth options to override defaults
 *
 * @remarks
 * Callback composition: The `jwt` and `session` callbacks are composed rather than
 * replaced. Internal callbacks run first (handling token storage and refresh), then
 * your custom callbacks receive the result. Other callbacks (`signIn`, `redirect`)
 * are replaced entirely if provided.
 *
 * @example Basic usage
 * ```typescript
 * // pages/api/auth/[...nextauth].ts
 * import { ImmutableAuth } from "@imtbl/auth-nextjs";
 *
 * export default ImmutableAuth({
 *   clientId: process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID!,
 *   redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`,
 * });
 * ```
 *
 * @example With NextAuth overrides
 * ```typescript
 * export default ImmutableAuth(
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
 * export default ImmutableAuth(
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
export function ImmutableAuth(
  config: ImmutableAuthConfig,
  overrides?: ImmutableAuthOverrides,
) {
  const authOptions = createAuthOptions(config);

  // If no overrides, use auth options as-is
  if (!overrides) {
    return NextAuth(authOptions);
  }

  // Compose callbacks to ensure internal callbacks always run first
  // User callbacks receive the result and can modify it further
  const composedCallbacks: NextAuthOptions['callbacks'] = {
    ...authOptions.callbacks,
  };

  if (overrides.callbacks) {
    // Compose jwt callback - internal callback runs first, then user callback
    if (overrides.callbacks.jwt) {
      const internalJwt = authOptions.callbacks?.jwt;
      const userJwt = overrides.callbacks.jwt;
      composedCallbacks.jwt = async (params) => {
        // Run internal jwt callback first to handle token storage and refresh
        const token = internalJwt ? await internalJwt(params) : params.token;
        // Then run user's jwt callback with the result
        return userJwt({ ...params, token });
      };
    }

    // Compose session callback - internal callback runs first, then user callback
    if (overrides.callbacks.session) {
      const internalSession = authOptions.callbacks?.session;
      const userSession = overrides.callbacks.session;
      composedCallbacks.session = async (params) => {
        // Run internal session callback first to expose token data
        const session = internalSession
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? await internalSession(params as any)
          : params.session;
        // Then run user's session callback with the result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return userSession({ ...params, session } as any);
      };
    }

    // For other callbacks (signIn, redirect), just use overrides if provided
    if (overrides.callbacks.signIn) {
      composedCallbacks.signIn = overrides.callbacks.signIn;
    }
    if (overrides.callbacks.redirect) {
      composedCallbacks.redirect = overrides.callbacks.redirect;
    }
  }

  const mergedOptions: NextAuthOptions = {
    ...authOptions,
    ...overrides,
    callbacks: composedCallbacks,
  };

  return NextAuth(mergedOptions);
}

// Types
export type {
  ImmutableAuthConfig,
  ImmutableTokenData,
  ImmutableUser,
  ZkEvmInfo,
  WithPageAuthRequiredOptions,
} from './types';

// Re-export login-related types from @imtbl/auth for convenience
export type { LoginOptions, DirectLoginOptions } from '@imtbl/auth';
export { MarketingConsentStatus } from '@imtbl/auth';

// Token refresh utilities (for advanced use)
export { refreshAccessToken, isTokenExpired } from './refresh';
