import { ImmutableApiClient, ImmutableApiClientFactory } from 'api-client';
import { OrderbookModuleConfiguration } from 'config/config';
import { ERC721Factory } from 'erc721';
import { Order } from 'openapi/sdk';
import { Seaport, SeaportFactory } from 'seaport';
import {
  CancelOrderResponse, CreateOrderParams, PrepareListingParams, PrepareListingResponse,
} from 'types';

export class Orderbook {
  private apiClient: ImmutableApiClient;

  private seaport: Seaport;

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

    this.apiClient = new ImmutableApiClientFactory(apiEndpoint, chainId).create();

    this.seaport = new SeaportFactory(
      this.config.seaportContractAddress,
      this.config.zoneContractAddress,
      this.config.provider,
    ).create();
  }

  getOrder(orderId: string): Promise<Order> {
    return this.apiClient.getOrder(orderId);
  }

  async prepareListing({
    offerer, listingItem, considerationItem, orderExpiry,
  }: PrepareListingParams): Promise<PrepareListingResponse> {
    const erc721 = new ERC721Factory(listingItem.contractAddress, this.config.provider).create();
    const royaltyInfo = await erc721.royaltyInfo(listingItem.tokenId, considerationItem.amount);

    return this.seaport.prepareSeaportOrder(
      offerer,
      listingItem,
      considerationItem,
      royaltyInfo,
      // Default order expiry to 2 years from now
      orderExpiry || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
    );
  }

  createOrder(createOrderParams: CreateOrderParams): Promise<Order> {
    return this.apiClient.createOrder(createOrderParams);
  }

  // fulfillOrder(createOrderParams: CreateOrderParams): Promise<Order> {
  // }

  async cancelOrder(orderId: string, accountAddress: string): Promise<CancelOrderResponse> {
    const order = await this.apiClient.getOrder(orderId);

    if (
      order.status !== Order.status.ACTIVE
      && order.status !== Order.status.INACTIVE
      && order.status !== Order.status.PENDING
    ) {
      throw new Error(`Cannot cancel order with status ${order.status}`);
    }

    if (order.account_address !== accountAddress) {
      throw new Error(`Only account ${order.account_address} can cancel order ${orderId}`);
    }

    const cancelOrderTransaction = await this.seaport.cancelOrder(order, accountAddress);
    return { unsignedCancelOrderTransaction: cancelOrderTransaction };
  }
}
