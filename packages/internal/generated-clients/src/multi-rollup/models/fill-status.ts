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
 * The ratio of the order that has been filled, an order that has been fully filled will have the same numerator and denominator values.
 * @export
 * @interface FillStatus
 */
export interface FillStatus {
    /**
     * The numerator of the fill status
     * @type {string}
     * @memberof FillStatus
     */
    'numerator': string;
    /**
     * The denominator of the fill status
     * @type {string}
     * @memberof FillStatus
     */
    'denominator': string;
}

