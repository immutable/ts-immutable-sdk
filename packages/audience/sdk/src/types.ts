import type { Environment, ConsentLevel } from '@imtbl/audience-core';

/** Configuration for the Immutable Audience SDK. */
export interface AudienceSDKConfig {
  publishableKey: string;
  environment: Environment;
  /** Defaults to 'none' — no tracking until explicitly opted in. */
  consent?: ConsentLevel;
  consentSource?: string;
  debug?: boolean;
  cookieDomain?: string;
  flushInterval?: number;
  flushSize?: number;
}
