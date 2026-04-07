import type { AudienceSDKConfig } from '@imtbl/audience-sdk';

/** Configuration for the Immutable Web SDK. */
export interface WebSDKConfig extends AudienceSDKConfig {
  /** Identifies the consent source for server-side audit trail (e.g. 'CookieBannerV2'). Defaults to 'WebSDK'. */
  consentSource?: string;
}
