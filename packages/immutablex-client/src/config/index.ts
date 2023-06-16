import { Configuration as APIConfiguration, ConfigurationParameters } from '@imtbl/generated-clients/src/imx';
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';

// eslint-disable-next-line @typescript-eslint/naming-convention
const defaultHeaders = { 'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__' };

export interface ImmutableXConfigurationParams {
  basePath: string,
  chainID: number,
  coreContractAddress: string,
  registrationContractAddress: string,
}

/**
 * The configuration for the Ethereum network
 */
export interface EthConfiguration {
  coreContractAddress: string;
  registrationContractAddress: string;
  chainID: number;
}

/**
 * The configuration for the ImmutableX client
 */
export interface ImmutableXConfiguration {
  /**
   * The configuration for the API client
   */
  apiConfiguration: APIConfiguration;
  /**
   * The configuration for the Ethereum network
   */
  ethConfiguration: EthConfiguration;
}

interface EthEnvironment extends EthConfiguration {
  basePath: string;
  headers?: Record<string, string>;
  sdkVersion?: string;
}

// DO NOT EXPORT THIS FUNCTION FROM INDEX
// it should not be made available to the public
export const createConfig = ({
  coreContractAddress,
  registrationContractAddress,
  chainID,
  basePath,
  headers,
  sdkVersion,
}: EthEnvironment): ImmutableXConfiguration => {
  if (!basePath.trim()) {
    throw Error('basePath can not be empty');
  }

  if (sdkVersion) {
    defaultHeaders['x-sdk-version'] = sdkVersion;
  }

  // eslint-disable-next-line no-param-reassign
  headers = { ...(headers || {}), ...defaultHeaders };
  const apiConfigOptions: ConfigurationParameters = {
    basePath,
    baseOptions: { headers },
  };

  return {
    apiConfiguration: new APIConfiguration(apiConfigOptions),
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
  chainID: 5,
  coreContractAddress: '0x7917eDb51ecD6CdB3F9854c3cc593F33de10c623',
  registrationContractAddress: '0x1C97Ada273C9A52253f463042f29117090Cd7D83',
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
