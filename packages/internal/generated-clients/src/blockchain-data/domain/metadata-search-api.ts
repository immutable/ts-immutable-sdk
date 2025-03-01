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


// @ts-ignore
import { APIError400 } from '../models';
// @ts-ignore
import { APIError401 } from '../models';
// @ts-ignore
import { APIError403 } from '../models';
// @ts-ignore
import { APIError404 } from '../models';
// @ts-ignore
import { APIError429 } from '../models';
// @ts-ignore
import { APIError500 } from '../models';
// @ts-ignore
import { ListFiltersResult } from '../models';
// @ts-ignore
import { SearchNFTsResult } from '../models';
// @ts-ignore
import { SearchStacksResult } from '../models';
// @ts-ignore
export type { APIError400 } from '../models';
// @ts-ignore
export type { APIError401 } from '../models';
// @ts-ignore
export type { APIError403 } from '../models';
// @ts-ignore
export type { APIError404 } from '../models';
// @ts-ignore
export type { APIError429 } from '../models';
// @ts-ignore
export type { APIError500 } from '../models';
// @ts-ignore
export type { ListFiltersResult } from '../models';
// @ts-ignore
export type { SearchNFTsResult } from '../models';
// @ts-ignore
export type { SearchStacksResult } from '../models';

/**
 * Request parameters for listFilters operation in MetadataSearchApi.
 * @export
 * @interface ListFiltersRequest
 */
export interface ListFiltersRequestParams {
    /**
     * The name of chain
     * @type {string}
     * @memberof ListFilters
     */
    readonly chainName: string

    /**
     * Contract addresses for collection
     * @type {string}
     * @memberof ListFilters
     */
    readonly contractAddress: string
}

/**
 * Request parameters for searchNFTs operation in MetadataSearchApi.
 * @export
 * @interface SearchNFTsRequest
 */
export interface SearchNFTsRequestParams {
    /**
     * The name of chain
     * @type {string}
     * @memberof SearchNFTs
     */
    readonly chainName: string

    /**
     * List of contract addresses to filter by
     * @type {Array<string>}
     * @memberof SearchNFTs
     */
    readonly contractAddress: Array<string>

    /**
     * Account address to filter by
     * @type {string}
     * @memberof SearchNFTs
     */
    readonly accountAddress?: string

    /**
     * Filters NFTs that belong to any of these stacks
     * @type {Array<string>}
     * @memberof SearchNFTs
     */
    readonly stackId?: Array<string>

    /**
     * Whether the listings should include only the owner created listings
     * @type {boolean}
     * @memberof SearchNFTs
     */
    readonly onlyIncludeOwnerListings?: boolean

    /**
     * Number of results to return per page
     * @type {number}
     * @memberof SearchNFTs
     */
    readonly pageSize?: number

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof SearchNFTs
     */
    readonly pageCursor?: string
}

/**
 * Request parameters for searchStacks operation in MetadataSearchApi.
 * @export
 * @interface SearchStacksRequest
 */
export interface SearchStacksRequestParams {
    /**
     * The name of chain
     * @type {string}
     * @memberof SearchStacks
     */
    readonly chainName: string

    /**
     * List of contract addresses to filter by
     * @type {Array<string>}
     * @memberof SearchStacks
     */
    readonly contractAddress: Array<string>

    /**
     * Account address to filter by
     * @type {string}
     * @memberof SearchStacks
     */
    readonly accountAddress?: string

    /**
     * Whether to the listings should include only the owner created listings
     * @type {boolean}
     * @memberof SearchStacks
     */
    readonly onlyIncludeOwnerListings?: boolean

    /**
     * Filters results to include only stacks that have a current active listing. False and \&#39;null\&#39; return all unfiltered stacks.
     * @type {boolean}
     * @memberof SearchStacks
     */
    readonly onlyIfHasActiveListings?: boolean

    /**
     * JSON encoded traits to filter by. e.g. encodeURIComponent(JSON.stringify({\&quot;rarity\&quot;: {\&quot;values\&quot;: [\&quot;common\&quot;, \&quot;rare\&quot;], \&quot;condition\&quot;: \&quot;eq\&quot;}}))
     * @type {string}
     * @memberof SearchStacks
     */
    readonly traits?: string

    /**
     * Keyword to search NFT name and description. Alphanumeric characters only.
     * @type {string}
     * @memberof SearchStacks
     */
    readonly keyword?: string

    /**
     * Sort results in a specific order
     * @type {'cheapest_first'}
     * @memberof SearchStacks
     */
    readonly sortBy?: SearchStacksSortByEnum

    /**
     * Number of results to return per page
     * @type {number}
     * @memberof SearchStacks
     */
    readonly pageSize?: number

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof SearchStacks
     */
    readonly pageCursor?: string
}


/**
  * @export
  * @enum {string}
  */
export enum SearchStacksSortByEnum {
    CheapestFirst = 'cheapest_first'
}
