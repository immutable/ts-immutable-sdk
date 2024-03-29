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
 * @interface APIError500AllOf
 */
export interface APIError500AllOf {
    /**
     * Error Code
     * @type {string}
     * @memberof APIError500AllOf
     */
    'code': APIError500AllOfCodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof APIError500AllOf
     */
    'details': object | null;
}

/**
    * @export
    * @enum {string}
    */
export enum APIError500AllOfCodeEnum {
    InternalServerError = 'INTERNAL_SERVER_ERROR'
}


