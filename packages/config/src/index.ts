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

    if (options.rateLimitingKey) {
      this.rateLimitingKey = options.rateLimitingKey;
      axios.defaults.headers.common['x-api-key'] = this.rateLimitingKey;
    }

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
  baseConfig: ImmutableConfiguration &
  (T extends { requireApiKey: true; } ? Required<{ apiKey: string; }> : {}) &
  (T extends { requireClientAppId: true; } ? Required<{ clientAppId: string; }> : {});
  overrides?: T;
}
