/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type InactiveOrderStatus = {
  /**
   * The order status that indicates an order cannot be fulfilled.
   */
  name: 'INACTIVE';
  /**
   * Whether the order offerer has sufficient approvals
   */
  sufficient_approvals: boolean;
  /**
   * Whether the order offerer still has sufficient balance to complete the order
   */
  sufficient_balances: boolean;
};

