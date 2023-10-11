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
import { GetMetadataResult } from '../models';
// @ts-ignore
import { ListMetadataResult } from '../models';
// @ts-ignore
import { MetadataRefreshRateLimitResult } from '../models';
// @ts-ignore
import { RefreshMetadataByIDRequest } from '../models';
// @ts-ignore
import { RefreshNFTMetadataByTokenIDRequest } from '../models';
// @ts-ignore
export { APIError400 } from '../models';
// @ts-ignore
export { APIError401 } from '../models';
// @ts-ignore
export { APIError403 } from '../models';
// @ts-ignore
export { APIError404 } from '../models';
// @ts-ignore
export { APIError429 } from '../models';
// @ts-ignore
export { APIError500 } from '../models';
// @ts-ignore
export { GetMetadataResult } from '../models';
// @ts-ignore
export { ListMetadataResult } from '../models';
// @ts-ignore
export { MetadataRefreshRateLimitResult } from '../models';
// @ts-ignore
export { RefreshMetadataByIDRequest } from '../models';
// @ts-ignore
export { RefreshNFTMetadataByTokenIDRequest } from '../models';

/**
 * Request parameters for getMetadata operation in MetadataApi.
 * @export
 * @interface MetadataApiGetMetadataRequest
 */
export interface MetadataApiGetMetadataRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof MetadataApiGetMetadata
     */
    readonly chainName: string

    /**
     * The address of metadata contract
     * @type {string}
     * @memberof MetadataApiGetMetadata
     */
    readonly contractAddress: string

    /**
     * The id of the metadata
     * @type {string}
     * @memberof MetadataApiGetMetadata
     */
    readonly metadataId: string
}

/**
 * Request parameters for listMetadata operation in MetadataApi.
 * @export
 * @interface MetadataApiListMetadataRequest
 */
export interface MetadataApiListMetadataRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof MetadataApiListMetadata
     */
    readonly chainName: string

    /**
     * The address of metadata contract
     * @type {string}
     * @memberof MetadataApiListMetadata
     */
    readonly contractAddress: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof MetadataApiListMetadata
     */
    readonly fromUpdatedAt?: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof MetadataApiListMetadata
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof MetadataApiListMetadata
     */
    readonly pageSize?: number
}

/**
 * Request parameters for refreshMetadataByID operation in MetadataApi.
 * @export
 * @interface MetadataApiRefreshMetadataByIDRequest
 */
export interface MetadataApiRefreshMetadataByIDRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof MetadataApiRefreshMetadataByID
     */
    readonly chainName: string

    /**
     * Contract address
     * @type {string}
     * @memberof MetadataApiRefreshMetadataByID
     */
    readonly contractAddress: string

    /**
     * NFT Metadata Refresh Request
     * @type {RefreshMetadataByIDRequest}
     * @memberof MetadataApiRefreshMetadataByID
     */
    readonly refreshMetadataByIDRequest: RefreshMetadataByIDRequest
}

/**
 * Request parameters for refreshNFTMetadataByTokenID operation in MetadataApi.
 * @export
 * @interface MetadataApiRefreshNFTMetadataByTokenIDRequest
 */
export interface MetadataApiRefreshNFTMetadataByTokenIDRequest {
    /**
     * The address of contract
     * @type {string}
     * @memberof MetadataApiRefreshNFTMetadataByTokenID
     */
    readonly contractAddress: string

    /**
     * The name of chain
     * @type {string}
     * @memberof MetadataApiRefreshNFTMetadataByTokenID
     */
    readonly chainName: string

    /**
     * the request body
     * @type {RefreshNFTMetadataByTokenIDRequest}
     * @memberof MetadataApiRefreshNFTMetadataByTokenID
     */
    readonly refreshNFTMetadataByTokenIDRequest: RefreshNFTMetadataByTokenIDRequest
}


