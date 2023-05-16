/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateOrderRequestBody } from '../models/CreateOrderRequestBody';
import type { Order } from '../models/Order';
import type { Orders } from '../models/Orders';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class OrderBookService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * listorder order_book
   * Retrieve a list of orders from a given chain
   * @returns Orders OK response.
   * @throws ApiError
   */
  public orderBookListOrder({
    chainId,
    pageSize = '100',
    sortBy,
    sortDirection,
    pageCursor,
  }: {
    /**
     * Chain identifier using the CAIP-2 blockchain id spec
     */
    chainId: string,
    /**
     * Number of orders to return per page
     */
    pageSize?: string,
    /**
     * Order field to sort by
     */
    sortBy?: string,
    /**
     * Ascending or descending direction for sort
     */
    sortDirection?: 'asc' | 'desc',
    /**
     * Cursor for specific page
     */
    pageCursor?: string,
  }): CancelablePromise<Orders> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/chains/{chain_id}/orders',
      path: {
        'chain_id': chainId,
      },
      query: {
        'page_size': pageSize,
        'sort_by': sortBy,
        'sort_direction': sortDirection,
        'page_cursor': pageCursor,
      },
      errors: {
        404: `not_found: Resource not found`,
        500: `internal_error: Internal server error`,
      },
    });
  }

  /**
   * create_order order_book
   * Create a listing on a specific chain
   * @returns Order Created response.
   * @throws ApiError
   */
  public orderBookCreateOrder({
    chainId,
    requestBody,
  }: {
    /**
     * Chain identifier using the CAIP-2 blockchain id spec
     */
    chainId: string,
    requestBody: CreateOrderRequestBody,
  }): CancelablePromise<Order> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chains/{chain_id}/orders',
      path: {
        'chain_id': chainId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `bad_request: Bad Request`,
        404: `not_found: Resource not found`,
        500: `internal_error: Internal server error`,
      },
    });
  }

  /**
   * getorder order_book
   * Retrieve a single order from a given chain
   * @returns Order OK response.
   * @throws ApiError
   */
  public orderBookGetOrder({
    chainId,
    orderId,
  }: {
    /**
     * Chain identifier using the CAIP-2 blockchain id spec
     */
    chainId: string,
    /**
     * Global Order identifier
     */
    orderId: string,
  }): CancelablePromise<Order> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/chains/{chain_id}/orders/{order_id}',
      path: {
        'chain_id': chainId,
        'order_id': orderId,
      },
      errors: {
        404: `not_found: Resource not found`,
        500: `internal_error: Internal server error`,
      },
    });
  }

}
