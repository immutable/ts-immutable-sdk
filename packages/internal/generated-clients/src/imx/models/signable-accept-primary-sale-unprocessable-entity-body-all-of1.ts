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
 * @interface SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1
 */
export interface SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1 {
    /**
     * Error Code
     * @type {string}
     * @memberof SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1
     */
    'code': SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1CodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1
     */
    'details': object | null;
}

export const SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1CodeEnum = {
    UnprocessableEntityError: 'UNPROCESSABLE_ENTITY_ERROR'
} as const;

export type SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1CodeEnum = typeof SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1CodeEnum[keyof typeof SignableAcceptPrimarySaleUnprocessableEntityBodyAllOf1CodeEnum];


