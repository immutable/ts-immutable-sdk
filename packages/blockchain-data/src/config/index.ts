import {
  Environment,
  ImmutableConfiguration,
  ModuleConfiguration,
} from '@imtbl/config';
import {
  Configuration as APIConfiguration,
  ConfigurationParameters,
} from '@imtbl/multi-rollup-api-client';

const defaultHeaders = { sdkVersion: 'ts-immutable-sdk-__SDK_VERSION__' };

interface APIConfigurationParams {
  basePath: string;
  headers?: Record<string, string>;
}

/**
 * createAPIConfiguration to create a custom APIConfiguration
 * other than the production and sandbox defined below.
 */
export const createAPIConfiguration = ({
  basePath,
  headers: baseHeaders,
}: APIConfigurationParams): APIConfiguration => {
  if (!basePath.trim()) {
    throw Error('basePath can not be empty');
  }

  const headers = { ...(baseHeaders || {}), ...defaultHeaders };
  const configParams: ConfigurationParameters = {
    basePath,
    baseOptions: { headers },
  };

  return new APIConfiguration(configParams);
};

const production = (): APIConfiguration =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createAPIConfiguration({
    basePath: 'https://indexer-mr.dev.imtbl.com/v1', // TODO update before mainnet release
  });

const sandbox = (): APIConfiguration =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createAPIConfiguration({
    basePath: 'https://indexer-mr.dev.imtbl.com/v1', // TODO update before testnet release
  });

export interface BlockchainDataModuleConfiguration
  extends ModuleConfiguration<APIConfigurationParams> {}

export class BlockchainDataConfiguration {
  readonly apiConfig: APIConfiguration;

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
