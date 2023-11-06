import axios from 'axios';

export enum Environment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox',
}
export class ImmutableConfiguration {
  readonly environment: Environment;

  readonly rateLimitingKey?: string;

  readonly apiKey?: string;

  readonly publishableAPIKey?: string;

  constructor(options: {
    environment: Environment;
    rateLimitingKey?: string;
    apiKey?: string;
    publishableAPIKey?: string;
  }) {
    this.environment = options.environment;
  }
}

const API_KEY_PREFIX = 'sk_imapik-';
const PUBLISHABLE_API_KEY_PREFIX = 'cai_imapik-';

export const addApiKeyToAxiosHeader = (apiKey: string) => {
  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    throw new Error('Invalid API key. Create your api key in Immutable developer hub. https://hub.immutable.com');
  }
  axios.defaults.headers.common['x-immutable-api-key'] = apiKey;
};

export const addPublishableAPIKeyToAxiosHeader = (publishableAPIKey: string) => {
  if (!publishableAPIKey.startsWith(PUBLISHABLE_API_KEY_PREFIX)) {
    throw new Error(
      'Invalid Publishable API key. Create your Publishable API key in Immutable developer hub.'
      + ' https://hub.immutable.com',
    );
  }
  axios.defaults.headers.common['x-immutable-publishable-api-key'] = publishableAPIKey;
};

export const addRateLimitingKeyToAxiosHeader = (rateLimitingKey: string) => {
  axios.defaults.headers.common['x-api-key'] = rateLimitingKey;
};

type ImmutableConfigurationWithRequireableFields<T> = ImmutableConfiguration &
(T extends { apiKey: 'required'; } ? Required<{ apiKey: string; }> : {}) &
(T extends { publishableAPIKey: 'required'; } ? Required<{ publishableAPIKey: string; }> : {});

type ImmutableConfigurationWithOmitableFields<T> =
  (T extends { apiKey: 'omit'; } ?
    Omit<ImmutableConfigurationWithRequireableFields<T>, 'apiKey'> :
    ImmutableConfigurationWithRequireableFields<T>);

export interface ModuleConfiguration<T> {
  baseConfig: ImmutableConfigurationWithOmitableFields<T>;
  overrides?: T;
}
