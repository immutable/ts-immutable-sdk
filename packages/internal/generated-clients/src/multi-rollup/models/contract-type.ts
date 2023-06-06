/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * Immutable Multi Rollup API
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * The contract type
 * @export
 * @enum {string}
 */

export const ContractType = {
    Erc721: 'ERC721',
    Erc20: 'ERC20'
} as const;

export type ContractType = typeof ContractType[keyof typeof ContractType];



