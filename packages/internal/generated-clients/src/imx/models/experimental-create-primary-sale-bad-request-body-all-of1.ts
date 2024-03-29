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
 * @interface ExperimentalCreatePrimarySaleBadRequestBodyAllOf1
 */
export interface ExperimentalCreatePrimarySaleBadRequestBodyAllOf1 {
    /**
     * Error Code
     * @type {string}
     * @memberof ExperimentalCreatePrimarySaleBadRequestBodyAllOf1
     */
    'code': ExperimentalCreatePrimarySaleBadRequestBodyAllOf1CodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof ExperimentalCreatePrimarySaleBadRequestBodyAllOf1
     */
    'details': object | null;
}

export const ExperimentalCreatePrimarySaleBadRequestBodyAllOf1CodeEnum = {
    ValidationError: 'VALIDATION_ERROR'
} as const;

export type ExperimentalCreatePrimarySaleBadRequestBodyAllOf1CodeEnum = typeof ExperimentalCreatePrimarySaleBadRequestBodyAllOf1CodeEnum[keyof typeof ExperimentalCreatePrimarySaleBadRequestBodyAllOf1CodeEnum];


