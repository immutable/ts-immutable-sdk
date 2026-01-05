// Client-side exports
export {
  ImmutableAuthProvider,
  useImmutableAuth,
  useAccessToken,
} from './provider';

export { CallbackPage, type CallbackPageProps } from './callback';

// Re-export useful types from this package
export type {
  ImmutableAuthProviderProps,
  UseImmutableAuthReturn,
  ImmutableAuthConfig,
  ImmutableUser,
} from '../types';

// Re-export login-related types from @imtbl/auth for convenience
export type { LoginOptions, DirectLoginOptions } from '@imtbl/auth';
export { MarketingConsentStatus } from '@imtbl/auth';
