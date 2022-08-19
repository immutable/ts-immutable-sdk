/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 3.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { Range } from './range';

/**
 * 
 * @export
 * @interface CollectionFilter
 */
export interface CollectionFilter {
    /**
     * Key of this property
     * @type {string}
     * @memberof CollectionFilter
     */
    'key'?: string;
    /**
     * 
     * @type {Range}
     * @memberof CollectionFilter
     */
    'range'?: Range;
    /**
     * Type of this filter
     * @type {string}
     * @memberof CollectionFilter
     */
    'type'?: string;
    /**
     * List of possible values for this property
     * @type {Array<string>}
     * @memberof CollectionFilter
     */
    'value'?: Array<string>;
}

