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

import { ItemType } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Types<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description List all types for a given Game ID
   *
   * @tags root
   * @name TypesList
   * @summary List item types
   * @request GET:/types
   */
  typesList = (
    query: {
      /** The Game ID you want types for */
      game_id: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemType[], any>({
      path: `/types`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
