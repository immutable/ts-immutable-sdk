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
import { OptionalExchangeData } from './optional-exchange-data';

/**
 * 
 * @export
 * @interface Exchange
 */
export interface Exchange {
    /**
     * Time this transaction was created
     * @type {string}
     * @memberof Exchange
     */
    'created_at'?: string;
    /**
     * 
     * @type {OptionalExchangeData}
     * @memberof Exchange
     */
    'data'?: OptionalExchangeData;
    /**
     * Transaction ID
     * @type {number}
     * @memberof Exchange
     */
    'id'?: number;
    /**
     * Provider name
     * @type {string}
     * @memberof Exchange
     */
    'provider'?: string;
    /**
     * Transaction status
     * @type {string}
     * @memberof Exchange
     */
    'status'?: string;
    /**
     * Transaction type
     * @type {string}
     * @memberof Exchange
     */
    'type'?: string;
    /**
     * Time this transaction was updates
     * @type {string}
     * @memberof Exchange
     */
    'updated_at'?: string;
    /**
     * Ethereum address of the user who created transaction
     * @type {string}
     * @memberof Exchange
     */
    'wallet_address'?: string;
}

