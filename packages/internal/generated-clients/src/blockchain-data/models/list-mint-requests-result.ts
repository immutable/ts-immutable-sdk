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
import { GetMintRequestResult } from './get-mint-request-result';
// May contain unused imports in some cases
// @ts-ignore
import { Page } from './page';

/**
 * List mint requests
 * @export
 * @interface ListMintRequestsResult
 */
export interface ListMintRequestsResult {
    /**
     * List of mint requests
     * @type {Array<GetMintRequestResult>}
     * @memberof ListMintRequestsResult
     */
    'result': Array<GetMintRequestResult>;
    /**
     * 
     * @type {Page}
     * @memberof ListMintRequestsResult
     */
    'page': Page;
}

