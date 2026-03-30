import {
  ImxConfiguration,
  ImmutableXConfiguration,
} from '@imtbl/x-client';
import {
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
      const clientConfig = new ImxConfiguration({ baseConfig });
      this.immutableXConfig = clientConfig.immutableXConfig;
    }
  }
}
