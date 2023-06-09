import { ImmutableApiClient, ImmutableApiClientFactory } from 'api-client';
import { OrderbookModuleConfiguration } from 'config/config';
import { ERC721Factory } from 'erc721';
import { OrderStatus, ListOrdersResult, OrderResult } from 'openapi/sdk';
import { Seaport, SeaportFactory } from 'seaport';
import {
  CancelOrderResponse,
  CreateOrderParams,
  FulfilOrderResponse,
  ListOrderParams,
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
    const chainName = config.overrides?.chainName;
    if (!chainName) {
      throw new Error('chainName must be provided as an override');
    }

    this.apiClient = new ImmutableApiClientFactory(
      apiEndpoint,
      chainName,
      this.config.seaportContractAddress,
    ).create();

    this.seaport = new SeaportFactory(
      this.config.seaportContractAddress,
      this.config.zoneContractAddress,
      this.config.provider,
    ).create();
  }

  /**
   * Get an order by ID
   * @param {string} orderId - The orderId to find.
   * @return {OrderResult} The returned order result.
   */
  getOrder(orderId: string): Promise<OrderResult> {
    return this.apiClient.getOrder(orderId);
  }

  /**
   * List orders. This method is used to get a list of orders filtered by conditions specified
   * in the params object.
   * @param {ListOrderParams} listOrderParams - Filtering, ordering and page parameters.
   * @return {Orders} The paged orders.
   */
  listOrders(listOrderParams: ListOrderParams): Promise<ListOrdersResult> {
    return this.apiClient.listOrders(listOrderParams);
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
   * @return {OrderResult} The result of the order created in the Immutable services.
   */
  createOrder(createOrderParams: CreateOrderParams): Promise<OrderResult> {
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
    const orderResult = await this.apiClient.getOrder(orderId);

    if (orderResult.result.status !== OrderStatus.ACTIVE) {
      throw new Error(`Cannot fulfil order that is not active. Current status: ${orderResult.result.status}`);
    }

    return this.seaport.fulfilOrder(orderResult.result, fulfillerAddress);
  }

  /**
   * Get an unsigned cancel order transaction. Orders can only be cancelled by
   * the account that created them.
   * @param {string} orderId - The orderId to cancel.
   * @param {string} accountAddress - The address of the account cancelling the order.
   * @return {CancelOrderResponse} The unsigned cancel order transaction
   */
  async cancelOrder(orderId: string, accountAddress: string): Promise<CancelOrderResponse> {
    const orderResult = await this.apiClient.getOrder(orderId);

    if (
      orderResult.result.status !== OrderStatus.ACTIVE
      && orderResult.result.status !== OrderStatus.INACTIVE
      && orderResult.result.status !== OrderStatus.PENDING
    ) {
      throw new Error(`Cannot cancel order with status ${orderResult.result.status}`);
    }

    if (orderResult.result.account_address !== accountAddress.toLowerCase()) {
      throw new Error(`Only account ${orderResult.result.account_address} can cancel order ${orderId}`);
    }

    const cancelOrderTransaction = await this.seaport.cancelOrder(
      orderResult.result,
      accountAddress,
    );
    return { unsignedCancelOrderTransaction: cancelOrderTransaction };
  }
}
