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
import { ChainWithDetails } from './chain-with-details';
// May contain unused imports in some cases
// @ts-ignore
import { Page } from './page';

/**
 * 
 * @export
 * @interface ListChainsResult
 */
export interface ListChainsResult {
    /**
     * List of chains
     * @type {Array<ChainWithDetails>}
     * @memberof ListChainsResult
     */
    'result': Array<ChainWithDetails>;
    /**
     * 
     * @type {Page}
     * @memberof ListChainsResult
     */
    'page': Page;
}

