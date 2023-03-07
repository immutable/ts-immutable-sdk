import {
  ImmutableXConfiguration as CoreSDKConfig,
  Config as CoreSDKConfigOptions,
} from '@imtbl/core-sdk';

export enum Environment {
  DEVELOPMENT = 'development',
  SANDBOX = 'sandbox',
  PRODUCTION = 'production',
}

type StarkExConfig = CoreSDKConfig & {
  env: Environment;
};

export class Configuration {
  private readonly starkExConfig: StarkExConfig;

  constructor(config: StarkExConfig) {
    this.starkExConfig = config;
  }

  public getStarkExConfig(): StarkExConfig {
    return this.starkExConfig;
  }
}

export const PRODUCTION: StarkExConfig = {
  ...CoreSDKConfigOptions.PRODUCTION,
  env: Environment.PRODUCTION,
};

export const SANDBOX: StarkExConfig = {
  ...CoreSDKConfigOptions.SANDBOX,
  env: Environment.SANDBOX,
};
