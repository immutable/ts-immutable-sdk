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
import { ActivityAsset } from './activity-asset';

/**
 * The deposit activity details
 * @export
 * @interface Deposit
 */
export interface Deposit {
    /**
     * The account address the asset was deposited to
     * @type {string}
     * @memberof Deposit
     */
    'to': string;
    /**
     * The deposited amount
     * @type {string}
     * @memberof Deposit
     */
    'amount': string;
    /**
     * 
     * @type {ActivityAsset}
     * @memberof Deposit
     */
    'asset': ActivityAsset;
}

