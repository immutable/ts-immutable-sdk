import { ImmutableApiClient, ImmutableApiClientFactory } from 'api-client';
import { OrderbookModuleConfiguration } from 'config/config';
import { ERC721Factory } from 'erc721';
import { Order, OrderStatus } from 'openapi/sdk';
import { Seaport, SeaportFactory } from 'seaport';
import {
  CancelOrderResponse,
  CreateOrderParams,
  FulfilOrderResponse,
  PrepareListingParams,
  PrepareListingResponse,
} from 'types';

/**
 * zkEVM orderbook SDK
 * @constructor
 * @param {OrderbookModuleConfiguration} config - Configuration for Immutable services.
 */
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

  /**
   * Get an order by ID
   * @param {string} orderId - The orderId to find.
   * @return {Order} The returned order.
   */
  getOrder(orderId: string): Promise<Order> {
    return this.apiClient.getOrder(orderId);
  }

  /**
   * Get required transactions and messages for signing prior to creating a listing
   * through the createOrder method
   * @param {PrepareListingParams} prepareListingParams - Details about the listing to be created.
   * @return {PrepareListingResponse} PrepareListingResponse includes
   * the unsigned approval transaction, the typed order message for signing and
   * the order components that can be submitted to `createOrder` with a signature.
   */
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
      // Default order start to now
      new Date(),
      // Default order expiry to 2 years from now
      orderExpiry || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
    );
  }

  /**
   * Create an order
   * @param {CreateOrderParams} createOrderParams - create an order with the given params.
   * @return {Order} The order created in the Immutable services.
   */
  createOrder(createOrderParams: CreateOrderParams): Promise<Order> {
    return this.apiClient.createOrder(createOrderParams);
  }

  /**
   * Get unsigned transactions that can be submitted to fulfil an open order. If the approval
   * transaction exists it must be signed and submitted to the chain before the fulfilment
   * transaction can be submitted or it will be reverted.
   * @param {string} orderId - The orderId to fulfil.
   * @param {string} fulfillerAddress - The address of the account fulfilling the order.
   * @return {FulfilOrderResponse} Approval and fulfilment transactions.
   */
  async fulfillOrder(orderId: string, fulfillerAddress: string): Promise<FulfilOrderResponse> {
    const order = await this.apiClient.getOrder(orderId);

    if (order.status !== OrderStatus.ACTIVE) {
      throw new Error(`Cannot fulfil order that is not active. Current status: ${order.status}`);
    }

    return this.seaport.fulfilOrder(order, fulfillerAddress);
  }

  /**
   * Get an unsigned cancel order transaction. Orders can only be cancelled by
   * the account that created them.
   * @param {string} orderId - The orderId to cancel.
   * @param {string} accountAddress - The address of the account cancelling the order.
   * @return {CancelOrderResponse} The unsigned cancel order transaction
   */
  async cancelOrder(orderId: string, accountAddress: string): Promise<CancelOrderResponse> {
    const order = await this.apiClient.getOrder(orderId);

    if (
      order.status !== OrderStatus.ACTIVE
      && order.status !== OrderStatus.INACTIVE
      && order.status !== OrderStatus.PENDING
    ) {
      throw new Error(`Cannot cancel order with status ${order.status}`);
    }

    if (order.account_address !== accountAddress.toLowerCase()) {
      throw new Error(`Only account ${order.account_address} can cancel order ${orderId}`);
    }

    const cancelOrderTransaction = await this.seaport.cancelOrder(order, accountAddress);
    return { unsignedCancelOrderTransaction: cancelOrderTransaction };
  }
}
