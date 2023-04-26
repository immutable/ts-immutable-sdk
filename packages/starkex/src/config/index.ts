import { ImmutableXConfiguration, Config } from '@imtbl/core-sdk';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

// Set `sdkVersion` on config
const PRODUCTION = () => {
  return Config.createConfig({
    basePath: 'https://api.x.immutable.com',
    chainID: 1,
    coreContractAddress: '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9',
    registrationContractAddress: '0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c',
    sdkVersion: '__SDK_VERSION__',
  });
};

// Set `sdkVersion` on config
const SANDBOX = () => {
  return Config.createConfig({
    basePath: 'https://api.sandbox.x.immutable.com',
    chainID: 5,
    coreContractAddress: '0x7917eDb51ecD6CdB3F9854c3cc593F33de10c623',
    registrationContractAddress: '0x1C97Ada273C9A52253f463042f29117090Cd7D83',
    sdkVersion: '__SDK_VERSION__',
  });
};

export interface StarkExOverrides {
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
          this.immutableXConfig = SANDBOX();
          break;
        }
        case Environment.PRODUCTION: {
          this.immutableXConfig = PRODUCTION();
          break;
        }
      }
    }
  }
}
