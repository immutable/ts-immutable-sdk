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
import { OrderFeeInfo } from './order-fee-info';

/**
 * 
 * @export
 * @interface StoreMakerTakerFee
 */
export interface StoreMakerTakerFee {
    /**
     * Fees
     * @type {Array<OrderFeeInfo>}
     * @memberof StoreMakerTakerFee
     */
    'fees'?: Array<OrderFeeInfo>;
    /**
     * Quantity of this asset with the sum of all fees applied to the asset
     * @type {string}
     * @memberof StoreMakerTakerFee
     */
    'quantity_with_fees': string;
}

