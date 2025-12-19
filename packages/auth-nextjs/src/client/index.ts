// Client-side exports
export {
  ImmutableAuthProvider,
  useImmutableAuth,
  useAccessToken,
} from './provider';

export { CallbackPage, type CallbackPageProps } from './callback';

// Re-export useful types
export type {
  ImmutableAuthProviderProps,
  UseImmutableAuthReturn,
  ImmutableAuthConfig,
  ImmutableUser,
} from '../types';
