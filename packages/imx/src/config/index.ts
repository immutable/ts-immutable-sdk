import {
  Config as CoreSDKConfigOptions,
  ImmutableXConfiguration,
} from '@imtbl/core-sdk';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

interface ImxOverrides {
  immutableXConfig: ImmutableXConfiguration;
}

interface ImxModuleConfiguration extends ModuleConfiguration<ImxOverrides> {}

export class ImxConfiguration {
  readonly immutableXConfig: ImmutableXConfiguration;
  readonly baseConfig: ImmutableConfiguration;

  constructor({ baseConfig, overrides }: ImxModuleConfiguration) {
    this.baseConfig = baseConfig;
    if (overrides) {
      this.immutableXConfig = overrides.immutableXConfig;
    } else {
      switch (baseConfig.environment) {
        case Environment.SANDBOX: {
          this.immutableXConfig = CoreSDKConfigOptions.SANDBOX;
          break;
        }
        case Environment.PRODUCTION: {
          this.immutableXConfig = CoreSDKConfigOptions.PRODUCTION;
          break;
        }
      }
    }
  }
}
