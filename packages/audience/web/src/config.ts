// Web SDK-specific constants.
// Backend endpoints and base URLs come from @imtbl/audience-core.

export const LIBRARY_NAME = '@imtbl/audience-web-sdk';
/** Replaced at build time by esbuild replace plugin. */
export const LIBRARY_VERSION = '__SDK_VERSION__';

/** Log prefix for console messages from this package. */
export const LOG_PREFIX = '[audience-web-sdk]';

/** Default consent source when consentSource is not provided in config. */
export const DEFAULT_CONSENT_SOURCE = 'WebSDK';

// --- Auto-tracked event names ---
// These are fired by the SDK lifecycle, not by studio code.

/** Fired on init (or consent upgrade from none) when no active session cookie exists. */
export const SESSION_START = 'session_start';
/** Fired on explicit shutdown(). Not fired on tab close or consent revocation. */
export const SESSION_END = 'session_end';
