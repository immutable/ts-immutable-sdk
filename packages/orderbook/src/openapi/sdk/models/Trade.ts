/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Chain } from './Chain';
import type { Fee } from './Fee';
import type { Item } from './Item';
import type { TradeBlockchainMetadata } from './TradeBlockchainMetadata';

export type Trade = {
  /**
   * Buy items are transferred from the taker to the maker.
   */
  buy: Array<Item>;
  /**
   * Deprecated. Use maker and taker addresses instead of buyer and seller addresses.
   */
  buyer_address: string;
  /**
   * Deprecated. Use fees instead. The taker always pays the fees.
   */
  buyer_fees: Array<Fee>;
  fees: Array<Fee>;
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
  /**
   * Sell items are transferred from the maker to the taker.
   */
  sell: Array<Item>;
  /**
   * Deprecated. Use maker and taker addresses instead of buyer and seller addresses.
   */
  seller_address: string;
  maker_address: string;
  taker_address: string;
};

