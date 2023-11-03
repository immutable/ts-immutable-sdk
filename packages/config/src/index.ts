import axios from 'axios';

export enum Environment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox',
}
export class ImmutableConfiguration {
  readonly environment: Environment;

  readonly rateLimitingKey?: string;

  readonly apiKey?: string;

  readonly clientAppId?: string;

  constructor(options: { environment: Environment; rateLimitingKey?: string; apiKey?: string; clientAppId?: string }) {
    this.environment = options.environment;
  }
}

export const addApiKeyToAxoisHeader = (apiKey: string) => {
  if (!apiKey.startsWith('sk_imapik-')) {
    throw new Error('Invalid API key');
  }
  axios.defaults.headers.common['x-immutable-api-key'] = apiKey;
};

export const addClientAppIdToAxoisHeader = (clientAppId: string) => {
  if (!clientAppId.startsWith('cai_imapik-')) {
    throw new Error('Invalid Client App Id');
  }
  axios.defaults.headers.common['x-immutable-client-app-id'] = clientAppId;
};

export const addRateLimitingKeyToAxoisHeader = (rateLimitingKey: string) => {
  axios.defaults.headers.common['x-api-key'] = rateLimitingKey;
};

type ImmutableConfigurationWithRequireableFields<T> = ImmutableConfiguration &
(T extends { apiKey: 'required'; } ? Required<{ apiKey: string; }> : {}) &
(T extends { clientAppId: 'required'; } ? Required<{ clientAppId: string; }> : {});

type ImmutableConfigurationWithOmitableFields<T> =
  (T extends { apiKey: 'omit'; } ?
    Omit<ImmutableConfigurationWithRequireableFields<T>, 'apiKey'> :
    ImmutableConfigurationWithRequireableFields<T>);

export interface ModuleConfiguration<T> {
  baseConfig: ImmutableConfigurationWithOmitableFields<T>;
  overrides?: T;
}
