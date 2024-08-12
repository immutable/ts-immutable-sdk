import { handle, WebhookHandlers } from './handler';

export type {
  BlockChainMetadata,
  Chain,
  ZkevmActivityBurn,
  ZkevmActivityDeposit,
  ZkevmActivityMint,
  ZkevmActivitySale,
  ZkevmActivityTransfer,
  ZkevmActivityWithdrawal,
  ZkevmCollectionUpdated,
  ZkevmMetadataUpdated,
  ZkevmMintRequestUpdated,
  ZkevmNftUpdated,
  ZkevmOrderUpdated,
  ZkevmTokenUpdated,
  ZkevmTradeCreated
} from './event-types';

export {
  handle
};
export type { WebhookHandlers };
