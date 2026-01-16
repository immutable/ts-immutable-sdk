/**
 * @imtbl/auth-next-client
 *
 * Client-side components for Immutable Auth.js v5 integration with Next.js.
 * This package provides React components and hooks for authentication.
 *
 * Note: This package depends on @imtbl/auth and should only be used in
 * browser/client environments. For server-side utilities, use @imtbl/auth-next-server.
 */

// Client-side components and hooks
export {
  ImmutableAuthProvider,
  useImmutableAuth,
  useAccessToken,
  useHydratedData,
  type UseHydratedDataResult,
  type HydratedDataProps,
} from './provider';

export { CallbackPage, type CallbackPageProps } from './callback';

// Re-export types
export type {
  ImmutableAuthProviderProps,
  UseImmutableAuthReturn,
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

// Re-export login-related types from @imtbl/auth for convenience
export type { LoginOptions, DirectLoginOptions } from '@imtbl/auth';
export { MarketingConsentStatus } from '@imtbl/auth';
