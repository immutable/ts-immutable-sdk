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
 */
export function ImmutableAuth(
  config: ImmutableAuthConfig,
  overrides?: ImmutableAuthOverrides,
) {
  const authOptions = createAuthOptions(config);

  // Merge overrides with generated options
  const mergedOptions: NextAuthOptions = overrides
    ? {
      ...authOptions,
      ...overrides,
      // Deep merge callbacks if both exist
      callbacks: {
        ...authOptions.callbacks,
        ...overrides.callbacks,
      },
    }
    : authOptions;

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

// Token refresh utilities (for advanced use)
export { refreshAccessToken, isTokenExpired } from './refresh';
