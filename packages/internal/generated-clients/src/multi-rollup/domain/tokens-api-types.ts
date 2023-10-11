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
import { GetTokenResult } from '../models';
// @ts-ignore
import { ListTokensResult } from '../models';
// @ts-ignore
export { APIError400 } from '../models';
// @ts-ignore
export { APIError404 } from '../models';
// @ts-ignore
export { APIError500 } from '../models';
// @ts-ignore
export { GetTokenResult } from '../models';
// @ts-ignore
export { ListTokensResult } from '../models';

/**
 * Request parameters for getERC20Token operation in TokensApi.
 * @export
 * @interface TokensApiGetERC20TokenRequest
 */
export interface TokensApiGetERC20TokenRequest {
    /**
     * The address of contract
     * @type {string}
     * @memberof TokensApiGetERC20Token
     */
    readonly contractAddress: string

    /**
     * The name of chain
     * @type {string}
     * @memberof TokensApiGetERC20Token
     */
    readonly chainName: string
}

/**
 * Request parameters for listERC20Tokens operation in TokensApi.
 * @export
 * @interface TokensApiListERC20TokensRequest
 */
export interface TokensApiListERC20TokensRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof TokensApiListERC20Tokens
     */
    readonly chainName: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof TokensApiListERC20Tokens
     */
    readonly fromUpdatedAt?: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof TokensApiListERC20Tokens
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof TokensApiListERC20Tokens
     */
    readonly pageSize?: number
}


