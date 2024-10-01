import { ModuleConfiguration } from '@imtbl/config';
import { track } from '@imtbl/metrics';
import { ImmutableApiClient, ImmutableApiClientFactory } from './api-client';
import {
  getConfiguredProvider,
  getOrderbookConfig,
  OrderbookModuleConfiguration,
  OrderbookOverrides,
} from './config/config';
import {
  mapBidFromOpenApiOrder,
  mapCollectionBidFromOpenApiOrder,
  mapFromOpenApiPage,
  mapFromOpenApiTrade,
  mapListingFromOpenApiOrder,
  mapOrderFromOpenApiOrder,
} from './openapi/mapper';
import {
  ApiError, CancelOrdersResult, FulfillmentDataRequest, Fee as OpenApiFee,
} from './openapi/sdk';
import { Seaport } from './seaport';
import { getBulkSeaportOrderSignatures } from './seaport/components';
import { SeaportLibFactory } from './seaport/seaport-lib-factory';
import {
  Action,
  ActionType,
  BidResult,
  CancelOrdersOnChainResponse,
  CollectionBidResult,
  CreateBidParams,
  CreateCollectionBidParams,
  CreateListingParams,
  FeeValue,
  FulfillBulkOrdersResponse,
  FulfillmentListing,
  FulfillmentOrder,
  FulfillOrderResponse,
  ListBidsParams,
  ListBidsResult,
  ListingResult,
  ListListingsParams,
  ListListingsResult,
  ListTradesParams,
  ListTradesResult,
  OrderStatusName,
  PrepareBidParams,
  PrepareBidResponse,
  PrepareBulkListingsParams,
  PrepareBulkListingsResponse,
  PrepareCancelOrdersResponse,
  PrepareCollectionBidParams,
  PrepareCollectionBidResponse,
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

  // Default order expiry to 2 years from now
  static defaultOrderExpiry(): Date {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2);
  }

  /**
   * Return the configuration for the orderbook module.
   * @return {OrderbookModuleConfiguration} The configuration for the orderbook module.
   */
  config(): OrderbookModuleConfiguration {
    return this.orderbookConfig;
  }

  /**
   * Get a listing by ID
   * @param {string} listingId - The listingId to find.
   * @return {ListingResult} The returned listing result.
   */
  async getListing(listingId: string): Promise<ListingResult> {
    const apiListing = await this.apiClient.getListing(listingId);
    return {
      result: mapListingFromOpenApiOrder(apiListing.result),
    };
  }

  /**
   * Get a bid by ID
   * @param {string} bidId - The bidId to find.
   * @return {BidResult} The returned bid result.
   */
  async getBid(bidId: string): Promise<BidResult> {
    const apiBid = await this.apiClient.getBid(bidId);
    return {
      result: mapBidFromOpenApiOrder(apiBid.result),
    };
  }

  /**
   * Get a collection bid by ID
   * @param {string} collectionBidId - The collectionBidId to find.
   * @return {CollectionBidResult} The returned collection bid result.
   */
  async getCollectionBid(collectionBidId: string): Promise<CollectionBidResult> {
    const apiCollectionBid = await this.apiClient.getCollectionBid(collectionBidId);
    return {
      result: mapCollectionBidFromOpenApiOrder(apiCollectionBid.result),
    };
  }

  /**
   * Get a trade by ID
   * @param {string} tradeId - The tradeId to find.
   * @return {TradeResult} The returned trade result.
   */
  async getTrade(tradeId: string): Promise<TradeResult> {
    const apiTrade = await this.apiClient.getTrade(tradeId);
    return {
      result: mapFromOpenApiTrade(apiTrade.result),
    };
  }

  /**
   * List listings. This method is used to get a list of listings filtered by conditions specified
   * in the params object.
   * @param {ListListingsParams} listOrderParams - Filtering, ordering and page parameters.
   * @return {ListListingsResult} The paged listings.
   */
  async listListings(
    listOrderParams: ListListingsParams,
  ): Promise<ListListingsResult> {
    const apiListings = await this.apiClient.listListings(listOrderParams);
    return {
      page: mapFromOpenApiPage(apiListings.page),
      result: apiListings.result.map(mapListingFromOpenApiOrder),
    };
  }

  /**
   * List bids. This method is used to get a list of bids filtered by conditions specified
   * in the params object.
   * @param {ListBidsParams} listOrderParams - Filtering, ordering and page parameters.
   * @return {ListBidsResult} The paged bids.
   */
  async listBids(
    listOrderParams: ListBidsParams,
  ): Promise<ListBidsResult> {
    const apiBids = await this.apiClient.listBids(listOrderParams);
    return {
      page: mapFromOpenApiPage(apiBids.page),
      result: apiBids.result.map(mapBidFromOpenApiOrder),
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
    const apiTrades = await this.apiClient.listTrades(listTradesParams);
    return {
      page: mapFromOpenApiPage(apiTrades.page),
      result: apiTrades.result.map(mapFromOpenApiTrade),
    };
  }

  /**
   * Get required transactions and messages for signing to facilitate creating bulk listings.
   * Once the transactions are submitted and the message signed, call the
   * {@linkcode PrepareBulkListingsResponse.completeListings} method provided in the return
   * type with the signature. This method supports up to 20 listing creations
   * at a time. It can also be used for individual listings to simplify integration code paths.
   *
   * Bulk listings created using an EOA (Metamask) will require a single listing confirmation
   * signature.
   * Bulk listings creating using a smart contract wallet will require multiple listing confirmation
   * signatures (as many as the number of orders).
   * @param {PrepareBulkListingsParams} prepareBulkListingsParams - Details about the listings
   * to be created.
   * @return {PrepareBulkListingsResponse} PrepareBulkListingsResponse includes
   * any unsigned approval transactions, the typed bulk order message for signing and
   * the {@linkcode PrepareBulkListingsResponse.completeListings} method that can be called with
   * the signature(s) to create the listings.
   */
  async prepareBulkListings(
    {
      makerAddress,
      listingParams,
    }: PrepareBulkListingsParams,
  ): Promise<PrepareBulkListingsResponse> {
    // Limit bulk listing creation to 20 orders to prevent API and order evaluation spam
    if (listingParams.length > 20) {
      throw new Error('Bulk listing creation is limited to 20 orders');
    }

    // Bulk listings (with single listing) code path common for both Smart contract
    // wallets and EOAs.
    // In the event of a single order, delegate to prepareListing as the signature is more
    // gas efficient
    if (listingParams.length === 1) {
      const prepareListingResponse = await this.seaport.prepareSeaportOrder(
        makerAddress,
        listingParams[0].sell,
        listingParams[0].buy,
        listingParams[0].sell.type === 'ERC1155',
        listingParams[0].orderStart || new Date(),
        listingParams[0].orderExpiry || Orderbook.defaultOrderExpiry(),
      );

      return {
        actions: prepareListingResponse.actions,
        completeListings: async (signatures: string | string[]) => {
          const createListingResult = await this.createListing({
            makerFees: listingParams[0].makerFees,
            orderComponents: prepareListingResponse.orderComponents,
            orderHash: prepareListingResponse.orderHash,
            orderSignature: typeof signatures === 'string' ? signatures : signatures[0],
          });

          return {
            result: [{
              success: true,
              orderHash: prepareListingResponse.orderHash,
              order: createListingResult.result,
            }],
          };
        },
      };
    }

    // Bulk listings (with multiple listings) code path for Smart contract wallets.
    // Code check to determine wallet type is not fool-proof but scenarios where smart
    // contract wallet is not deployed will be an edge case
    const isSmartContractWallet: boolean = await this.orderbookConfig.provider.getCode(makerAddress) !== '0x';
    if (isSmartContractWallet) {
      track('orderbookmr', 'bulkListings', { walletType: 'Passport', makerAddress, listingsCount: listingParams.length });

      // eslint-disable-next-line max-len
      const prepareListingResponses = await Promise.all(listingParams.map((listing) => this.seaport.prepareSeaportOrder(
        makerAddress,
        listing.sell,
        listing.buy,
        listing.sell.type === 'ERC1155',
        listing.orderStart || new Date(),
        listing.orderExpiry || Orderbook.defaultOrderExpiry(),
      )));

      const pendingApproval: string[] = [];
      const actions = prepareListingResponses.flatMap((response) => {
        // de-dupe approval transactions to ensure every contract has
        // a maximum of 1 approval transaction
        const dedupedActions: Action[] = [];
        response.actions.forEach((action) => {
          if (action.type === ActionType.TRANSACTION) {
            // Assuming only a single item is on offer per listing
            const contractAddress = response.orderComponents.offer[0].token;
            if (!pendingApproval.includes(contractAddress)) {
              pendingApproval.push(contractAddress);
              dedupedActions.push(action);
            }
          } else {
            dedupedActions.push(action);
          }
        });
        return dedupedActions;
      });

      return {
        actions,
        completeListings: async (signatures: string | string[]) => {
          const signatureIsString = typeof signatures === 'string';
          if (signatureIsString) {
            throw new Error('A signature per listing must be provided for smart contract wallets');
          }

          const createListingsApiResponses = await Promise.all(
            prepareListingResponses.map((prepareListingResponse, i) => {
              const signature = signatures[i];
              return this.apiClient.createListing({
                makerFees: listingParams[i].makerFees,
                orderComponents: prepareListingResponse.orderComponents,
                orderHash: prepareListingResponse.orderHash,
                orderSignature: signature,
                // Swallow failed creations,this gets mapped in the response to the caller as failed
              }).catch(() => undefined);
            }),
          );

          return {
            result: createListingsApiResponses.map((apiListingResponse, i) => ({
              success: !!apiListingResponse,
              orderHash: prepareListingResponses[i].orderHash,
              // eslint-disable-next-line max-len
              order: apiListingResponse ? mapListingFromOpenApiOrder(apiListingResponse.result) : undefined,
            })),
          };
        },
      };
    }

    // Bulk listings (with multiple listings) code path for EOA wallets.
    track('orderbookmr', 'bulkListings', { walletType: 'EOA', makerAddress, listingsCount: listingParams.length });
    const { actions, preparedOrders } = await this.seaport.prepareBulkSeaportOrders(
      makerAddress,
      listingParams.map((listing) => ({
        offerItem: listing.sell,
        considerationItem: listing.buy,
        allowPartialFills: listing.sell.type === 'ERC1155',
        orderStart: listing.orderStart || new Date(),
        orderExpiry: listing.orderExpiry || Orderbook.defaultOrderExpiry(),
      })),
    );

    return {
      actions,
      completeListings: async (signatures: string | string[]) => {
        const signatureIsArray = typeof signatures === 'object';
        if (signatureIsArray && signatures.length !== 1) {
          throw new Error('Only a single signature is expected for bulk listing creation');
        }

        const orderComponents = preparedOrders.map((orderParam) => orderParam.orderComponents);
        const signature = signatureIsArray ? signatures[0] : signatures;
        const bulkOrderSignatures = getBulkSeaportOrderSignatures(
          signature,
          orderComponents,
        );

        const createOrdersApiListingResponse = await Promise.all(
          orderComponents.map((orderComponent, i) => {
            const sig = bulkOrderSignatures[i];
            const listing = preparedOrders[i];
            const listingParam = listingParams[i];
            return this.apiClient.createListing({
              orderComponents: orderComponent,
              orderHash: listing.orderHash,
              orderSignature: sig,
              makerFees: listingParam.makerFees,
            // Swallow failed creations - this gets mapped in the response to the caller as failed
            }).catch(() => undefined);
          }),
        );

        return {
          result: createOrdersApiListingResponse.map((apiListingResponse, i) => ({
            success: !!apiListingResponse,
            orderHash: preparedOrders[i].orderHash,
            order: apiListingResponse
              ? mapListingFromOpenApiOrder(apiListingResponse.result)
              : undefined,
          })),
        };
      },
    };
  }

  /**
   * Get required transactions and messages for signing prior to creating a listing
   * through the {@linkcode createListing} method
   * @param {PrepareListingParams} prepareListingParams - Details about the listing to be created.
   * @return {PrepareListingResponse} PrepareListingResponse includes
   * the unsigned approval transaction, the typed order message for signing and
   * the order components that can be submitted to {@linkcode createListing} with a signature.
   */
  async prepareListing({
    makerAddress,
    sell,
    buy,
    orderStart,
    orderExpiry,
  }: PrepareListingParams): Promise<PrepareListingResponse> {
    return this.seaport.prepareSeaportOrder(
      makerAddress,
      sell,
      buy,
      sell.type === 'ERC1155',
      // Default order start to now
      orderStart || new Date(),
      // Default order expiry to 2 years from now
      orderExpiry || Orderbook.defaultOrderExpiry(),
    );
  }

  /**
   * Create a listing
   * @param {CreateListingParams} createListingParams - create a listing with the given params.
   * @return {ListingResult} The result of the listing created in the Immutable services.
   */
  async createListing(
    createListingParams: CreateListingParams,
  ): Promise<ListingResult> {
    const apiListingResponse = await this.apiClient.createListing(createListingParams);

    return {
      result: mapListingFromOpenApiOrder(apiListingResponse.result),
    };
  }

  /**
   * Get required transactions and messages for signing prior to creating a bid
   * through the {@linkcode createBid} method
   * @param {PrepareBidParams} prepareBidParams - Details about the bid to be created.
   * @return {PrepareBidResponse} PrepareBidResponse includes
   * the unsigned approval transaction, the typed order message for signing and
   * the order components that can be submitted to {@linkcode createBid} with a signature.
   */
  async prepareBid({
    makerAddress,
    sell,
    buy,
    orderStart,
    orderExpiry,
  }: PrepareBidParams): Promise<PrepareBidResponse> {
    return this.seaport.prepareSeaportOrder(
      makerAddress,
      sell,
      buy,
      buy.type === 'ERC1155',
      // Default order start to now
      orderStart || new Date(),
      // Default order expiry to 2 years from now
      orderExpiry || Orderbook.defaultOrderExpiry(),
    );
  }

  /**
   * Create a bid
   * @param {CreateBidParams} createBidParams - create a bid with the given params.
   * @return {BidResult} The result of the bid created in the Immutable services.
   */
  async createBid(
    createBidParams: CreateBidParams,
  ): Promise<BidResult> {
    const apiBidResponse = await this.apiClient.createBid(createBidParams);

    return {
      result: mapBidFromOpenApiOrder(apiBidResponse.result),
    };
  }

  /**
   * Get required transactions and messages for signing prior to creating a collection bid
   * through the {@linkcode createCollectionBid} method
   * @param {PrepareCollectionBidParams} - Details about the collection bid to be created.
   * @return {PrepareCollectionBidResponse} PrepareCollectionBidResponse includes
   * the unsigned approval transaction, the typed order message for signing and
   * the order components that can be submitted to {@linkcode createCollectionBid} with a signature.
   */
  async prepareCollectionBid({
    makerAddress,
    sell,
    buy,
    orderStart,
    orderExpiry,
  }: PrepareCollectionBidParams): Promise<PrepareCollectionBidResponse> {
    return this.seaport.prepareSeaportOrder(
      makerAddress,
      sell,
      buy,
      true,
      // Default order start to now
      orderStart || new Date(),
      // Default order expiry to 2 years from now
      orderExpiry || Orderbook.defaultOrderExpiry(),
    );
  }

  /**
   * Create a collection bid
   * @param {CreateCollectionBidParams} createCollectionBidParams create a collection bid
   *                                                              with the given params.
   * @return {CollectionBidResult} The result of the collection bid created
   *                               in the Immutable services.
   */
  async createCollectionBid(
    createCollectionBidParams: CreateCollectionBidParams,
  ): Promise<CollectionBidResult> {
    const apiCollectionBidResponse = await this.apiClient.createCollectionBid(
      createCollectionBidParams,
    );

    return {
      result: mapCollectionBidFromOpenApiOrder(apiCollectionBidResponse.result),
    };
  }

  /**
   * Get unsigned transactions that can be submitted to fulfil an open order. If the approval
   * transaction exists it must be signed and submitted to the chain before the fulfilment
   * transaction can be submitted or it will be reverted.
   * @param {string} orderId - The orderId to fulfil.
   * @param {string} takerAddress - The address of the account fulfilling the order.
   * @param {FeeValue[]} takerFees - Taker ecosystem fees to be paid.
   * @param {string} amountToFill - Amount of the order to fill, defaults to sell item amount.
   *                                Only applies to ERC1155 orders
   * @return {FulfillOrderResponse} Approval and fulfilment transactions.
   */
  async fulfillOrder(
    orderId: string,
    takerAddress: string,
    takerFees: FeeValue[],
    amountToFill?: string,
    tokenId?: string,
  ): Promise<FulfillOrderResponse> {
    const fulfillmentDataParams: FulfillmentDataRequest = {
      order_id: orderId,
      taker_address: takerAddress,
      fees: takerFees.map((fee) => ({
        type: OpenApiFee.type.TAKER_ECOSYSTEM,
        amount: fee.amount,
        recipient_address: fee.recipientAddress,
      })),
    };

    const considerationCriteria = tokenId
      ? [{ identifier: tokenId, proof: [] }]
      : undefined;

    // if token ID is present we can assume it is a criteria based order for now
    if (tokenId) fulfillmentDataParams.token_id = tokenId;

    const fulfillmentDataRes = await this.apiClient.fulfillmentData([fulfillmentDataParams]);

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

    return this.seaport.fulfillOrder(
      orderResult,
      takerAddress,
      extraData,
      amountToFill,
      considerationCriteria,
    );
  }

  /**
   * Get unsigned transactions that can be submitted to fulfil multiple open orders. If approval
   * transactions exist, they must be signed and submitted to the chain before the fulfilment
   * transaction can be submitted or it will be reverted.
   * @param {FulfillmentOrder[]} orders - The details of the orders to fulfil, amounts
   *                                               to fill and taker ecosystem fees to be paid.
   * @param {string} takerAddress - The address of the account fulfilling the order.
   * @return {FulfillBulkOrdersResponse} Approval and fulfilment transactions.
   */
  async fulfillBulkOrders(
    orders: FulfillmentOrder[] | FulfillmentListing[],
    takerAddress: string,
  ): Promise<FulfillBulkOrdersResponse> {
    const mappedOrders = orders.map((order): FulfillmentOrder => ({
      orderId: 'listingId' in order ? order.listingId : order.orderId,
      takerFees: order.takerFees,
      amountToFill: order.amountToFill,
    }));

    const fulfillmentDataRes = await this.apiClient.fulfillmentData(
      mappedOrders.map((fulfillmentRequest) => ({
        order_id: fulfillmentRequest.orderId,
        taker_address: takerAddress,
        fees: fulfillmentRequest.takerFees.map((fee) => ({
          type: OpenApiFee.type.TAKER_ECOSYSTEM,
          amount: fee.amount,
          recipient_address: fee.recipientAddress,
        })),
      })),
    );

    try {
      const fulfillableOrdersWithUnits = fulfillmentDataRes.result.fulfillable_orders
        .map((fulfillmentData) => {
        // Find the order that corresponds to the order for the units
          const order = mappedOrders.find((l) => l.orderId === fulfillmentData.order.id);
          if (!order) {
            throw new Error(`Could not find order for order ${fulfillmentData.order.id}`);
          }

          return {
            extraData: fulfillmentData.extra_data,
            order: fulfillmentData.order,
            unitsToFill: order.amountToFill,
          };
        });

      return {
        ...(await this.seaport.fulfillBulkOrders(
          fulfillableOrdersWithUnits,
          takerAddress,
        )),
        fulfillableOrders: fulfillmentDataRes.result.fulfillable_orders.map(
          (o) => mapOrderFromOpenApiOrder(o.order),
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
            (o) => mapOrderFromOpenApiOrder(o.order),
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
   * {@linkcode cancelOrdersOnChain}. For the orderbook to authenticate the cancellation,
   * the creator of the orders must sign an EIP712 message containing the orderIds.
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
   * {@linkcode cancelOrdersOnChain}. Orders cancelled this way cannot be fulfilled and
   * will be removed from the orderbook. If there is pending fulfillment data outstanding
   * for the order, its cancellation will be pending until the fulfillment window has passed.
   * {@linkcode prepareOrderCancellations} can be used to get the signable action that is signed
   * to get the signature required for this call.
   * @param {string[]} orderIds - The orderIds to attempt to cancel.
   * @param {string} accountAddress - The address of the account cancelling the orders.
   * @param {string} signature - The signature obtained by signing the
   * message obtained from {@linkcode prepareOrderCancellations}.
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
    const listingResultsPromises = Promise.all(
      orderIds.map((id) => this.apiClient.getListing(id).catch((e: ApiError) => {
        if (e.status === 404) {
          return undefined;
        }
        throw e;
      })),
    );

    const bidResultsPromises = Promise.all(
      orderIds.map((id) => this.apiClient.getBid(id).catch((e: ApiError) => {
        if (e.status === 404) {
          return undefined;
        }
        throw e;
      })),
    );

    const collectionBidResultsPromises = Promise.all(
      orderIds.map((id) => this.apiClient.getCollectionBid(id).catch((e: ApiError) => {
        if (e.status === 404) {
          return undefined;
        }
        throw e;
      })),
    );

    const orders = [
      await Promise.all([listingResultsPromises, bidResultsPromises, collectionBidResultsPromises]),
    ].flat(2).filter((r) => r !== undefined).map((f) => f.result);

    if (orders.length !== orderIds.length) {
      const notFoundOrderIds = orderIds.filter((oi) => !orders.some((o) => o.id === oi));
      throw new Error(`Orders ${notFoundOrderIds} not found`);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const order of orders) {
      if (order.account_address !== accountAddress.toLowerCase()) {
        throw new Error(
          `Only account ${order.account_address} can cancel order ${order.id}`,
        );
      }
    }

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
