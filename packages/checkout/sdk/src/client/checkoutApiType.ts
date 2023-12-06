/* eslint-disable @typescript-eslint/naming-convention */
export enum TransactionType {
  BRIDGE = 'bridge',
}

export type Transactions = {
  result: Transaction[]
};

export type TransactionDetails = {
  from_address: string
  from_chain: string
  contract_address: string
  amount: string
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
