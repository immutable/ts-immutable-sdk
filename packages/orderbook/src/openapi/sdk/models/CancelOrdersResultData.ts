/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FailedOrderCancellation } from './FailedOrderCancellation';

export type CancelOrdersResultData = {
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
  failed_cancellations: Array<FailedOrderCancellation>;
};

