import {
  Config as CoreSDKConfigOptions,
  ImmutableXConfiguration,
} from '@imtbl/core-sdk';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

interface StarkExOverrides {
  immutableXConfig: ImmutableXConfiguration;
}

interface StarkExModuleConfiguration
  extends ModuleConfiguration<StarkExOverrides> {}

export class StarkExConfiguration {
  readonly immutableXConfig: ImmutableXConfiguration;
  readonly baseConfig: ImmutableConfiguration;

  constructor({ baseConfig, overrides }: StarkExModuleConfiguration) {
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
