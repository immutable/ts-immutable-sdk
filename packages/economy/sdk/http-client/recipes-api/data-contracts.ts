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

export interface DomainCondition {
  comparison?: string;
  expected?: string;
  ref?: string;
  type?: string;
}

export interface DomainInput {
  conditions?: DomainCondition[];
  id?: string;
  name?: string;
  type?: string;
}

export interface DomainOutput {
  data?: object;
  id?: string;
  location?: string;
  name?: string;
  ref?: string;
  type?: string;
}

export interface DomainRecipe {
  created_at?: string;
  description?: string;
  game_id?: string;
  id?: string;
  inputs?: DomainInput[];
  name?: string;
  outputs?: DomainOutput[];
  status?: string;
  updated_at?: string;
}

export interface HttpCondition {
  comparison?: string;
  expected?: string;
  ref?: string;
  type?: string;
}

export interface HttpCreateRecipeInput {
  conditions?: HttpCondition[];
  name?: string;
  /** @example "single_item" */
  type?: 'single_item' | 'multiple_item' | 'single_currency' | 'multiple_currency';
}

export interface HttpCreateRecipeOutput {
  data?: object;
  location?: string;
  name?: string;
  ref?: string;
  /** @example "item_definition" */
  type?: 'item_definition' | 'input';
}

export interface HttpCreateRecipeRequest {
  description?: string;
  /** @example "shardbound" */
  game_id: string;
  inputs?: HttpCreateRecipeInput[];
  name?: string;
  outputs?: HttpCreateRecipeOutput[];
}

export interface HttpUpdateRecipeInput {
  conditions?: HttpCondition[];
  id?: string;
  name?: string;
  /** @example "single_item" */
  type?: 'single_item' | 'multiple_item' | 'single_currency' | 'multiple_currency';
}

export interface HttpUpdateRecipeOutput {
  data?: object;
  id?: string;
  location?: string;
  name?: string;
  ref?: string;
  /** @example "item_definition" */
  type?: 'item_definition' | 'input';
}

export interface HttpUpdateRecipeRequest {
  description?: string;
  inputs?: HttpUpdateRecipeInput[];
  name?: string;
  outputs?: HttpUpdateRecipeOutput[];
  status?: string;
}
