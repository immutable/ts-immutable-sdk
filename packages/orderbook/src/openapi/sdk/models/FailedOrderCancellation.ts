/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FailedOrderCancellation = {
  /**
   * ID of the order which failed to be cancelled
   */
  order: string;
  /**
   * Reason code indicating why the order failed to be cancelled
   */
  reason_code: FailedOrderCancellation.reason_code;
};

export namespace FailedOrderCancellation {

  /**
   * Reason code indicating why the order failed to be cancelled
   */
  export enum reason_code {
    FILLED = 'FILLED',
  }


}

