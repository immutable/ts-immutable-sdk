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
 * @interface ActiveOrderStatus
 */
export interface ActiveOrderStatus {
    /**
     * The order status that indicates an order can be fulfilled.
     * @type {string}
     * @memberof ActiveOrderStatus
     */
    'name': ActiveOrderStatusNameEnum;
}

export const ActiveOrderStatusNameEnum = {
    Active: 'ACTIVE'
} as const;

export type ActiveOrderStatusNameEnum = typeof ActiveOrderStatusNameEnum[keyof typeof ActiveOrderStatusNameEnum];


