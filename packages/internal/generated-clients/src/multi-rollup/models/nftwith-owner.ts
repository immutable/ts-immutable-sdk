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


// May contain unused imports in some cases
// @ts-ignore
import { Chain } from './chain';

/**
 * 
 * @export
 * @interface NFTWithOwner
 */
export interface NFTWithOwner {
    /**
     * 
     * @type {Chain}
     * @memberof NFTWithOwner
     */
    'chain': Chain;
    /**
     * The address of NFT contract
     * @type {string}
     * @memberof NFTWithOwner
     */
    'contract_address': string;
    /**
     * An `uint256` token id as string
     * @type {string}
     * @memberof NFTWithOwner
     */
    'token_id': string;
    /**
     * The account address of the owner of the NFT
     * @type {string}
     * @memberof NFTWithOwner
     */
    'account_address': string;
    /**
     * The amount of owned tokens (uint256 as string)
     * @type {string}
     * @memberof NFTWithOwner
     */
    'balance': string;
    /**
     * When the owner last changed for the given NFT
     * @type {string}
     * @memberof NFTWithOwner
     */
    'updated_at': string;
}

