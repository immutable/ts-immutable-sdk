import { OrderBookClient } from '../openapi/sdk';
import { ImmutableApiClient } from './api-client';

export class ImmutableApiClientFactory {
  private orderbookClient: OrderBookClient;

  constructor(
    apiEndpoint: string,
    private readonly chainName: string,
    private readonly seaportAddress: string,
    rateLimitingKey?: string,
  ) {
    this.orderbookClient = new OrderBookClient({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      BASE: apiEndpoint,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      HEADERS: rateLimitingKey ? {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-api-key': rateLimitingKey!,
      } : undefined,
    });
  }

  create(): ImmutableApiClient {
    return new ImmutableApiClient(this.orderbookClient.orders, this.chainName, this.seaportAddress);
  }
}
