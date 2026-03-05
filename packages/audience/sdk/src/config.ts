import type { Environment } from './types';

const BASE_URLS: Record<Environment, string> = {
  dev: 'https://api.dev.immutable.com',
  sandbox: 'https://api.sandbox.immutable.com',
  production: 'https://api.immutable.com',
};

export const EVENTS_ENDPOINT = '/v1/audience/events';

export const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
export const DEFAULT_FLUSH_SIZE = 20;

export const getBaseUrl = (environment: Environment): string => BASE_URLS[environment];
