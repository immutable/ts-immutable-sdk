/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 3.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 *
 * @export
 * @interface OptionalExchangeData
 */
export interface OptionalExchangeData {
    /**
     * Provider transaction ID
     * @type {string}
     * @memberof OptionalExchangeData
     */
    'external_id'?: string;
    /**
     * Fees amount
     * @type {number}
     * @memberof OptionalExchangeData
     */
    'fees_amount'?: number;
    /**
     * Amount that was exchanged from
     * @type {number}
     * @memberof OptionalExchangeData
     */
    'from_amount'?: number;
    /**
     * Currency that was exchanged from
     * @type {string}
     * @memberof OptionalExchangeData
     */
    'from_currency'?: string;
    /**
     * Provider wallet address that was used for transferring crypto
     * @type {string}
     * @memberof OptionalExchangeData
     */
    'provider_wallet_address'?: string;
    /**
     * Amount that was exchanged to
     * @type {number}
     * @memberof OptionalExchangeData
     */
    'to_amount'?: number;
    /**
     * Currency that was exchanged to
     * @type {string}
     * @memberof OptionalExchangeData
     */
    'to_currency'?: string;
    /**
     * TransferImx ID
     * @type {string}
     * @memberof OptionalExchangeData
     */
    'transfer_id'?: string;
}

