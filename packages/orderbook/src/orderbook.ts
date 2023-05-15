import { OrderbookModuleConfiguration } from 'config/config';
import { OrderBookClient } from 'openapi/sdk';

export class Orderbook {
  private orderbookClient: OrderBookClient;

  private chainId: string;

  constructor(config: OrderbookModuleConfiguration) {
    // TODO: Move endpoint lookup to a map based on env. Just using override to get dev started
    const apiEndpoint = config.overrides?.apiEndpoint;
    if (!apiEndpoint) {
      throw new Error('API endpoint must be provided as an override');
    }

    // TODO: Move chainId lookup to a map based on env. Just using override to get dev started
    const chainId = config.overrides?.chainId;
    if (!chainId) {
      throw new Error('ChainID must be provided as an override');
    }

    this.chainId = chainId;
    this.orderbookClient = config.overrides?.orderbookClient || new OrderBookClient({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      BASE: apiEndpoint,
    });
  }

  getOrder(orderId: string) {
    return this.orderbookClient.orderBook.orderBookGetOrder({ chainId: this.chainId, orderId });
  }
}
