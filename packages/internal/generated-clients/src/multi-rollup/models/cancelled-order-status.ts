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
 * @interface CancelledOrderStatus
 */
export interface CancelledOrderStatus {
    /**
     * The order status indicating a order is has been cancelled or about to be cancelled.
     * @type {string}
     * @memberof CancelledOrderStatus
     */
    'name': CancelledOrderStatusNameEnum;
    /**
     * Whether the cancellation of the order is pending
     * @type {boolean}
     * @memberof CancelledOrderStatus
     */
    'pending': boolean;
    /**
     * Whether the cancellation was done on-chain or off-chain or as a result of an underfunded account
     * @type {string}
     * @memberof CancelledOrderStatus
     */
    'cancellation_type': CancelledOrderStatusCancellationTypeEnum;
}

export const CancelledOrderStatusNameEnum = {
    Cancelled: 'CANCELLED'
} as const;

export type CancelledOrderStatusNameEnum = typeof CancelledOrderStatusNameEnum[keyof typeof CancelledOrderStatusNameEnum];
export const CancelledOrderStatusCancellationTypeEnum = {
    OnChain: 'ON_CHAIN',
    OffChain: 'OFF_CHAIN',
    Underfunded: 'UNDERFUNDED'
} as const;

export type CancelledOrderStatusCancellationTypeEnum = typeof CancelledOrderStatusCancellationTypeEnum[keyof typeof CancelledOrderStatusCancellationTypeEnum];


