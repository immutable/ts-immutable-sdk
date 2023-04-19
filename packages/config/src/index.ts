export enum Environment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox',
}
export class ImmutableConfiguration {
  readonly environment: Environment;
  readonly apiKey?: string;

  constructor(options: { environment: Environment; apiKey?: string }) {
    this.environment = options.environment;
    this.apiKey = options.apiKey;
  }
}

export interface ModuleConfiguration {
  baseConfig: ImmutableConfiguration;
  overrides?: Object;
}
