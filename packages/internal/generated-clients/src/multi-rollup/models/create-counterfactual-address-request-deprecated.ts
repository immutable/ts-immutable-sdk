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
 * @interface CreateCounterfactualAddressRequestDeprecated
 */
export interface CreateCounterfactualAddressRequestDeprecated {
    /**
     * The user\'s UAK address
     * @type {string}
     * @memberof CreateCounterfactualAddressRequestDeprecated
     */
    'ethereumAddress': string;
    /**
     * The signature generated with the UAK
     * @type {string}
     * @memberof CreateCounterfactualAddressRequestDeprecated
     */
    'ethereumSignature': string;
}

