/* eslint-disable @typescript-eslint/naming-convention */
export enum TransactionType {
  BRIDGE = 'bridge',
}

export type Transactions = {
  result: Transaction[]
};

export type TransactionDetails = {
  amount: string
  from_address: string
  from_chain: string
  from_token_address: string
  to_address: string
  to_chain: string
  to_token_address: string
};

export type BlockchainMetadata = {
  transaction_hash: string
};

export type Transaction = {
  tx_type: TransactionType
  details: TransactionDetails
  blockchain_metadata: BlockchainMetadata
  updated_at: string
};
