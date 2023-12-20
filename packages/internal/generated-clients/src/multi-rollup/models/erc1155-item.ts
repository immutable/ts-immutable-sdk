/* tslint:disable */
/* eslint-disable */
/**
 * Immutable zkEVM API
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
 * @interface ERC1155Item
 */
export interface ERC1155Item {
    /**
     * Token type user is offering, which in this case is ERC1155
     * @type {string}
     * @memberof ERC1155Item
     */
    'type': ERC1155ItemTypeEnum;
    /**
     * Address of ERC1155 token
     * @type {string}
     * @memberof ERC1155Item
     */
    'contract_address': string;
    /**
     * ID of ERC1155 token
     * @type {string}
     * @memberof ERC1155Item
     */
    'token_id': string;
    /**
     * A string representing the price at which the user is willing to sell the token. This value is provided in the smallest unit of the token (e.g., wei for Ethereum).
     * @type {string}
     * @memberof ERC1155Item
     */
    'amount': string;
}

export const ERC1155ItemTypeEnum = {
    Erc1155: 'ERC1155'
} as const;

export type ERC1155ItemTypeEnum = typeof ERC1155ItemTypeEnum[keyof typeof ERC1155ItemTypeEnum];


