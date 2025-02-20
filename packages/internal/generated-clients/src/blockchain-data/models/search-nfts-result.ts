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
import { NFTBundle } from './nftbundle';
// May contain unused imports in some cases
// @ts-ignore
import { Page } from './page';

/**
 * Search NFTs result
 * @export
 * @interface SearchNFTsResult
 */
export interface SearchNFTsResult {
    /**
     * List of nft bundles
     * @type {Array<NFTBundle>}
     * @memberof SearchNFTsResult
     */
    'result': Array<NFTBundle>;
    /**
     * 
     * @type {Page}
     * @memberof SearchNFTsResult
     */
    'page': Page;
}

