import { OrderBookClient } from 'openapi/sdk';
import { ImmutableApiClient } from './api-client';

export class ImmutableApiClientFactory {
  private orderbookClient: OrderBookClient;

  constructor(apiEndpoint: string, private readonly chainId: string) {
    this.orderbookClient = new OrderBookClient({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      BASE: apiEndpoint,
    });
  }

  create(): ImmutableApiClient {
    return new ImmutableApiClient(this.orderbookClient, this.chainId);
  }
}
