/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Order } from './Order';
import type { Page } from './Page';

export type ListOrdersResult = {
  page: Page;
  result: Array<Order>;
};

