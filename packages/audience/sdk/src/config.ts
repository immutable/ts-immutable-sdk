// SDK-specific constants.
// Backend endpoints and base URLs come from @imtbl/audience-core.

export const LIBRARY_NAME = '@imtbl/audience';
/** Replaced at build time by esbuild replace plugin. */
export const LIBRARY_VERSION = '__SDK_VERSION__';

/** Log prefix for console messages from this package. */
export const LOG_PREFIX = '[audience]';

/** Default consent source when consentSource is not provided in config. */
export const DEFAULT_CONSENT_SOURCE = 'WebSDK';
