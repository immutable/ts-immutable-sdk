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
import { Chain } from './chain';

/**
 * 
 * @export
 * @interface Token
 */
export interface Token {
    /**
     * 
     * @type {Chain}
     * @memberof Token
     */
    'chain': Chain;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    'contract_address': string;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    'root_contract_address': string | null;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    'symbol': string | null;
    /**
     * 
     * @type {number}
     * @memberof Token
     */
    'decimals': number | null;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    'image_url': string | null;
    /**
     * 
     * @type {string}
     * @memberof Token
     */
    'name': string | null;
}

