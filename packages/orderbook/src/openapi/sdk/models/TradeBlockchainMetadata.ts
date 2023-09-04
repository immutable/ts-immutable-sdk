/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The metadata related to the transaction in which the activity occurred
 */
export type TradeBlockchainMetadata = {
  /**
   * The transaction hash of the trade
   */
  transaction_hash: string;
  /**
   * EVM block number (uint64 as string)
   */
  block_number: string;
  /**
   * Transaction index in a block (uint32 as string)
   */
  transaction_index: string;
  /**
   * The log index of the fulfillment event in a block (uint32 as string)
   */
  log_index: string;
};

