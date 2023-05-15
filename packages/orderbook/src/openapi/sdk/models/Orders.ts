/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Order } from './Order';

export type Orders = {
  /**
   * Cursor to retrieve next page
   */
  next?: string;
  /**
   * Cursor to retrieve previous page
   */
  previous?: string;
  result: Array<Order>;
};

