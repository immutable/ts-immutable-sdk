import { Environment, ImmutableConfiguration, KeyHeaders } from '@imtbl/config';
import { BlockchainData } from '../blockchain-data';
import { BlockchainDataModuleConfiguration } from './index';

describe('BlockchainData', () => {
  it('should instantiate a SANDBOX BlockchainData', async () => {
    const environment = Environment.SANDBOX;

    const config: BlockchainDataModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment,
      }),
    };

    const blockchainData = new BlockchainData(config);
    expect(blockchainData).toBeInstanceOf(BlockchainData);
    expect(blockchainData.config.baseConfig.environment).toBe(environment);
  });

  it('should instantiate a PRODUCTION BlockchainData', async () => {
    const environment = Environment.PRODUCTION;

    const config: BlockchainDataModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment,
      }),
    };

    const blockchainData = new BlockchainData(config);
    expect(blockchainData).toBeInstanceOf(BlockchainData);
    expect(blockchainData.config.baseConfig.environment).toBe(environment);
  });

  it('should instantiate a BlockchainData with override basePath', async () => {
    const basePath = 'basePath';

    const config: BlockchainDataModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      overrides: {
        basePath,
      },
    };

    const blockchainData = new BlockchainData(config);
    expect(blockchainData).toBeInstanceOf(BlockchainData);
    expect(blockchainData.config.apiConfig.basePath).toBe(basePath);
  });

  it('should instantiate a BlockchainData with override headers', async () => {
    const headers = { testHeader: 'ts-immutable-sdk-0.0.1' };

    const config: BlockchainDataModuleConfiguration = {
      baseConfig: { environment: Environment.PRODUCTION },
      overrides: {
        basePath: 'https://api.dev.immutable.com/v1',
        headers,
      },
    };
    const blockchainData = new BlockchainData(config);
    expect(blockchainData).toBeInstanceOf(BlockchainData);
    expect(blockchainData.config.apiConfig.baseOptions?.headers).toMatchObject(
      headers
    );
  });

  it('should instantiate a BlockchainData with rate limit and api key in headers', async () => {
    const rateLimitKey = 'rateLimit';
    const apiKey = 'api';

    const headers = {
      testHeader: 'ts-immutable-sdk-0.0.1',
      [KeyHeaders.API_KEY]: apiKey,
      [KeyHeaders.RATE_LIMITING_KEY]: rateLimitKey,
    };

    const config: BlockchainDataModuleConfiguration = {
      baseConfig: { environment: Environment.PRODUCTION, rateLimitingKey: rateLimitKey, apiKey },
      overrides: {
        basePath: 'https://api.dev.immutable.com/v1',
        headers,
      },
    };
    const blockchainData = new BlockchainData(config);
    expect(blockchainData).toBeInstanceOf(BlockchainData);
    expect(blockchainData.config.apiConfig.baseOptions?.headers).toMatchObject(
      headers
    );
  });
});
