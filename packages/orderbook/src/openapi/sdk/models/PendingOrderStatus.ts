/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PendingOrderStatus = {
  /**
   * The order status that indicates the order is yet to be active due to various reasons.
   */
  name: 'PENDING';
  /**
   * Whether the order has been evaluated after its creation
   */
  evaluated: boolean;
  /**
   * Whether the order has reached its specified start time
   */
  started: boolean;
};

