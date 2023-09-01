/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Chain } from './Chain';
import type { Fee } from './Fee';
import type { Item } from './Item';
import type { TradeBlockchainMetadata } from './TradeBlockchainMetadata';

export type Trade = {
  buy: Array<Item>;
  buyer_address: string;
  buyer_fees: Array<Fee>;
  chain: Chain;
  order_id: string;
  blockchain_metadata: TradeBlockchainMetadata;
  /**
   * Time the on-chain trade event is indexed by the order book system
   */
  indexed_at: string;
  /**
   * Global Trade identifier
   */
  id: string;
  sell: Array<Item>;
  seller_address: string;
  maker_address: string;
  taker_address: string;
};

