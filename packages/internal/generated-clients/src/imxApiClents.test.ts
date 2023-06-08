import { ImxApiClients } from './imxApiClients';
import { imxConfig } from './config';

describe('ImxApiClients', () => {
  it('should instantiate a SANDBOX ImxApiClients', async () => {
    const config = imxConfig.getSandbox();
    const { assetApi } = new ImxApiClients(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });

  it('should instantiate a PRODUCTION ImxApiClients', async () => {
    const config = imxConfig.getProduction();
    const { assetApi } = new ImxApiClients(config);
    const assetsResponse = await assetApi.listAssets();

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });
});
