/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * Immutable X API
 *
 * The version of the OpenAPI document: 3.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { Mint } from './mint';

/**
 * 
 * @export
 * @interface ListMintsResponse
 */
export interface ListMintsResponse {
    /**
     * Generated cursor returned by previous query
     * @type {string}
     * @memberof ListMintsResponse
     */
    'cursor': string;
    /**
     * Remaining results flag. 1: there are remaining results matching this query, 0: no remaining results
     * @type {number}
     * @memberof ListMintsResponse
     */
    'remaining': number;
    /**
     * Mints matching query parameters
     * @type {Array<Mint>}
     * @memberof ListMintsResponse
     */
    'result': Array<Mint>;
}

