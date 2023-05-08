import { ImmutableXConfiguration, Config } from '@imtbl/core-sdk';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

/**
 * Set `sdkVersion` on config
 */
const production = () => Config.createConfig({
  basePath: 'https://api.x.immutable.com',
  chainID: 1,
  coreContractAddress: '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9',
  registrationContractAddress: '0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c',
  sdkVersion: 'ts-immutable-sdk-__SDK_VERSION__',
});

/**
 * Set `sdkVersion` on config
 */
const sandbox = () => Config.createConfig({
  basePath: 'https://api.sandbox.x.immutable.com',
  chainID: 5,
  coreContractAddress: '0x7917eDb51ecD6CdB3F9854c3cc593F33de10c623',
  registrationContractAddress: '0x1C97Ada273C9A52253f463042f29117090Cd7D83',
  sdkVersion: 'ts-immutable-sdk-__SDK_VERSION__',
});

export interface ImxOverrides {
  immutableXConfig: ImmutableXConfiguration;
}

export interface ImxModuleConfiguration
  extends ModuleConfiguration<ImxOverrides> {}

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
          this.immutableXConfig = sandbox();
          break;
        }
        case Environment.PRODUCTION: {
          this.immutableXConfig = production();
          break;
        }
        default: {
          this.immutableXConfig = sandbox();
        }
      }
    }
  }
}
