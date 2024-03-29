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
 * @interface ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1
 */
export interface ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1 {
    /**
     * Error Code
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1
     */
    'code': ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1CodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1
     */
    'details': object | null;
}

export const ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1CodeEnum = {
    InternalServerError: 'INTERNAL_SERVER_ERROR'
} as const;

export type ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1CodeEnum = typeof ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1CodeEnum[keyof typeof ExperimentalGetPrimarySaleInternalServerErrorBodyAllOf1CodeEnum];


