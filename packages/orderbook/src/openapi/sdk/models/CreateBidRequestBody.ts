/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ERC20Item } from './ERC20Item';
import type { Fee } from './Fee';
import type { Item } from './Item';
import type { ProtocolData } from './ProtocolData';

export type CreateBidRequestBody = {
  account_address: string;
  order_hash: string;
  /**
   * Buy item for bid should either be ERC721 or ERC1155 item
   */
  buy: Array<Item>;
  /**
   * Buy fees should only include maker marketplace fees and should be no more than two entries as more entires will incur more gas. It is best practice to have this as few as possible.
   */
  fees: Array<Fee>;
  /**
   * Time after which the Order is considered expired
   */
  end_at: string;
  protocol_data: ProtocolData;
  /**
   * A random value added to the create Order request
   */
  salt: string;
  /**
   * Sell item for bid should be an ERC20 item
   */
  sell: Array<ERC20Item>;
  /**
   * Digital signature generated by the user for the specific Order
   */
  signature: string;
  /**
   * Time after which Order is considered active
   */
  start_at: string;
};

