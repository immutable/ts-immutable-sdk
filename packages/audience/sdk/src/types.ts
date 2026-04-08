import type { Environment, ConsentLevel } from '@imtbl/audience-core';

/** Configuration for the Immutable Web SDK. */
export interface AudienceConfig {
  /** Publishable API key from Immutable Hub (pk_imtbl_...). */
  publishableKey: string;
  /** Target environment — controls which backend receives events. */
  environment: Environment;
  /** Initial consent level. Defaults to 'none' (no tracking until opted in). */
  consent?: ConsentLevel;
  /** Enable console logging of all events, flushes, and consent changes. */
  debug?: boolean;
  /** Cookie domain for cross-subdomain sharing (e.g. '.studio.com'). */
  cookieDomain?: string;
  /** Queue flush interval in milliseconds. Defaults to 5000. */
  flushInterval?: number;
  /** Number of queued messages that triggers an automatic flush. Defaults to 20. */
  flushSize?: number;
}
