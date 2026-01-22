/**
 * @imtbl/auth-next-client
 *
 * Client-side components for Immutable Auth.js v5 integration with Next.js.
 * This package provides React components and hooks for authentication.
 *
 * This package is designed to work with:
 * - SessionProvider from next-auth/react (user-provided)
 * - createAuthConfig from @imtbl/auth-next-server
 * - Standalone login functions from @imtbl/auth
 *
 * @example Basic setup
 * ```tsx
 * // app/providers.tsx
 * "use client";
 * import { SessionProvider } from "next-auth/react";
 *
 * export function Providers({ children }: { children: React.ReactNode }) {
 *   return <SessionProvider>{children}</SessionProvider>;
 * }
 * ```
 */

// Callback page component
export { CallbackPage, type CallbackPageProps, type CallbackConfig } from './callback';

// Session hook with getUser for wallet integration
export { useImmutableSession, type UseImmutableSessionReturn, type ImmutableSession } from './hooks';

// Re-export types
export type {
  ImmutableUserClient,
  ImmutableTokenDataClient,
  ZkEvmInfo,
} from './types';

// Re-export server types for convenience (commonly used together)
export type {
  ImmutableAuthConfig,
  ImmutableTokenData,
  ImmutableUser,
  AuthProps,
  AuthPropsWithData,
  ProtectedAuthProps,
  ProtectedAuthPropsWithData,
} from '@imtbl/auth-next-server';

// Re-export standalone login functions and types from @imtbl/auth for convenience
export {
  loginWithPopup,
  loginWithEmbedded,
  loginWithRedirect,
  handleLoginCallback,
  type LoginConfig,
  type TokenResponse,
  type StandaloneLoginOptions,
} from '@imtbl/auth';

// Re-export login-related types from @imtbl/auth for convenience
export type { LoginOptions, DirectLoginOptions } from '@imtbl/auth';
export { MarketingConsentStatus } from '@imtbl/auth';
