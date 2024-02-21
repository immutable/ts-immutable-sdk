/* eslint-disable implicit-arrow-linebreak */
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
  addKeysToHeadersOverride
} from '@imtbl/config';
import { mr } from '@imtbl/generated-clients';

const defaultHeaders = {
  sdkVersion: 'ts-immutable-sdk-multi-rollup-api-client-__SDK_VERSION__',
};

export interface APIConfigurationParams {
  basePath: string;
  headers?: Record<string, string>;
  baseConfig?: ImmutableConfiguration;
}

/**
 * createAPIConfiguration to create a custom Configuration
 * other than the production and sandbox defined below.
 */
export const createAPIConfiguration = (overrides: APIConfigurationParams): mr.Configuration => {
  const {
    baseConfig,
    basePath,
    headers: baseHeaders,
  } = overrides;

  if (!basePath.trim()) {
    throw Error('basePath can not be empty');
  }

  const headers = {
    ...(baseHeaders || {}),
    ...(addKeysToHeadersOverride(baseConfig, overrides) || {}),
    ...defaultHeaders
  };

  const configParams: mr.ConfigurationParameters = {
    ...baseConfig,
    basePath,
    baseOptions: { headers },
  };

  return new mr.Configuration(configParams);
};

export interface BlockchainDataModuleConfiguration
  extends ModuleConfiguration<APIConfigurationParams> { }

export class BlockchainDataConfiguration {
  readonly apiConfig: mr.Configuration;

  readonly baseConfig: ImmutableConfiguration;

  constructor({ baseConfig, overrides }: BlockchainDataModuleConfiguration) {
    this.baseConfig = baseConfig;

    if (overrides) {
      this.apiConfig = createAPIConfiguration(overrides);
    } else {
      switch (baseConfig.environment) {
        case Environment.SANDBOX: {
          this.apiConfig = createAPIConfiguration({
            basePath: 'https://api.sandbox.immutable.com',
            baseConfig,
          });
          break;
        }
        case Environment.PRODUCTION: {
          this.apiConfig = createAPIConfiguration({
            basePath: 'https://api.immutable.com',
            baseConfig,
          });
          break;
        }
        default: {
          this.apiConfig = createAPIConfiguration({
            basePath: 'https://api.sandbox.immutable.com',
            baseConfig,
          });
        }
      }
    }
  }
}
