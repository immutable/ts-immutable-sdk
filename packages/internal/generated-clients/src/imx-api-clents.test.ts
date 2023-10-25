import { AxiosRequestConfig } from 'axios';
import { ImxApiClients } from './imx-api-clients';
import { imxApiConfig } from './config';

describe('ImxApiClients', () => {
  it('should instantiate a SANDBOX ImxApiClients', async () => {
    const config = imxApiConfig.getSandbox();

    let axiosRequest: AxiosRequestConfig = {};
    config.baseOptions.adapter = jest.fn().mockImplementation(async (request: AxiosRequestConfig) => {
      axiosRequest = request;
      return { status: 200 };
    });

    const { assetApi } = new ImxApiClients(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(axiosRequest.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
    expect(axiosRequest.url).toEqual('https://api.sandbox.x.immutable.com/v1/assets');
  });

  it('should instantiate a PRODUCTION ImxApiClients', async () => {
    const config = imxApiConfig.getProduction();

    let axiosRequest: AxiosRequestConfig = {};
    config.baseOptions.adapter = jest.fn().mockImplementation(async (request: AxiosRequestConfig) => {
      axiosRequest = request;
      return { status: 200 };
    });

    const { assetApi } = new ImxApiClients(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(axiosRequest.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
    expect(axiosRequest.url).toEqual('https://api.x.immutable.com/v1/assets');
  });
});
