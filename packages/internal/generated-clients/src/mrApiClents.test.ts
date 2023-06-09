import { MultiRollupApiClients } from './MrApiClients';
import { mrConfig } from './config';

describe('MultiRollupApiClients', () => {
  it('should instantiate a Indexer client', async () => {
    const { collectionApi } = new MultiRollupApiClients(mrConfig.sandbox);
    // TODO write better tests - can't test methods since they are behind a VPN
    expect(collectionApi).toBeTruthy();
  });

  it('should instantiate a Order Book client', async () => {
    const { ordersApi } = new MultiRollupApiClients(mrConfig.sandbox);
    // TODO write better tests - can't test methods since they are behind a VPN
    expect(ordersApi).toBeTruthy();
  });
});
