/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CancelledOrderStatus = {
  /**
   * The order status indicating a order is has been cancelled or about to be cancelled.
   */
  name: 'CANCELLED';
  /**
   * Whether the cancellation of the order is pending
   */
  pending: boolean;
  /**
   * Whether the cancellation was done on-chain or off-chain or as a result of an underfunded account
   */
  cancellation_type: CancelledOrderStatus.cancellation_type;
};

export namespace CancelledOrderStatus {

  /**
   * Whether the cancellation was done on-chain or off-chain or as a result of an underfunded account
   */
  export enum cancellation_type {
    ON_CHAIN = 'ON_CHAIN',
    OFF_CHAIN = 'OFF_CHAIN',
    UNDERFUNDED = 'UNDERFUNDED',
  }


}

