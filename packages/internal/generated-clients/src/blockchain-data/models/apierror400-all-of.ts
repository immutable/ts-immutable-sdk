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
 * @interface APIError400AllOf
 */
export interface APIError400AllOf {
    /**
     * Error Code
     * @type {string}
     * @memberof APIError400AllOf
     */
    'code': APIError400AllOfCodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof APIError400AllOf
     */
    'details': object | null;
}

/**
    * @export
    * @enum {string}
    */
export enum APIError400AllOfCodeEnum {
    ValidationError = 'VALIDATION_ERROR'
}


