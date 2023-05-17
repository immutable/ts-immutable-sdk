import { OrderbookModuleConfiguration } from 'config/config';
import { ERC721 } from 'erc721';
import { OrderBookClient, Order } from 'openapi/sdk';
import { Seaport } from 'seaport';
import { CreateOrderParams, PrepareListingParams, PrepareListingResponse } from 'types';

export class Orderbook {
  private orderbookClient: OrderBookClient;

  private chainId: string;

  constructor(private config: OrderbookModuleConfiguration) {
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

  getOrder(orderId: string): Promise<Order> {
    return this.orderbookClient.orderBook.orderBookGetOrder({ chainId: this.chainId, orderId });
  }

  async prepareListing({
    offerer, listingItem, considerationItem, orderExpiry,
  }: PrepareListingParams): Promise<PrepareListingResponse> {
    const royaltyInfo = await new ERC721(listingItem.contractAddress, this.config.provider)
      .royaltyInfo(listingItem.tokenId, considerationItem.amount);

    const { approvalTransaction, orderMessageToSign } = await new Seaport(
      this.config.seaportContractAddress,
      this.config.zoneContractAddress,
      this.config.provider,
    ).constructSeaportOrder(
      offerer,
      listingItem,
      considerationItem,
      royaltyInfo,
      // Default order expiry to 2 years from now
      orderExpiry || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
    );
  }

  createOrder(createOrderParams: CreateOrderParams): Promise<Order> {
  }
}
