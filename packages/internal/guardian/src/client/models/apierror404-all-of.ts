/* tslint:disable */
/* eslint-disable */
/**
 * Guardian
 * Guardian API
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
 * @interface APIError404AllOf
 */
export interface APIError404AllOf {
    /**
     * Error Code
     * @type {string}
     * @memberof APIError404AllOf
     */
    'code': APIError404AllOfCodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof APIError404AllOf
     */
    'details': object | null;
}

export const APIError404AllOfCodeEnum = {
    ResourceNotFound: 'RESOURCE_NOT_FOUND'
} as const;

export type APIError404AllOfCodeEnum = typeof APIError404AllOfCodeEnum[keyof typeof APIError404AllOfCodeEnum];


