// Client-side exports
export {
  ImmutableAuthProvider,
  useImmutableAuth,
  useAccessToken,
  useHydratedData,
  type UseHydratedDataResult,
  type HydratedDataProps,
} from './provider';

export { CallbackPage, type CallbackPageProps } from './callback';

// Re-export useful types from this package
export type {
  ImmutableAuthProviderProps,
  UseImmutableAuthReturn,
  ImmutableAuthConfig,
  ImmutableUser,
} from '../types';

// Re-export AuthProps and AuthPropsWithData from server for use in client components
export type { AuthProps, AuthPropsWithData } from '../server/index';

// Re-export login-related types from @imtbl/auth for convenience
export type { LoginOptions, DirectLoginOptions } from '@imtbl/auth';
export { MarketingConsentStatus } from '@imtbl/auth';
