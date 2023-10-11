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
 * Request parameters for listNFTOwners operation in NftOwnersApi.
 * @export
 * @interface NftOwnersApiListNFTOwnersRequest
 */
export interface NftOwnersApiListNFTOwnersRequest {
    /**
     * The address of contract
     * @type {string}
     * @memberof NftOwnersApiListNFTOwners
     */
    readonly contractAddress: string

    /**
     * An &#x60;uint256&#x60; token id as string
     * @type {string}
     * @memberof NftOwnersApiListNFTOwners
     */
    readonly tokenId: string

    /**
     * The name of chain
     * @type {string}
     * @memberof NftOwnersApiListNFTOwners
     */
    readonly chainName: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof NftOwnersApiListNFTOwners
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof NftOwnersApiListNFTOwners
     */
    readonly pageSize?: number
}

/**
 * Request parameters for listOwnersByContractAddress operation in NftOwnersApi.
 * @export
 * @interface NftOwnersApiListOwnersByContractAddressRequest
 */
export interface NftOwnersApiListOwnersByContractAddressRequest {
    /**
     * The address of contract
     * @type {string}
     * @memberof NftOwnersApiListOwnersByContractAddress
     */
    readonly contractAddress: string

    /**
     * The name of chain
     * @type {string}
     * @memberof NftOwnersApiListOwnersByContractAddress
     */
    readonly chainName: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof NftOwnersApiListOwnersByContractAddress
     */
    readonly fromUpdatedAt?: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof NftOwnersApiListOwnersByContractAddress
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof NftOwnersApiListOwnersByContractAddress
     */
    readonly pageSize?: number
}


