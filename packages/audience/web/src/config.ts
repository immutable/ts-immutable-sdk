import type { Environment } from './types';

const BASE_URLS: Record<Environment, string> = {
  local: 'http://localhost:8070',
  dev: 'https://api.dev.immutable.com',
  sandbox: 'https://api.sandbox.immutable.com',
  production: 'https://api.immutable.com',
};

export const MESSAGES_ENDPOINT = '/v1/audience/messages';
export const CONSENT_ENDPOINT = '/v1/audience/tracking-consent';

export const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
export const DEFAULT_FLUSH_SIZE = 20;

export const LIBRARY_NAME = '@imtbl/audience-web-sdk';
// Replaced at build time by esbuild replace plugin
export const LIBRARY_VERSION = '__SDK_VERSION__';

export const getBaseUrl = (env: Environment): string => BASE_URLS[env];
