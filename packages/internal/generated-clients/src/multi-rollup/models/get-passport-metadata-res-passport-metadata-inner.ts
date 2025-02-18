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
 * The user\'s passport metadata
 * @export
 * @interface GetPassportMetadataResPassportMetadataInner
 */
export interface GetPassportMetadataResPassportMetadataInner {
    /**
     * The chain id (eg: eip155:1)
     * @type {string}
     * @memberof GetPassportMetadataResPassportMetadataInner
     */
    'chain_id'?: string;
    /**
     * The chain key
     * @type {string}
     * @memberof GetPassportMetadataResPassportMetadataInner
     */
    'chain_key'?: string;
    /**
     * The user admin key
     * @type {string}
     * @memberof GetPassportMetadataResPassportMetadataInner
     */
    'user_admin_key'?: string;
    /**
     * The counterfactual address
     * @type {string}
     * @memberof GetPassportMetadataResPassportMetadataInner
     */
    'counterfactual_address'?: string;
}

