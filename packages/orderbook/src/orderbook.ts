import { ModuleConfiguration } from '@imtbl/config';
import { ImmutableApiClient, ImmutableApiClientFactory } from './api-client';
import {
  getOrderbookConfig,
  OrderbookModuleConfiguration,
  OrderbookOverrides,
} from './config/config';
import { Fee as OpenApiFee } from './openapi/sdk';
import { mapFromOpenApiOrder, mapFromOpenApiPage } from './openapi/mapper';
import { Seaport } from './seaport';
import { SeaportLibFactory } from './seaport/seaport-lib-factory';
import {
  CancelOrderResponse,
  CreateListingParams,
  Fee,
  FeeType,
  FeeValue,
  FulfillOrderResponse,
  ListListingsParams,
  ListListingsResult,
  ListingResult,
  OrderStatus,
  PrepareListingParams,
  PrepareListingResponse,
} from './types';

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
   * Return the configuration for the orderbook module.
   * @return {OrderbookModuleConfiguration} The configuration for the orderbook module.
   */
  config(): OrderbookModuleConfiguration {
    return this.orderbookConfig;
  }

  /**
   * Get an order by ID
   * @param {string} listingId - The listingId to find.
   * @return {ListingResult} The returned order result.
   */
  async getListing(listingId: string): Promise<ListingResult> {
    const apiListing = await this.apiClient.getListing(listingId);
    return {
      result: mapFromOpenApiOrder(apiListing.result),
    };
  }

  /**
   * List orders. This method is used to get a list of orders filtered by conditions specified
   * in the params object.
   * @param {ListListingsParams} listOrderParams - Filtering, ordering and page parameters.
   * @return {ListListingsResult} The paged orders.
   */
  async listListings(
    listOrderParams: ListListingsParams,
  ): Promise<ListListingsResult> {
    const apiListings = await this.apiClient.listListings(listOrderParams);
    return {
      page: mapFromOpenApiPage(apiListings.page),
      result: apiListings.result.map(mapFromOpenApiOrder),
    };
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
    return this.seaport.prepareSeaportOrder(
      makerAddress,
      sell,
      buy,
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
  async createListing(
    createListingParams: CreateListingParams,
  ): Promise<ListingResult> {
    const makerFee: Fee | undefined = createListingParams.makerFee
      ? {
        ...createListingParams.makerFee,
        type: FeeType.MAKER_MARKETPLACE,
      }
      : undefined;

    const apiListingResponse = await this.apiClient.createListing({
      ...createListingParams,
      makerFee,
    });

    return {
      result: mapFromOpenApiOrder(apiListingResponse.result),
    };
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
    takerFee?: FeeValue,
  ): Promise<FulfillOrderResponse> {
    const fulfillmentDataRes = await this.apiClient.fulfillmentData([
      {
        order_id: listingId,
        fee: takerFee
          ? {
            amount: takerFee.amount,
            fee_type: FeeType.TAKER_MARKETPLACE as unknown as OpenApiFee.fee_type.TAKER_MARKETPLACE,
            recipient: takerFee.recipient,
          }
          : undefined,
      },
    ]);

    if (fulfillmentDataRes.result.length !== 1) {
      throw new Error('unexpected fulfillment data result length');
    }

    const extraData = fulfillmentDataRes.result[0].extra_data;
    const orderResult = fulfillmentDataRes.result[0].order;

    if (orderResult.status !== OrderStatus.ACTIVE) {
      throw new Error(
        `Cannot fulfil order that is not active. Current status: ${orderResult.status}`,
      );
    }

    return this.seaport.fulfillOrder(orderResult, takerAddress, extraData);
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
