/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Fee } from './Fee';

export type FulfillmentDataRequest = {
  order_id: string;
  /**
   * Address of the intended account fulfilling the order
   */
  taker_address: string;
  fees: Array<Fee>;
  /**
   * Token ID for the ERC721 or ERC1155 token
   */
  token_id?: string;
};

