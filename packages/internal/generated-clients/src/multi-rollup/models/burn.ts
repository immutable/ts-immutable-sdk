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
import { ActivityAsset } from './activity-asset';

/**
 * The burn activity details
 * @export
 * @interface Burn
 */
export interface Burn {
    /**
     * The account address the asset was transferred from
     * @type {string}
     * @memberof Burn
     */
    'from': string;
    /**
     * The amount of assets burnt
     * @type {string}
     * @memberof Burn
     */
    'amount': string;
    /**
     * 
     * @type {ActivityAsset}
     * @memberof Burn
     */
    'asset': ActivityAsset;
}

