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

import { DomainRecipe, HttpCreateRecipeRequest, HttpUpdateRecipeRequest } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Recipes<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Get all recipes
   *
   * @tags root
   * @name RecipesList
   * @summary Get all recipes
   * @request GET:/recipes
   */
  recipesList = (
    query: {
      /** Game ID */
      game_id: string;
      /**
       * Map of conditions and values
       * @example "condition.item_definition_id=XYZ"
       */
      filters?: string[];
    },
    params: RequestParams = {},
  ) =>
    this.request<DomainRecipe[], any>({
      path: `/recipes`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Create recipe
   *
   * @tags root
   * @name RecipesCreate
   * @summary Create recipe
   * @request POST:/recipes
   */
  recipesCreate = (request: HttpCreateRecipeRequest, params: RequestParams = {}) =>
    this.request<DomainRecipe, any>({
      path: `/recipes`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Get recipe by id
   *
   * @tags root
   * @name RecipesDetail
   * @summary Get recipe by id
   * @request GET:/recipes/{id}
   */
  recipesDetail = (id: string, params: RequestParams = {}) =>
    this.request<DomainRecipe, any>({
      path: `/recipes/${id}`,
      method: 'GET',
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Update recipe
   *
   * @tags root
   * @name RecipesUpdate
   * @summary Update recipe
   * @request PUT:/recipes/{id}
   */
  recipesUpdate = (id: string, request: HttpUpdateRecipeRequest, params: RequestParams = {}) =>
    this.request<DomainRecipe, any>({
      path: `/recipes/${id}`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * @description Delete recipe by id
   *
   * @tags root
   * @name RecipesDelete
   * @summary Delete recipe by id
   * @request DELETE:/recipes/{id}
   */
  recipesDelete = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/recipes/${id}`,
      method: 'DELETE',
      type: ContentType.Json,
      ...params,
    });
}
