/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
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
import { Collection } from './collection';
// May contain unused imports in some cases
// @ts-ignore
import { Page } from './page';

/**
 * 
 * @export
 * @interface ListCollectionsResult
 */
export interface ListCollectionsResult {
    /**
     * List of collections
     * @type {Array<Collection>}
     * @memberof ListCollectionsResult
     */
    'result': Array<Collection>;
    /**
     * 
     * @type {Page}
     * @memberof ListCollectionsResult
     */
    'page': Page;
}

