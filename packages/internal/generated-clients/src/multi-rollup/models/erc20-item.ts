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
 * 
 * @export
 * @interface ERC20Item
 */
export interface ERC20Item {
    /**
     * Token type user is offering, which in this case is ERC20
     * @type {string}
     * @memberof ERC20Item
     */
    'item_type': ERC20ItemItemTypeEnum;
    /**
     * Address of ERC20 token
     * @type {string}
     * @memberof ERC20Item
     */
    'contract_address': string;
    /**
     * A string representing the starting price at which the user is willing to sell the token. This value is provided in the smallest unit of the token (e.g., wei for Ethereum).
     * @type {string}
     * @memberof ERC20Item
     */
    'start_amount': string;
}

export const ERC20ItemItemTypeEnum = {
    Erc20: 'ERC20'
} as const;

export type ERC20ItemItemTypeEnum = typeof ERC20ItemItemTypeEnum[keyof typeof ERC20ItemItemTypeEnum];


