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


// May contain unused imports in some cases
// @ts-ignore
import { Network } from './network';

/**
 * Item in a collection
 * @export
 * @interface CollectionItem
 */
export interface CollectionItem {
    /**
     * 
     * @type {Network}
     * @memberof CollectionItem
     */
    'network': Network;
    /**
     * Name
     * @type {string}
     * @memberof CollectionItem
     */
    'name'?: string;
    /**
     * Description
     * @type {string}
     * @memberof CollectionItem
     */
    'description'?: string;
    /**
     * Image
     * @type {string}
     * @memberof CollectionItem
     */
    'image'?: string;
    /**
     * Image
     * @type {string}
     * @memberof CollectionItem
     */
    'animation_url'?: string;
    /**
     * Token ID
     * @type {string}
     * @memberof CollectionItem
     */
    'token_id': string;
    /**
     * Ethereum address
     * @type {string}
     * @memberof CollectionItem
     */
    'owner': string;
}



