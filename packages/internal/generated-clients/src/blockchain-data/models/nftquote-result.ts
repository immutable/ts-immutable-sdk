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
// May contain unused imports in some cases
// @ts-ignore
import { Market } from './market';
// May contain unused imports in some cases
// @ts-ignore
import { MarketNft } from './market-nft';

/**
 * NFT quote result
 * @export
 * @interface NFTQuoteResult
 */
export interface NFTQuoteResult {
    /**
     * 
     * @type {Chain}
     * @memberof NFTQuoteResult
     */
    'chain': Chain;
    /**
     * Token id of NFT (uint256 as string)
     * @type {string}
     * @memberof NFTQuoteResult
     */
    'token_id': string;
    /**
     * 
     * @type {Market}
     * @memberof NFTQuoteResult
     */
    'market_stack': Market;
    /**
     * 
     * @type {MarketNft}
     * @memberof NFTQuoteResult
     */
    'market_nft': MarketNft;
    /**
     * 
     * @type {Market}
     * @memberof NFTQuoteResult
     */
    'market_collection': Market;
}

