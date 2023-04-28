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

export interface CraftCraftOutputResult {
  /** JSON object containing properties of the crafted item */
  properties?: object;
  /** ID of the crafted item */
  result_item_id?: string;
}

export interface CraftExecuteRecipeInput {
  ingredients: CraftIngredient[];
  recipe_id: string;
  user_id: string;
}

export interface CraftExecuteRecipeSuccessOutput {
  /** ID of this crafting execution. Can be used to look up details of the craft later. */
  craft_id?: string;
  /** List of items crated from this crafting execution */
  results?: CraftCraftOutputResult[];
}

export interface CraftFieldError {
  error?: string;
  name?: string;
}

export interface CraftIngredient {
  condition_id: string;
  item_id: string;
}

export interface CraftValidationErrors {
  errors?: CraftFieldError[];
  message?: string;
}
