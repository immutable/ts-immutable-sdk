import MessageValidator from 'sns-validator';
import { Environment } from '@imtbl/config';
import { imx } from '@imtbl/generated-clients';
import {
  ZkevmActivityBurn, ZkevmActivityDeposit, ZkevmActivityMint, ZkevmActivitySale,
  ZkevmActivityTransfer, ZkevmActivityWithdrawal, ZkevmCollectionUpdated, ZkevmMetadataUpdated,
  ZkevmMintRequestUpdated, ZkevmNftUpdated, ZkevmOrderUpdated, ZkevmTokenUpdated,
  ZkevmTradeCreated
} from './event-types';

const validator = new MessageValidator();

const allowedTopicArnPrefix = {
  [Environment.PRODUCTION]: 'arn:aws:sns:us-east-2:362750628221:',
  [Environment.SANDBOX]: 'arn:aws:sns:us-east-2:783421985614:'
};

export type WebhookHandlers = {
  zkevmMintRequestUpdated?: (event: ZkevmMintRequestUpdated) => Promise<void>;
  zkEvmActivityMint?: (event: ZkevmActivityMint) => Promise<void>;
  zkEvmActivityBurn?: (event: ZkevmActivityBurn) => Promise<void>;
  zkEvmActivityTransfer?: (event: ZkevmActivityTransfer) => Promise<void>;
  zkEvmActivitySale?: (event: ZkevmActivitySale) => Promise<void>;
  zkEvmActivityDeposit?: (event: ZkevmActivityDeposit) => Promise<void>;
  zkEvmActivityWithdrawal?: (event: ZkevmActivityWithdrawal) => Promise<void>;
  zkEvmCollectionUpdated?: (event: ZkevmCollectionUpdated) => Promise<void>;
  zkEvmNftUpdated?: (event: ZkevmNftUpdated) => Promise<void>;
  zkEvmMetadataUpdated?: (event: ZkevmMetadataUpdated) => Promise<void>;
  zkEvmTokenUpdated?: (event: ZkevmTokenUpdated) => Promise<void>;
  zkEvmOrderUpdated?: (event: ZkevmOrderUpdated) => Promise<void>;
  zkEvmTradeCreated?: (event: ZkevmTradeCreated) => Promise<void>;
  xNftCreated?: (event: imx.Asset) => Promise<void>;
  xNftUpdated?: (event: imx.Asset) => Promise<void>;
  xOrderAccepted?: (event: imx.OrderV3) => Promise<void>;
  xOrderFilled?: (event: imx.OrderV3) => Promise<void>;
  xOrderCancelled?: (event: imx.OrderV3) => Promise<void>;
  xTransferCreated?: (event: imx.Transfer) => Promise<void>;
  all?: (event: any) => Promise<void>;
};

/**
 * handle will validate webhook message origin and verify signature of the message and calls corresponding handlers passed in.
 * @param body The request body to a webhook endpoint in json string or js object form.
 * @param env The Immutable environment the webhook is set up for.
 * @param handlers The optional handlers object for different events. The `all` handler will be triggered for all event types.
 * @returns The event object from the webhook message after validation and verification.
 */
export const handle = async (
  body: string | Record<string, unknown>,
  env: Environment,
  handlers?: WebhookHandlers
) => {
  const msg: any = await new Promise((resolve, reject) => {
    validator.validate(body, (err, message: any) => {
      if (err) {
        return reject(err);
      }

      // check for topic arn prefix
      if (!message.TopicArn.startsWith(allowedTopicArnPrefix[env])) {
        throw new Error('Invalid topic arn');
      }

      if (message?.Type === 'SubscriptionConfirmation') {
        fetch(message.SubscribeURL).then(() => {
          resolve(message);
        }).catch((e) => {
          reject(e);
        });
      }
      return resolve(message);
    });
  });

  const event = JSON.parse(msg.Message);
  if (msg.Type === 'Notification') {
    switch (event.event_name) {
      case 'imtbl_zkevm_mint_request_updated':
        if (handlers?.zkevmMintRequestUpdated) {
          await handlers?.zkevmMintRequestUpdated(event);
        }
        break;
      case 'imtbl_zkevm_activity_mint':
        if (handlers?.zkEvmActivityMint) {
          await handlers?.zkEvmActivityMint(event);
        }
        break;
      case 'imtbl_zkevm_activity_burn':
        if (handlers?.zkEvmActivityBurn) {
          await handlers?.zkEvmActivityBurn(event);
        }
        break;
      case 'imtbl_zkevm_activity_transfer':
        if (handlers?.zkEvmActivityTransfer) {
          await handlers?.zkEvmActivityTransfer(event);
        }
        break;
      case 'imtbl_zkevm_activity_sale':
        if (handlers?.zkEvmActivitySale) {
          await handlers?.zkEvmActivitySale(event);
        }
        break;
      case 'imtbl_zkevm_activity_deposit':
        if (handlers?.zkEvmActivityDeposit) {
          await handlers?.zkEvmActivityDeposit(event);
        }
        break;
      case 'imtbl_zkevm_activity_withdrawal':
        if (handlers?.zkEvmActivityWithdrawal) {
          await handlers?.zkEvmActivityWithdrawal(event);
        }
        break;
      case 'imtbl_zkevm_collection_updated':
        if (handlers?.zkEvmCollectionUpdated) {
          await handlers?.zkEvmCollectionUpdated(event);
        }
        break;
      case 'imtbl_zkevm_nft_updated':
        if (handlers?.zkEvmNftUpdated) {
          await handlers?.zkEvmNftUpdated(event);
        }
        break;
      case 'imtbl_zkevm_metadata_updated':
        if (handlers?.zkEvmMetadataUpdated) {
          await handlers?.zkEvmMetadataUpdated(event);
        }
        break;
      case 'imtbl_zkevm_token_updated':
        if (handlers?.zkEvmTokenUpdated) {
          await handlers?.zkEvmTokenUpdated(event);
        }
        break;
      case 'imtbl_zkevm_order_updated':
        if (handlers?.zkEvmOrderUpdated) {
          await handlers?.zkEvmOrderUpdated(event);
        }
        break;
      case 'imtbl_zkevm_trade_created':
        if (handlers?.zkEvmTradeCreated) {
          await handlers?.zkEvmTradeCreated(event);
        }
        break;
      case 'imtbl_x_nft_created':
        if (handlers?.xNftCreated) {
          await handlers?.xNftCreated(event);
        }
        break;
      case 'imtbl_x_nft_updated':
        if (handlers?.xNftUpdated) {
          await handlers?.xNftUpdated(event);
        }
        break;
      case 'imtbl_x_order_accepted':
        if (handlers?.xOrderAccepted) {
          await handlers?.xOrderAccepted(event);
        }
        break;
      case 'imtbl_x_order_filled':
        if (handlers?.xOrderFilled) {
          await handlers?.xOrderFilled(event);
        }
        break;
      case 'imtbl_x_order_cancelled':
        if (handlers?.xOrderCancelled) {
          await handlers?.xOrderCancelled(event);
        }
        break;
      case 'imtbl_x_transfer_created':
        if (handlers?.xTransferCreated) {
          await handlers?.xTransferCreated(event);
        }
        break;
      default:
        break;
    }
    if (handlers?.all) {
      await handlers?.all(event);
    }
  }

  return event;
};
