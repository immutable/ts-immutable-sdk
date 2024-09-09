/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BidResult } from '../models/BidResult';
import type { CancelOrdersRequestBody } from '../models/CancelOrdersRequestBody';
import type { CancelOrdersResult } from '../models/CancelOrdersResult';
import type { ChainName } from '../models/ChainName';
import type { CreateBidRequestBody } from '../models/CreateBidRequestBody';
import type { CreateListingRequestBody } from '../models/CreateListingRequestBody';
import type { FulfillableOrder } from '../models/FulfillableOrder';
import type { FulfillmentDataRequest } from '../models/FulfillmentDataRequest';
import type { ListBidsResult } from '../models/ListBidsResult';
import type { ListingResult } from '../models/ListingResult';
import type { ListListingsResult } from '../models/ListListingsResult';
import type { ListTradeResult } from '../models/ListTradeResult';
import type { OrderStatusName } from '../models/OrderStatusName';
import type { PageCursor } from '../models/PageCursor';
import type { PageSize } from '../models/PageSize';
import type { TradeResult } from '../models/TradeResult';
import type { UnfulfillableOrder } from '../models/UnfulfillableOrder';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class OrdersService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Cancel one or more orders
   * Cancel one or more orders
   * @returns CancelOrdersResult Orders cancellation response.
   * @throws ApiError
   */
  public cancelOrders({
    chainName,
    requestBody,
  }: {
    chainName: ChainName,
    requestBody: CancelOrdersRequestBody,
  }): CancelablePromise<CancelOrdersResult> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chains/{chain_name}/orders/cancel',
      path: {
        'chain_name': chainName,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request (400)`,
        401: `Unauthorised Request (401)`,
        404: `The specified resource was not found (404)`,
        429: `Too Many Requests (429)`,
        500: `Internal Server Error (500)`,
        501: `Not Implemented Error (501)`,
      },
    });
  }

  /**
   * List all listings
   * List all listings
   * @returns ListListingsResult OK response.
   * @throws ApiError
   */
  public listListings({
    chainName,
    status,
    sellItemContractAddress,
    buyItemType,
    buyItemContractAddress,
    accountAddress,
    sellItemMetadataId,
    sellItemTokenId,
    fromUpdatedAt,
    pageSize,
    sortBy,
    sortDirection,
    pageCursor,
  }: {
    chainName: ChainName,
    /**
     * Order status to filter by
     */
    status?: OrderStatusName,
    /**
     * Sell item contract address to filter by
     */
    sellItemContractAddress?: string,
    /**
     * Buy item type to filter by
     */
    buyItemType?: 'NATIVE' | 'ERC20',
    /**
     * Buy item contract address to filter by
     */
    buyItemContractAddress?: string,
    /**
     * The account address of the user who created the listing
     */
    accountAddress?: string,
    /**
     * The metadata_id of the sell item
     */
    sellItemMetadataId?: string,
    /**
     * Sell item token identifier to filter by
     */
    sellItemTokenId?: string,
    /**
     * From updated at including given date
     */
    fromUpdatedAt?: string,
    /**
     * Maximum number of orders to return per page
     */
    pageSize?: PageSize,
    /**
     * Order field to sort by. `buy_item_amount` sorts by per token price, for example if 5 ERC-1155s are on sale for 10eth, it’s sorted as 2eth for `buy_item_amount`.
     */
    sortBy?: 'created_at' | 'updated_at' | 'buy_item_amount',
    /**
     * Ascending or descending direction for sort
     */
    sortDirection?: 'asc' | 'desc',
    /**
     * Page cursor to retrieve previous or next page. Use the value returned in the response.
     */
    pageCursor?: PageCursor,
  }): CancelablePromise<ListListingsResult> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/chains/{chain_name}/orders/listings',
      path: {
        'chain_name': chainName,
      },
      query: {
        'status': status,
        'sell_item_contract_address': sellItemContractAddress,
        'buy_item_type': buyItemType,
        'buy_item_contract_address': buyItemContractAddress,
        'account_address': accountAddress,
        'sell_item_metadata_id': sellItemMetadataId,
        'sell_item_token_id': sellItemTokenId,
        'from_updated_at': fromUpdatedAt,
        'page_size': pageSize,
        'sort_by': sortBy,
        'sort_direction': sortDirection,
        'page_cursor': pageCursor,
      },
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
      },
    });
  }

  /**
   * Create a listing
   * Create a listing
   * @returns ListingResult Created response.
   * @throws ApiError
   */
  public createListing({
    chainName,
    requestBody,
  }: {
    chainName: ChainName,
    requestBody: CreateListingRequestBody,
  }): CancelablePromise<ListingResult> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chains/{chain_name}/orders/listings',
      path: {
        'chain_name': chainName,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
      },
    });
  }

  /**
   * List a paginated array of bids with optional filter parameters
   * List a paginated array of bids with optional filter parameters
   * @returns ListBidsResult OK response.
   * @throws ApiError
   */
  public listBids({
    chainName,
    status,
    buyItemContractAddress,
    sellItemContractAddress,
    accountAddress,
    buyItemMetadataId,
    buyItemTokenId,
    fromUpdatedAt,
    pageSize,
    sortBy,
    sortDirection,
    pageCursor,
  }: {
    chainName: ChainName,
    /**
     * Order status to filter by
     */
    status?: OrderStatusName,
    /**
     * Buy item contract address to filter by
     */
    buyItemContractAddress?: string,
    /**
     * Sell item contract address to filter by
     */
    sellItemContractAddress?: string,
    /**
     * The account address of the user who created the bid
     */
    accountAddress?: string,
    /**
     * The metadata_id of the buy item
     */
    buyItemMetadataId?: string,
    /**
     * buy item token identifier to filter by
     */
    buyItemTokenId?: string,
    /**
     * From updated at including given date
     */
    fromUpdatedAt?: string,
    /**
     * Maximum number of orders to return per page
     */
    pageSize?: PageSize,
    /**
     * Order field to sort by. `sell_item_amount` sorts by per token price, for example if 10eth is offered for 5 ERC1155 items, it’s sorted as 2eth for `sell_item_amount`.
     */
    sortBy?: 'created_at' | 'updated_at' | 'sell_item_amount',
    /**
     * Ascending or descending direction for sort
     */
    sortDirection?: 'asc' | 'desc',
    /**
     * Page cursor to retrieve previous or next page. Use the value returned in the response.
     */
    pageCursor?: PageCursor,
  }): CancelablePromise<ListBidsResult> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/chains/{chain_name}/orders/bids',
      path: {
        'chain_name': chainName,
      },
      query: {
        'status': status,
        'buy_item_contract_address': buyItemContractAddress,
        'sell_item_contract_address': sellItemContractAddress,
        'account_address': accountAddress,
        'buy_item_metadata_id': buyItemMetadataId,
        'buy_item_token_id': buyItemTokenId,
        'from_updated_at': fromUpdatedAt,
        'page_size': pageSize,
        'sort_by': sortBy,
        'sort_direction': sortDirection,
        'page_cursor': pageCursor,
      },
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
      },
    });
  }

  /**
   * Create a bid
   * Create a bid
   * @returns BidResult Created response.
   * @throws ApiError
   */
  public createBid({
    chainName,
    requestBody,
  }: {
    chainName: ChainName,
    requestBody: CreateBidRequestBody,
  }): CancelablePromise<BidResult> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chains/{chain_name}/orders/bids',
      path: {
        'chain_name': chainName,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
        501: `Not Implemented Error (501)`,
      },
    });
  }

  /**
   * Get a single listing by ID
   * Get a single listing by ID
   * @returns ListingResult OK response.
   * @throws ApiError
   */
  public getListing({
    chainName,
    listingId,
  }: {
    chainName: ChainName,
    /**
     * Global Order identifier
     */
    listingId: string,
  }): CancelablePromise<ListingResult> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/chains/{chain_name}/orders/listings/{listing_id}',
      path: {
        'chain_name': chainName,
        'listing_id': listingId,
      },
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
      },
    });
  }

  /**
   * Get a single bid by ID
   * Get a single bid by ID
   * @returns BidResult OK response.
   * @throws ApiError
   */
  public getBid({
    chainName,
    bidId,
  }: {
    chainName: ChainName,
    /**
     * Global Bid identifier
     */
    bidId: string,
  }): CancelablePromise<BidResult> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/chains/{chain_name}/orders/bids/{bid_id}',
      path: {
        'chain_name': chainName,
        'bid_id': bidId,
      },
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
      },
    });
  }

  /**
   * Retrieve fulfillment data for orders
   * Retrieve signed fulfillment data based on the list of order IDs and corresponding fees.
   * @returns any Successful response
   * @throws ApiError
   */
  public fulfillmentData({
    chainName,
    requestBody,
  }: {
    chainName: ChainName,
    requestBody: Array<FulfillmentDataRequest>,
  }): CancelablePromise<{
    result: {
      fulfillable_orders: Array<FulfillableOrder>;
      unfulfillable_orders: Array<UnfulfillableOrder>;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chains/{chain_name}/orders/fulfillment-data',
      path: {
        'chain_name': chainName,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
      },
    });
  }

  /**
   * List all trades
   * List all trades
   * @returns ListTradeResult OK response.
   * @throws ApiError
   */
  public listTrades({
    chainName,
    accountAddress,
    sellItemContractAddress,
    fromIndexedAt,
    pageSize,
    sortBy,
    sortDirection,
    pageCursor,
  }: {
    chainName: ChainName,
    accountAddress?: string,
    sellItemContractAddress?: string,
    /**
     * From indexed at including given date
     */
    fromIndexedAt?: string,
    /**
     * Maximum number of trades to return per page
     */
    pageSize?: PageSize,
    /**
     * Trade field to sort by
     */
    sortBy?: 'indexed_at',
    /**
     * Ascending or descending direction for sort
     */
    sortDirection?: 'asc' | 'desc',
    /**
     * Page cursor to retrieve previous or next page. Use the value returned in the response.
     */
    pageCursor?: PageCursor,
  }): CancelablePromise<ListTradeResult> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/chains/{chain_name}/trades',
      path: {
        'chain_name': chainName,
      },
      query: {
        'account_address': accountAddress,
        'sell_item_contract_address': sellItemContractAddress,
        'from_indexed_at': fromIndexedAt,
        'page_size': pageSize,
        'sort_by': sortBy,
        'sort_direction': sortDirection,
        'page_cursor': pageCursor,
      },
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
      },
    });
  }

  /**
   * Get a single trade by ID
   * Get a single trade by ID
   * @returns TradeResult OK response.
   * @throws ApiError
   */
  public getTrade({
    chainName,
    tradeId,
  }: {
    chainName: ChainName,
    /**
     * Global Trade identifier
     */
    tradeId: string,
  }): CancelablePromise<TradeResult> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/chains/{chain_name}/trades/{trade_id}',
      path: {
        'chain_name': chainName,
        'trade_id': tradeId,
      },
      errors: {
        400: `Bad Request (400)`,
        404: `The specified resource was not found (404)`,
        500: `Internal Server Error (500)`,
      },
    });
  }

}
