const TEST_KEY_PREFIX = 'pk_imapik-test-';

export const INGEST_PATH = '/v1/audience/messages';
export const CONSENT_PATH = '/v1/audience/tracking-consent';

export const FLUSH_INTERVAL_MS = 5_000;
export const FLUSH_SIZE = 20;

export const COOKIE_NAME = 'imtbl_anon_id';
export const SESSION_COOKIE = '_imtbl_sid';
export const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60 * 2; // 2 years
export const SESSION_MAX_AGE = 30 * 60; // 30 minutes in seconds

export const SESSION_START = 'session_start';
export const SESSION_END = 'session_end';

export const getBaseUrl = (publishableKey: string, baseUrl?: string): string => {
  if (baseUrl) return baseUrl;
  return publishableKey.startsWith(TEST_KEY_PREFIX)
    ? 'https://api.sandbox.immutable.com'
    : 'https://api.immutable.com';
};
