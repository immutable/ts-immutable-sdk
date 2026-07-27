import {
  Configuration as APIConfiguration,
  ConfigurationParameters as ApiConfigurationParameters,
} from '../multi-rollup';

// eslint-disable-next-line @typescript-eslint/naming-convention
const defaultHeaders = { 'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__' };

/**
 * Configuration for generated clients
 */
export type ImmutableAPIConfiguration = APIConfiguration;

interface Environment {
  basePath: string;
  headers?: Record<string, string>;
}

export const createConfig = ({
  basePath,
  headers,
}: Environment): ImmutableAPIConfiguration => {
  if (!basePath.trim()) {
    throw Error('basePath can not be empty');
  }

  const composedHeaders = { ...defaultHeaders, ...(headers || {}) };
  const apiConfigOptions: ApiConfigurationParameters = {
    basePath,
    baseOptions: { headers: composedHeaders },
  };

  return new APIConfiguration(apiConfigOptions);
};

export type MultiRollupAPIConfiguration = {
  indexer: ImmutableAPIConfiguration;
  orderBook: ImmutableAPIConfiguration;
  passport: ImmutableAPIConfiguration;
};

/**
 * Creates a Configuration for the specified environment
 * @returns an MultiRollupAPIConfiguration
 */
export const multiRollupConfig = {
  getProduction: (): MultiRollupAPIConfiguration => ({
    indexer: createConfig({
      basePath: 'https://api.immutable.com',
    }),
    orderBook: createConfig({
      basePath: 'https://api.immutable.com',
    }),
    passport: createConfig({
      basePath: 'https://api.immutable.com',
    }),
  }),
  getSandbox: (): MultiRollupAPIConfiguration => ({
    indexer: createConfig({
      basePath: 'https://api.sandbox.immutable.com',
    }),
    orderBook: createConfig({
      basePath: 'https://api.sandbox.immutable.com',
    }),
    passport: createConfig({
      basePath: 'https://api.sandbox.immutable.com',
    }),
  }),
};
