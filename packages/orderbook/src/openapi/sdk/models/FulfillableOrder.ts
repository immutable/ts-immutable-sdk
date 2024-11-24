/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Order } from './Order';

export type FulfillableOrder = {
  order: Order;
  /**
   * Token ID for the ERC721 or ERC1155 token when fulfilling a collection order
   */
  token_id?: string;
  extra_data: string;
};

