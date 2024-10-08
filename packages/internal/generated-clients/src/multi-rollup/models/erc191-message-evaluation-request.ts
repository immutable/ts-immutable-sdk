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
 * @interface ERC191MessageEvaluationRequest
 */
export interface ERC191MessageEvaluationRequest {
    /**
     * the raw message data to sign
     * @type {string}
     * @memberof ERC191MessageEvaluationRequest
     */
    'payload': string;
    /**
     * rollup chain ID
     * @type {string}
     * @memberof ERC191MessageEvaluationRequest
     */
    'chainID': string;
}

