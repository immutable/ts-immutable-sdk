import { MultiRollupApiClients } from './mr-api-clients';
import { multiRollupConfig } from './config';

describe('MultiRollupApiClients', () => {
  it('should instantiate a Indexer client', async () => {
    const { collectionApi } = new MultiRollupApiClients(multiRollupConfig.getSandbox());
    // Can not test methods since they are behind a VPN, uncomment following code when testable.

    // const collectionsResponse = await collectionApi.listCollections({
    //   chainName: 'imtbl-zkevm-testnet',
    // });
    // expect(collectionsResponse.status).toEqual(200);
    // expect(collectionsResponse.data).toBeTruthy();
    // expect(collectionsResponse.config.headers?.['x-sdk-version']).toContain(
    //   'ts-immutable-sdk',
    // );
    expect(collectionApi).toBeTruthy();
  });

  it('should instantiate a Order Book client', async () => {
    const { ordersApi } = new MultiRollupApiClients(multiRollupConfig.getSandbox());

    // Can not test methods since they are behind a VPN, uncomment following code when testable.

    // const listingsResponse = await ordersApi.listListings({
    //   chainName: 'imtbl-zkevm-testnet',
    // });
    // expect(listingsResponse.status).toEqual(200);
    // expect(listingsResponse.data).toBeTruthy();
    // expect(listingsResponse.config.headers?.['x-sdk-version']).toContain(
    //   'ts-immutable-sdk',
    // );
    expect(ordersApi).toBeTruthy();
  });
});
