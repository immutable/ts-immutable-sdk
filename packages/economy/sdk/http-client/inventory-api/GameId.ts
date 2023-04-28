/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  InventoryBatchRequest,
  InventoryCreateItemRequest,
  InventoryItem,
  InventoryMintItemRequest,
  InventoryPaginatedItems,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class GameId<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description An atomic operation that allow to create and delete multiple items
   *
   * @tags root
   * @name BatchCreate
   * @summary Create/Delete items in batch
   * @request POST:/{gameID}/batch
   * @secure
   */
  batchCreate = (gameId: string, request: InventoryBatchRequest, params: RequestParams = {}) =>
    this.request<InventoryItem[], any>({
      path: `/${gameId}/batch`,
      method: 'POST',
      body: request,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Get items based on filters
   *
   * @tags root
   * @name ItemsDetail
   * @summary Get items
   * @request GET:/{gameID}/items
   */
  itemsDetail = (
    gameId: string,
    query?: {
      /** Item IDs to filter items */
      id?: string[];
      /** Owners to filter items */
      owner?: string[];
      /** Number of records per page */
      limit?: number;
      /** Page number */
      page?: number;
      /** field to order the results */
      order_by?: string;
      /** results ordered ascending or descending */
      direction?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<InventoryPaginatedItems, any>({
      path: `/${gameId}/items`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Create an item for the given game, owner, location and item definition
   *
   * @tags root
   * @name ItemsCreate
   * @summary Create an item
   * @request POST:/{gameID}/items
   * @secure
   */
  itemsCreate = (gameId: string, request: InventoryCreateItemRequest, params: RequestParams = {}) =>
    this.request<InventoryItem, any>({
      path: `/${gameId}/items`,
      method: 'POST',
      body: request,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Delete an item for the given game
   *
   * @tags root
   * @name ItemsDelete
   * @summary Delete an item
   * @request DELETE:/{gameID}/items/{id}
   * @secure
   */
  itemsDelete = (gameId: string, id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/${gameId}/items/${id}`,
      method: 'DELETE',
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description Used to mint items that aren't minted yet (pending status)
   *
   * @tags root
   * @name MintCreate
   * @summary Mint on-chain items in the zkEVM
   * @request POST:/{gameID}/mint
   * @secure
   */
  mintCreate = (gameId: string, request: InventoryMintItemRequest, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/${gameId}/mint`,
      method: 'POST',
      body: request,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
