import type { AudienceError, ConsentLevel } from '@imtbl/audience-core';

/** Configuration for the Immutable Web SDK. */
export interface AudienceConfig {
  /** Publishable API key from Immutable Hub (pk_imapik-...). */
  publishableKey: string;
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
  /** Override the default API base URL. */
  baseUrl?: string;
  /**
   * Called when the SDK fails to reach the backend. Receives a structured
   * {@link AudienceError} with a machine-readable `code` so studios can
   * branch on the failure mode (FLUSH_FAILED, CONSENT_SYNC_FAILED,
   * NETWORK_ERROR, VALIDATION_REJECTED). Exceptions thrown from this
   * callback are swallowed so a bad handler can't wedge the SDK.
   */
  onError?: (err: AudienceError) => void;
}
