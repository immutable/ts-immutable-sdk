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
import { Chain } from './chain';
// May contain unused imports in some cases
// @ts-ignore
import { Filter } from './filter';

/**
 * 
 * @export
 * @interface FilterResult
 */
export interface FilterResult {
    /**
     * 
     * @type {Chain}
     * @memberof FilterResult
     */
    'chain': Chain;
    /**
     * ETH Address of collection that the asset belongs to
     * @type {string}
     * @memberof FilterResult
     */
    'contract_address': string;
    /**
     * List of all filters and the most common values
     * @type {Array<Filter>}
     * @memberof FilterResult
     */
    'filters': Array<Filter>;
}

