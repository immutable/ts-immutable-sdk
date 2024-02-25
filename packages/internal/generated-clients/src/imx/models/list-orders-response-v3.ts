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
import { OrderV3 } from './order-v3';

/**
 * 
 * @export
 * @interface ListOrdersResponseV3
 */
export interface ListOrdersResponseV3 {
    /**
     * Generated cursor returned by previous query
     * @type {string}
     * @memberof ListOrdersResponseV3
     */
    'cursor': string;
    /**
     * Remaining results flag. 1: there are remaining results matching this query, 0: no remaining results
     * @type {number}
     * @memberof ListOrdersResponseV3
     */
    'remaining': number;
    /**
     * Orders matching query parameters
     * @type {Array<OrderV3>}
     * @memberof ListOrdersResponseV3
     */
    'result': Array<OrderV3>;
}

