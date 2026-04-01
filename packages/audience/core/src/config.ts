import type { Environment } from './types';

const BASE_URLS: Record<Environment, string> = {
  dev: 'https://api.dev.immutable.com',
  sandbox: 'https://api.sandbox.immutable.com',
  production: 'https://api.immutable.com',
};

export const INGEST_PATH = '/v1/audience/messages';
export const CONSENT_PATH = '/v1/audience/tracking-consent';

export const FLUSH_INTERVAL_MS = 5_000;
export const FLUSH_SIZE = 20;

export const COOKIE_NAME = 'imtbl_anon_id';
export const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60 * 2; // 2 years

export const getBaseUrl = (environment: Environment): string => BASE_URLS[environment];
