/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BuyItem } from './BuyItem';
import type { Fee } from './Fee';
import type { ProtocolData } from './ProtocolData';
import type { SellItem } from './SellItem';

export type CreateOrderRequestBody = {
  account_address: string;
  order_hash: string;
  buy: Array<BuyItem>;
  buy_fees: Array<Fee>;
  /**
   * Time after which the Order is considered expired
   */
  end_time: string;
  protocol_data: ProtocolData;
  /**
   * A random value added to the create Order request
   */
  salt: string;
  sell: Array<SellItem>;
  /**
   * Digital signature generated by the user for the specific Order
   */
  signature: string;
  /**
   * Time after which Order is considered active
   */
  start_time: string;
};

