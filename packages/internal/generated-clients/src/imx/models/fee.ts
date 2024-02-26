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



/**
 * 
 * @export
 * @interface Fee
 */
export interface Fee {
    /**
     * Wallet address
     * @type {string}
     * @memberof Fee
     */
    'address': string;
    /**
     * The percentage of fee
     * @type {number}
     * @memberof Fee
     */
    'percentage': number;
    /**
     * Type of fee. Examples: `royalty`, `maker`, `taker` or `protocol`
     * @type {string}
     * @memberof Fee
     */
    'type': string;
}

