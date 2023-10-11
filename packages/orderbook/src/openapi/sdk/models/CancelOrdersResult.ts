/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CancelOrdersResult = {
  result: {
    /**
     * Orders which were successfully cancelled
     */
    successful_cancellations: Array<string>;
    /**
     * Orders which are marked for cancellation but the cancellation cannot be guaranteed
     */
    pending_cancellations: Array<string>;
    /**
     * Orders which failed to be cancelled
     */
    failed_cancellations: Array<{
      /**
       * ID of the order which failed to be cancelled
       */
      order: string;
      /**
       * Reason code indicating why the order failed to be cancelled
       */
      reason_code: 'ALREADY_FILLED';
    }>;
  };
};

