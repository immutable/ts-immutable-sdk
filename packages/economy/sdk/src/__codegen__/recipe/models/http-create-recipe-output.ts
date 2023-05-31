/* tslint:disable */
/* eslint-disable */
/**
 * Recipe API
 * Recipe API
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * 
 * @export
 * @interface HttpCreateRecipeOutput
 */
export interface HttpCreateRecipeOutput {
    /**
     * 
     * @type {object}
     * @memberof HttpCreateRecipeOutput
     */
    'data'?: object;
    /**
     * 
     * @type {string}
     * @memberof HttpCreateRecipeOutput
     */
    'location': HttpCreateRecipeOutputLocationEnum;
    /**
     * 
     * @type {string}
     * @memberof HttpCreateRecipeOutput
     */
    'name': string;
    /**
     * 
     * @type {string}
     * @memberof HttpCreateRecipeOutput
     */
    'ref': string;
    /**
     * 
     * @type {string}
     * @memberof HttpCreateRecipeOutput
     */
    'type'?: HttpCreateRecipeOutputTypeEnum;
}

export const HttpCreateRecipeOutputLocationEnum = {
    Zkevm: 'zkevm',
    Offchain: 'offchain'
} as const;

export type HttpCreateRecipeOutputLocationEnum = typeof HttpCreateRecipeOutputLocationEnum[keyof typeof HttpCreateRecipeOutputLocationEnum];
export const HttpCreateRecipeOutputTypeEnum = {
    ItemDefinition: 'item_definition',
    Input: 'input'
} as const;

export type HttpCreateRecipeOutputTypeEnum = typeof HttpCreateRecipeOutputTypeEnum[keyof typeof HttpCreateRecipeOutputTypeEnum];


