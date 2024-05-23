import { ModuleConfiguration } from '@imtbl/config';
import { ImmutableApiClient, ImmutableApiClientFactory } from './api-client';
import {
  getConfiguredProvider,
  getOrderbookConfig,
  OrderbookModuleConfiguration,
  OrderbookOverrides,
} from './config/config';
import { CancelOrdersResult, Fee as OpenApiFee } from './openapi/sdk';
import {
  mapFromOpenApiOrder,
  mapFromOpenApiPage,
  mapFromOpenApiTrade,
} from './openapi/mapper';
import { Seaport } from './seaport';
import { SeaportLibFactory } from './seaport/seaport-lib-factory';
import {
  ActionType,
  CancelOrdersOnChainResponse,
  CreateListingParams,
  FeeType,
  FeeValue,
  FulfillBulkOrdersResponse,
  FulfillmentListing,
  FulfillOrderResponse,
  ListingResult,
  ListListingsParams,
  ListListingsResult,
  ListTradesParams,
  ListTradesResult,
  OrderStatusName,
  PrepareCancelOrdersResponse,
  PrepareListingParams,
  PrepareListingResponse,
  SignablePurpose,
  TradeResult,
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
    const obConfig = getOrderbookConfig(config);

    const finalConfig: OrderbookModuleConfiguration = {
      ...obConfig,
      ...config.overrides,
    } as OrderbookModuleConfiguration;

    if (config.overrides?.jsonRpcProviderUrl) {
      finalConfig.provider = getConfiguredProvider(
        config.overrides?.jsonRpcProviderUrl!,
        config.baseConfig.rateLimitingKey,
      );
    }

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
      config.baseConfig.rateLimitingKey,
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
      config.baseConfig.rateLimitingKey,
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
   * Get a trade by ID
   * @param {string} tradeId - The tradeId to find.
   * @return {TradeResult} The returned order result.
   */
  async getTrade(tradeId: string): Promise<TradeResult> {
    const apiListing = await this.apiClient.getTrade(tradeId);
    return {
      result: mapFromOpenApiTrade(apiListing.result),
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
   * List trades. This method is used to get a list of trades filtered by conditions specified
   * in the params object
   * @param {ListTradesParams} listTradesParams - Filtering, ordering and page parameters.
   * @return {ListTradesResult} The paged trades.
   */
  async listTrades(
    listTradesParams: ListTradesParams,
  ): Promise<ListTradesResult> {
    const apiListings = await this.apiClient.listTrades(listTradesParams);
    return {
      page: mapFromOpenApiPage(apiListings.page),
      result: apiListings.result.map(mapFromOpenApiTrade),
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
    const apiListingResponse = await this.apiClient.createListing({
      ...createListingParams,
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
   * @param {string} takerAddress - The address of the account fulfilling the order.
   * @param {FeeValue[]} takerFees - Taker ecosystem fees to be paid.
   * @param {string} amountToFill - Amount of the order to fill, defaults to sell item amount.
   *                                Only applies to ERC1155 orders
   * @return {FulfillOrderResponse} Approval and fulfilment transactions.
   */
  async fulfillOrder(
    listingId: string,
    takerAddress: string,
    takerFees: FeeValue[],
    amountToFill?: string,
  ): Promise<FulfillOrderResponse> {
    const fulfillmentDataRes = await this.apiClient.fulfillmentData([
      {
        order_id: listingId,
        taker_address: takerAddress,
        fees: takerFees.map((fee) => ({
          amount: fee.amount,
          type:
            FeeType.TAKER_ECOSYSTEM as unknown as OpenApiFee.type.TAKER_ECOSYSTEM,
          recipient_address: fee.recipientAddress,
        })),
      },
    ]);

    if (fulfillmentDataRes.result.unfulfillable_orders?.length > 0) {
      throw new Error(
        `Unable to prepare fulfillment date: ${fulfillmentDataRes.result.unfulfillable_orders[0].reason}`,
      );
    } else if (fulfillmentDataRes.result.fulfillable_orders?.length !== 1) {
      throw new Error('unexpected fulfillable order result length');
    }

    const extraData = fulfillmentDataRes.result.fulfillable_orders[0].extra_data;
    const orderResult = fulfillmentDataRes.result.fulfillable_orders[0].order;

    if (orderResult.status.name !== OrderStatusName.ACTIVE) {
      throw new Error(
        `Cannot fulfil order that is not active. Current status: ${orderResult.status}`,
      );
    }

    return this.seaport.fulfillOrder(orderResult, takerAddress, extraData, amountToFill);
  }

  async fulfillBulkOrders(
    listings: Array<FulfillmentListing>,
    takerAddress: string,
  ): Promise<FulfillBulkOrdersResponse> {
    const fulfillmentDataRes = await this.apiClient.fulfillmentData(
      listings.map((listingRequest) => ({
        order_id: listingRequest.listingId,
        taker_address: takerAddress,
        fees: listingRequest.takerFees.map((fee) => ({
          amount: fee.amount,
          type:
            FeeType.TAKER_ECOSYSTEM as unknown as OpenApiFee.type.TAKER_ECOSYSTEM,
          recipient_address: fee.recipientAddress,
        })),
      })),
    );

    try {
      const fulfillableOrdersWithUnits = fulfillmentDataRes.result.fulfillable_orders
        .map((fulfillmentData) => {
        // Find the listing that corresponds to the order for the units
          const listing = listings.find((l) => l.listingId === fulfillmentData.order.id);
          if (!listing) {
            throw new Error(`Could not find listing for order ${fulfillmentData.order.id}`);
          }

          return {
            extraData: fulfillmentData.extra_data,
            order: fulfillmentData.order,
            unitsToFill: listing.amountToFill,
          };
        });

      return {
        ...(await this.seaport.fulfillBulkOrders(
          fulfillableOrdersWithUnits,
          takerAddress,
        )),
        fulfillableOrders: fulfillmentDataRes.result.fulfillable_orders.map(
          (o) => mapFromOpenApiOrder(o.order),
        ),
        unfulfillableOrders: fulfillmentDataRes.result.unfulfillable_orders.map(
          (o) => ({
            orderId: o.order_id,
            reason: o.reason,
          }),
        ),
        sufficientBalance: true,
      };
    } catch (e: any) {
      // if insufficient balance error, we return FulfillBulkOrdersInsufficientBalanceResponse
      if (String(e).includes('The fulfiller does not have the balances needed to fulfill.')) {
        return {
          fulfillableOrders: fulfillmentDataRes.result.fulfillable_orders.map(
            (o) => mapFromOpenApiOrder(o.order),
          ),
          unfulfillableOrders: fulfillmentDataRes.result.unfulfillable_orders.map(
            (o) => ({
              orderId: o.order_id,
              reason: o.reason,
            }),
          ),
          sufficientBalance: false,
        };
      }

      // if some other error is thrown,
      // there likely is a race condition of the original order validity
      // we throw the error back out
      throw e;
    }
  }

  /**
   * Cancelling orders is a gasless alternative to on-chain cancellation exposed with
   * `cancelOrdersOnChain`. For the orderbook to authenticate the cancellation, the creator
   * of the orders must sign an EIP712 message containing the orderIds
   * @param {string} orderIds - The orderIds to attempt to cancel.
   * @return {PrepareCancelOrdersResponse} The signable action to cancel the orders.
   */
  async prepareOrderCancellations(
    orderIds: string[],
  ): Promise<PrepareCancelOrdersResponse> {
    const network = await this.orderbookConfig.provider.getNetwork();
    const domain = {
      name: 'imtbl-order-book',
      chainId: network.chainId,
      verifyingContract: this.orderbookConfig.seaportContractAddress,
    };

    const types = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      CancelPayload: [
        { name: 'orders', type: 'Order[]' },
      ],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Order: [
        { name: 'id', type: 'string' },
      ],
    };

    const cancelMessage = {
      orders: orderIds.map((id) => ({ id })),
    };

    return {
      signableAction: {
        purpose: SignablePurpose.OFF_CHAIN_CANCELLATION,
        type: ActionType.SIGNABLE,
        message: {
          domain,
          types,
          value: cancelMessage,
        },
      },
    };
  }

  /**
   * Cancelling orders is a gasless alternative to on-chain cancellation exposed with
   * `cancelOrdersOnChain`. Orders cancelled this way cannot be fulfilled and will be removed
   * from the orderbook. If there is pending fulfillment data outstanding for the order, its
   * cancellation will be pending until the fulfillment window has passed.
   * `prepareOffchainOrderCancellations` can be used to get the signable action that is signed
   * to get the signature required for this call.
   * @param {string[]} orderIds - The orderIds to attempt to cancel.
   * @param {string} accountAddress - The address of the account cancelling the orders.
   * @param {string} accountAddress - The address of the account cancelling the orders.
   * @return {CancelOrdersResult} The result of the off-chain cancellation request
   */
  async cancelOrders(
    orderIds: string[],
    accountAddress: string,
    signature: string,
  ): Promise<CancelOrdersResult> {
    return this.apiClient.cancelOrders(
      orderIds,
      accountAddress,
      signature,
    );
  }

  /**
   * Get an unsigned order cancellation transaction. Orders can only be cancelled by
   * the account that created them. All of the orders must be from the same seaport contract.
   * If trying to cancel orders from multiple seaport contracts, group the orderIds by seaport
   * contract and call this method for each group.
   * @param {string[]} orderIds - The orderIds to cancel.
   * @param {string} accountAddress - The address of the account cancelling the order.
   * @return {CancelOrdersOnChainResponse} The unsigned cancel order action
   */
  async cancelOrdersOnChain(
    orderIds: string[],
    accountAddress: string,
  ): Promise<CancelOrdersOnChainResponse> {
    const orderResults = await Promise.all(orderIds.map((id) => this.apiClient.getListing(id)));

    // eslint-disable-next-line no-restricted-syntax
    for (const orderResult of orderResults) {
      if (
        orderResult.result.status.name !== OrderStatusName.ACTIVE
        && orderResult.result.status.name !== OrderStatusName.INACTIVE
        && orderResult.result.status.name !== OrderStatusName.PENDING
      ) {
        throw new Error(
          `Cannot cancel order with status ${orderResult.result.status}`,
        );
      }

      if (orderResult.result.account_address !== accountAddress.toLowerCase()) {
        throw new Error(
          `Only account ${orderResult.result.account_address} can cancel order ${orderResult.result.id}`,
        );
      }
    }

    const orders = orderResults.map((orderResult) => orderResult.result);
    const seaportAddresses = orders.map((o) => o.protocol_data.seaport_address);
    const distinctSeaportAddresses = new Set(...[seaportAddresses]);
    if (distinctSeaportAddresses.size !== 1) {
      throw new Error('Cannot cancel multiple orders from different seaport contracts. Please group your orderIds accordingly');
    }

    const cancellationAction = await this.seaport.cancelOrders(
      orders,
      accountAddress,
    );
    return { cancellationAction };
  }
}
