/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CancelledOrderStatus = {
  /**
   * The order status
   */
  name: 'CANCELLED';
  /**
   * Whether the cancellation of the order is pending
   */
  is_pending: boolean;
  /**
   * Whether the cancellation was done on-chain or off-chain
   */
  cancellation_type: CancelledOrderStatus.cancellation_type;
};

export namespace CancelledOrderStatus {

  /**
   * Whether the cancellation was done on-chain or off-chain
   */
  export enum cancellation_type {
    ON_CHAIN = 'ON_CHAIN',
    OFF_CHAIN = 'OFF_CHAIN',
  }


}

