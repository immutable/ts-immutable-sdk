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


// May contain unused imports in some cases
// @ts-ignore
import { AssetPropertiesCollection } from './asset-properties-collection';

/**
 * 
 * @export
 * @interface AssetProperties
 */
export interface AssetProperties {
    /**
     * 
     * @type {AssetPropertiesCollection}
     * @memberof AssetProperties
     */
    'collection'?: AssetPropertiesCollection;
    /**
     * Image URL of this asset
     * @type {string}
     * @memberof AssetProperties
     */
    'image_url'?: string;
    /**
     * Name of this asset
     * @type {string}
     * @memberof AssetProperties
     */
    'name'?: string;
}

