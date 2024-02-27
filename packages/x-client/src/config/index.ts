/* eslint-disable @typescript-eslint/naming-convention */
import { imx } from '@imtbl/generated-clients';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

export { Environment, ImmutableConfiguration } from '@imtbl/config';
const ApiConfiguration = imx.Configuration;
export { ApiConfiguration };

const defaultHeaders = { 'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__' };

interface ImmutableXConfigurationParams {
  basePath: string,
  chainID: number,
  coreContractAddress: string,
  registrationContractAddress: string,
}

export interface EthConfiguration {
  coreContractAddress: string;
  registrationContractAddress: string;
  chainID: number;
}

interface ImxEnvironment extends EthConfiguration {
  basePath: string;
  headers?: Record<string, string>;
  sdkVersion?: string;
}

export interface ImmutableXConfiguration {
  /**
   * The configuration for the API client
   */
  apiConfiguration: imx.Configuration;
  /**
   * The configuration for the Ethereum network
   */
  ethConfiguration: EthConfiguration;
}

/**
 * @dev Copied from Core SDK as a convenience for migrating away from Core SDK
 */
const createConfig = ({
  coreContractAddress,
  registrationContractAddress,
  chainID,
  basePath,
  headers,
  sdkVersion,
}: ImxEnvironment): ImmutableXConfiguration => {
  if (!basePath.trim()) {
    throw Error('basePath can not be empty');
  }

  if (sdkVersion) {
    defaultHeaders['x-sdk-version'] = sdkVersion;
  }

  // eslint-disable-next-line no-param-reassign
  headers = { ...(headers || {}), ...defaultHeaders };
  const apiConfigOptions: imx.ConfigurationParameters = {
    basePath,
    baseOptions: { headers },
  };

  return {
    apiConfiguration: new ApiConfiguration(apiConfigOptions),
    ethConfiguration: {
      coreContractAddress,
      registrationContractAddress,
      chainID,
    },
  };
};

/**
 * Creates a Configuration for the specified environment
 * @dev Copied from Core SDK as a convenience for migrating away from Core SDK
 * @returns an ImmutableXConfiguration
 */
export const Config = {
  get PRODUCTION() {
    return createConfig({
      basePath: 'https://api.x.immutable.com',
      chainID: 1,
      coreContractAddress: '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9',
      registrationContractAddress: '0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c',
    });
  },

  get SANDBOX() {
    return createConfig({
      basePath: 'https://api.sandbox.x.immutable.com',
      chainID: 11155111,
      coreContractAddress: '0x2d5C349fD8464DA06a3f90b4B0E9195F3d1b7F98',
      registrationContractAddress: '0xDbA6129C02E69405622fAdc3d5A7f8d23eac3b97',
    });
  },

  createConfig,
};

/**
 * createImmutableXConfiguration to create a custom ImmutableXConfiguration
 * other than the production and sandbox defined below.
 */
export const createImmutableXConfiguration = ({
  basePath,
  chainID,
  coreContractAddress,
  registrationContractAddress,
}: ImmutableXConfigurationParams): ImmutableXConfiguration => createConfig({
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

/**
 * @name imxClientConfig
 * @description Helper method to create a standard ImxModuleConfiguration
 * object for the IMXClient class. If you need to override the default
 * configuration, manually construct the ImxModuleConfiguration object.
 * @param environment {Environment} The environment to connect to
 * @param publishableKey {string} The publishable key from Hub
 * @returns {ImxModuleConfiguration}
 */
export const imxClientConfig = (
  environment: Environment,
  publishableKey?: string,
): ImxModuleConfiguration => {
  if (!environment) {
    throw new Error('Environment is required');
  }
  if (Object.values(Environment).indexOf(environment) === -1) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  type ConfigOptions = {
    environment: Environment;
    publishableKey?: string;
  };

  const configOptions: ConfigOptions = {
    environment,
  };

  if (publishableKey) {
    configOptions.publishableKey = publishableKey;
  }

  return {
    baseConfig: new ImmutableConfiguration(configOptions),
  };
};
