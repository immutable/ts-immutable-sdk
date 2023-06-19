/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChainName } from '../models/ChainName';
import type { CreateListingRequestBody } from '../models/CreateListingRequestBody';
import type { ListingResult } from '../models/ListingResult';
import type { ListListingsResult } from '../models/ListListingsResult';
import type { OrderStatus } from '../models/OrderStatus';
import type { PageCursor } from '../models/PageCursor';
import type { PageSize } from '../models/PageSize';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class OrdersService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

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
    sellItemTokenId,
    pageSize,
    sortBy,
    sortDirection,
    pageCursor,
  }: {
    chainName: ChainName,
    /**
     * Order status to filter by
     */
    status?: OrderStatus,
    /**
     * Sell item contract address to filter by
     */
    sellItemContractAddress?: string,
    /**
     * Sell item token identifier to filter by
     */
    sellItemTokenId?: string,
    /**
     * Maximum number of orders to return per page
     */
    pageSize?: PageSize,
    /**
     * Order field to sort by
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
      url: '/v1/chains/{chain_name}/listings',
      path: {
        'chain_name': chainName,
      },
      query: {
        'status': status,
        'sell_item_contract_address': sellItemContractAddress,
        'sell_item_token_id': sellItemTokenId,
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
      url: '/v1/chains/{chain_name}/listings',
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
      url: '/v1/chains/{chain_name}/listings/{listing_id}',
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

}
