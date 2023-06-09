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
export const imxConfig = {
  getProduction() {
    return createConfig({
      basePath: 'https://api.x.immutable.com',
    });
  },

  getSandbox() {
    return createConfig({
      basePath: 'https://api.sandbox.x.immutable.com',
    });
  },
};

const mrApiConfig = {
  indexerMr: () => createConfig({
    basePath: 'https://indexer-mr.dev.imtbl.com',
  }),
  orderBookMr: () => createConfig({
    basePath: 'https://order-book-mr.dev.imtbl.com',
  }),
};

/**
 * Creates a Configuration for the specified environment
 * @returns an MultiRollupAPIConfiguration
 */
export const mrConfig = {
  production: mrApiConfig,
  sandbox: mrApiConfig,
};

export type MultiRollupAPIConfiguration = typeof mrApiConfig;
