import type { Environment, ConsentLevel } from '@imtbl/audience-core';

/** Configuration for the Immutable Web SDK. */
export interface WebSDKConfig {
  publishableKey: string;
  environment: Environment;
  consent?: ConsentLevel;
  consentSource?: string;
  debug?: boolean;
  cookieDomain?: string;
  flushInterval?: number;
  flushSize?: number;
}
