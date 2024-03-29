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
 * @interface SignableRejectPrimarySaleBadRequestBodyAllOf1
 */
export interface SignableRejectPrimarySaleBadRequestBodyAllOf1 {
    /**
     * Error Code
     * @type {string}
     * @memberof SignableRejectPrimarySaleBadRequestBodyAllOf1
     */
    'code': SignableRejectPrimarySaleBadRequestBodyAllOf1CodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof SignableRejectPrimarySaleBadRequestBodyAllOf1
     */
    'details': object | null;
}

export const SignableRejectPrimarySaleBadRequestBodyAllOf1CodeEnum = {
    ValidationError: 'VALIDATION_ERROR'
} as const;

export type SignableRejectPrimarySaleBadRequestBodyAllOf1CodeEnum = typeof SignableRejectPrimarySaleBadRequestBodyAllOf1CodeEnum[keyof typeof SignableRejectPrimarySaleBadRequestBodyAllOf1CodeEnum];


