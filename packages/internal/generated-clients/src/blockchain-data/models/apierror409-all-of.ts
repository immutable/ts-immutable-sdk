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
 * @interface APIError409AllOf
 */
export interface APIError409AllOf {
    /**
     * Error Code
     * @type {string}
     * @memberof APIError409AllOf
     */
    'code': APIError409AllOfCodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {{ [key: string]: any; }}
     * @memberof APIError409AllOf
     */
    'details': { [key: string]: any; } | null;
}

/**
    * @export
    * @enum {string}
    */
export enum APIError409AllOfCodeEnum {
    ConflictError = 'CONFLICT_ERROR'
}


