/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
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
import { Order } from './order';
// May contain unused imports in some cases
// @ts-ignore
import { Page } from './page';

/**
 * 
 * @export
 * @interface ListOrdersResult
 */
export interface ListOrdersResult {
    /**
     * 
     * @type {Page}
     * @memberof ListOrdersResult
     */
    'page': Page;
    /**
     * 
     * @type {Array<Order>}
     * @memberof ListOrdersResult
     */
    'result': Array<Order>;
}

