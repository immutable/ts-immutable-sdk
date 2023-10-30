import axios from 'axios';

export enum Environment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox',
}
export class ImmutableConfiguration {
  readonly environment: Environment;

  readonly apiKey?: string;

  readonly clientAppId?: string;

  constructor(options: { environment: Environment; apiKey?: string; clientAppId?: string }) {
    this.environment = options.environment;

    if (options.apiKey) {
      if (!options.apiKey.startsWith('sk_imapik-')) {
        throw new Error('Invalid API key');
      }
      this.apiKey = options.apiKey;
      axios.defaults.headers.common['x-immutable-api-key'] = this.apiKey;
    }

    if (options.clientAppId) {
      if (!options.clientAppId.startsWith('cai_imapik-')) {
        throw new Error('Invalid Client App Id');
      }
      this.clientAppId = options.clientAppId;
      axios.defaults.headers.common['x-immutable-client-app-id'] = this.clientAppId;
    }
  }
}

export interface ModuleConfiguration<T> {
  baseConfig: ImmutableConfiguration;
  overrides?: T;
}
