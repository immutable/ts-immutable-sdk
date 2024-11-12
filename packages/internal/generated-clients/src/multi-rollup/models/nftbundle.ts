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
import { Listing } from './listing';
// May contain unused imports in some cases
// @ts-ignore
import { Market } from './market';
// May contain unused imports in some cases
// @ts-ignore
import { NFTWithStack } from './nftwith-stack';

/**
 * NFT bundle includes NFT with stack, markets and listings
 * @export
 * @interface NFTBundle
 */
export interface NFTBundle {
    /**
     * 
     * @type {NFTWithStack}
     * @memberof NFTBundle
     */
    'nft_with_stack': NFTWithStack;
    /**
     * 
     * @type {Market}
     * @memberof NFTBundle
     */
    'market': Market | null;
    /**
     * List of open listings for the stack.
     * @type {Array<Listing>}
     * @memberof NFTBundle
     */
    'listings': Array<Listing>;
}

