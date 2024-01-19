import { ImmutableXConfiguration, Config } from '@imtbl/core-sdk';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

interface ImmutableXConfigurationParams {
  basePath: string,
  chainID: number,
  coreContractAddress: string,
  registrationContractAddress: string,
}

/**
 * createImmutableXConfiguration to create a custom ImmutableXConfiguration
 * other than the production and sandbox defined below.
 */
export const createImmutableXConfiguration = ({
  basePath,
  chainID,
  coreContractAddress,
  registrationContractAddress,
}: ImmutableXConfigurationParams): ImmutableXConfiguration => Config.createConfig({
  basePath,
  chainID,
  coreContractAddress,
  registrationContractAddress,
  sdkVersion: 'ts-immutable-sdk-__SDK_VERSION__',
});

/**
 * Sets `sdkVersion` at the time of build
 */
const production = () => createImmutableXConfiguration({
  basePath: 'https://api.x.immutable.com',
  chainID: 1,
  coreContractAddress: '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9',
  registrationContractAddress: '0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c',
});

/**
 * Sets `sdkVersion` at the time of build
 */
const sandbox = () => createImmutableXConfiguration({
  basePath: 'https://api.sandbox.x.immutable.com',
  chainID: 11155111,
  coreContractAddress: '0x2d5C349fD8464DA06a3f90b4B0E9195F3d1b7F98',
  registrationContractAddress: '0xDbA6129C02E69405622fAdc3d5A7f8d23eac3b97',
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
