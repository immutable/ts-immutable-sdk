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
 * Fee required to be paid for a primary sale
 * @export
 * @interface SignableCreatePrimarySaleOKBodyFeesItems
 */
export interface SignableCreatePrimarySaleOKBodyFeesItems {
    /**
     * Ethereum address of the fee recipient
     * @type {string}
     * @memberof SignableCreatePrimarySaleOKBodyFeesItems
     */
    'address': string;
    /**
     * Fee amount
     * @type {string}
     * @memberof SignableCreatePrimarySaleOKBodyFeesItems
     */
    'amount': string;
    /**
     * Fee percentage in basis points (e.g. 200 for 2%)
     * @type {number}
     * @memberof SignableCreatePrimarySaleOKBodyFeesItems
     */
    'percentage': number;
    /**
     * Fee type
     * @type {string}
     * @memberof SignableCreatePrimarySaleOKBodyFeesItems
     */
    'type': SignableCreatePrimarySaleOKBodyFeesItemsTypeEnum;
}

export const SignableCreatePrimarySaleOKBodyFeesItemsTypeEnum = {
    Ecosystem: 'ECOSYSTEM',
    Protocol: 'PROTOCOL'
} as const;

export type SignableCreatePrimarySaleOKBodyFeesItemsTypeEnum = typeof SignableCreatePrimarySaleOKBodyFeesItemsTypeEnum[keyof typeof SignableCreatePrimarySaleOKBodyFeesItemsTypeEnum];


