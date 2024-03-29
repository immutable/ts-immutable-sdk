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
 * @interface GetPrimarySaleOKBodyResultFeesItems
 */
export interface GetPrimarySaleOKBodyResultFeesItems {
    /**
     * Ethereum address of the fee recipient
     * @type {string}
     * @memberof GetPrimarySaleOKBodyResultFeesItems
     */
    'address': string;
    /**
     * Fee amount
     * @type {string}
     * @memberof GetPrimarySaleOKBodyResultFeesItems
     */
    'amount': string;
    /**
     * Fee percentage in basis points (e.g. 200 for 2%)
     * @type {number}
     * @memberof GetPrimarySaleOKBodyResultFeesItems
     */
    'percentage': number;
    /**
     * Fee type
     * @type {string}
     * @memberof GetPrimarySaleOKBodyResultFeesItems
     */
    'type': GetPrimarySaleOKBodyResultFeesItemsTypeEnum;
}

export const GetPrimarySaleOKBodyResultFeesItemsTypeEnum = {
    Ecosystem: 'ECOSYSTEM',
    Protocol: 'PROTOCOL'
} as const;

export type GetPrimarySaleOKBodyResultFeesItemsTypeEnum = typeof GetPrimarySaleOKBodyResultFeesItemsTypeEnum[keyof typeof GetPrimarySaleOKBodyResultFeesItemsTypeEnum];


