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


// May contain unused imports in some cases
// @ts-ignore
import { NFT } from './nft';
// May contain unused imports in some cases
// @ts-ignore
import { Page } from './page';

/**
 * 
 * @export
 * @interface ListNFTsResult
 */
export interface ListNFTsResult {
    /**
     * List of nfts
     * @type {Array<NFT>}
     * @memberof ListNFTsResult
     */
    'result': Array<NFT>;
    /**
     * 
     * @type {Page}
     * @memberof ListNFTsResult
     */
    'page': Page;
}

