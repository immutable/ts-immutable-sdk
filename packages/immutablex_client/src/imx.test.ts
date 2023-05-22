import { ImmutableXClient } from 'index';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Config } from '@imtbl/core-sdk';
import { ImxConfiguration, ImxModuleConfiguration, createImmutableXConfiguration } from './config';

describe('ImmutableXClient', () => {
  it('should instantiate a SANDBOX ImmutableXClient', async () => {
    const imtblConfig = new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    });

    const { assetApi } = new ImmutableXClient({
      baseConfig: imtblConfig,
    });
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });

  it('should instantiate a PRODUCTION ImmutableXClient', async () => {
    const config = new ImxConfiguration({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    const { assetApi } = new ImmutableXClient(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });

  it('should instantiate a ImmutableXClient with override and custom version', async () => {
    const config: ImxModuleConfiguration = {
      baseConfig: { environment: Environment.PRODUCTION },
      overrides: {
        immutableXConfig: createImmutableXConfiguration({
          basePath: 'https://api.sandbox.x.immutable.com',
          chainID: 1,
          coreContractAddress: '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9',
          registrationContractAddress:
            '0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c',
        }),
      },
    };
    const { assetApi } = new ImmutableXClient(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });

  it('should instantiate a ImmutableXClient with override and custom SDK version', async () => {
    const sdkVersion = 'ts-immutable-sdk-0.0.1';

    const config: ImxModuleConfiguration = {
      baseConfig: { environment: Environment.PRODUCTION },
      overrides: {
        immutableXConfig: Config.createConfig({
          basePath: 'https://api.sandbox.x.immutable.com',
          chainID: 1,
          coreContractAddress: '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9',
          registrationContractAddress:
            '0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c',
          sdkVersion,
        }),
      },
    };

    const { assetApi } = new ImmutableXClient(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toEqual(
      sdkVersion,
    );
  });
});
