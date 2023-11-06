import axios from 'axios';

export enum Environment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox',
}
export class ImmutableConfiguration {
  readonly environment: Environment;

  readonly rateLimitingKey?: string;

  readonly apiKey?: string;

  readonly publishableKey?: string;

  constructor(options: {
    environment: Environment;
    rateLimitingKey?: string;
    apiKey?: string;
    publishableKey?: string;
  }) {
    this.environment = options.environment;
  }
}

const API_KEY_PREFIX = 'sk_imapik-';
const PUBLISHABLE_KEY_PREFIX = 'cai_imapik-';

export const addApiKeyToAxiosHeader = (apiKey: string) => {
  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    throw new Error('Invalid API key. Create your api key in Immutable developer hub. https://hub.immutable.com');
  }
  axios.defaults.headers.common['x-immutable-api-key'] = apiKey;
};

export const addPublishableKeyToAxiosHeader = (publishableKey: string) => {
  if (!publishableKey.startsWith(PUBLISHABLE_KEY_PREFIX)) {
    throw new Error(
      'Invalid Publishable key. Create your Publishable key in Immutable developer hub.'
      + ' https://hub.immutable.com',
    );
  }
  axios.defaults.headers.common['x-immutable-publishable-key'] = publishableKey;
};

export const addRateLimitingKeyToAxiosHeader = (rateLimitingKey: string) => {
  axios.defaults.headers.common['x-api-key'] = rateLimitingKey;
};

type ImmutableConfigurationWithRequireableFields<T> = ImmutableConfiguration &
(T extends { apiKey: 'required'; } ? Required<{ apiKey: string; }> : {}) &
(T extends { publishableKey: 'required'; } ? Required<{ publishableKey: string; }> : {});

type ImmutableConfigurationWithOmitableFields<T> =
  (T extends { apiKey: 'omit'; } ?
    Omit<ImmutableConfigurationWithRequireableFields<T>, 'apiKey'> :
    ImmutableConfigurationWithRequireableFields<T>);

export interface ModuleConfiguration<T> {
  baseConfig: ImmutableConfigurationWithOmitableFields<T>;
  overrides?: T;
}
