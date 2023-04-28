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
  HttpCreateItemDefinitionRequest,
  HttpUpdateItemDefinitionRequest,
  ItemCreationPayloadOutput,
  ItemDefinition,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Definitions<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description List all definitions for a given Game ID
   *
   * @tags root
   * @name DefinitionsList
   * @summary List item definitions
   * @request GET:/definitions
   */
  definitionsList = (
    query: {
      /** The Game ID you want definitions for */
      game_id: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemDefinition[], any>({
      path: `/definitions`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Create item definition
   *
   * @tags root
   * @name DefinitionsCreate
   * @summary Create item definition
   * @request POST:/definitions
   */
  definitionsCreate = (request: HttpCreateItemDefinitionRequest, params: RequestParams = {}) =>
    this.request<ItemDefinition, any>({
      path: `/definitions`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Get item definition given an ID
   *
   * @tags root
   * @name DefinitionsDetail
   * @summary Get item definition
   * @request GET:/definitions/{id}
   */
  definitionsDetail = (id: string, params: RequestParams = {}) =>
    this.request<ItemDefinition, any>({
      path: `/definitions/${id}`,
      method: 'GET',
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Update item definition
   *
   * @tags root
   * @name DefinitionsUpdate
   * @summary Update item definition
   * @request PUT:/definitions/{id}
   */
  definitionsUpdate = (id: string, request: HttpUpdateItemDefinitionRequest, params: RequestParams = {}) =>
    this.request<ItemDefinition, any>({
      path: `/definitions/${id}`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Validate metadata against a definition's template additional properties
   *
   * @tags root
   * @name ValidateCreate
   * @summary Validate metadata against a definition
   * @request POST:/definitions/{id}/validate
   */
  validateCreate = (id: string, request: object, params: RequestParams = {}) =>
    this.request<ItemCreationPayloadOutput, any>({
      path: `/definitions/${id}/validate`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
