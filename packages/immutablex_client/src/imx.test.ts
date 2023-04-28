import { ImxConfiguration } from './config';
import { ImmutableXClientFactory } from 'index';
import { Environment } from '@imtbl/config';
import { Config } from '@imtbl/core-sdk';

describe('ImmutableXClientFactory', () => {
  it('should instantiate a SANDBOX ImmutableXClientFactory', async () => {
    const config = new ImxConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });
    const { assetApi } = ImmutableXClientFactory(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk'
    );
  });

  it('should instantiate a PRODUCTION ImmutableXClientFactory', async () => {
    const config = new ImxConfiguration({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    const { assetApi } = ImmutableXClientFactory(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk'
    );
  });

  it('should instantiate a ImmutableXClientFactory with override and custom version', async () => {
    const sdkVersion = 'ts-immutable-sdk-0.0.1';
    const config = new ImxConfiguration({
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
    });
    const { assetApi } = ImmutableXClientFactory(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toEqual(
      sdkVersion
    );
  });
});
