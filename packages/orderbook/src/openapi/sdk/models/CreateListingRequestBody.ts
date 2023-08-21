/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Fee } from './Fee';
import type { Item } from './Item';
import type { ProtocolData } from './ProtocolData';

export type CreateListingRequestBody = {
  account_address: string;
  order_hash: string;
  /**
   * Buy item for listing should either be NATIVE or ERC20 item
   */
  buy: Array<Item>;
  fees: Array<Fee>;
  /**
   * Time after which the Order is considered expired
   */
  end_time: string;
  protocol_data: ProtocolData;
  /**
   * A random value added to the create Order request
   */
  salt: string;
  /**
   * Sell item for listing should be an ERC721 item
   */
  sell: Array<Item>;
  /**
   * Digital signature generated by the user for the specific Order
   */
  signature: string;
  /**
   * Time after which Order is considered active
   */
  start_time: string;
};

