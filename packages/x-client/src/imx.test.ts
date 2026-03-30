import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { AxiosRequestConfig } from 'axios';
import { IMXClient } from './IMXClient';
import {
  createConfig,
  ImxConfiguration,
  ImxModuleConfiguration,
  createImmutableXConfiguration,
} from './config';

describe('IMXClient', () => {
  it('should instantiate a SANDBOX IMXClient', async () => {
    const imtblConfig = new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    });

    const client = new IMXClient({
      baseConfig: imtblConfig,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let axiosRequest: AxiosRequestConfig = {};
    const adapter = jest.fn().mockImplementation(
      async (request: AxiosRequestConfig) => {
        axiosRequest = request;
        return { status: 200 };
      },
    );

    const reqConfig : AxiosRequestConfig = {
      adapter,
    };

    // @ts-ignore
    await client.assetApi.listAssets({}, reqConfig);
    expect(axiosRequest.headers?.['x-sdk-version']).toEqual('ts-immutable-sdk-__SDK_VERSION__');
  });

  it('should instantiate a PRODUCTION IMXClient', async () => {
    const config = new ImxConfiguration({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    const { assetApi } = new IMXClient(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });

  it('should instantiate a IMXClient with override and custom version', async () => {
    const immutableXConfig = createImmutableXConfiguration({
      basePath: 'https://api.sandbox.x.immutable.com',
      chainID: 1,
      coreContractAddress: '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9',
      registrationContractAddress:
        '0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let axiosRequest: AxiosRequestConfig = {};
    immutableXConfig.apiConfiguration.baseOptions.adapter = jest.fn().mockImplementation(
      async (request: AxiosRequestConfig) => {
        axiosRequest = request;
        return { status: 200 };
      },
    );

    const config: ImxModuleConfiguration = {
      baseConfig: { environment: Environment.PRODUCTION },
      overrides: { immutableXConfig },
    };
    const { assetApi } = new IMXClient(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
  });

  it('should instantiate a IMXClient with override and custom SDK version', async () => {
    const sdkVersion = 'ts-immutable-sdk-0.0.1';

    const immutableXConfig = createConfig({
      basePath: 'https://api.sandbox.x.immutable.com',
      chainID: 1,
      coreContractAddress: '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9',
      registrationContractAddress:
        '0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c',
      sdkVersion,
    });

    let axiosRequest: AxiosRequestConfig = {};
    immutableXConfig.apiConfiguration.baseOptions.adapter = jest.fn().mockImplementation(
      async (request: AxiosRequestConfig) => {
        axiosRequest = request;
        return { status: 200 };
      },
    );

    const config: ImxModuleConfiguration = {
      baseConfig: { environment: Environment.PRODUCTION },
      overrides: { immutableXConfig },
    };

    const { assetApi } = new IMXClient(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(axiosRequest.headers?.['x-sdk-version']).toEqual(
      sdkVersion,
    );
  });
});
