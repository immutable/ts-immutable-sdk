import { MultiRollupApiClients } from './MrApiClients';
import { mrConfig } from './config';

describe('MultiRollupApiClients', () => {
  it('should instantiate a Indexer client', async () => {
    const config = mrConfig.getIndexerSandbox();
    const { collectionApi } = new MultiRollupApiClients(config);
    const collectionsResponse = await collectionApi.listCollections({ chainName: 'ethereum' });

    expect(collectionsResponse.status).toEqual(200);
    expect(collectionsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });

  it('should instantiate a Order Book client', async () => {
    const config = mrConfig.getIndexerSandbox();
    const { ordersApi } = new MultiRollupApiClients(config);
    const assetsResponse = await ordersApi.listOrders({ chainName: 'ethereum' });

    expect(assetsResponse.status).toEqual(200);
    expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
  });
});
