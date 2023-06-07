import {
  Configuration as APIConfiguration,
  ConfigurationParameters,
} from '../imx';

// eslint-disable-next-line @typescript-eslint/naming-convention
const defaultHeaders = { 'x-sdk-version': 'ts-immutable-sdk-__SDK_VERSION__' };

/**
 * The configuration for the ImmutableX client
 */
export type ImxApiConfiguration = APIConfiguration;

interface Environment {
  basePath: string;
  headers?: Record<string, string>;
}

const createConfig = ({
  basePath,
  headers,
}: Environment): ImxApiConfiguration => {
  if (!basePath.trim()) {
    throw Error('basePath can not be empty');
  }

  const composedHeaders = { ...(headers || {}), ...defaultHeaders };
  const apiConfigOptions: ConfigurationParameters = {
    basePath,
    baseOptions: { headers: composedHeaders },
  };

  return new APIConfiguration(apiConfigOptions);
};

/**
 * Creates a Configuration for the specified environment
 * @returns an ImmutableXConfiguration
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

  createConfig,
};
