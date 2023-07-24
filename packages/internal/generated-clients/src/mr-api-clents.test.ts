import { MultiRollupApiClients } from './mr-api-clients';
import { multiRollupConfig } from './config';

describe('MultiRollupApiClients', () => {
  it('should instantiate a Indexer client', async () => {
    const { collectionApi } = new MultiRollupApiClients(multiRollupConfig.getSandbox());
    // TODO write better tests - can't test methods since they are behind a VPN
    expect(collectionApi).toBeTruthy();
  });

  it('should instantiate a Order Book client', async () => {
    const { ordersApi } = new MultiRollupApiClients(multiRollupConfig.getSandbox());
    // TODO write better tests - can't test methods since they are behind a VPN
    expect(ordersApi).toBeTruthy();
  });
});
