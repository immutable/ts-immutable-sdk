import { TransactionApprovalRequestChainTypeEnum } from '@imtbl/guardian';

export enum SendMessage {
  CONFIRMATION_START = 'confirmation_start',
  CONFIRMATION_DATA_READY = 'confirmation_data_ready',
}

export const enum ConfirmationTypeEnum {
  starkex_transaction = 'starkex_transaction',
  zkevm_transaction = 'zkevm_transaction',
  zkevm_message = 'zkevm_message',
}

type ZkEvmTransactionMetadata = {
  transactionID: string;
  etherAddress: string;
  chainType: TransactionApprovalRequestChainTypeEnum;
  chainID: string;
};

type ZkevmMessageMetadata = {
  messageID: string;
  etherAddress: string;
};

type StarkExTransactionMetadata = {
  transactionID: string;
  etherAddress: string;
  chainType: TransactionApprovalRequestChainTypeEnum;
};

type StarkExTransactionnMessageData = {
  confirmationType: ConfirmationTypeEnum.starkex_transaction;
  confirmationMetadata: StarkExTransactionMetadata;
};

type ZkEvmTransactionMessageData = {
  confirmationType: ConfirmationTypeEnum.zkevm_transaction;
  confirmationMetadata: ZkEvmTransactionMetadata;
};

type ZkEvmMessageMessageData = {
  confirmationType: ConfirmationTypeEnum.zkevm_message;
  confirmationMetadata: ZkevmMessageMetadata;
};

export type ConfirmationDataReadyMessageData =
ZkEvmMessageMessageData
| ZkEvmTransactionMessageData
| StarkExTransactionnMessageData;

export type PostMessageData = {
  eventType: string;
  messageType: SendMessage.CONFIRMATION_DATA_READY;
  messageData: ConfirmationDataReadyMessageData;
};

export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',
  CONFIRMATION_TYPE_ERROR = 'confirmation_type_error',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_ERROR = 'transaction_error',
  TRANSACTION_REJECTED = 'transaction_rejected',
  MESSAGE_CONFIRMED = 'message_confirmed',
  MESSAGE_ERROR = 'message_error',
  MESSAGE_REJECTED = 'message_rejected',
}

export type ConfirmationResult = {
  confirmed: boolean;
};

export const PASSPORT_EVENT_TYPE = 'imx_passport_confirmation';
