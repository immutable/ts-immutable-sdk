import {
  // these could be imported from '../multi-rollup' instead
  // consider adding a multi-rollup config if the clients are vastly different
  Configuration as APIConfiguration,
  ConfigurationParameters as ApiConfigurationParameters,
} from '../imx';

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

/**
 * Creates a Configuration for the specified environment
 * @returns an ImmutableAPIConfiguration
 */
export const imxApiConfig = {
  getProduction: () => createConfig({
    basePath: 'https://api.x.immutable.com',
  }),
  getSandbox: () => createConfig({
    basePath: 'https://api.sandbox.x.immutable.com',
  }),
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
      basePath: 'https://api.x.immutable.com',
    }),
    orderBook: createConfig({
      basePath: 'https://order-book-mr.imtbl.com',
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
