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

import { HttpCreateItemTemplateRequest, ItemTemplate } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Templates<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description List all templates for a given Game ID
   *
   * @tags root
   * @name TemplatesList
   * @summary List item templates
   * @request GET:/templates
   */
  templatesList = (
    query: {
      /** The Game ID you want templates for */
      game_id: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemTemplate[], any>({
      path: `/templates`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Create item template
   *
   * @tags root
   * @name TemplatesCreate
   * @summary Create item template
   * @request POST:/templates
   */
  templatesCreate = (request: HttpCreateItemTemplateRequest, params: RequestParams = {}) =>
    this.request<ItemTemplate, any>({
      path: `/templates`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Get item template given an ID
   *
   * @tags root
   * @name TemplatesDetail
   * @summary Get item template
   * @request GET:/templates/{id}
   */
  templatesDetail = (id: string, params: RequestParams = {}) =>
    this.request<ItemTemplate, any>({
      path: `/templates/${id}`,
      method: 'GET',
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
