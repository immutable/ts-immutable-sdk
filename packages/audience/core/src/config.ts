import type { Environment } from './types';

// --- Backend endpoints ---

const BASE_URLS: Record<Environment, string> = {
  local: 'http://localhost:8070',
  dev: 'https://api.dev.immutable.com',
  sandbox: 'https://api.sandbox.immutable.com',
  production: 'https://api.immutable.com',
};

export const INGEST_PATH = '/v1/audience/messages';
export const CONSENT_PATH = '/v1/audience/tracking-consent';

export const getBaseUrl = (environment: Environment): string => BASE_URLS[environment];

// --- Shared cookie names (cross-surface identity stitching) ---

export const ANON_ID_COOKIE = 'imtbl_anon_id';
export const SESSION_COOKIE = '_imtbl_sid';
export const CONSENT_COOKIE = '_imtbl_consent';

// --- Queue defaults ---

export const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
export const DEFAULT_FLUSH_SIZE = 20;
