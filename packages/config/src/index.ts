import axios from 'axios';
import { track, setEnvironment, setPublishableApiKey } from '@imtbl/metrics';

export enum Environment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox',
}

export enum KeyHeaders {
  API_KEY = 'x-immutable-api-key',
  PUBLISHABLE_KEY = 'x-immutable-publishable-key',
  RATE_LIMITING_KEY = 'x-api-key',
}

export class ImmutableConfiguration {
  readonly environment: Environment;

  readonly rateLimitingKey?: string;

  readonly apiKey?: string;

  readonly publishableKey?: string;

  constructor(options: {
    environment: Environment,
    rateLimitingKey?: string,
    apiKey?: string,
    publishableKey?: string
  }) {
    this.environment = options.environment;
    this.publishableKey = options.publishableKey;
    this.apiKey = options.apiKey;
    this.rateLimitingKey = options.rateLimitingKey;

    setEnvironment(options.environment);
    track('config', 'created_imtbl_config');
  }
}

// Adds publishableKey, apiKey, and rateLimitingKey to the headers of the overrides object
// if exists in base config. Otherwise returns the overrides object as is.
// Use this for openapi generated clients with security headers.
export const addKeysToHeadersOverride = <T extends { headers?: Record<string, string> }>(
  baseConfig: ImmutableConfiguration | undefined,
  overrides: T | undefined): T | undefined => {
  if (!baseConfig || (!baseConfig.apiKey && !baseConfig.publishableKey && !baseConfig.rateLimitingKey)) {
    return overrides;
  }

  const newHeaders: Record<string, string> = {};

  if (baseConfig.apiKey) {
    newHeaders[KeyHeaders.API_KEY] = baseConfig.apiKey;
  }

  if (baseConfig.publishableKey) {
    newHeaders[KeyHeaders.PUBLISHABLE_KEY] = baseConfig.publishableKey;
  }

  if (baseConfig.rateLimitingKey) {
    newHeaders[KeyHeaders.RATE_LIMITING_KEY] = baseConfig.rateLimitingKey;
  }

  // If overrides and overrides.headers exist, merge them with newHeaders, giving precedence to existing overrides
  if (overrides && overrides.headers) {
    return {
      ...overrides,
      headers: {
        ...newHeaders, // Add newHeaders first so that the existing keys in overrides.headers can override them
        ...overrides.headers,
      },
    };
  }

  return {
    ...overrides,
    headers: newHeaders,
  } as T;
};

const API_KEY_PREFIX = 'sk_imapik-';
const PUBLISHABLE_KEY_PREFIX = 'pk_imapik-';

export const addApiKeyToAxiosHeader = (apiKey: string) => {
  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    throw new Error(
      'Invalid API key. Create your api key in Immutable developer hub. https://hub.immutable.com',
    );
  }
  axios.defaults.headers.common[KeyHeaders.API_KEY] = apiKey;
};

export const addPublishableKeyToAxiosHeader = (publishableKey: string) => {
  if (!publishableKey.startsWith(PUBLISHABLE_KEY_PREFIX)) {
    throw new Error(
      'Invalid Publishable key. Create your Publishable key in Immutable developer hub.'
      + ' https://hub.immutable.com',
    );
  }
  setPublishableApiKey(publishableKey);
  axios.defaults.headers.common[KeyHeaders.PUBLISHABLE_KEY] = publishableKey;
};

export const addRateLimitingKeyToAxiosHeader = (rateLimitingKey: string) => {
  axios.defaults.headers.common[KeyHeaders.RATE_LIMITING_KEY] = rateLimitingKey;
};

type ImmutableConfigurationWithRequireableFields<T> = ImmutableConfiguration &
(T extends { apiKey: 'required' } ? Required<{ apiKey: string }> : {}) &
(T extends { publishableKey: 'required' }
  ? Required<{ publishableKey: string }>
  : {});

type ImmutableConfigurationWithOmitableFields<T> = T extends { apiKey: 'omit' }
  ? Omit<ImmutableConfigurationWithRequireableFields<T>, 'apiKey'>
  : ImmutableConfigurationWithRequireableFields<T>;

export interface ModuleConfiguration<T> {
  baseConfig: ImmutableConfigurationWithOmitableFields<T>;
  overrides?: T;
}
