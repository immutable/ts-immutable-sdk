/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateOrderRequestBody } from '../models/CreateOrderRequestBody';
import type { Order } from '../models/Order';
import type { Orders } from '../models/Orders';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class OrdersService {

  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * List all orders
   * List all orders
   * @returns Orders OK response.
   * @throws ApiError
   */
  public listOrders({
    chainId,
    pageSize = 100,
    sortBy,
    sortDirection,
    pageCursor,
  }: {
    /**
     * Chain identifier using the CAIP-2 blockchain id spec
     */
    chainId: string,
    /**
     * Maximum number of orders to return per page
     */
    pageSize?: number,
    /**
     * Order field to sort by
     */
    sortBy?: 'status' | 'sell_item_contract_address' | 'sell_item_token_id',
    /**
     * Ascending or descending direction for sort
     */
    sortDirection?: 'asc' | 'desc',
    /**
     * Page cursor to retrieve previous or next page. Use the value returned in the response.
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
   * Create an order
   * Create an order
   * @returns Order Created response.
   * @throws ApiError
   */
  public createOrder({
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
   * Get a single order by ID
   * Get a single order by ID
   * @returns Order OK response.
   * @throws ApiError
   */
  public getOrder({
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
