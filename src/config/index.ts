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

// NOTE: new Configuration(Config.SANDBOX) looks weird because we have "Config"
// and "Configuration". Maybe we want to have something akin to "Config" but
// actually named "Options" or "Environments".

export const PRODUCTION: StarkExConfig = {
  ...CoreSDKConfigOptions.PRODUCTION,
  env: Environment.PRODUCTION,
};

export const SANDBOX: StarkExConfig = {
  ...CoreSDKConfigOptions.SANDBOX,
  env: Environment.SANDBOX,
};
