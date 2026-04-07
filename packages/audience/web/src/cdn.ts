/**
 * Audience web SDK CDN entry point — self-contained IIFE bundle.
 * Assigns ImmutableWebSDK to window for script-tag usage.
 */
import { ImmutableWebSDK } from './index';

if (typeof window !== 'undefined') {
  (window as any).ImmutableWebSDK = ImmutableWebSDK;
}

export { ImmutableWebSDK };
export type {
  WebSDKConfig,
  ConsentLevel,
  UserTraits,
  Environment,
} from './index';
