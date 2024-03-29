/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * Immutable X API
 *
 * The version of the OpenAPI document: 3.0.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { SummarizedCollection } from './summarized-collection';

/**
 * 
 * @export
 * @interface ApiSummarizeCollectionsResponse
 */
export interface ApiSummarizeCollectionsResponse {
    /**
     * Generated cursor returned by previous query
     * @type {string}
     * @memberof ApiSummarizeCollectionsResponse
     */
    'cursor': string;
    /**
     * Remaining results flag. 1: there are remaining results matching this query, 0: no remaining results
     * @type {number}
     * @memberof ApiSummarizeCollectionsResponse
     */
    'remaining': number;
    /**
     * Collections matching query parameters
     * @type {Array<SummarizedCollection>}
     * @memberof ApiSummarizeCollectionsResponse
     */
    'result': Array<SummarizedCollection>;
}

