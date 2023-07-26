/* eslint-disable implicit-arrow-linebreak */
import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';
import { mr } from '@imtbl/generated-clients';

const defaultHeaders = {
  sdkVersion: 'ts-immutable-sdk-multi-rollup-api-client-__SDK_VERSION__',
};

export interface APIConfigurationParams {
  basePath: string;
  headers?: Record<string, string>;
}

/**
 * createAPIConfiguration to create a custom Configuration
 * other than the production and sandbox defined below.
 */
export const createAPIConfiguration = ({
  basePath,
  headers: baseHeaders,
}: APIConfigurationParams): mr.Configuration => {
  if (!basePath.trim()) {
    throw Error('basePath can not be empty');
  }

  const headers = { ...(baseHeaders || {}), ...defaultHeaders };
  const configParams: mr.ConfigurationParameters = {
    basePath,
    baseOptions: { headers },
  };

  return new mr.Configuration(configParams);
};

const production = (): mr.Configuration =>
  createAPIConfiguration({
    basePath: 'https://indexer-mr.imtbl.com',
  });

const sandbox = (): mr.Configuration =>
  createAPIConfiguration({
    basePath: 'https://api.sandbox.immutable.com',
  });

export interface BlockchainDataModuleConfiguration
  extends ModuleConfiguration<APIConfigurationParams> {}

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
          this.apiConfig = sandbox();
          break;
        }
        case Environment.PRODUCTION: {
          this.apiConfig = production();
          break;
        }
        default: {
          this.apiConfig = sandbox();
        }
      }
    }
  }
}
