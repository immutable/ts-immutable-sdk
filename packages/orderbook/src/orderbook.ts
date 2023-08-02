import { ModuleConfiguration } from '@imtbl/config';
import { ImmutableApiClient, ImmutableApiClientFactory } from 'api-client';
import {
  getOrderbookConfig,
  OrderbookModuleConfiguration,
  OrderbookOverrides,
} from 'config/config';
import { ERC721Factory } from 'erc721';
import { ListingResult, ListListingsResult, OrderStatus } from 'openapi/sdk';
import { Seaport } from 'seaport';
import {
  CancelOrderResponse,
  CreateListingParams,
  FulfillOrderResponse,
  ListListingsParams,
  PrepareListingParams,
  PrepareListingResponse,
} from 'types';
import { SeaportLibFactory } from './seaport/seaport-lib-factory';

/**
 * zkEVM orderbook SDK
 * @constructor
 * @param {OrderbookModuleConfiguration} config - Configuration for Immutable services.
 */
export class Orderbook {
  private apiClient: ImmutableApiClient;

  private seaport: Seaport;

  private orderbookConfig: OrderbookModuleConfiguration;

  constructor(config: ModuleConfiguration<OrderbookOverrides>) {
    const obConfig = getOrderbookConfig(config.baseConfig.environment);

    const finalConfig: OrderbookModuleConfiguration = {
      ...obConfig,
      ...config.overrides,
    } as OrderbookModuleConfiguration;

    if (!finalConfig) {
      throw new Error(
        'Orderbook configuration not passed, please specify the environment under config.baseConfig.environment',
      );
    }

    this.orderbookConfig = finalConfig;

    const { apiEndpoint, chainName } = this.orderbookConfig;
    if (!apiEndpoint) {
      throw new Error('API endpoint must be provided');
    }

    this.apiClient = new ImmutableApiClientFactory(
      apiEndpoint,
      chainName,
      this.orderbookConfig.seaportContractAddress,
    ).create();

    const seaportLibFactory = new SeaportLibFactory(
      this.orderbookConfig.seaportContractAddress,
      this.orderbookConfig.provider,
    );
    this.seaport = new Seaport(
      seaportLibFactory,
      this.orderbookConfig.provider,
      this.orderbookConfig.seaportContractAddress,
      this.orderbookConfig.zoneContractAddress,
    );
  }

  /**
   * Get an order by ID
   * @param {string} listingId - The listingId to find.
   * @return {ListingResult} The returned order result.
   */
  getListing(listingId: string): Promise<ListingResult> {
    return this.apiClient.getListing(listingId);
  }

  /**
   * List orders. This method is used to get a list of orders filtered by conditions specified
   * in the params object.
   * @param {ListOrderParams} listOrderParams - Filtering, ordering and page parameters.
   * @return {Orders} The paged orders.
   */
  listListings(
    listOrderParams: ListListingsParams,
  ): Promise<ListListingsResult> {
    return this.apiClient.listListings(listOrderParams);
  }

  /**
   * Get required transactions and messages for signing prior to creating a listing
   * through the createListing method
   * @param {PrepareListingParams} prepareListingParams - Details about the listing to be created.
   * @return {PrepareListingResponse} PrepareListingResponse includes
   * the unsigned approval transaction, the typed order message for signing and
   * the order components that can be submitted to `createListing` with a signature.
   */
  async prepareListing({
    makerAddress,
    sell,
    buy,
    orderExpiry,
  }: PrepareListingParams): Promise<PrepareListingResponse> {
    const erc721 = new ERC721Factory(
      sell.contractAddress,
      this.orderbookConfig.provider,
    ).create();
    const royaltyInfo = await erc721.royaltyInfo(sell.tokenId, buy.amount);

    return this.seaport.prepareSeaportOrder(
      makerAddress,
      sell,
      buy,
      royaltyInfo,
      // Default order start to now
      new Date(),
      // Default order expiry to 2 years from now
      orderExpiry || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
    );
  }

  /**
   * Create an order
   * @param {CreateListingParams} createListingParams - create an order with the given params.
   * @return {ListingResult} The result of the order created in the Immutable services.
   */
  createListing(
    createListingParams: CreateListingParams,
  ): Promise<ListingResult> {
    return this.apiClient.createListing(createListingParams);
  }

  /**
   * Get unsigned transactions that can be submitted to fulfil an open order. If the approval
   * transaction exists it must be signed and submitted to the chain before the fulfilment
   * transaction can be submitted or it will be reverted.
   * @param {string} listingId - The listingId to fulfil.
   * @param {string} fulfillerAddress - The address of the account fulfilling the order.
   * @return {FulfillOrderResponse} Approval and fulfilment transactions.
   */
  async fulfillOrder(
    listingId: string,
    takerAddress: string,
  ): Promise<FulfillOrderResponse> {
    const orderResult = await this.apiClient.getListing(listingId);

    if (orderResult.result.status !== OrderStatus.ACTIVE) {
      throw new Error(
        `Cannot fulfil order that is not active. Current status: ${orderResult.result.status}`,
      );
    }

    return this.seaport.fulfilOrder(orderResult.result, takerAddress);
  }

  /**
   * Get an unsigned cancel order transaction. Orders can only be cancelled by
   * the account that created them.
   * @param {string} listingId - The listingId to cancel.
   * @param {string} accountAddress - The address of the account cancelling the order.
   * @return {CancelOrderResponse} The unsigned cancel order transaction
   */
  async cancelOrder(
    listingId: string,
    accountAddress: string,
  ): Promise<CancelOrderResponse> {
    const orderResult = await this.apiClient.getListing(listingId);

    if (
      orderResult.result.status !== OrderStatus.ACTIVE
      && orderResult.result.status !== OrderStatus.INACTIVE
      && orderResult.result.status !== OrderStatus.PENDING
    ) {
      throw new Error(
        `Cannot cancel order with status ${orderResult.result.status}`,
      );
    }

    if (orderResult.result.account_address !== accountAddress.toLowerCase()) {
      throw new Error(
        `Only account ${orderResult.result.account_address} can cancel order ${listingId}`,
      );
    }

    const cancelOrderTransaction = await this.seaport.cancelOrder(
      orderResult.result,
      accountAddress,
    );
    return { unsignedCancelOrderTransaction: cancelOrderTransaction };
  }
}
