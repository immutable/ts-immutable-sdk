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

import { InventoryItem, InventoryUpdateItemRequest } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Items<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Get item by ID
   *
   * @tags root
   * @name ItemsDetail
   * @summary Get item by ID
   * @request GET:/items/{id}
   */
  itemsDetail = (id: string, params: RequestParams = {}) =>
    this.request<InventoryItem, any>({
      path: `/items/${id}`,
      method: 'GET',
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Update an item's metadata
   *
   * @tags root
   * @name ItemsUpdate
   * @summary Update an item
   * @request PUT:/items/{itemID}
   * @secure
   */
  itemsUpdate = (itemId: string, request: InventoryUpdateItemRequest, params: RequestParams = {}) =>
    this.request<InventoryItem, any>({
      path: `/items/${itemId}`,
      method: 'PUT',
      body: request,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
