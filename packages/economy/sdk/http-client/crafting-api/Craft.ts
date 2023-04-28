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

import { CraftExecuteRecipeInput, CraftExecuteRecipeSuccessOutput, CraftValidationErrors } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Craft<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags root
   * @name CraftCreate
   * @summary Recipe execution from user inputs
   * @request POST:/craft
   */
  craftCreate = (request: CraftExecuteRecipeInput, params: RequestParams = {}) =>
    this.request<CraftExecuteRecipeSuccessOutput, CraftValidationErrors>({
      path: `/craft`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
