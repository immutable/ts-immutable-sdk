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
 * @interface SignableRejectPrimarySaleInternalServerErrorBodyAllOf1
 */
export interface SignableRejectPrimarySaleInternalServerErrorBodyAllOf1 {
    /**
     * Error Code
     * @type {string}
     * @memberof SignableRejectPrimarySaleInternalServerErrorBodyAllOf1
     */
    'code': SignableRejectPrimarySaleInternalServerErrorBodyAllOf1CodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof SignableRejectPrimarySaleInternalServerErrorBodyAllOf1
     */
    'details': object | null;
}

export const SignableRejectPrimarySaleInternalServerErrorBodyAllOf1CodeEnum = {
    InternalServerError: 'INTERNAL_SERVER_ERROR'
} as const;

export type SignableRejectPrimarySaleInternalServerErrorBodyAllOf1CodeEnum = typeof SignableRejectPrimarySaleInternalServerErrorBodyAllOf1CodeEnum[keyof typeof SignableRejectPrimarySaleInternalServerErrorBodyAllOf1CodeEnum];


