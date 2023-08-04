import { MultiRollupApiClients } from './mr-api-clients';
import { multiRollupConfig } from './config';

describe('MultiRollupApiClients', () => {
  const itNeedsVPN = process.env.RUN_VPN_TESTS ? it : it.skip;

  itNeedsVPN('should instantiate a Indexer client', async () => {
    const { collectionApi } = new MultiRollupApiClients(multiRollupConfig.getSandbox());
    const collectionsResponse = await collectionApi.listCollections({
      chainName: 'imtbl-zkevm-testnet',
    });
    expect(collectionsResponse.config.url).toEqual(
      'https://indexer-mr.sandbox.imtbl.com/v1/chains/imtbl-zkevm-testnet/collections',
    );
    expect(collectionsResponse.status).toEqual(200);
    expect(collectionsResponse.data).toBeTruthy();
    expect(collectionsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
    expect(collectionApi).toBeTruthy();
  });

  itNeedsVPN('should instantiate a Order Book client', async () => {
    const { ordersApi } = new MultiRollupApiClients(multiRollupConfig.getSandbox());
    const listingsResponse = await ordersApi.listListings({
      chainName: 'imtbl-zkevm-testnet',
    });
    expect(listingsResponse.config.url).toEqual(
      'https://order-book-mr.sandbox.imtbl.com/v1/chains/imtbl-zkevm-testnet/orders/listings',
    );
    expect(listingsResponse.status).toEqual(200);
    expect(listingsResponse.data).toBeTruthy();
    expect(listingsResponse.config.headers?.['x-sdk-version']).toContain(
      'ts-immutable-sdk',
    );
    expect(ordersApi).toBeTruthy();
  });
});
