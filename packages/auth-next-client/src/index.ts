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

// Login hook with state management
export { useLogin, type UseLoginReturn } from './hooks';

// Logout hook with federated logout support
export { useLogout, type UseLogoutReturn } from './hooks';

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

// Re-export types needed for useLogin and useLogout hooks
export type {
  LoginConfig,
  StandaloneLoginOptions,
  DirectLoginOptions,
  LogoutConfig,
} from '@imtbl/auth';
export { MarketingConsentStatus } from '@imtbl/auth';
