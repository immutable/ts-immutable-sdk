export const BASE_URL = 'https://api.immutable.com';

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
