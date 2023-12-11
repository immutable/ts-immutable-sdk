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
import { APIError404 } from '../models';
// @ts-ignore
import { APIError500 } from '../models';
// @ts-ignore
import { ListCollectionOwnersResult } from '../models';
// @ts-ignore
import { ListNFTOwnersResult } from '../models';
// @ts-ignore
export { APIError400 } from '../models';
// @ts-ignore
export { APIError404 } from '../models';
// @ts-ignore
export { APIError500 } from '../models';
// @ts-ignore
export { ListCollectionOwnersResult } from '../models';
// @ts-ignore
export { ListNFTOwnersResult } from '../models';

/**
 * Request parameters for listAllNFTOwners operation in NftOwnersApi.
 * @export
 * @interface ListAllNFTOwnersRequest
 */
export interface ListAllNFTOwnersRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof ListAllNFTOwners
     */
    readonly chainName: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof ListAllNFTOwners
     */
    readonly fromUpdatedAt?: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof ListAllNFTOwners
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof ListAllNFTOwners
     */
    readonly pageSize?: number
}

/**
 * Request parameters for listNFTOwners operation in NftOwnersApi.
 * @export
 * @interface ListNFTOwnersRequest
 */
export interface ListNFTOwnersRequest {
    /**
     * The address of contract
     * @type {string}
     * @memberof ListNFTOwners
     */
    readonly contractAddress: string

    /**
     * An &#x60;uint256&#x60; token id as string
     * @type {string}
     * @memberof ListNFTOwners
     */
    readonly tokenId: string

    /**
     * The name of chain
     * @type {string}
     * @memberof ListNFTOwners
     */
    readonly chainName: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof ListNFTOwners
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof ListNFTOwners
     */
    readonly pageSize?: number
}

/**
 * Request parameters for listOwnersByContractAddress operation in NftOwnersApi.
 * @export
 * @interface ListOwnersByContractAddressRequest
 */
export interface ListOwnersByContractAddressRequest {
    /**
     * The address of contract
     * @type {string}
     * @memberof ListOwnersByContractAddress
     */
    readonly contractAddress: string

    /**
     * The name of chain
     * @type {string}
     * @memberof ListOwnersByContractAddress
     */
    readonly chainName: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof ListOwnersByContractAddress
     */
    readonly fromUpdatedAt?: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof ListOwnersByContractAddress
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof ListOwnersByContractAddress
     */
    readonly pageSize?: number
}


