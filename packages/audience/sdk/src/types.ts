import type { AudienceError, AutocaptureOptions, ConsentLevel } from '@imtbl/audience-core';

/** Configuration for the Immutable Web SDK. */
export interface AudienceConfig {
  /** Publishable API key from Immutable Hub (pk_imapik-...). */
  publishableKey: string;
  /** Initial consent level. Defaults to 'none' (no tracking until opted in). */
  consent?: ConsentLevel;
  /**
   * Configure passive auto-capture (link clicks, forms, scroll depth),
   * the same capture engine the tracking pixel uses. Omit to use the
   * defaults (forms/clicks/scroll on, internalClicks/buttons off).
   */
  autocapture?: AutocaptureOptions;
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
  /** When true, all events are marked test: true and can be filtered from production analytics. */
  testMode?: boolean;
  /**
   * Called when the SDK fails to reach the backend. Receives a structured
   * {@link AudienceError} with a machine-readable `code` so studios can
   * branch on the failure mode (FLUSH_FAILED, CONSENT_SYNC_FAILED,
   * NETWORK_ERROR, VALIDATION_REJECTED). Exceptions thrown from this
   * callback are swallowed so a bad handler can't wedge the SDK.
   */
  onError?: (err: AudienceError) => void;
}
