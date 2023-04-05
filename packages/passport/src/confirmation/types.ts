import { GetSignableTradeRequest, UnsignedTransferRequest } from '@imtbl/core-sdk';

export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_ERROR = 'transaction_error',
}

export enum SendMessage {
  TRANSACTION_START = 'transaction_start'
}

export enum TransactionTypes {
  CreateTrade = 'v1/trades',
  TRANSFER = 'v1/transfers'
}

export type CreateTrade = {
  transactionType: TransactionTypes.CreateTrade;
  transactionData: GetSignableTradeRequest,
}

export type Transfer = {
  transactionType: TransactionTypes.TRANSFER;
  transactionData: UnsignedTransferRequest;
}

export type Transaction = CreateTrade | Transfer;

export type DisplayConfirmationParams = {
  messageType: SendMessage;
  messageData: Transaction;
}

export type ConfirmationResult = {
  confirmed: boolean;
}

export const PassportEventType = 'imx_passport_confirmation';
