import {
  Config as CoreSDKConfigOptions,
  ImmutableXConfiguration as CoreSDKConfig,
} from '@imtbl/core-sdk';
import { Environment, Configuration } from '@imtbl/config/src';

type StarkExConfig = CoreSDKConfig & {
  env: Environment;
};

export class ProviderConfiguration {
  private readonly starkExConfig: StarkExConfig;

  constructor(configuration: Configuration) {
    switch (configuration.environment) {
      case Environment.SANDBOX: {
        this.starkExConfig = {
          ...CoreSDKConfigOptions.SANDBOX,
          env: Environment.SANDBOX,
        };
        break;
      }
      case Environment.PRODUCTION: {
        this.starkExConfig = {
          ...CoreSDKConfigOptions.PRODUCTION,
          env: Environment.PRODUCTION,
        };
        break;
      }
    }
  }

  public getStarkExConfig(): StarkExConfig {
    return this.starkExConfig;
  }
}
