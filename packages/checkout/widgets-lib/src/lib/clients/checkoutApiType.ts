/* eslint-disable @typescript-eslint/naming-convention */
export enum TransactionType {
  BRIDGE = 'bridge',
}

export const TransactionStatus = {
  IN_PROGRESS: 'in_progress',
  WITHDRAWAL_PENDING: 'withdrawal_pending',
} as const;

export type Transactions = {
  result: Transaction[]
};

export type CurrentStatus = {
  status: string;
  withdrawal_ready_at?: string;
};

export type TransactionDetails = {
  amount: string
  from_address: string
  from_chain: string
  from_token_address: string
  to_address: string
  to_chain: string
  to_token_address: string
  current_status: CurrentStatus
};

export type BlockchainMetadata = {
  transaction_hash: string
};

export type Transaction = {
  tx_type: TransactionType
  details: TransactionDetails
  blockchain_metadata: BlockchainMetadata
  created_at: string
};
