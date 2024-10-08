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



/**
 * 
 * @export
 * @interface Call
 */
export interface Call {
    /**
     * An Ethereum address
     * @type {string}
     * @memberof Call
     */
    'target_address': string;
    /**
     * The function signature
     * @type {string}
     * @memberof Call
     */
    'function_signature': string;
    /**
     * The function arguments
     * @type {Array<string>}
     * @memberof Call
     */
    'function_args': Array<string>;
}

