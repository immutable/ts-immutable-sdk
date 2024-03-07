import {
  Config as CoreSDKConfigOptions,
} from '@imtbl/core-sdk';
import { ImmutableXConfiguration } from '@imtbl/x-client';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

interface ProviderOverrides {
  immutableXConfig: ImmutableXConfiguration;
}

interface ProviderModuleConfiguration
  extends ModuleConfiguration<ProviderOverrides> { }

export class ProviderConfiguration {
  readonly immutableXConfig: ImmutableXConfiguration;

  readonly baseConfig: ImmutableConfiguration;

  constructor({ baseConfig, overrides }: ProviderModuleConfiguration) {
    this.baseConfig = baseConfig;
    if (overrides) {
      this.immutableXConfig = overrides.immutableXConfig;
    } else {
      // TODO: remove once a sensible default is chosen
      // eslint-disable-next-line default-case
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
