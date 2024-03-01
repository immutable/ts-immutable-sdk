/* eslint-disable @typescript-eslint/naming-convention */
import { imx } from '@imtbl/generated-clients';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

export { Environment, ImmutableConfiguration } from '@imtbl/config';
export class ApiConfiguration extends imx.Configuration {}

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
  apiConfiguration: ApiConfiguration;
  /**
   * The configuration for the Ethereum network
   */
  ethConfiguration: EthConfiguration;
}

/**
 * @dev use createImmutableXConfiguration instead
 */
export const createConfig = ({
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

export interface ConfigOptions {
  environment: Environment;
  apiKey?: string;
  publishableKey?: string;
  rateLimitingKey?: string;
}

/**
 * @name imxClientConfig
 * @description Helper method to create a standard ImxModuleConfiguration
 * object for the IMXClient class. If you need to override the default
 * configuration, manually construct the ImxModuleConfiguration object.
 * @param configOptions {ConfigOptions} The configuration options
 * @param configOptions.environment {Environment} The environment to connect to
 * @param configOptions.apkKey {string} The API key from Immutable Hub
 * @param configOptions.publishableKey {string} The publishable key from Immutable Hub
 * @returns {ImxModuleConfiguration}
 */
export const imxClientConfig = (configOptions: ConfigOptions): ImxModuleConfiguration => {
  if (!configOptions) {
    throw new Error('configOptions is required');
  }
  if (Object.values(Environment).indexOf(configOptions.environment) === -1) {
    throw new Error(`Invalid environment: ${configOptions.environment}`);
  }

  const clientConfig = new ImxConfiguration({
    baseConfig: new ImmutableConfiguration(configOptions),
  });

  return clientConfig;
};
