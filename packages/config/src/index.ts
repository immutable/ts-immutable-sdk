export enum Environment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox',
}
export class ImmutableConfiguration {
  private readonly environment: Environment;
  private readonly apiKey?: string;

  constructor(options: { environment: Environment; apiKey?: string }) {
    this.environment = options.environment;
    this.apiKey = options.apiKey;
  }

  getEnvironment(): Environment {
    return this.environment;
  }
  getApiKey(): string | undefined {
    return this.apiKey;
  }
}

export interface ModuleConfiguration {
  baseConfig: ImmutableConfiguration;
  overrides?: Object;
}
