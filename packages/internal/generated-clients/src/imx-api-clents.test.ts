import { ImxApiClients } from './imx-api-clients';
import { imxApiConfig } from './config';

describe('ImxApiClients', () => {
  it('should instantiate a SANDBOX ImxApiClients', async () => {
    const config = imxApiConfig.getSandbox();
    const { assetApi } = new ImxApiClients(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });

  it('should instantiate a PRODUCTION ImxApiClients', async () => {
    const config = imxApiConfig.getProduction();
    const { assetApi } = new ImxApiClients(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });
});
