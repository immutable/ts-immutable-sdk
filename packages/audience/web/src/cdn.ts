/**
 * Audience web SDK CDN entry point — self-contained IIFE bundle.
 * Assigns exports to window globals for script-tag usage:
 *   window.ImmutableWebSDK
 *   window.AudienceEvent
 *   window.IdentityProvider
 */
import { ImmutableWebSDK, AudienceEvent, IdentityProvider } from './index';

if (typeof window !== 'undefined') {
  (window as any).ImmutableWebSDK = ImmutableWebSDK;
  (window as any).AudienceEvent = AudienceEvent;
  (window as any).IdentityProvider = IdentityProvider;
}

export { ImmutableWebSDK, AudienceEvent, IdentityProvider };
export type {
  EventParamMap,
  Identity,
  WebSDKConfig,
  ConsentLevel,
  UserTraits,
  Environment,
} from './index';
